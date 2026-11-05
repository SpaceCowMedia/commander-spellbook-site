import React from 'react';
import ArtCircle from 'components/card/ArtCircle/ArtCircle';
import styles from './login.module.scss';
import SpellbookHead from 'components/layout/SpellbookHead/SpellbookHead';
import Link from 'next/link';
import ExternalLink from 'components/layout/ExternalLink/ExternalLink';

const Login: React.FC = () => {
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: Unable to Log In"
        description="An error occurred during the login process."
      />
      <div className={`static-page ${styles.reportErrorContainer}`}>
        <ArtCircle cardName="Kethis, the Hidden Hand" className="m-auto md:block hidden" />
        <h1 className="heading-title">Unable to Log In</h1>

        <div className="text-center">
          <p>You must be a member of the Commander Spellbook discord server to log in.</p>
          <ExternalLink role="button" className="button" href="https://discord.com/invite/DkAyVJG">
            Join the Commander Spellbook Discord
          </ExternalLink>
        </div>
        <div className="text-center">
          <Link role="button" className="button" href="/login">
            Log In Again
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;
