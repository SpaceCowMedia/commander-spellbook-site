import React from "react";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ExternalLink from "../components/layout/ExternalLink/ExternalLink";
import styles from "./about.module.scss";
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";

type Props = {};

const About: React.FC<Props> = ({}: Props) => {
  return (
    <PageWrapper>
      <SpellbookHead
        title="Commander Spellbook: About"
        description="About the Commander Spellbook project to record EDH combos."
      />
      <div className={`static-page ${styles.aboutContainer}`}>
        <ArtCircle
          cardName="Codie, Vociferous Codex"
          className="m-auto md:block hidden"
        />
        <h1 className="heading-title">About Commander Spellbook</h1>

        <p>
          The Commander Spellbook project is a search engine for Commander/EDH
          combos and to make them easily available across all modern digital
          platforms. This community driven project is used to power&nbsp;
          <ExternalLink href="https://edhrec.com/combos">
            EDHREC's Combo Feature
          </ExternalLink>
          .
        </p>
        <p>
          The database and the source code for the website are&nbsp;
          <ExternalLink href="https://opensource.org/licenses/MIT">
            completely free and open source under the MIT license
          </ExternalLink>
          . We encourage you to copy this data so it lives on!
        </p>

        <ul>
          <li>
            <ExternalLink href="https://github.com/Commander-Spellbook/website-v2">
              Website Source Code on GitHub
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://docs.google.com/spreadsheets/d/1KqyDRZRCgy8YgMFnY0tHSw_3jC99Z0zFvJrPbfm66vA/">
              Combo Database Backend on Google Sheets
            </ExternalLink>
          </li>
        </ul>

        <strong>Sincerely, the Community Admins,</strong>
        <ul className="ml-4 list-inside">
          <li>
            <ExternalLink href="https://twitter.com/lappermedic">
              Lapper
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.moxfield.com/users/goldshot20">
              Goldshot20
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.moxfield.com/users/AppleSaws">
              AppleSaws
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.secretpassageediting.com/">
              Myles Schaller
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.moxfield.com/users/Gordon%27s%20Kitchen">
              Gordon
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.youtube.com/c/ScholarsofKaladesh">
              Wedgi
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.moxfield.com/users/SeniorEdificer">
              Senior Edificer
            </ExternalLink>
            &nbsp;(emeritus)
          </li>
        </ul>
      </div>
    </PageWrapper>
  );
};

export default About;
