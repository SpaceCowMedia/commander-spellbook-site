import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SaltVotesApi, Variant, VariantsApi } from '@space-cow-media/spellbook-client';
import SpellbookHead from 'components/SpellbookHead/SpellbookHead';
import ArtCircle from 'components/layout/ArtCircle/ArtCircle';
import ColorIdentity from 'components/layout/ColorIdentity/ColorIdentity';
import CardImage from 'components/layout/CardImage/CardImage';
import TemplateCard from 'components/combo/TemplateCard/TemplateCard';
import CardZones from 'components/combo/CardZones/CardZones';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import Loader from 'components/layout/Loader/Loader';
import Icon from 'components/layout/Icon/Icon';
import SaltSlider from 'components/salt/SaltSlider/SaltSlider';
import { comboTitleToText } from 'components/combo/CardHeader/CardHeader';
import { apiConfiguration } from 'services/api.service';
import useCookie from 'lib/useCookie';
import { MAX_SALT, SaltVoteError, saltVoteError } from 'lib/salt';
import { readSeenCombos, rememberSeenCombo } from 'lib/saltVotingSeen';
import { DEFAULT_ORDERING } from 'lib/constants';
import useFoolsDay, { isFoolsDay } from 'lib/foolsDay';
import styles from './salt.module.scss';

const QUEUE_BATCH_SIZE = 50;
const PREFETCH_WHEN_LEFT = 5;
const SCORE_KEY = new RegExp(`^[0-${MAX_SALT}]$`);
// Like the regular queue: public combos (the only ones the API lists) that are legal in Commander and not spoilers.
const UNPOPULAR_COMBOS_QUERY = 'legal:commander -is:spoiler';

function freshCombos(batch: Variant[], skip: Set<string>): Variant[] {
  return batch.filter((combo) => {
    if (skip.has(combo.id)) {
      return false;
    }
    skip.add(combo.id);
    return true;
  });
}

interface Tally {
  voted: number;
  skipped: number;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    !!target.closest('input:not([type="range"]), textarea, select, [contenteditable="true"]')
  );
}

const SaltVoting: React.FC = () => {
  const [jwt, , cookieLoaded] = useCookie('csbJwt');
  const loggedIn = !!jwt;
  const [queue, setQueue] = useState<Variant[]>([]);
  const [fetching, setFetching] = useState(true);
  const [caughtUp, setCaughtUp] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [voteError, setVoteError] = useState<SaltVoteError | null>(null);
  const [tally, setTally] = useState<Tally>({ voted: 0, skipped: 0 });
  const foolsDay = useFoolsDay();
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const requesting = useRef(false);
  const unpopularOffset = useRef(0);
  const focusNextCombo = useRef(false);
  const current = queue[0];

  const fetchFreshCombos = async (skip: Set<string>): Promise<Variant[]> => {
    if (!isFoolsDay()) {
      const batch = await new SaltVotesApi(apiConfiguration()).saltVotesQueueList({ limit: QUEUE_BATCH_SIZE });
      return freshCombos(batch, skip);
    }
    // On April Fools the queue walks through the least popular combos instead, skipping pages already seen.
    const variantsApi = new VariantsApi(apiConfiguration());
    for (;;) {
      const page = await variantsApi.variantsList({
        q: UNPOPULAR_COMBOS_QUERY,
        groupByCombo: true,
        ordering: `popularity,${DEFAULT_ORDERING}`,
        limit: QUEUE_BATCH_SIZE,
        offset: unpopularOffset.current,
      });
      unpopularOffset.current += page.results.length;
      const fresh = freshCombos(page.results, skip);
      if (fresh.length > 0 || !page.next) {
        return fresh;
      }
    }
  };

  const fetchBatch = async () => {
    if (requesting.current) {
      return;
    }
    requesting.current = true;
    setFetching(true);
    try {
      const skip = readSeenCombos();
      queueRef.current.forEach((combo) => skip.add(combo.id));
      const fresh = await fetchFreshCombos(skip);
      setQueue((queued) => queued.concat(fresh));
      setCaughtUp(fresh.length === 0);
    } catch {
      setLoadError('The combos to vote on could not be loaded.');
    } finally {
      requesting.current = false;
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!caughtUp && !loadError && queue.length <= PREFETCH_WHEN_LEFT) {
      fetchBatch();
    }
  }, [queue.length, caughtUp, loadError]);

  const upcoming = queue[1];
  useEffect(() => {
    upcoming?.uses.forEach(({ card }) => {
      if (card.imageUriFrontNormal) {
        new Image().src = card.imageUriFrontNormal;
      }
    });
  }, [upcoming?.id]);

  useEffect(() => {
    if (current && focusNextCombo.current) {
      focusNextCombo.current = false;
      document.getElementById(loggedIn ? 'salt-voting-slider' : 'salt-voting-skip')?.focus();
    }
  }, [current?.id]);

  const advance = (combo: Variant, outcome: keyof Tally) => {
    focusNextCombo.current = !!document.activeElement?.closest('#salt-voting-combo');
    rememberSeenCombo(combo.id);
    setQueue((queued) => queued.filter((queuedCombo) => queuedCombo.id !== combo.id));
    setTally((counts) => ({ ...counts, [outcome]: counts[outcome] + 1 }));
    setPicked(null);
    setVoteError(null);
  };

  const skip = () => {
    if (current && !pending) {
      advance(current, 'skipped');
    }
  };

  const vote = async () => {
    if (!current || picked === null || pending) {
      return;
    }
    setPending(true);
    setVoteError(null);
    try {
      await new SaltVotesApi(apiConfiguration()).saltVotesUpdate({
        variant: current.id,
        saltVoteRequest: { score: picked },
      });
      advance(current, 'voted');
    } catch (err) {
      setVoteError(saltVoteError(err));
    } finally {
      setPending(false);
    }
  };

  const lookAgain = () => {
    setLoadError(null);
    setCaughtUp(false);
  };

  const handleKeyDown = useRef<(_event: KeyboardEvent) => void>(() => {});
  handleKeyDown.current = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) {
      return;
    }
    const onControl = event.target instanceof HTMLElement && !!event.target.closest('a, button');
    if (loggedIn && SCORE_KEY.test(event.key)) {
      event.preventDefault();
      setPicked(Number(event.key));
    } else if (loggedIn && event.key === 'Enter' && !onControl) {
      event.preventDefault();
      vote();
    } else if (event.key.toLowerCase() === 's') {
      event.preventDefault();
      skip();
    }
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown.current(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const renderCombo = (combo: Variant) => {
    const results = combo.produces.filter((result) => result.feature.name.toLowerCase() !== 'lock');
    return (
      <article key={combo.id} id="salt-voting-combo" className={styles.combo}>
        <header className={styles.comboHeader}>
          <div className={styles.identity}>
            <ColorIdentity identity={combo.identity} size="small" />
          </div>
          <h2 className={styles.comboTitle}>{comboTitleToText(combo.uses, combo.requires)}</h2>
        </header>
        <div className={styles.cards}>
          {combo.uses.map((use) => (
            <div key={use.card.id} className={styles.card}>
              <CardImage card={use.card} usedFace={use.usedFace} />
              {use.quantity > 1 && <span className={styles.quantity}>×{use.quantity}</span>}
              <CardZones card={use} className={styles.zones} />
            </div>
          ))}
          {combo.requires.map((template) => (
            <div key={template.template.id} className={styles.card}>
              <TemplateCard template={template} />
              {template.quantity > 1 && <span className={styles.quantity}>×{template.quantity}</span>}
              <CardZones card={template} className={styles.zones} />
            </div>
          ))}
        </div>
        <div className={styles.results}>
          <h3 className={styles.sectionLabel}>Results</h3>
          <ul className={styles.resultList}>
            {results.map((result) => (
              <li key={result.feature.id}>
                <TextWithMagicSymbol
                  text={result.quantity > 1 ? `${result.quantity} ${result.feature.name}` : result.feature.name}
                />
              </li>
            ))}
          </ul>
          <Link
            id="salt-voting-open-combo"
            href={`/combo/${combo.id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.openCombo}
          >
            Open combo ↗
          </Link>
        </div>
        <div className={styles.voting}>
          {!cookieLoaded ? (
            <SaltSlider id="salt-voting-slider" label="Your salt vote" value={null} onChange={() => {}} disabled />
          ) : loggedIn ? (
            <>
              <SaltSlider
                id="salt-voting-slider"
                label="Your salt vote for this combo"
                value={picked}
                onChange={setPicked}
                onConfirm={vote}
                disabled={pending}
              />
              {voteError && (
                <p id="salt-voting-error" role="alert" className={styles.error}>
                  {voteError.message}{' '}
                  {voteError.loginRequired && (
                    <Link href="/login/?final=/salt/" className="font-bold">
                      Log in
                    </Link>
                  )}
                </p>
              )}
              <div className={styles.actions}>
                <button
                  id="salt-voting-vote"
                  type="button"
                  className={styles.voteButton}
                  disabled={picked === null || pending}
                  onClick={vote}
                >
                  Vote
                </button>
                <button
                  id="salt-voting-skip"
                  type="button"
                  className={styles.skipButton}
                  disabled={pending}
                  onClick={skip}
                >
                  Skip →
                </button>
              </div>
            </>
          ) : (
            <>
              <p className={styles.loginNote}>
                Log in to vote on how salty this combo is. You can still browse the combos.
              </p>
              <div className={styles.actions}>
                <Link id="salt-voting-login" href="/login/?final=/salt/" className={styles.voteButton}>
                  Log in to vote
                </Link>
                <button id="salt-voting-skip" type="button" className={styles.skipButton} onClick={skip}>
                  Next combo →
                </button>
              </div>
            </>
          )}
        </div>
      </article>
    );
  };

  const renderState = () => {
    if (current) {
      return renderCombo(current);
    }
    if (loadError) {
      return (
        <div id="salt-voting-load-error" className={styles.message} role="alert">
          <p>{loadError}</p>
          <button type="button" className="button" onClick={lookAgain}>
            Try again
          </button>
        </div>
      );
    }
    if (caughtUp && !fetching) {
      return (
        <div id="salt-voting-caught-up" className={styles.message}>
          <p className={styles.messageTitle}>You're all caught up!</p>
          <p>
            There are no more combos to vote on right now. Come back later, or see how your votes shape the rankings.
          </p>
          <div className="flex flex-wrap justify-center">
            <button type="button" className="button" onClick={lookAgain}>
              Look again
            </button>
            <Link className="button" href="/search/?sort=salt&order=desc">
              Saltiest combos
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.message}>
        <Loader />
      </div>
    );
  };

  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: Salt Voting"
        description="Vote on how salty EDH combos are, that is how unfun they are to play against."
      />
      <div className="static-page">
        <ArtCircle cardName="Salt Flats" className="m-auto md:block hidden" />
        <h1 className="heading-title">Salt Voting</h1>
        <p className={styles.intro}>
          How unfun is each combo to play against? Vote from 0 (not at all) to {MAX_SALT} (extremely). A combo gets a
          salt score once it has enough votes from the last year: find the{' '}
          <Link href="/search/?sort=salt&order=desc">saltiest combos</Link>, or search them with the{' '}
          <Link href="/syntax-guide/#salt">salt keyword</Link>.
        </p>
        {foolsDay && (
          <p id="salt-voting-fools-day" className={styles.foolsDay}>
            <Icon name="masks" /> Happy April Fools! Today's queue serves the least popular combos.
          </p>
        )}
        {renderState()}
        <p id="salt-voting-tally" className={styles.tally} aria-live="polite">
          {tally.voted} voted · {tally.skipped} skipped
          <span className={styles.shortcuts} aria-hidden="true">
            {loggedIn ? ` · keys 0–${MAX_SALT} pick a score, Enter votes, S skips` : ' · S skips'}
          </span>
        </p>
      </div>
    </>
  );
};

export default SaltVoting;
