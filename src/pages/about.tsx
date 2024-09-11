import React from "react";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ExternalLink from "../components/layout/ExternalLink/ExternalLink";
import styles from "./about.module.scss";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";

const About: React.FC = () => {
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: About"
        description="About the Commander Spellbook project to record EDH combos."
      />
      <div className={`static-page ${styles.aboutContainer}`}>
        <ArtCircle cardName="Codie, Vociferous Codex" className="m-auto md:block hidden" />
        <h1 className="heading-title">About Commander Spellbook</h1>

        <p>
          The Commander Spellbook project is a search engine for Commander/EDH combos and that makes them easily
          available across all modern digital platforms. This community driven project is used to power&nbsp;
          <ExternalLink href="https://edhrec.com/combos">EDHREC's Combo Feature</ExternalLink>.
        </p>
        <p>
          The source code for the website and the backend server are&nbsp;
          <ExternalLink href="https://opensource.org/licenses/MIT">
            completely free and open source under the MIT license
          </ExternalLink>
          .
        </p>
        <p>
          Interested in the development of Commander Spellbook? Head over to&nbsp;
          <ExternalLink href="https://discord.com/invite/DkAyVJG">our Discord server</ExternalLink>
          &nbsp;and invoke our @Artificers.
        </p>

        <ul>
          <li>
            <ExternalLink href="https://github.com/SpaceCowMedia/commander-spellbook-site">
              Website Source Code on GitHub
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://github.com/SpaceCowMedia/commander-spellbook-backend">
              Backend Source Code on GitHub
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={`${process.env.NEXT_PUBLIC_EDITOR_BACKEND_URL}/`}>Backend REST API</ExternalLink>
          </li>
        </ul>

        <strong>Sincerely, the Community Admins,</strong>
        <ul className="ml-4 list-inside">
          <li>
            <ExternalLink href="https://twitter.com/lappermedic">Lapper</ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.moxfield.com/users/goldshot20">Goldshot20</ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.moxfield.com/users/AppleSaws">AppleSaws</ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.secretpassageediting.com/">Myles Schaller</ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.moxfield.com/users/Gordon%27s%20Kitchen">Gordon</ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.youtube.com/c/ScholarsofKaladesh">Wedgi</ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.moxfield.com/users/SeniorEdificer">Senior Edificer</ExternalLink>
            &nbsp;(emeritus)
          </li>
        </ul>
      </div>
    </>
  );
};

export default About;
