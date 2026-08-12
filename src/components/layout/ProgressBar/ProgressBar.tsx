import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import styles from './progressBar.module.scss';

const START_PROGRESS = 0.3;
const STOP_DELAY_MS = 200;
const TRICKLE_INTERVAL_MS = 200;
const FADE_MS = 200;

// Matches the deceleration NProgress used, so the bar keeps its familiar feel.
function trickleAmount(progress: number): number {
  if (progress < 0.2) {
    return 0.1;
  }
  if (progress < 0.5) {
    return 0.04;
  }
  if (progress < 0.8) {
    return 0.02;
  }
  if (progress < 0.99) {
    return 0.005;
  }
  return 0;
}

type Props = {
  color: string;
};

const ProgressBar: React.FC<Props> = ({ color }) => {
  const router = useRouter();
  const [progress, setProgress] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      if (trickle.current) {
        clearInterval(trickle.current);
        trickle.current = null;
      }
    };

    const start = () => {
      clearTimers();
      setProgress(START_PROGRESS);
      trickle.current = setInterval(() => {
        setProgress((current) => (current === null ? current : current + trickleAmount(current)));
      }, TRICKLE_INTERVAL_MS);
    };

    const stop = () => {
      clearTimers();
      timers.current.push(
        setTimeout(() => {
          setProgress(1);
          timers.current.push(setTimeout(() => setProgress(null), FADE_MS));
        }, STOP_DELAY_MS),
      );
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', stop);
    router.events.on('routeChangeError', stop);
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', stop);
      router.events.off('routeChangeError', stop);
      clearTimers();
    };
  }, [router.events]);

  if (progress === null) {
    return null;
  }

  return (
    <div
      id="progress-bar"
      className={`${styles.progressBar} ${progress === 1 ? styles.done : ''}`}
      style={{ transform: `scaleX(${progress})`, ['--progress-color' as string]: color }}
    >
      <span className={styles.peg} />
    </div>
  );
};

export default ProgressBar;
