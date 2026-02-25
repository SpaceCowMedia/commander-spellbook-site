import styles from './shareComboButtons.module.scss';
import CopyComboLinkButton from '../CopyComboLinkButton/CopyComboLinkButton';
import ShareNetwork from '../ShareNetwork/ShareNetwork';
import React from 'react';

interface Props {
  comboId: string;
}

const ShareComboButtons: React.FC<Props> = ({ comboId }) => {
  const comboLink = `https://commanderspellbook.com/combo/${comboId}`;
  const embedComboLink = encodeURIComponent(comboLink);
  const embedComboText = encodeURIComponent('Check out this combo!');
  const blueskyUrl = `https://bsky.app/intent/compose?text=${embedComboText}${encodeURIComponent('\n\n')}${embedComboLink}&hashtags=commanderspellbook&via=CommanderSpell`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${embedComboLink}&title=${embedComboText}&description=${embedComboText}&quote=&hashtag=%23commanderspellbook`;
  const redditUrl = `https://www.reddit.com/submit?url=${embedComboLink}&title=${embedComboText}`;

  return (
    <div className={`border-t border-gray pt-2 mt-1 ${styles.shareContainer}`}>
      <div className="flex">
        <CopyComboLinkButton className={`button ${styles.shareNetwork}`} comboLink={comboLink}>
          <div className={`${styles.linkIcon} ${styles.copyIcon}`}>
            <div className="sr-only">Copy to Clipboard</div>
          </div>
        </CopyComboLinkButton>
        <ShareNetwork url={blueskyUrl} className={`button ${styles.shareNetwork}`} network="Bluesky">
          <div className={`${styles.linkIcon} ${styles.blueskyIcon}`} />
        </ShareNetwork>
        <ShareNetwork url={redditUrl} className={`button ${styles.shareNetwork}`} network="Reddit">
          <div className={`${styles.linkIcon} ${styles.redditIcon}`} />
        </ShareNetwork>
        <ShareNetwork url={facebookUrl} className={`button ${styles.shareNetwork}`} network="Facebook">
          <div className={`${styles.linkIcon} ${styles.facebookIcon}`} />
        </ShareNetwork>
        <div /> {/* This is a hack to make the buttons align to the right */}
      </div>
    </div>
  );
};

export default ShareComboButtons;
