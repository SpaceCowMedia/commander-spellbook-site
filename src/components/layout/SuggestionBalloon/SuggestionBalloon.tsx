import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import useCookie from 'lib/useCookie';
import { Suggestion, pickSuggestion, rememberSuggestionShown } from 'lib/suggestions';
import Icon from '../Icon/Icon';
import styles from './suggestionBalloon.module.scss';

interface Props {
  suggestions: Suggestion[];
}

const SuggestionBalloon: React.FC<Props> = ({ suggestions }) => {
  const [jwt, , cookieLoaded] = useCookie('csbJwt');
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  // Dismissed but still sinking away, so it stays until its animation ends.
  const [dismissed, setDismissed] = useState(false);
  const rolled = useRef(false);

  useEffect(() => {
    if (!cookieLoaded || rolled.current) {
      return;
    }
    rolled.current = true;
    const picked = pickSuggestion(suggestions, { loggedIn: !!jwt });
    if (picked) {
      rememberSuggestionShown();
      setSuggestion(picked);
    }
  }, [cookieLoaded]);

  if (!suggestion) {
    return null;
  }

  return (
    <aside
      id="suggestion-balloon"
      data-suggestion={suggestion.id}
      className={`${styles.balloon} ${dismissed ? styles.dismissed : ''}`}
      aria-labelledby="suggestion-balloon-title"
      inert={dismissed}
      onAnimationEnd={(event) => {
        if (dismissed && event.target === event.currentTarget) {
          setSuggestion(null);
        }
      }}
    >
      <Icon name={suggestion.icon} className={styles.icon} />
      <div className={styles.body}>
        <p id="suggestion-balloon-title" className={styles.title}>
          {suggestion.title}
        </p>
        <p className={styles.message}>{suggestion.message}</p>
        <Link href={suggestion.href} className={`button tight ${styles.action}`}>
          {suggestion.action}
        </Link>
      </div>
      <button
        id="suggestion-balloon-dismiss"
        type="button"
        className={styles.dismiss}
        aria-label="Dismiss suggestion"
        onClick={() => setDismissed(true)}
      >
        <Icon name="cross" />
      </button>
    </aside>
  );
};

export default SuggestionBalloon;
