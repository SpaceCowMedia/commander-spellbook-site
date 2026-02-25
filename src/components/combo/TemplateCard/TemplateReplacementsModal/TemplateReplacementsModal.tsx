import Modal from 'components/ui/Modal/Modal';
import React, { useEffect, useState } from 'react';
import Dimmer from 'components/ui/Dimmer/Dimmer';
import edhrecService from 'services/edhrec.service';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import ExternalLink from 'components/layout/ExternalLink/ExternalLink';
import { Template, TemplateInVariant } from '@space-cow-media/spellbook-client';
import { ScryfallResultsPage } from 'services/scryfall.service';
import Card from 'scryfall-client/dist/models/card';
import ScryfallService from 'services/scryfall.service';
import Loader from 'components/layout/Loader/Loader';

interface Props {
  template: TemplateInVariant;
  textTrigger?: (_count?: number) => React.ReactNode;
  fetchTemplateReplacements?: (_template: Template, _page: number) => Promise<ScryfallResultsPage>;
}

const TemplateReplacementsModal: React.FC<Props> = ({
  template,
  textTrigger,
  fetchTemplateReplacements = ScryfallService.templateReplacements,
}) => {
  const title = template.template.scryfallQuery
    ? `Scryfall results for “${template.template.name}”`
    : `Replacement list for “${template.template.name}”`;
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState<number | undefined>(undefined);
  const [nextPage, setNextPage] = useState<number | undefined>(0);
  const [results, setResults] = useState<Card[]>([]);

  const fetchNextResults = async () => {
    if (nextPage === undefined || loading) {
      return;
    }
    setLoading(true);
    try {
      const page = await fetchTemplateReplacements(template.template, nextPage);
      setCount(page.count);
      setNextPage(page.nextPage);
      setResults(results.concat(page.results));
    } catch (error) {
      console.error(error);
      setResults([]);
      setNextPage(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !results.length) {
      fetchNextResults();
    }
  }, []);

  return (
    <>
      {!textTrigger && (
        <button
          className="button !p-0 !px-2 !text-white font-bold text-lg z-10 w-min whitespace-nowrap h-8 text-[14px]"
          onClick={() => setIsOpen(true)}
        >
          View {!!count && count + ' '}Cards
        </button>
      )}
      {textTrigger && (
        <span className="cursor-pointer" onClick={() => setIsOpen(true)}>
          {textTrigger(count)}
        </span>
      )}
      <Modal closeIcon size="large" open={isOpen} onClose={() => setIsOpen(false)}>
        {loading && count === undefined && <Dimmer loading />}
        {title && (
          <h2 className="text-center text-2xl font-bold mb-8">
            <TextWithMagicSymbol text={title} />
          </h2>
        )}
        {template.quantity > 1 && (
          <h3 className="text-center font-bold mb-8 underline">Quantity Needed: {template.quantity}</h3>
        )}
        {template.template.scryfallQuery && (
          <ExternalLink
            href={
              'https://scryfall.com/search?q=' +
              encodeURIComponent(`(${template.template.scryfallQuery}) legal:commander`)
            }
            className="text-center block mb-8"
          >
            View on Scryfall
          </ExternalLink>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          {results.map((result) => (
            <a href={edhrecService.getCardUrl(result.name)} target="_blank" rel="noopener noreferrer" key={result.id}>
              <img
                className="rounded-xl"
                width="240"
                src={ScryfallService.getScryfallImage(result)[0]}
                alt={result.name}
              />
            </a>
          ))}
        </div>
        <div className="flex justify-center w-full mt-3">
          {loading ? (
            <Loader />
          ) : (
            nextPage !== undefined &&
            nextPage > 0 && (
              <button className="button" onClick={fetchNextResults}>
                Load More
              </button>
            )
          )}
        </div>
      </Modal>
    </>
  );
};

export default TemplateReplacementsModal;
