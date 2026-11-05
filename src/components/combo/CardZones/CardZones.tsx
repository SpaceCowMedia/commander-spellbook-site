import React, { useId } from 'react';
import { Tooltip } from 'react-tooltip';
import { CardInVariant, TemplateInVariant } from '@space-cow-media/spellbook-client';
import Icon from 'components/ui/Icon/Icon';
import { PREREQ_ICON_MAP } from 'components/combo/PrerequisiteList/PrerequisiteList';
import { ZONE_MAP } from 'lib/combo/prerequisitesProcessor';
import classNames from 'lib/react/classNames';
import styles from './cardZones.module.scss';

type Zone = keyof typeof ZONE_MAP;

const ZONE_STATES: Partial<
  Record<Zone, 'battlefieldCardState' | 'exileCardState' | 'graveyardCardState' | 'libraryCardState'>
> = {
  B: 'battlefieldCardState',
  E: 'exileCardState',
  G: 'graveyardCardState',
  L: 'libraryCardState',
};

interface SymbolProps {
  description: string;
  tooltipId: string;
  zone?: Zone;
  className?: string;
  children: React.ReactNode;
}

const ZoneSymbol: React.FC<SymbolProps> = ({ description, tooltipId, zone, className, children }) => (
  <button
    type="button"
    className={classNames(styles.symbol, className)}
    aria-label={description}
    data-zone={zone}
    data-tooltip-id={tooltipId}
    data-tooltip-content={description}
  >
    {children}
  </button>
);

interface Props {
  card: CardInVariant | TemplateInVariant;
  className?: string;
}

const CardZones: React.FC<Props> = ({ card, className }) => {
  const tooltipId = useId();
  const zones = card.zoneLocations.filter((zone): zone is Zone => zone in ZONE_MAP);
  const anyZone = zones.length === Object.keys(ZONE_MAP).length;
  const verb = zones.length > 1 ? 'Can start' : 'Starts';

  if (zones.length === 0 && !card.mustBeCommander) {
    return null;
  }

  const describe = (zone: Zone) => {
    const stateField = ZONE_STATES[zone];
    const state = stateField ? card[stateField] : '';
    const commander = zone === 'C' && card.mustBeCommander ? ', and must be your commander' : '';
    return `${verb} ${ZONE_MAP[zone]}${state ? ` (${state})` : ''}${commander}`;
  };

  return (
    <div className={classNames(styles.zones, className)}>
      {anyZone ? (
        <ZoneSymbol description="Can start in any zone" tooltipId={tooltipId} className={styles.anyZone}>
          Any zone
        </ZoneSymbol>
      ) : (
        zones.map((zone, index) => (
          <React.Fragment key={zone}>
            {index > 0 && (
              <span className={styles.or} aria-hidden="true">
                or
              </span>
            )}
            <ZoneSymbol description={describe(zone)} tooltipId={tooltipId} zone={zone}>
              <Icon name={PREREQ_ICON_MAP[zone]} />
            </ZoneSymbol>
          </React.Fragment>
        ))
      )}
      {card.mustBeCommander && (anyZone || !zones.includes('C')) && (
        <ZoneSymbol description="Must be your commander" tooltipId={tooltipId} className={styles.commander}>
          <Icon name="commander" />
        </ZoneSymbol>
      )}
      <Tooltip
        id={tooltipId}
        openEvents={{ mouseenter: true, focus: true, click: true }}
        closeEvents={{ mouseleave: true, blur: true }}
        globalCloseEvents={{ escape: true, clickOutsideAnchor: true }}
        portalRoot={typeof document === 'undefined' ? undefined : document.body}
      />
    </div>
  );
};

export default CardZones;
