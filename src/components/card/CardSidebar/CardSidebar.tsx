import React from 'react';
import Link from 'next/link';
import { CardDetail } from '@space-cow-media/spellbook-client';
import BuyButtons from 'components/layout/BuyButtons/BuyButtons';
import ExternalLink from 'components/layout/ExternalLink/ExternalLink';
import LegalityTable from 'components/layout/LegalityTable/LegalityTable';
import ShareButtons from 'components/layout/ShareButtons/ShareButtons';
import EDHRECService from 'services/edhrec.service';
import GathererService from 'services/gatherer.service';
import { scryfallCardUrl } from 'services/scryfall.service';
import VendorsService from 'services/vendors.service';
import useCookie from 'lib/useCookie';
import { absoluteUrl } from 'lib/seo';
import { submitComboPath } from 'lib/cards';
import { cardCanonicalPath } from '../cardSeo';

interface Props {
  card: CardDetail;
}

const knownPrice = (price: string) => (Number(price) > 0 ? price : '');

const CardSidebar: React.FC<Props> = ({ card }) => {
  const [csbIsStaff] = useCookie('csbIsStaff');
  const references = [
    { id: 'card-edhrec-link', site: 'EDHREC', href: EDHRECService.getCardUrl(card.name) },
    { id: 'card-scryfall-link', site: 'Scryfall', href: scryfallCardUrl(card.name) },
    { id: 'card-gatherer-link', site: 'Gatherer', href: GathererService.getCardUrl(card.name) },
  ];
  return (
    <div className="mt-4 mb-4 w-full rounded-sm overflow-hidden">
      <BuyButtons
        idSuffix="card"
        analyticsCategory="Card Page Actions"
        tcgPlayerLink={VendorsService.getCardTcgPlayerUrl(card.name)}
        cardKingdomLink={VendorsService.getCardCardKingdomUrl(card.name)}
        tcgPlayerPrice={knownPrice(card.prices.tcgplayer)}
        cardKingdomPrice={knownPrice(card.prices.cardkingdom)}
        titled
      />
      <div className="mt-1">
        {references.map(({ id, site, href }) => (
          <ExternalLink
            key={id}
            id={id}
            href={href}
            className="button w-full"
            title={`Open ${card.name} on ${site}, in a new tab`}
          >
            View on {site}
          </ExternalLink>
        ))}
        <Link
          id="card-submit-combo-button"
          className="button w-full"
          href={submitComboPath(card.name)}
          title={`Suggest a new combo that uses ${card.name}`}
        >
          Submit a Combo with this Card
        </Link>
        {csbIsStaff === 'true' && (
          <Link
            id="edit-card-button"
            className="button w-full"
            href={`${process.env.NEXT_PUBLIC_EDITOR_BACKEND_URL}/admin/spellbook/card/?${new URLSearchParams({ q: card.name })}`}
            title="Find this card in the admin panel"
          >
            Edit this Card
          </Link>
        )}
        <ShareButtons
          link={absoluteUrl(cardCanonicalPath(card))}
          text={`Check out the combos with ${card.name}!`}
          subject="Card"
          analyticsCategory="Card Page Actions"
        />
      </div>
      <LegalityTable legalities={card.legalities} />
    </div>
  );
};

export default CardSidebar;
