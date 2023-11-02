import styles from './icon.module.scss'


const SPELLBOOK_ICONS = {
  graveyard: styles.graveyard,
  battlefield: styles.battlefield,
  commandZone: styles.commandZone,
  hand: styles.hand,
  library: styles.library,
  exile: styles.exile,
  archidekt: styles.archidekt,
}

type Props = {
  name: keyof typeof SPELLBOOK_ICONS;
}
const Icon = ({name}: Props) => {

  if (!SPELLBOOK_ICONS[name]) return  null

  return <i className={`${styles.icon} ${SPELLBOOK_ICONS[name]}`}/>
}

export default Icon
