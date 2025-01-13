import Icon from 'components/layout/Icon/Icon';
import React, { useEffect, useState } from 'react';
import { DARK_THEME, getTheme, LIGHT_THEME, setTheme, SYSTEM_THEME } from 'services/theme.service';

const ThemeSelector: React.FC = () => {
  const [darkMode, setDarkMode] = useState(SYSTEM_THEME);

  useEffect(() => {
    setDarkMode(getTheme());
  }, []);

  const updateTheme = (theme: string) => {
    setDarkMode(theme);
    setTheme(theme);
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

export default ThemeSelector;
