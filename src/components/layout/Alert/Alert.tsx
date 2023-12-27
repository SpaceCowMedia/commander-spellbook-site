import Icon, {SpellbookIcon} from "../Icon/Icon";
import styles from './Alert.module.scss'
type Props = {
  type: 'error' | 'warning' | 'info' | 'success' | 'important'
  icon: SpellbookIcon
  children: React.ReactNode
  title?: string
}

const Alert = ({type, icon, children, title}: Props) => {


    return (
      <div className={`border-l-4 pl-4 py-1 mb-2 ${styles[type]} ${styles.border}`} role="alert">
        <h4 className={`${styles[type]} ${styles.text}`}><Icon name={icon} /> {title}</h4>
        <div className="ms-3">
          {children}
        </div>
      </div>
    )
}

export default Alert
