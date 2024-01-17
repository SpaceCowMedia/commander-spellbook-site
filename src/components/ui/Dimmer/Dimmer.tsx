import styles from './Dimmer.module.scss'
import Loader from "components/layout/Loader/Loader";
import classNames from "classnames";

type Props = {
  loading?: boolean
  dark?: boolean
  onClick?: () => void
}

const Dimmer = ({loading, dark, onClick}: Props) => {
  return (
    <div onClick={onClick} className={classNames(styles.dimmer, dark && styles.dark)}>
      {loading && <Loader/> }
    </div>
  )
}

export default Dimmer;
