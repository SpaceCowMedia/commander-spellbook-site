import React, {useEffect, useState} from "react";
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ExternalLink from "../components/layout/ExternalLink/ExternalLink";
import styles from "./report-error.module.scss";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
type Props = {};

const Login: React.FC<Props> = ({}: Props) => {

  return (
    <PageWrapper>
      <SpellbookHead
        title="Commander Spellbook: Login"
        description="Login through discord to submit combo suggestions."
      />
      <div className={`static-page ${styles.reportErrorContainer}`}>
        <ArtCircle cardName="Kethis, the Hidden Hand" className="m-auto md:block hidden" />
        <h1 className="heading-title">Login</h1>
        <p>
         Currently you can only login through discord. You must be a member of the Commander Spellbook discord server to login.
        </p>

        <div className="text-center">
          <ExternalLink
            role="button"
            className="button"
            href={`https://backend.commanderspellbook.com/login/discord/?code&next=${process.env.NEXT_PUBLIC_CLIENT_URL}/discord-login`}
          >
            Login with Discord
          </ExternalLink>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;
