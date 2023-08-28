import React, {useEffect, useState} from "react";
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ExternalLink from "../components/layout/ExternalLink/ExternalLink";
import styles from "./report-error.module.scss";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import {v4 as uuid4} from "uuid";
import {useCookies} from "react-cookie";
type Props = {};

const Login: React.FC<Props> = ({}: Props) => {

  const [localState, setLocalState] = useState('')

  useEffect(() => {
    let storedState = localStorage.getItem('discordState')
    if (!storedState) {
      storedState = uuid4()
      localStorage.setItem('discordState', storedState)
    }
    setLocalState(storedState)
  }, [])

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
            href={`https://discord.com/oauth2/authorize?client_id=1138608636759904387&redirect_uri=https://dev.commanderspellbook.com/discord-login&state=${localState}&response_type=code&scope=identify+email+guilds`}
          >
            Login with Discord
          </ExternalLink>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;
