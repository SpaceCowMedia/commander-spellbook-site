import Modal from 'components/ui/Modal/Modal';
import React, { addTransitionType, startTransition, useEffect, useState, ViewTransition } from 'react';
import Dimmer from 'components/ui/Dimmer/Dimmer';
import edhrecService from 'services/edhrec.service';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import ExternalLink from 'components/layout/ExternalLink/ExternalLink';
import { TemplateInVariant } from '@space-cow-media/spellbook-client';
import { ReplacementCard } from 'lib/types';
import { cachedTemplateReplacements } from 'lib/templateReplacementsCache';
import Loader from 'components/layout/Loader/Loader';
import SpoilerFog from 'components/layout/SpoilerFog/SpoilerFog';
import { LOAD_MORE, TEMPLATE_MORPH_SHARE } from 'lib/viewTransitions';

interface Props {
  template: TemplateInVariant;
  textTrigger?: (_count?: number) => React.ReactNode;
  open?: boolean;
  onOpenChange?: (_open: boolean) => void;
  // The card of the list that shares its name with the one shown elsewhere, to grow out of it.
  morph?: { name: string; cardId?: string };
}

const CARD_MOVE = { [LOAD_MORE]: 'cardMove', default: 'none' };

const TemplateReplacementsModal: React.FC<Props> = ({ template, textTrigger, open, onOpenChange, morph }) => {
  const title = `Replacement list for “${template.template.name}”`;
  const [loading, setLoading] = useState(false);
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = open ?? localOpen;
  const setIsOpen = onOpenChange ?? setLocalOpen;
  const [count, setCount] = useState<number | undefined>(undefined);
  const [nextPage, setNextPage] = useState<number | undefined>(0);
  const [results, setResults] = useState<ReplacementCard[]>([]);
  // Only the last row moves when cards are added after it, and it is in the last page.
  const [pageStarts, setPageStarts] = useState<number[]>([]);
  const movableFrom = pageStarts.at(-2) ?? 0;
  const loadedMoreFrom = pageStarts.length > 1 ? pageStarts[pageStarts.length - 1] : results.length;
  const morphIndex = results.findIndex((result) => result.id === morph?.cardId);

  const fetchNextResults = async (more = false) => {
    if (nextPage === undefined || loading) {
      return;
    }
    setLoading(true);
    try {
      const page = await cachedTemplateReplacements(template.template, nextPage);
      const show = () => {
        setCount(page.count);
        setNextPage(page.nextPage);
        setPageStarts(pageStarts.concat(results.length));
        setResults(results.concat(page.results));
        setLoading(false);
      };
      if (more) {
        startTransition(() => {
          addTransitionType(LOAD_MORE);
          show();
        });
      } else {
        show();
      }
    } catch (error) {
      console.error(error);
      setResults([]);
      setNextPage(undefined);
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
          className="button p-0! px-2! text-white! font-bold text-lg z-10 w-min whitespace-nowrap h-8 text-[14px]"
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
          {results.map((result, index) => {
            const morphing = isOpen && index === morphIndex;
            // Lazy, so that opening the list doesn't wait for every card to load, but Load More waits for its own.
            const image = (
              <img
                className="rounded-xl"
                width="240"
                height="334"
                src={result.images[0]}
                alt={result.name}
                loading={morphing || index >= loadedMoreFrom ? undefined : 'lazy'}
              />
            );
            return (
              <ViewTransition key={result.id} update={index >= movableFrom ? CARD_MOVE : 'none'} default="none">
                <SpoilerFog className="replacementCard" name={result.name} spoiler={result.spoiler}>
                  <a href={edhrecService.getCardUrl(result.name)} target="_blank" rel="noopener noreferrer">
                    {morphing && morph ? (
                      <ViewTransition name={morph.name} share={TEMPLATE_MORPH_SHARE} default="none">
                        {image}
                      </ViewTransition>
                    ) : (
                      image
                    )}
                  </a>
                </SpoilerFog>
              </ViewTransition>
            );
          })}
        </div>
        <div className="flex justify-center w-full mt-3">
          {loading ? (
            <Loader />
          ) : (
            nextPage !== undefined &&
            nextPage > 0 && (
              <button className="button" onClick={() => fetchNextResults(true)}>
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
