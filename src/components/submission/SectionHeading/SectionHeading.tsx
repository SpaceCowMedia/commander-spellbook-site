import React from 'react';
import Icon, { SpellbookIcon } from '../../layout/Icon/Icon';

interface Props {
  icon: SpellbookIcon;
  title: string;
  count?: number;
}

const SectionHeading: React.FC<Props> = ({ icon, title, count }) => (
  <h2 className="submission-heading">
    <Icon name={icon} className="text-primary" />
    <span>{title}</span>
    {count !== undefined && <span className="submission-count">{count}</span>}
  </h2>
);

export default SectionHeading;
