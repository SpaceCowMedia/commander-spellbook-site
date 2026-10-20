import React from 'react';
import Link from 'next/link';
import ExternalLink from 'components/layout/ExternalLink/ExternalLink';
import styles from './footer.module.scss';
import Image from 'next/image';
import useFoolsDay from 'lib/foolsDay';

interface Props {
  className?: string;
  noMargin?: boolean;
  comboOfTheDay?: string;
}

const Footer: React.FC<Props> = ({ className, noMargin, comboOfTheDay }) => {
  const foolsDay = useFoolsDay();
  return (
    <div className={`${className} ${noMargin && 'mt-0 lg:mt-0'}`}>
      {!noMargin && (
        <div className="relative md:-mt-24 lg:-mt-48">
          <Image
            className="w-full select-none"
            height="100"
            width="2000"
            src={foolsDay ? '/pointy-footer.svg' : '/footer.svg'}
            alt="footer"
          />
        </div>
      )}
      <footer className={styles.footer}>
        <div className="container md:flex flex-row text-center md:text-left">
          <div className={styles.linkCollection}>
            <h3 className={styles.header}>Combos</h3>
            <Link href="/advanced-search/">Advanced Search</Link>
            <Link href="/syntax-guide/">Syntax Guide</Link>
            <Link href="/random/">Random Combo</Link>
            <Link href="/find-my-combos/">Find My Combos</Link>
            <Link href="/search/?q=is:featured">Featured Combos</Link>
            <Link href={comboOfTheDay ? `/combo/${comboOfTheDay}` : '/combo-of-the-day/'}>Combo of the Day</Link>
            <Link href="/search/?sort=created&order=desc">Most Recent Combos</Link>
            <Link href="/search/?sort=popularity&order=desc">Most Popular Combos</Link>
            <Link href="/search/?sort=salt&order=desc">Saltiest Combos</Link>
            <Link href="/salt/">Salt Voting</Link>
            <Link href="/search/?q=banned:commander">Commander Banned Combos</Link>
          </div>
          <div className={styles.linkCollection}>
            <h3 className={styles.header}>Commander Spellbook</h3>
            <Link href="/about/">About</Link>
            <Link href="/submit-a-combo/">New Combo Submission</Link>
            <Link href="/submit-an-update/">Update / Error Submission</Link>
            <Link href="/style-guide/">Combo Style Guide</Link>
            <Link href="/privacy-policy/">Privacy Policy</Link>
            <Link href="/login/?final=">Login</Link>
            <Link href="/metrics/">Metrics</Link>
          </div>
          <div className={styles.linkCollection}>
            <h3 className={styles.header}>Community</h3>
            <ExternalLink href="https://www.patreon.com/commanderspellbook">Patreon</ExternalLink>
            <ExternalLink href="https://discord.gg/DkAyVJG">Discord</ExternalLink>
            <ExternalLink href="https://bsky.app/profile/commanderspellbook.com">Bluesky</ExternalLink>
            <ExternalLink href="https://github.com/EDHREC/commander-spellbook-site">Github</ExternalLink>
            <ExternalLink href="https://edhrec.com/combos">EDHREC</ExternalLink>
            <ExternalLink href="https://draftsim.com">Draftsim</ExternalLink>
            <ExternalLink href="https://psycatgames.com/games/life-counter/">MTG Life Counter: Lotus</ExternalLink>
          </div>
        </div>
        <div className="container mt-8 text-light">
          <p className="my-4">
            Commander Spellbook is unofficial Fan Content permitted under the&nbsp;
            <ExternalLink href="https://company.wizards.com/en/legal/fancontentpolicy">Fan Content Policy</ExternalLink>
            . Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast.
            ©Wizards of the Coast LLC.
          </p>
          <p className="my-4">
            Commander Spellbook utilizes icons provided by&nbsp;
            <ExternalLink href="https://fontawesome.com/">Font Awesome</ExternalLink>&nbsp;according to the&nbsp;
            <ExternalLink href="https://fontawesome.com/license">Font Awesome License</ExternalLink>.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
