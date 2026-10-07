export const LIGHT_THEME = 'light';
export const DARK_THEME = 'dark';
export const SYSTEM_THEME = 'system';
export const THEME_COOKIE_NAME = 'theme';

export function isDarkTheme(theme: string): boolean {
  return theme === SYSTEM_THEME ? window.matchMedia('(prefers-color-scheme: dark)').matches : theme === DARK_THEME;
}

export function applyTheme(theme: string): () => void {
  document.documentElement.classList.toggle(DARK_THEME, isDarkTheme(theme));
  if (theme !== SYSTEM_THEME) {
    return () => {};
  }
  function listenToMediaChange(event: MediaQueryListEvent) {
    if (theme === SYSTEM_THEME) {
      document.documentElement.classList.toggle(DARK_THEME, event.matches);
    }
  }
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', listenToMediaChange);
  return () => {
    mediaQuery.removeEventListener('change', listenToMediaChange);
  };
}
