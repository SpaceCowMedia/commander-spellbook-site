import { DARK_THEME, LIGHT_THEME, SYSTEM_THEME, THEME_COOKIE_NAME } from 'components/ui/DarkMode/DarkMode';
import { NextApiRequest, NextApiResponse } from 'next';
import CookieService from 'services/cookie.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const mode = req.query.theme;
  const modes = [SYSTEM_THEME, LIGHT_THEME, DARK_THEME];
  if (typeof mode !== 'string' || !modes.includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode' });
  }
  CookieService.set(THEME_COOKIE_NAME, mode, 'year', {
    req: req,
    res: res,
  });
  res.status(200).json({ mode });
}
