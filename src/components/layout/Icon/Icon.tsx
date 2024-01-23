import styles from './icon.module.scss'
import {
  faArrowUpRightDots, faArrowUpWideShort, faCartShopping, faCertificate,
  faCheckDouble,
  faCircleExclamation,
  faCircleInfo, faCircleXmark, faCode, faCoins, faDollarSign, faFileLines, faFingerprint, faHashtag, faInfinity,
  faKey,
  faLightbulb, faListCheck, faListOl, faPalette, faScaleBalanced, faSeedling, faSignature, faStar, faTags,
  faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const SPELLBOOK_ICONS = {
  graveyard: styles.graveyard,
  battlefield: styles.battlefield,
  commandZone: styles.commandZone,
  hand: styles.hand,
  library: styles.library,
  exile: styles.exile,
  archidekt: styles.archidekt,
}

const SPELLBOOK_FA_ICONS = {
  circleInfo: faCircleInfo,
  triangleExclamation: faTriangleExclamation,
  circleExclamation: faCircleExclamation,
  lightbulb: faLightbulb,
  circleXmark: faCircleXmark,
  star: faStar,
  signature: faSignature,
  hashtag: faHashtag,
  palette: faPalette,
  checkDouble: faCheckDouble,
  listCheck: faListCheck,
  listOl: faListOl,
  infinity: faInfinity,
  arrowUpRightDots: faArrowUpRightDots,
  dollarSign: faDollarSign,
  scaleBalanced: faScaleBalanced,
  certificate: faCertificate,
  cartShopping: faCartShopping,
  fingerprint: faFingerprint,
  tags: faTags,
  arrowUpWideShort: faArrowUpWideShort,
  seedling: faSeedling,
  fileLines: faFileLines,
  key: faKey,
  coins: faCoins,
  code: faCode,
}

export type SpellbookIcon = keyof typeof SPELLBOOK_ICONS | keyof typeof SPELLBOOK_FA_ICONS

type Props = {
  name: SpellbookIcon
}
const Icon = ({name}: Props) => {

  if (name in SPELLBOOK_ICONS) return <i className={`${styles.icon} ${SPELLBOOK_ICONS[name as keyof typeof SPELLBOOK_ICONS]}`}/>
  if (name in SPELLBOOK_FA_ICONS) return <FontAwesomeIcon className={styles.icon} icon={SPELLBOOK_FA_ICONS[name as keyof typeof SPELLBOOK_FA_ICONS]} />

  return null
}

export default Icon
