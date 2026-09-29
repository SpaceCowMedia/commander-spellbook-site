import ErrorBase from '../ErrorBase/ErrorBase';
import SpellbookHead from '../../SpellbookHead/SpellbookHead';
import styles from './httpErrorPage.module.scss';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiErrorMessage } from '../../../lib/httpErrors';

interface ErrorTemplate {
  title: string;
  // Each background art comes with its own flavor line
  arts: [string, string][];
}

const BAD_REQUEST: ErrorTemplate = {
  title: 'Bad Request',
  arts: [
    [styles.mentalMisstep, 'Just a small misstep.'],
    [styles.wrongTurn, 'Looks like a wrong turn.'],
    [styles.counterspell, "That one didn't resolve."],
  ],
};

const UNAUTHORIZED: ErrorTemplate = {
  title: 'Login Required',
  arts: [
    [styles.gatekeeperOfMalakir, 'Halt! Who goes there?'],
    [styles.ghostlyPrison, 'None shall pass unannounced.'],
  ],
};

const FORBIDDEN: ErrorTemplate = {
  title: 'Access Denied',
  arts: [
    [styles.forbiddenOrchard, 'This orchard is off-limits.'],
    [styles.silence, 'Not for your eyes.'],
  ],
};

const NOT_FOUND: ErrorTemplate = {
  title: 'Page Not Found',
  arts: [
    [styles.barrenGlory, 'You were looking for glory, but found an empty world.'],
    [styles.curiosity, 'How curious...'],
    [styles.lostInTheWoods, 'Must be lost in the woods.'],
    [styles.oneWithNothing, 'You were looking for one thing. You found... nothing.'],
    [styles.possibilityStorm, 'So many possibilities... just not on this page.'],
    [styles.totallyLost, "Looks like you're totally lost..."],
    [styles.unexpectedlyAbsent, 'It was unexpectedly absent.'],
    [styles.zhalfirinVoid, 'Must have phased out.'],
  ],
};

const TIMED_OUT: ErrorTemplate = {
  title: 'Timed Out',
  arts: [
    [styles.timeStop, 'Time stood still.'],
    [styles.outOfTime, 'We ran out of time.'],
    [styles.stallForTime, 'Still waiting...'],
  ],
};

const TOO_MANY_REQUESTS: ErrorTemplate = {
  title: 'Slow Down',
  arts: [
    [styles.ruleOfLaw, 'One spell per turn, please.'],
    [styles.etherswornCanonist, 'The Canonist is keeping count.'],
    [styles.deafeningSilence, 'Hush. One at a time.'],
    [styles.winterOrb, 'Not everything untaps at once.'],
  ],
};

const SERVER_ERROR: ErrorTemplate = {
  title: 'Uh Oh',
  arts: [
    [styles.apocalypse, 'Everything went up in flames.'],
    [styles.obliterate, 'Obliterated.'],
    [styles.bookBurning, 'Someone burned the spellbook.'],
  ],
};

const UNAVAILABLE: ErrorTemplate = {
  title: 'Temporarily Unavailable',
  arts: [
    [styles.temporaryLockdown, 'Closed for a little while.'],
    [styles.sleep, 'The servers are taking a nap.'],
    [styles.powerSink, 'Out of mana.'],
  ],
};

const ERROR_TEMPLATES: Record<number, ErrorTemplate> = {
  400: BAD_REQUEST,
  401: UNAUTHORIZED,
  403: FORBIDDEN,
  404: NOT_FOUND,
  408: TIMED_OUT,
  429: TOO_MANY_REQUESTS,
  500: SERVER_ERROR,
  502: UNAVAILABLE,
  503: UNAVAILABLE,
  504: TIMED_OUT,
};

interface Props {
  status: number;
  // Seconds to wait before trying again, holding the retry back until then
  retryAfter?: number | null;
}

const HttpErrorPage: React.FC<Props> = ({ status, retryAfter }) => {
  const router = useRouter();
  const template = ERROR_TEMPLATES[status] ?? SERVER_ERROR;
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(retryAfter ?? 0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * template.arts.length));
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timeout = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timeout);
  }, [secondsLeft]);

  const [artClassName, flavor] = template.arts[index];
  const canRetry = status === 408 || status === 429 || status >= 500;
  const waiting = secondsLeft > 0;

  let message: string | undefined;
  // A missing page needs no more explanation than its title
  if (status !== 404) {
    message = retryAfter && !waiting ? 'You can try again now.' : apiErrorMessage(status, secondsLeft);
  }

  return (
    <>
      <SpellbookHead
        title={`Commander Spellbook: ${template.title}`}
        description={apiErrorMessage(status, retryAfter ?? undefined)}
      />
      <ErrorBase mainMessage={template.title} subMessage={flavor} containerClassName={artClassName}>
        {message && <p className={styles.message}>{message}</p>}
        {status === 401 && (
          <Link href={`/login?final=${encodeURIComponent(router.asPath)}`} className={`button ${styles.button}`}>
            Log In
          </Link>
        )}
        {canRetry && (
          <button
            type="button"
            className={`button ${styles.button} ${waiting ? 'disabled' : ''}`}
            disabled={waiting}
            onClick={() => router.reload()}
          >
            Try Again
          </button>
        )}
      </ErrorBase>
    </>
  );
};

export default HttpErrorPage;
