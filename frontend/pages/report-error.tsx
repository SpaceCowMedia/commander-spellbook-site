import React from "react"
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ExternalLink from "../components/layout/ExternalLink/ExternalLink";
import styles from './report-error.module.scss'
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";

type Props = {}

const ReportError: React.FC<Props> = ({}: Props) => {
  return (
    <PageWrapper>
      <SpellbookHead title="Commander Spellbook: Report Error" description="Report an error in a combo on Commander Spellbook through our discord."/>
      <div className={`static-page ${styles.reportErrorContainer}`}>
        <ArtCircle cardName="Go Blank" className="m-auto md:block hidden"/>
        <h1 className="heading-title">Report an Error</h1>
        <p>
          The first step for reporting an error is&nbsp;
          <ExternalLink href="https://discord.gg/KDnvP5f">joining our Discord server</ExternalLink>. Once you have joined,
          copy and fill the following template to report an
          error in the&nbsp;
          <ExternalLink href="https://discord.com/channels/673601282946236417/673734250402545676">#submit-an-update
          </ExternalLink>&nbsp;
          channel:
        </p>

        <pre id="error-template">
          <code>
            Combo Link:{'\n'}
            Problem with Combo:
          </code>
        </pre>

        <div className="text-center">
          <ExternalLink role="button" className="button"
                        href="https://discord.com/channels/673601282946236417/673734250402545676">Report the Error in
            #submit-an-update
          </ExternalLink>
        </div>
      </div>
    </PageWrapper>
  )
}

export default ReportError
