import CookieService from './cookie.service';

export const SYSTEM_THEME = 'system';
export const LIGHT_THEME = 'light';
export const DARK_THEME = 'dark';
export const THEME_COOKIE_NAME = 'theme';

const themes = [LIGHT_THEME, DARK_THEME, SYSTEM_THEME];

export const getTheme = () => {
  let localStorageTheme = localStorage.getItem(THEME_COOKIE_NAME);
  if (localStorageTheme) {
    if (themes.includes(localStorageTheme)) {
      return localStorageTheme;
    }
    localStorageTheme = null;
  }
  let cookieTheme = CookieService.get(THEME_COOKIE_NAME);
  if (cookieTheme) {
    if (themes.includes(cookieTheme)) {
      localStorage.setItem(THEME_COOKIE_NAME, cookieTheme);
      return cookieTheme;
    }
    cookieTheme = undefined;
  }
  localStorage.setItem(THEME_COOKIE_NAME, SYSTEM_THEME);
  return SYSTEM_THEME;
};

function applyTheme(theme: string) {
  if (theme === SYSTEM_THEME) {
    document.documentElement.classList.toggle(DARK_THEME, window.matchMedia('(prefers-color-scheme: dark)').matches);
  } else {
    document.documentElement.classList.toggle(DARK_THEME, theme === DARK_THEME);
  }
}

export const setTheme = (theme: string) => {
  if (!themes.includes(theme)) {
    theme = SYSTEM_THEME;
  }
  applyTheme(theme);
  localStorage.setItem(THEME_COOKIE_NAME, theme);
  fetch('/api/set-theme?theme=' + theme);
};

const listenThemeChanges = (): (() => void) => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Step 1. align settings with display
    const initialTheme = getTheme();
    applyTheme(initialTheme);

    // Step 2. listen for changes in local storage
    const storageEventListener = (e: StorageEvent) => {
      if (e.key === THEME_COOKIE_NAME && e.newValue && themes.includes(e.newValue)) {
        applyTheme(e.newValue);
      }
    };
    window.addEventListener('storage', storageEventListener);

    // Step 3. listen for changes in system preference
    function handlePreferenceChange(e: MediaQueryListEvent) {
      if (getTheme() === SYSTEM_THEME) {
        document.documentElement.classList.toggle(DARK_THEME, e.matches);
      }
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handlePreferenceChange);

    // Step 4. return cleanup function
    return () => {
      window.removeEventListener('storage', storageEventListener);
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handlePreferenceChange);
    };
  }
  return () => {};
};

listenThemeChanges();
