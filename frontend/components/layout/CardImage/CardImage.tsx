import styles from './cardImage.module.scss'
import FlipperCard from "../FlipperCard/FlipperCard";
import React, {useEffect, useRef, useState} from "react";
import cardBack from 'assets/images/card-back.png'

type Props = {
  img: string,
  name: string,
  className?: string
}


const CardImage = ({img, name, className}: Props) => {

  const imageRef = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [readyToFlip, setReadyToFlip] = useState(false)

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) setLoaded(true)
    setTimeout(() => {
      setReadyToFlip(true)
    }, 300)
  }, [])

    return (
      <FlipperCard
        className={className}
        flipped={loaded && readyToFlip}
        front={<img className={styles.frontCard} src={cardBack.src} alt="" />}
        back={<img ref={imageRef} className={styles.frontCard} src={img} alt={name} onLoad={() => setLoaded(true)} />}
        />
    )
}


export default CardImage