import styles from './spoilerFog.module.scss';
import React, { useId } from 'react';
import { Tooltip } from 'react-tooltip';
import { revealAllSpoilers, revealSpoiler, useSpoilerFogged } from 'lib/spoilers';

const REVEAL_ALL_HELP = 'Click to show every spoiler until you close this tab';
const MODAL_Z_INDEX = 10000000000;

interface Props {
  name: string;
  spoiler: boolean;
  /* Off in hover previews, which reveal spoilers as a whole. */
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const SpoilerFog: React.FC<Props> = ({ name, spoiler, interactive = true, className, children }) => {
  const tooltipId = useId();
  const fogged = useSpoilerFogged({ name, spoiler });

  return (
    <div className={`${styles.spoilerFog} ${fogged ? styles.fogged : ''} ${className ?? ''}`}>
      {children}
      {spoiler && (
        <div className={`${styles.fog} ${fogged ? '' : styles.dissolved}`} aria-hidden={!interactive || undefined}>
          {interactive ? (
            <>
              <button
                type="button"
                className={styles.veil}
                aria-label="Reveal this spoiler card"
                onClick={() => revealSpoiler(name)}
              />
              <button
                type="button"
                className={styles.label}
                onClick={revealAllSpoilers}
                data-tooltip-id={tooltipId}
                data-tooltip-content={REVEAL_ALL_HELP}
              >
                Spoiler
              </button>
              {fogged && (
                // out of the card's flip transform, and above the replacements modal
                <Tooltip
                  id={tooltipId}
                  positionStrategy="fixed"
                  portalRoot={typeof document === 'undefined' ? undefined : document.body}
                  style={{ zIndex: MODAL_Z_INDEX }}
                />
              )}
            </>
          ) : (
            <span className={styles.label}>Spoiler</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SpoilerFog;
