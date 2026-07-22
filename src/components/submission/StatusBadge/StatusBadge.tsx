import React from 'react';
import { SuggestionStatusEnum } from '@space-cow-media/spellbook-client';
import Icon, { SpellbookIcon } from '../../layout/Icon/Icon';

interface StatusInfo {
  label: string;
  icon: SpellbookIcon;
  className: string;
}

const STATUS_INFO: Partial<Record<SuggestionStatusEnum, StatusInfo>> = {
  [SuggestionStatusEnum.A]: {
    label: 'Accepted',
    icon: 'checkDouble',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  },
  [SuggestionStatusEnum.Pa]: {
    label: 'Pending Approval',
    icon: 'check',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  [SuggestionStatusEnum.R]: {
    label: 'Rejected',
    icon: 'cross',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  },
  [SuggestionStatusEnum.N]: {
    label: 'New',
    icon: 'star',
    className: 'bg-primary/15 text-link dark:text-primary',
  },
  [SuggestionStatusEnum.Ad]: {
    label: 'Awaiting Discussion',
    icon: 'comments',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
};

const UNKNOWN_STATUS: StatusInfo = {
  label: 'Unknown',
  icon: 'question',
  className: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
};

const StatusBadge: React.FC<{ status: SuggestionStatusEnum }> = ({ status }) => {
  const info = STATUS_INFO[status] ?? UNKNOWN_STATUS;
  return (
    <span className={`status-badge ${info.className}`} title={info.label}>
      <Icon name={info.icon} />
      {info.label}
    </span>
  );
};

export default StatusBadge;
