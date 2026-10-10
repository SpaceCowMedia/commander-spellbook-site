import { getCookie } from 'cookies-next/client';
import { useCallback, useEffect, useState } from 'react';
import CookieService, { expirationDurations } from 'services/cookie.service';

type Age = keyof typeof expirationDurations;

// Cookies are only readable once mounted, so `loaded` distinguishes "not read yet"
// from "not set". Reading during render instead would desync server and client markup.
export default function useCookie(key: string): [string | undefined, (value: string, age?: Age) => void, boolean] {
  const [value, setValue] = useState<string | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setValue(getCookie(key));
    setLoaded(true);
  }, [key]);

  const update = useCallback(
    (next: string, age?: Age) => {
      CookieService.set(key, next, age);
      setValue(next);
    },
    [key],
  );

  return [value, update, loaded];
}
