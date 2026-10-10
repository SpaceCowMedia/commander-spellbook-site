import React, { CSSProperties, useRef } from 'react';
import styles from './saltSlider.module.scss';
import { MAX_SALT, SALT_LEVELS, saltTier } from 'lib/salt/salt';
import Icon from 'components/ui/Icon/Icon';
import classNames from 'lib/react/classNames';

interface Props {
  id: string;
  label: string;
  value: number | null;
  onChange: (_value: number) => void;
  onConfirm?: () => void;
  disabled?: boolean;
}

const GRAINS_PER_SCORE = [0, 3, 5, 7, 10];

const INNER_STOPS = Array.from({ length: MAX_SALT - 1 }, (_, index) => index + 1);

// An unrated slider rests on 0 without showing it, so the keys that would stay there have to pick it instead.
const KEYS_TOWARDS_ZERO = ['ArrowLeft', 'ArrowDown', 'Home', 'PageDown'];

const SaltSlider: React.FC<Props> = ({ id, label, value, onChange, onConfirm, disabled }) => {
  const input = useRef<HTMLInputElement>(null);
  const position = value ?? 0;
  const grainCount = GRAINS_PER_SCORE[position];

  const pick = (score: number) => {
    if (!disabled) {
      onChange(score);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onConfirm?.();
    } else if (value === null && KEYS_TOWARDS_ZERO.includes(event.key)) {
      pick(0);
    }
  };

  return (
    <div
      className={classNames(styles.slider, value === null && styles.unset, disabled && styles.disabled)}
      style={{ '--value': position } as CSSProperties}
    >
      <div className={styles.readout} aria-hidden="true">
        {value === null ? (
          <span className={styles.prompt}>Slide or tap to rate</span>
        ) : (
          <span key={value} className={styles.reading}>
            <span className={styles.score}>{value}</span>
            <span className={styles.tier}>{saltTier(value)}</span>
          </span>
        )}
      </div>
      <div className={styles.control}>
        <input
          ref={input}
          id={id}
          type="range"
          className={styles.input}
          min={0}
          max={MAX_SALT}
          step={1}
          value={position}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={value === null ? 'Not rated' : `${value}, ${saltTier(value)}`}
          onChange={(event) => pick(Number(event.target.value))}
          onClick={(event) => value === null && pick(Number(event.currentTarget.value))}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.track} aria-hidden="true">
          <div className={styles.fill} />
          {INNER_STOPS.map((stop) => (
            <span key={stop} className={styles.stop} style={{ '--stop': stop } as CSSProperties} />
          ))}
          <div className={styles.rail}>
            <div className={styles.knob}>
              <span
                key={value ?? 'unset'}
                className={styles.shaker}
                style={{ '--grains': grainCount } as CSSProperties}
              >
                <Icon name="salt" className={styles.shakerIcon} />
                {Array.from({ length: grainCount }, (_, grain) => (
                  <span key={grain} className={styles.grain} style={{ '--grain': grain } as CSSProperties} />
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.scale} aria-hidden="true">
        {SALT_LEVELS.map((level, score) => (
          <button
            key={score}
            type="button"
            tabIndex={-1}
            data-salt-tick={score}
            title={`${score} · ${level}`}
            className={classNames(styles.tick, value === score && styles.picked)}
            style={{ '--stop': score } as CSSProperties}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              pick(score);
              input.current?.focus();
            }}
          >
            {score}
          </button>
        ))}
      </div>
      <div className={styles.captions} aria-hidden="true">
        <span>{SALT_LEVELS[0]}</span>
        <span>{SALT_LEVELS[MAX_SALT]}</span>
      </div>
    </div>
  );
};

export default SaltSlider;
