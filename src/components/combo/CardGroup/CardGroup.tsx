import styles from "./cardGroup.module.scss";
import { useState } from "react";
import CardLink from "../../layout/CardLink/CardLink";
import CardImage from "../../layout/CardImage/CardImage";
import {Template} from "lib/types";
import TemplateCard from "components/combo/TemplateCard/TemplateCard";

type Props = {
  cards: Array<{ name: string; oracleImageUrl: string }>;
  templates: Template[]
};

const CardGroup = ({ cards, templates }: Props) => {
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
      {((cards as Array<{ name: string; oracleImageUrl: string } | Template>).concat(templates)).map((card, index) => (
        <div
          key={`oracle-card-image-${index}`}
          className={`${styles.cardImgWrapper} ${
            shouldExpand(index) && styles.expand
          }`}
          onMouseEnter={() => setHoveredOverCardIndex(index)}
          onMouseLeave={() => setHoveredOverCardIndex(-1)}
        >
          {'template' in card ?
            <TemplateCard className={styles.cardImg} template={card}/>
            :
          <CardLink className="relative" name={card.name}>
            <CardImage
              img={card.oracleImageUrl}
              name={card.name}
              className={styles.cardImg}
            />
          </CardLink>}
        </div>
      ))}

    </div>
  );
};

export default CardGroup;
