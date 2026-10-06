import styles from './shareButtons.module.scss';
import CopyLinkButton from '../CopyLinkButton/CopyLinkButton';
import ShareNetwork from '../ShareNetwork/ShareNetwork';
import React from 'react';

interface Props {
  link: string;
  text: string;
  subject: string;
  analyticsCategory: string;
}

const ShareButtons: React.FC<Props> = ({ link, text, subject, analyticsCategory }) => {
  const embedLink = encodeURIComponent(link);
  const embedText = encodeURIComponent(text);
  const blueskyUrl = `https://bsky.app/intent/compose?text=${embedText}${encodeURIComponent('\n\n')}${embedLink}&hashtags=commanderspellbook&via=CommanderSpell`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${embedLink}&title=${embedText}&description=${embedText}&quote=&hashtag=%23commanderspellbook`;
  const redditUrl = `https://www.reddit.com/submit?url=${embedLink}&title=${embedText}`;

  return (
    <div className={`border-t border-gray pt-2 mt-1 ${styles.shareContainer}`}>
      <div className="flex">
        <CopyLinkButton
          className={`button ${styles.shareNetwork}`}
          link={link}
          subject={subject}
          analyticsCategory={analyticsCategory}
        >
          <div className={`${styles.linkIcon} ${styles.copyIcon}`}>
            <div className="sr-only">Copy to Clipboard</div>
          </div>
        </CopyLinkButton>
        <ShareNetwork url={blueskyUrl} className={`button ${styles.shareNetwork}`} network="Bluesky" subject={subject}>
          <div className={`${styles.linkIcon} ${styles.blueskyIcon}`} />
        </ShareNetwork>
        <ShareNetwork url={redditUrl} className={`button ${styles.shareNetwork}`} network="Reddit" subject={subject}>
          <div className={`${styles.linkIcon} ${styles.redditIcon}`} />
        </ShareNetwork>
        <ShareNetwork
          url={facebookUrl}
          className={`button ${styles.shareNetwork}`}
          network="Facebook"
          subject={subject}
        >
          <div className={`${styles.linkIcon} ${styles.facebookIcon}`} />
        </ShareNetwork>
        <div /> {/* This is a hack to make the buttons align to the right */}
      </div>
    </div>
  );
};

export default ShareButtons;
