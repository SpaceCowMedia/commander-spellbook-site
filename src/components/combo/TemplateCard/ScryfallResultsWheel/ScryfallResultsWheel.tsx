import { ScryfallCard } from "@scryfall/api-types";
import React, { useState } from "react";
import Icon from "components/layout/Icon/Icon";
import { getScryfallImage } from "lib/getScryfallImage";
import edhrecService from "services/edhrec.service";

type Props = {
  cards: ScryfallCard.Any[];
};

const ScryfallResultsWheel: React.FC<Props> = ({ cards }) => {
  const [index, setIndex] = useState(0);

  const next = () => {
    if (index === cards.length - 1) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  };

  const previous = () => {
    if (index === 0) {
      setIndex(cards.length - 1);
    } else {
      setIndex(index - 1);
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      <div className="h-full flex justify-center items-center flex-grow">
        <Icon name="chevronLeft" onClick={previous} className="cursor-pointer text-white text-2xl" />
      </div>
      <div className="h-full flex justify-center items-center">
        <a href={edhrecService.getCardUrl(cards[index].name)} target="_blank" rel="noopener noreferrer">
          <div
            className="rounded-xl transition-all ease-in-out duration-300 w-[160px] h-[225px] bg-cover"
            style={{ backgroundImage: `url(${getScryfallImage(cards[index])[0]})` }}
          />
        </a>
      </div>
      <div className="h-full flex justify-center items-center flex-grow">
        <Icon name="chevronRight" onClick={next} className="cursor-pointer text-white text-2xl" />
      </div>
    </div>
  );
};

export default ScryfallResultsWheel;
