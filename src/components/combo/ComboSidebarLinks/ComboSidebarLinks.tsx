import BuyComboButtons from "./BuyComboButtons/BuyComboButtons";
import EdhrecLink from "./EdhrecLink/EdhrecLink";
import Link from "next/link";
import ShareComboButtons from "./ShareComboButtons/ShareComboButtons";
import Embed from "components/combo/ComboSidebarLinks/Embed/Embed";
import {Variant} from "lib/types";

type Props = {
  cards: string[];
  comboLink: string;
  edhrecLink: string;
  comboId: string;
  tcgPlayerPrice: string;
  cardKingdomPrice: string;
  combo: Variant
};

const ComboSidebarLinks = ({
  cards,
  comboLink,
  edhrecLink,
  comboId,
  tcgPlayerPrice,
  cardKingdomPrice,
  combo
}: Props) => {
  return (
    <div className="mt-4 mb-4 w-full rounded overflow-hidden">
      <BuyComboButtons
        cards={cards}
        tcgPlayerPrice={tcgPlayerPrice}
        cardKingdomPrice={cardKingdomPrice}
      />
      <div className="mt-1">
        {/*<SimilarComboButton cards={cards} comboId={comboId} />*/}
        {!!edhrecLink && <EdhrecLink link={edhrecLink} />}
        <Link
          id="report-error-button"
          className="button w-full"
          href={`/report-error/?comboId=${comboId}`}
        >
          Report an Error with this Combo
        </Link>
        <Embed combo={combo} />
        <ShareComboButtons comboLink={comboLink} />
      </div>
    </div>
  );
};

export default ComboSidebarLinks;
