import React from 'react';
import { VariantStatusEnum } from '@space-cow-media/spellbook-client';
import styles from './comboResultFrame.module.scss';
import cn from 'lib/cn';

interface Props {
  header: React.ReactNode;
  /* Left out for combos that do not share a single status, which then look like approved ones. */
  status?: VariantStatusEnum;
  banner?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

function statusLook(status?: VariantStatusEnum): { className: string; tooltip?: string } {
  switch (status) {
    case undefined:
    case VariantStatusEnum.Ok:
      return { className: styles.okStatus };
    case VariantStatusEnum.E:
      return { className: styles.exampleStatus, tooltip: 'Combo marked as EXAMPLE' };
    default:
      return { className: styles.draftStatus, tooltip: 'Combo marked as DRAFT' };
  }
}

const ComboResultFrame: React.FC<Props> = ({ header, status, banner, footer, children }) => {
  const { className: statusClass, tooltip } = statusLook(status);

  return (
    <div className={styles.comboResultFrame}>
      <div className={cn(styles.header, statusClass)} title={tooltip}>
        {header}
      </div>
      <div className={styles.content}>{children}</div>
      {banner && <div className={styles.banner}>{banner}</div>}
      {footer && (
        <div className={cn(styles.footer, statusClass)} title={tooltip}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default ComboResultFrame;
