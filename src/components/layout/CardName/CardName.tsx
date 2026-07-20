import React from 'react';
import styles from './cardName.module.scss';

interface Props {
  name: string;
  className?: string;
}

/* Alchemy (MTG Arena) rebalanced cards are named with an "A-" prefix, e.g. "A-Lightning Bolt".
   The prefix is kept in the underlying name (links, titles, exports) and only swapped for the
   alchemy symbol when rendered. Each face of a double-faced card carries its own prefix. */
const ALCHEMY_PREFIX = 'A-';
const FACE_SEPARATOR = ' // ';

const AlchemySymbol: React.FC = () => (
  <>
    <span className="sr-only">(Alchemy) </span>
    <img aria-hidden="true" className={styles.alchemySymbol} src="/images/mtga-alchemy.svg" alt="" />
  </>
);

const CardName: React.FC<Props> = ({ name, className }) => {
  const faces = name.split(FACE_SEPARATOR);

  if (!faces.some((face) => face.startsWith(ALCHEMY_PREFIX))) {
    return <span className={className}>{name}</span>;
  }

  return (
    <span className={className}>
      {faces.map((face, index) => (
        <React.Fragment key={index}>
          {index > 0 && FACE_SEPARATOR}
          {face.startsWith(ALCHEMY_PREFIX) ? (
            <>
              <AlchemySymbol />
              {face.slice(ALCHEMY_PREFIX.length)}
            </>
          ) : (
            face
          )}
        </React.Fragment>
      ))}
    </span>
  );
};

export default CardName;
