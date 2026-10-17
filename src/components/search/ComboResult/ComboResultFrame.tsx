import React from 'react';
import styles from './comboResultFrame.module.scss';

interface Props {
  bannerClassName?: string;
  bannerText?: string;
  children: React.ReactNode;
  className?: string;
  footerText: string;
  footerTitle?: string;
}

const ComboResultFrame: React.FC<Props> = ({
  bannerClassName,
  bannerText,
  children,
  className,
  footerText,
  footerTitle,
}) => (
  <div className={`${styles.comboResultFrame} ${className ?? ''}`}>
    <div className={styles.content}>{children}</div>
    {bannerText && <div className={`${styles.banner} ${bannerClassName ?? ''}`}>{bannerText}</div>}
    <div className={styles.footer} title={footerTitle}>
      {footerText}
    </div>
  </div>
);

export default ComboResultFrame;
