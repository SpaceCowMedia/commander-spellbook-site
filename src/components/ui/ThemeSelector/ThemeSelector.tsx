import Icon from 'components/layout/Icon/Icon';
import React, { useEffect } from 'react';
import { DARK_THEME, LIGHT_THEME, SYSTEM_THEME, applyTheme } from 'services/theme.service';
import { useCookies } from 'react-cookie';
import styles from './ThemeSelector.module.scss';

const ThemeSelector: React.FC = () => {
  const [cookies, setCookies] = useCookies(['theme']);
  useEffect(() => {
    if (!cookies.theme) {
      return updateTheme(SYSTEM_THEME);
    } else {
      return applyTheme(cookies.theme);
    }
  }, [cookies.theme]);

  const updateTheme = (theme: string) => {
    setCookies('theme', theme, { maxAge: 31536000 });
  };

  return (
    <button className={styles.iconButton}>
      {cookies.theme == LIGHT_THEME ? (
        <Icon name="sun" onClick={() => updateTheme(DARK_THEME)} />
      ) : cookies.theme == DARK_THEME ? (
        <Icon name="moon" onClick={() => updateTheme(SYSTEM_THEME)} />
      ) : (
        <Icon name="halfStrokeCircle" onClick={() => updateTheme(LIGHT_THEME)} />
      )}
    </button>
  );
};

export default ThemeSelector;
