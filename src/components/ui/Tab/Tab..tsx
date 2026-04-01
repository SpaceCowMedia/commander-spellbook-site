import styles from './Tab.module.scss';
import {useEffect, useState} from "react";

interface TabType {
  title: React.ReactNode;
  content: React.ReactNode;
}

interface Props {
  tabs: TabType[];
  activeTabIndex?: number;
  onTabChange?: (index: number) => void;
}

const Tab = ({ tabs, activeTabIndex, onTabChange } : Props) => {
  const [localTabIndex, setLocalTabIndex] = useState(activeTabIndex ?? 0);

  useEffect(() => {
    if (activeTabIndex !== undefined) {
      setLocalTabIndex(activeTabIndex);
    }
  }, [activeTabIndex]);

  const handleTabClick = (index: number) => {
    setLocalTabIndex(index);
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
            <div className={styles.bottomBorder}/>
          </button>
        ))}
      </div>
      <div>
        {tabs[localTabIndex]?.content}
      </div>
    </div>
  );
}

export default Tab;
