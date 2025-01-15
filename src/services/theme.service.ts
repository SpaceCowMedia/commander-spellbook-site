export const LIGHT_THEME = 'light';
export const DARK_THEME = 'dark';
export const THEME_COOKIE_NAME = 'theme';

export function applyTheme(theme: string) {
  document.documentElement.classList.toggle(DARK_THEME, theme === DARK_THEME);
}
