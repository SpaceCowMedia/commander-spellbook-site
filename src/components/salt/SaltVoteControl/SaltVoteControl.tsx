import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ResponseError, SaltVote, SaltVotesApi, Variant, VariantStatusEnum } from '@space-cow-media/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import useCookie from 'lib/react/useCookie';
import { isVoteExpired, SaltVoteError, saltTier, saltVoteError } from 'lib/salt/salt';
import Icon from 'components/ui/Icon/Icon';
import SaltSlider from 'components/salt/SaltSlider/SaltSlider';
import styles from './saltVoteControl.module.scss';

const VOTABLE_STATUSES: string[] = [VariantStatusEnum.Ok, VariantStatusEnum.E];

interface Props {
  combo: Variant;
  vote: SaltVote | null;
  onVoteChange: (_vote: SaltVote | null) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const SaltVoteControl: React.FC<Props> = ({ combo, vote, onVoteChange }) => {
  const [jwt, , cookieLoaded] = useCookie('csbJwt');
  const [voteLoaded, setVoteLoaded] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<SaltVoteError | null>(null);
  const loggedIn = !!jwt;
  const votable = VOTABLE_STATUSES.includes(combo.status);
  const loginLink = `/login/?final=/combo/${combo.id}/`;

  useEffect(() => {
    if (!loggedIn || !votable) {
      return;
    }
    let cancelled = false;
    new SaltVotesApi(apiConfiguration())
      .saltVotesList({ variant: combo.id })
      .then((page) => {
        if (!cancelled) {
          const saved = page.results[0] ?? null;
          onVoteChange(saved);
          setPicked(saved?.score ?? null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(saltVoteError(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setVoteLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn, votable, combo.id]);

  const cast = async () => {
    if (picked === null || pending) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const saved = await new SaltVotesApi(apiConfiguration()).saltVotesUpdate({
        variant: combo.id,
        saltVoteRequest: { score: picked },
      });
      onVoteChange(saved);
    } catch (err) {
      setError(saltVoteError(err));
    } finally {
      setPending(false);
    }
  };

  const retract = async () => {
    setPending(true);
    setError(null);
    try {
      await new SaltVotesApi(apiConfiguration()).saltVotesDestroy({ variant: combo.id });
    } catch (err) {
      if (!(err instanceof ResponseError && err.response.status === 404)) {
        setError(saltVoteError(err));
        setPending(false);
        return;
      }
    }
    onVoteChange(null);
    setPicked(null);
    setPending(false);
  };

  const renderVoting = () => {
    if (!votable) {
      return <p className={styles.note}>Voting opens once this combo is published.</p>;
    }
    if (!cookieLoaded || (loggedIn && !voteLoaded)) {
      return <SaltSlider id="salt-vote-slider" label="Your salt vote" value={null} onChange={() => {}} disabled />;
    }
    if (!loggedIn) {
      return (
        <div className={styles.login}>
          <p className={styles.note}>How unfun is this combo to play against? Log in to cast your vote.</p>
          <Link id="salt-vote-login" href={loginLink} className={styles.voteButton}>
            Log in to vote
          </Link>
        </div>
      );
    }
    return (
      <>
        <SaltSlider
          id="salt-vote-slider"
          label="Your salt vote"
          value={picked}
          onChange={setPicked}
          onConfirm={cast}
          disabled={pending}
        />
        <div className={styles.actions}>
          <button
            id="salt-vote-submit"
            type="button"
            className={styles.voteButton}
            disabled={picked === null || pending}
            onClick={cast}
          >
            {vote === null ? 'Vote' : picked === vote.score ? 'Vote again' : 'Change vote'}
          </button>
          {vote !== null && (
            <button
              id="salt-vote-retract"
              type="button"
              className={styles.retractButton}
              disabled={pending}
              onClick={retract}
            >
              Retract
            </button>
          )}
        </div>
        {vote !== null &&
          (isVoteExpired(vote) ? (
            <p id="salt-vote-status" className={styles.expired}>
              <Icon name="triangleExclamation" className={styles.expiredIcon} />
              <span>
                You voted {vote.score} · {saltTier(vote.score)} on {formatDate(vote.updated)}, more than a year ago, so
                your vote no longer counts. <strong>Vote again</strong> to make it count.
              </span>
            </p>
          ) : (
            <>
              <p id="salt-vote-status" className={styles.status}>
                You voted {vote.score} · {saltTier(vote.score)} on {formatDate(vote.updated)}.
              </p>
              <p className={styles.hint}>
                Votes stop counting a year after they are cast or changed, so vote again to refresh yours.
              </p>
            </>
          ))}
      </>
    );
  };

  return (
    <div className={styles.control}>
      <h3 className={styles.heading}>Your vote</h3>
      {renderVoting()}
      {error && (
        <p id="salt-vote-error" role="alert" className={styles.error}>
          {error.message}{' '}
          {error.loginRequired && (
            <Link href={loginLink} className="font-bold">
              Log in
            </Link>
          )}
        </p>
      )}
      <Link href="/salt/" className={styles.queueLink}>
        Vote on more combos →
      </Link>
    </div>
  );
};

export default SaltVoteControl;
