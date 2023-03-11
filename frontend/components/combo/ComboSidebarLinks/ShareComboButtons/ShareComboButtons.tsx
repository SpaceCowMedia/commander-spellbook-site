import styles from './shareComboButtons.module.scss'
import CopyComboLinkButton from "../CopyComboLinkButton/CopyComboLinkButton";
import ShareNetwork from "../ShareNetwork/ShareNetwork";

type Props = {
  comboLink: string
}

const ShareComboButtons = ({comboLink}: Props) => {

  const twitterUrl = `https://twitter.com/intent/tweet?text=Check out this combo!&url=${comboLink}&hashtags=commanderspellbook&via=CommanderSpell`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${comboLink}&title=Check out this combo!&description=Check out this combo!&quote=&hashtag=%23commanderspellbook`
  const redditUrl = `https://www.reddit.com/submit?url=${comboLink}&title=Check out this combo!`

  return (
    <div className={`border-t border-gray pt-2 mt-1 ${styles.shareContainer}`}>
      <div className="flex">
        <CopyComboLinkButton className={`button ${styles.shareNetwork}`} comboLink={comboLink}>
          <div className={`${styles.linkIcon} ${styles.copyIcon}`}>
            <div className="sr-only">Copy to Clipboard</div>
          </div>
        </CopyComboLinkButton>

        <ShareNetwork url={twitterUrl} className={`button ${styles.shareNetwork}`} network="Twitter" >
          <div className={`${styles.linkIcon} ${styles.twitterIcon}`}/>
        </ShareNetwork>

        <ShareNetwork url={redditUrl} className={`button ${styles.shareNetwork}`} network="Reddit" >
          <div className={`${styles.linkIcon} ${styles.redditIcon}`}/>
        </ShareNetwork>

        <ShareNetwork url={facebookUrl} className={`button ${styles.shareNetwork}`} network="Facebook" >
          <div className={`${styles.linkIcon} ${styles.facebookIcon}`}/>
        </ShareNetwork>

        <div/> {/* This is a hack to make the buttons align to the right */}
      </div>
    </div>
  )
}

export default ShareComboButtons