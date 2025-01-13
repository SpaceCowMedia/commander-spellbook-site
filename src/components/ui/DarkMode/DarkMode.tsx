'use client';

import Icon from 'components/layout/Icon/Icon';
import React, { useEffect, useState } from 'react';
import CookieService from 'services/cookie.service';

export const SYSTEM_THEME = 'system';
export const LIGHT_THEME = 'light';
export const DARK_THEME = 'dark';
export const THEME_COOKIE_NAME = 'theme';

const DarkMode: React.FC = () => {
  const cookieTheme = CookieService.get<string>(THEME_COOKIE_NAME);
  const [darkMode, setDarkMode] = useState(cookieTheme ?? SYSTEM_THEME);

  function handlePreferenceChange(e: MediaQueryListEvent) {
    if (darkMode === SYSTEM_THEME) {
      document.documentElement.classList.toggle(DARK_THEME, e.matches);
    }
  }

  useEffect(() => {
    if (darkMode !== SYSTEM_THEME) {
      document.documentElement.classList.toggle(DARK_THEME, darkMode === DARK_THEME);
    } else {
      document.documentElement.classList.toggle(DARK_THEME, window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, [darkMode]);

  useEffect(() => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handlePreferenceChange);
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handlePreferenceChange);
    };
  }, []);

  const updateTheme = (theme: string) => {
    fetch('/api/set-theme?theme=' + theme);
    setDarkMode(theme);
  };

  return (
    <>
      {darkMode == LIGHT_THEME ? (
        <Icon name="sun" onClick={() => updateTheme(DARK_THEME)} />
      ) : darkMode == DARK_THEME ? (
        <Icon name="moon" onClick={() => updateTheme(SYSTEM_THEME)} />
      ) : (
        <Icon name="halfStrokeCircle" onClick={() => updateTheme(LIGHT_THEME)} />
      )}
    </>
  );
};

export default DarkMode;
