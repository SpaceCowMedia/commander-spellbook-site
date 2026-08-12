import Icon from 'components/layout/Icon/Icon';
import React, { useEffect } from 'react';
import { DARK_THEME, LIGHT_THEME, SYSTEM_THEME, THEME_COOKIE_NAME, applyTheme } from 'services/theme.service';
import useCookie from 'lib/useCookie';
import styles from './ThemeSelector.module.scss';

const ThemeSelector: React.FC = () => {
  const [theme, setTheme, loaded] = useCookie(THEME_COOKIE_NAME);

  const updateTheme = (next: string) => {
    setTheme(next, 'year');
  };

  useEffect(() => {
    // Until the cookie is read, the inline script in _document owns the applied theme.
    if (!loaded) {
      return;
    }
    if (!theme) {
      return updateTheme(SYSTEM_THEME);
    } else {
      return applyTheme(theme);
    }
  }, [loaded, theme]);

  return (
    <button
      type="button"
      className={styles.iconButton}
      title={
        theme == LIGHT_THEME
          ? 'Switch to dark theme'
          : theme == DARK_THEME
            ? 'Switch to system theme'
            : 'Switch to light theme'
      }
      onClick={() => updateTheme(theme == LIGHT_THEME ? DARK_THEME : theme == DARK_THEME ? SYSTEM_THEME : LIGHT_THEME)}
    >
      {theme == LIGHT_THEME ? (
        <Icon name="sun" />
      ) : theme == DARK_THEME ? (
        <Icon name="moon" />
      ) : (
        <Icon name="halfStrokeCircle" />
      )}
    </button>
  );
};

export default ThemeSelector;
