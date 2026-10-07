import styles from './Tab.module.scss';
import { addTransitionType, startTransition, useEffect, useId, useState, ViewTransition } from 'react';
import { TAB_BACK, TAB_FORWARD } from 'lib/viewTransitions';

// The panel updates in place, so the old and the new one slide across side by side, inside its bounds.
const PANEL_UPDATE = { [TAB_FORWARD]: 'tabSlideForward', [TAB_BACK]: 'tabSlideBack', default: 'none' };
const UNDERLINE_SHARE = { [TAB_FORWARD]: 'tabUnderline', [TAB_BACK]: 'tabUnderline', default: 'none' };

interface TabType {
  title: React.ReactNode;
  content: React.ReactNode;
}

interface Props {
  tabs: TabType[];
  activeTabIndex?: number;
  onTabChange?: (index: number) => void;
}

const Tab = ({ tabs, activeTabIndex, onTabChange }: Props) => {
  const [localTabIndex, setLocalTabIndex] = useState(activeTabIndex ?? 0);
  const underline = `tab-underline${useId()}`;

  useEffect(() => {
    if (activeTabIndex !== undefined) {
      setLocalTabIndex(activeTabIndex);
    }
  }, [activeTabIndex]);

  const handleTabClick = (index: number) => {
    if (index === localTabIndex) {
      return;
    }
    startTransition(() => {
      addTransitionType(index > localTabIndex ? TAB_FORWARD : TAB_BACK);
      setLocalTabIndex(index);
    });
    if (onTabChange) {
      onTabChange(index);
    }
  };

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabHeaders}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tabHeader} ${index === localTabIndex ? styles.activeTabHeader : ''}`}
            onClick={() => handleTabClick(index)}
          >
            <div className="p-3">{tab.title}</div>
            <div className={styles.bottomBorder}>
              {index === localTabIndex && (
                <ViewTransition name={underline} share={UNDERLINE_SHARE} default="none">
                  <div className={styles.underline} />
                </ViewTransition>
              )}
            </div>
          </button>
        ))}
      </div>
      <ViewTransition update={PANEL_UPDATE} default="none">
        <div>{tabs[localTabIndex]?.content}</div>
      </ViewTransition>
    </div>
  );
};

export default Tab;
