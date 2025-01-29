import React, { useEffect } from 'react';
import ArtCircle from '../../components/layout/ArtCircle/ArtCircle';
import styles from '../report-error.module.scss';
import SpellbookHead from '../../components/SpellbookHead/SpellbookHead';
import TokenService from '../../services/token.service';
import CookieService from '../../services/cookie.service';
import Link from 'next/link';
import ExternalLink from '../../components/layout/ExternalLink/ExternalLink';
import { useRouter } from 'next/router';
import { apiConfiguration } from 'services/api.service';
import { UsersApi } from '@space-cow-media/spellbook-client';

const Login: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const decodedJwt = TokenService.decodeJwt(CookieService.get('csbJwt'));

    if (decodedJwt) {
      const configuration = apiConfiguration();
      const usersApi = new UsersApi(configuration);
      usersApi.usersRetrieve({ id: decodedJwt.user_id }).then((user) => {
        console.log(user);
      });
    }
  }, []);

  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: Login"
        description="Login through discord to submit combo suggestions."
      />
      <div className={`static-page ${styles.reportErrorContainer}`}>
        <ArtCircle cardName="Kethis, the Hidden Hand" className="m-auto md:block hidden" />
        <h1 className="heading-title">Login</h1>
        <div className="text-center">
          <p>
            Currently you can only login through discord. You must be a member of the{' '}
            <ExternalLink href="https://discord.com/invite/DkAyVJG">Commander Spellbook Discord server</ExternalLink> to
            login.
          </p>

          <Link
            role="button"
            className="button"
            href={`${process.env.NEXT_PUBLIC_EDITOR_BACKEND_URL}/login/discord/?code&next=${process.env.NEXT_PUBLIC_CLIENT_URL}/login/discord/?${router.query.final ? `final=${router.query.final}` : ''}`}
          >
            Login with Discord
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;
