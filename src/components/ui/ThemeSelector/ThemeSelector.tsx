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
    <button
      className={styles.iconButton}
      title={
        cookies.theme == LIGHT_THEME
          ? 'Switch to dark theme'
          : cookies.theme == DARK_THEME
            ? 'Switch to system theme'
            : 'Switch to light theme'
      }
      onClick={() =>
        updateTheme(
          cookies.theme == LIGHT_THEME ? DARK_THEME : cookies.theme == DARK_THEME ? SYSTEM_THEME : LIGHT_THEME,
        )
      }
    >
      {cookies.theme == LIGHT_THEME ? (
        <Icon name="sun" />
      ) : cookies.theme == DARK_THEME ? (
        <Icon name="moon" />
      ) : (
        <Icon name="halfStrokeCircle" />
      )}
    </button>
  );
};

export default ThemeSelector;
