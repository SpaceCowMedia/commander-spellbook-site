import Icon from 'components/layout/Icon/Icon';
import React, { useEffect } from 'react';
import { DARK_THEME, LIGHT_THEME, applyTheme } from 'services/theme.service';
import { useCookies } from 'react-cookie';
import styles from './ThemeSelector.module.scss';

const ThemeSelector: React.FC = () => {
  const [cookies, setCookies] = useCookies(['theme']);
  const isDarkMode = cookies.theme === 'dark';
  useEffect(() => {
    if (!cookies.theme) {
      const isOsDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      updateTheme(isOsDarkMode ? DARK_THEME : LIGHT_THEME);
    } else {
      applyTheme(cookies.theme);
    }
  }, [cookies.theme]);
  const updateTheme = (theme: string) => {
    setCookies('theme', theme, { maxAge: 31536000 });
    applyTheme(theme);
  };

  return (
    <button className={styles.iconButton}>
      {isDarkMode ? (
        <Icon name="sun" onClick={() => updateTheme(LIGHT_THEME)} />
      ) : (
        <Icon name="moon" onClick={() => updateTheme(DARK_THEME)} />
      )}
    </button>
  );
};

export default ThemeSelector;
