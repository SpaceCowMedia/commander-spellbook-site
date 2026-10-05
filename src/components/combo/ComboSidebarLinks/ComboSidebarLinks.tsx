import BuyComboButtons from './BuyComboButtons/BuyComboButtons';
import EdhrecLink from './EdhrecLink/EdhrecLink';
import Link from 'next/link';
import ShareButtons from 'components/layout/ShareButtons/ShareButtons';
import Embed from 'components/combo/ComboSidebarLinks/Embed/Embed';
import React from 'react';
import { Variant } from '@space-cow-media/spellbook-client';
import useCookie from 'lib/useCookie';
import { absoluteUrl } from 'lib/seo';

interface Props {
  cards: string[];
  edhrecLink?: string;
  comboId: string;
  tcgPlayerPrice: string;
  cardKingdomPrice: string;
  combo: Variant;
}

const ComboSidebarLinks: React.FC<Props> = ({
  cards,
  edhrecLink,
  comboId,
  tcgPlayerPrice,
  cardKingdomPrice,
  combo,
}) => {
  const [csbIsStaff] = useCookie('csbIsStaff');
  return (
    <div className="mt-4 mb-4 w-full rounded-sm overflow-hidden">
      <BuyComboButtons cards={cards} tcgPlayerPrice={tcgPlayerPrice} cardKingdomPrice={cardKingdomPrice} />
      <div className="mt-1">
        {!!edhrecLink && <EdhrecLink link={edhrecLink} />}
        <Link id="report-error-button" className="button w-full" href={`/submit-an-update/?comboId=${comboId}`}>
          Report an Error with this Combo
        </Link>
        <Link id="submit-variant-button" className="button w-full" href={`/submit-a-combo/?variantOf=${comboId}`}>
          Submit a Variant of this Combo
        </Link>
        <Embed combo={combo} />
        {csbIsStaff === 'true' && (
          <Link
            id="edit-combo-button"
            className="button w-full"
            href={`${process.env.NEXT_PUBLIC_EDITOR_BACKEND_URL}/admin/spellbook/variant/${comboId}/change/`}
          >
            Edit this Combo
          </Link>
        )}
        <ShareButtons
          link={absoluteUrl(`/combo/${combo.id}/`)}
          text="Check out this combo!"
          subject="Combo"
          analyticsCategory="Combo Detail Page Actions"
        />
      </div>
    </div>
  );
};

export default ComboSidebarLinks;
