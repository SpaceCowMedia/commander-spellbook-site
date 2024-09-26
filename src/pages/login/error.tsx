import React from 'react';
import ArtCircle from '../../components/layout/ArtCircle/ArtCircle';
import styles from '../report-error.module.scss';
import SpellbookHead from '../../components/SpellbookHead/SpellbookHead';
import Link from 'next/link';

const Login: React.FC = () => {
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: Login Error"
        description="An error occurred during the login process."
      />
      <div className={`static-page ${styles.reportErrorContainer}`}>
        <ArtCircle cardName="Kethis, the Hidden Hand" className="m-auto md:block hidden" />
        <h1 className="heading-title">Login Error</h1>

        <div className="text-center">
          <p>You must be a member of the Commander Spellbook discord server to login.</p>
          <Link role="button" className="button" href="https://discord.com/invite/DkAyVJG">
            Join the Commander Spellbook Discord
          </Link>
        </div>
        <div className="text-center">
          <Link role="button" className="button" href="/login">
            Retry Login
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;
