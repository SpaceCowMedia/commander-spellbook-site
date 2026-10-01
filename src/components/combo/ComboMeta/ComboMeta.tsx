import React, { CSSProperties, useState } from 'react';
import Link from 'next/link';
import pluralize from 'pluralize';
import { SaltVote, Variant, VariantStatusEnum } from '@space-cow-media/spellbook-client';
import Icon, { SpellbookIcon } from 'components/layout/Icon/Icon';
import ExternalLink from 'components/layout/ExternalLink/ExternalLink';
import SaltMeter from 'components/salt/SaltMeter/SaltMeter';
import SaltVoteControl from 'components/salt/SaltVoteControl/SaltVoteControl';
import ComboBracket from 'components/combo/ComboBracket/ComboBracket';
import EDHRECService from 'services/edhrec.service';
import { IS_LOCK } from 'lib/constants';
import { formatSalt, liveSaltStats, MAX_SALT, SaltStats, saltTier } from 'lib/salt';
import cn from 'lib/cn';
import styles from './comboMeta.module.scss';

interface Props {
  combo: Variant;
}

interface Badge {
  icon: SpellbookIcon;
  label: string;
  description: string;
  className: string;
}

const NEUTRAL_BADGE = 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100';

const STATUS_BADGES: Partial<Record<VariantStatusEnum, Badge>> = {
  [VariantStatusEnum.E]: {
    icon: 'lightbulb',
    label: 'Example · no explanation',
    description: "This combo is an example of a variant and doesn't provide an explanation.",
    className: NEUTRAL_BADGE,
  },
  [VariantStatusEnum.D]: {
    icon: 'pencil',
    label: 'Draft · only visible to editors',
    description: 'This combo is a draft and is only visible to editors.',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  [VariantStatusEnum.Nr]: {
    icon: 'eye',
    label: 'Needs review · only visible to editors',
    description: 'This combo needs to be reviewed and is only visible to editors.',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
};

function getBadges(combo: Variant): Badge[] {
  const badges: Badge[] = [];
  if (combo.produces.some((feature) => feature.feature.name.toLowerCase() === 'lock')) {
    badges.push({ icon: 'lock', label: 'Lock', description: IS_LOCK, className: NEUTRAL_BADGE });
  }
  const statusBadge = STATUS_BADGES[combo.status];
  if (statusBadge) {
    badges.push(statusBadge);
  }
  return badges;
}

interface TileProps {
  id: string;
  icon: SpellbookIcon;
  label: string;
  value: React.ReactNode;
  caption: React.ReactNode;
  link?: React.ReactNode;
}

const Tile: React.FC<TileProps> = ({ id, icon, label, value, caption, link }) => (
  <div id={id} className={styles.tile}>
    <div className={styles.tileLabel}>
      <Icon name={icon} /> {label}
    </div>
    <div className={styles.tileValue}>{value}</div>
    <div className={styles.tileCaption}>{caption}</div>
    {link && <div className={styles.tileLink}>{link}</div>}
  </div>
);

const ComboMeta: React.FC<Props> = ({ combo }) => {
  const [vote, setVote] = useState<SaltVote | null>(null);
  const storedStats: SaltStats = { salt: combo.salt, voteCount: combo.saltVoteCount };
  const stats = vote ? liveSaltStats(storedStats, vote) : storedStats;
  const badges = getBadges(combo);
  const popularity = combo.popularity;
  const variantCount = Math.max(combo.variantCount, 1);

  return (
    <div id="combo-metadata" className={styles.metadata}>
      <h2 className="text-xl font-bold">Metadata</h2>

      {badges.length > 0 && (
        <ul className={styles.badges}>
          {badges.map((badge) => (
            <li key={badge.label} className={cn('status-badge', badge.className)} title={badge.description}>
              <Icon name={badge.icon} /> {badge.label}
            </li>
          ))}
        </ul>
      )}

      {!!combo.bracketTag && <ComboBracket combo={combo} />}

      <div className={styles.tiles}>
        <Tile
          id="combo-popularity"
          icon="arrowUpRightDots"
          label="Popularity"
          value={popularity === null ? '—' : popularity.toLocaleString('en-US')}
          caption={popularity === null ? 'No EDHREC data yet' : `${pluralize('deck', popularity)} on EDHREC`}
          link={!!popularity && <ExternalLink href={EDHRECService.getComboUrl(combo)}>View on EDHREC ↗</ExternalLink>}
        />
        <Tile
          id="combo-variant-count"
          icon="copy"
          label="Variants"
          value={variantCount}
          caption={variantCount > 1 ? 'variants of this combo' : 'the only variant of this combo'}
          link={variantCount > 1 && <Link href={`/search/?variant=${combo.id}&groupByCombo=false`}>Show all →</Link>}
        />
      </div>

      <section
        id="combo-salt"
        className={styles.salt}
        style={{ '--value': stats.salt ?? 0 } as CSSProperties}
        aria-labelledby="combo-salt-heading"
      >
        <div className={styles.saltScore}>
          <div id="combo-salt-heading" className={styles.tileLabel}>
            <Icon name="salt" /> Salt
          </div>
          {stats.salt === null ? (
            <div className={styles.saltValue}>
              <span className={styles.tooFewVotes}>Too few votes</span>
            </div>
          ) : (
            <div className={styles.saltValue}>
              <span className={styles.saltNumber}>{formatSalt(stats.salt)}</span>
              <span className={styles.saltScale}>/ {MAX_SALT}</span>
              <span className={styles.saltTier}>{saltTier(stats.salt)}</span>
            </div>
          )}
          <SaltMeter salt={stats.salt} className="mt-3" />
          {stats.voteCount > 0 && (
            <p id="combo-salt-votes" className={styles.saltVotes}>
              {stats.voteCount} {pluralize('vote', stats.voteCount)} in the last year
            </p>
          )}
          <p className={styles.saltExplanation}>
            How unfun this combo is to play against, from 0 to {MAX_SALT}, as voted by Commander Spellbook users. Scores
            are refreshed every couple of hours.
          </p>
        </div>
        <div className={styles.saltVote}>
          <SaltVoteControl combo={combo} vote={vote} onVoteChange={setVote} />
        </div>
      </section>
    </div>
  );
};

export default ComboMeta;
