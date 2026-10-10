import Icon from 'components/ui/Icon/Icon';
import React, { useEffect } from 'react';
import {
  DARK_THEME,
  LIGHT_THEME,
  SYSTEM_THEME,
  THEME_COOKIE_NAME,
  applyTheme,
  isDarkTheme,
} from 'services/theme.service';
import useCookie from 'lib/react/useCookie';
import { THEME_SWITCH } from 'lib/viewTransitions';
import styles from './themeSelector.module.scss';

const ThemeSelector: React.FC = () => {
  const [theme, setTheme, loaded] = useCookie(THEME_COOKIE_NAME);

  const updateTheme = (next: string) => {
    setTheme(next, 'year');
  };

  // The new theme spreads from the corner over the old one. Both apply in the transition's update, after the old page
  // is captured: the effect below would otherwise apply the new theme before.
  const switchTheme = (next: string) => {
    const root = document.documentElement;
    if (!('startViewTransition' in document) || isDarkTheme(next) === root.classList.contains(DARK_THEME)) {
      updateTheme(next);
      return;
    }
    document.startViewTransition({
      update: () => {
        root.classList.toggle(DARK_THEME, isDarkTheme(next));
        updateTheme(next);
      },
      types: [THEME_SWITCH],
    });
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
      onClick={() => switchTheme(theme == LIGHT_THEME ? DARK_THEME : theme == DARK_THEME ? SYSTEM_THEME : LIGHT_THEME)}
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
