import React from "react"
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ExternalLink from "../components/layout/ExternalLink/ExternalLink";
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";

type Props = {}

const HowToSubmitACombo:React.FC < Props > = ({}: Props) => {
  return (
    <PageWrapper>
      <SpellbookHead title="Commander Spellbook: How to Submit a Combo" description="Learn how to contribute to Commander Spellbook by submitting a new combo."/>
      <div className="static-page">
        <ArtCircle cardName="Kethis, the Hidden Hand" className="m-auto md:block hidden"/>
        <h1 className="heading-title">Want to submit a combo?</h1>
        <p>
          At this time, combo submissions (and updates) are only being accepted via
          <ExternalLink href="https://discord.gg/KDnvP5f">&nbsp;Discord</ExternalLink>, as
          we've learned from experience that many of them require a discussion. If
          your combo isn't listed here, or if you've found a bug with one of our
          combos, please join us on Discord to contribute to the catalog.
        </p>
        <div className="text-center">
          <ExternalLink role="button" className="button" href="https://discord.gg/KDnvP5f">Join us on Discord</ExternalLink>
        </div>
      </div>
    </PageWrapper>
  )
}

export default HowToSubmitACombo
