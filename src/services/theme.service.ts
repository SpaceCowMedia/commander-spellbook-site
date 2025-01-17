export const LIGHT_THEME = 'light';
export const DARK_THEME = 'dark';
export const SYSTEM_THEME = 'system';
export const THEME_COOKIE_NAME = 'theme';

export function applyTheme(theme: string): () => void {
  let dark = theme === DARK_THEME;
  if (theme === SYSTEM_THEME) {
    dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  document.documentElement.classList.toggle(DARK_THEME, dark);
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
