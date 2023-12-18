import styles from './icon.module.scss'
import {
  faCircleExclamation,
  faCircleInfo, faCircleXmark,
  faLightbulb, faStar,
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
