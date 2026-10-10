import styles from './previewCaption.module.scss';
import React from 'react';

interface Props {
  text: string;
  progress?: {
    durationMs: number;
    /* restarts the bar whenever it changes */
    key: React.Key;
    className?: string;
  };
}

/* The banner every card preview speaks through, so that a template's rotation and a spoiler's
   countdown look and time the same. */
const PreviewCaption: React.FC<Props> = ({ text, progress }) => (
  <div className={styles.caption}>
    {text}
    {progress && (
      <div className={`${styles.progressTrack} ${progress.className ?? ''}`}>
        <div key={progress.key} className={styles.progress} style={{ animationDuration: `${progress.durationMs}ms` }} />
      </div>
    )}
  </div>
);

export default PreviewCaption;
