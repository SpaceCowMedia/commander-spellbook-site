import Icon, {SpellbookIcon} from "../Icon/Icon";

type Props = {
  type: 'error' | 'warning' | 'info' | 'success'
  icon: SpellbookIcon
  children: React.ReactNode
  title?: string
}

const Alert = ({type, icon, children, title}: Props) => {

  let color = ''
  switch (type) {
    case 'error':
      color = 'red-200'
      break
    case 'warning':
      color = 'amber-400'
      break
    case 'info':
      color = 'blue-200'
      break
    case 'success':
      color = 'green-200'
      break
  }

    return (
      <div className={`border-l-4 border-${color} pl-4 py-1 mb-2`} role="alert">
        <h4 className={`text-${color} mb-2`}><Icon name={icon} /> {title}</h4>
        <div className="ms-3">
          {children}
        </div>
      </div>
    )
}

export default Alert
