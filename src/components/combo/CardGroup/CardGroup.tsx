import styles from "./cardGroup.module.scss";
import { useState } from "react";
import CardLink from "../../layout/CardLink/CardLink";
import CardImage from "../../layout/CardImage/CardImage";

type Props = {
  cards: Array<{ name: string; oracleImageUrl: string }>;
};

const CardGroup = ({ cards }: Props) => {
  const [hoveredOverCardIndex, setHoveredOverCardIndex] = useState(-1);

  const shouldExpand = (index: number): boolean => {
    if (hoveredOverCardIndex < 0) return false;
    return (
      index - 4 === hoveredOverCardIndex || index - 8 === hoveredOverCardIndex
    );
  };

  return (
    <div
      className={`${styles.cardImages} container hidden lg:flex ${
        cards.length < 4 && "justify-center"
      }`}
    >
      {cards.map((card, index) => (
        <div
          key={`oracle-card-image-${index}`}
          className={`${styles.cardImgWrapper} ${
            shouldExpand(index) && styles.expand
          }`}
          onMouseEnter={() => setHoveredOverCardIndex(index)}
          onMouseLeave={() => setHoveredOverCardIndex(-1)}
        >
          <CardLink className="relative" name={card.name}>
            <CardImage
              img={card.oracleImageUrl}
              name={card.name}
              className={styles.cardImg}
            />
          </CardLink>
        </div>
      ))}
    </div>
  );
};

export default CardGroup;
