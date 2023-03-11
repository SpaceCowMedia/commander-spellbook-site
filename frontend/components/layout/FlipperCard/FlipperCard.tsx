import styles from './flipperCard.module.scss'
import {ReactNode} from "react";

type Props = {
  flipped: boolean
  front: ReactNode
  back: ReactNode
  className?: string
}

const FlipperCard = ({flipped, front, back, className}: Props) => {

  return (
    <div className={`${styles.flipContainer} ${flipped && styles.flipped} ${className}`}>
      <div className={styles.flipper}>
        <div className={styles.front}>
          {front}
        </div>
        <div className={styles.back}>
          {back}
        </div>
      </div>
    </div>
  )

}

export default FlipperCard