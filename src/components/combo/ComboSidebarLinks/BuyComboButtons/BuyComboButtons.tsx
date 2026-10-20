import React from 'react';
import BuyButtons from 'components/layout/BuyButtons/BuyButtons';
import VendorsService from 'services/vendors.service';

interface Props {
  cards: string[];
  tcgPlayerPrice: string;
  cardKingdomPrice: string;
}

const BuyComboButtons: React.FC<Props> = ({ cards, tcgPlayerPrice, cardKingdomPrice }) => {
  return (
    <BuyButtons
      idSuffix="combo"
      analyticsCategory="Combo Detail Page Actions"
      tcgPlayerLink={VendorsService.getComboTcgPlayerUrl(cards)}
      cardKingdomLink={VendorsService.getComboCardKingdomUrl(cards)}
      tcgPlayerPrice={tcgPlayerPrice}
      cardKingdomPrice={cardKingdomPrice}
    />
  );
};

export default BuyComboButtons;
