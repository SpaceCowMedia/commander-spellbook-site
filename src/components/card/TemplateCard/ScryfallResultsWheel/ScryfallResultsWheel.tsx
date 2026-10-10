import React, { addTransitionType, startTransition, useEffect, useRef, useState, ViewTransition } from 'react';
import Icon from 'components/ui/Icon/Icon';
import edhrecService from 'services/edhrec.service';
import { ReplacementsPage } from 'lib/card/replacements';
import Loader from 'components/ui/Loader/Loader';
import SpoilerFog from 'components/card/SpoilerFog/SpoilerFog';
import { useSwipeable } from 'react-swipeable';
import { TEMPLATE_MORPH_SHARE, WHEEL_NEXT, WHEEL_PREVIOUS } from 'lib/viewTransitions';

const CARD_ENTER = { [WHEEL_NEXT]: 'slideFromRight', [WHEEL_PREVIOUS]: 'slideFromLeft', default: 'none' };
const CARD_EXIT = { [WHEEL_NEXT]: 'slideToLeft', [WHEEL_PREVIOUS]: 'slideToRight', default: 'none' };
const LAST = -1;

interface Position {
  page: number;
  index: number;
}

interface Props {
  fetchResults: (_page: number) => Promise<ReplacementsPage>;
  // Shares the card shown with the replacement list, to grow into it.
  morphName?: string;
  onCurrentChange?: (_id: string) => void;
}

const ScryfallResultsWheel: React.FC<Props> = ({ fetchResults, morphName, onCurrentChange }) => {
  const [pages, setPages] = useState<ReplacementsPage[]>([]);
  const [position, setPosition] = useState<Position>({ page: 0, index: 0 });
  // The page of the next card is still loading: its slot waits, with the arrows where they are.
  const [arriving, setArriving] = useState(false);
  const [moved, setMoved] = useState(false);
  const preloaded = useRef<HTMLImageElement[]>([]);

  const pageSize = pages[0]?.results.length ?? 0;
  const pageCount = pageSize ? Math.max(Math.ceil((pages[0].count ?? 0) / pageSize), 1) : 1;
  const currentPage = pages[position.page];
  const current = currentPage?.results[position.index];

  const load = (page: number) =>
    fetchResults(page).then((result) => {
      setPages((loaded) => {
        const updated = [...loaded];
        updated[page] = result;
        return updated;
      });
      return result;
    });

  const destination = (direction: string): Position => {
    const length = currentPage?.results.length ?? 0;
    if (direction === WHEEL_NEXT) {
      return position.index + 1 < length
        ? { page: position.page, index: position.index + 1 }
        : { page: (position.page + 1) % pageCount, index: 0 };
    }
    return position.index > 0
      ? { page: position.page, index: position.index - 1 }
      : { page: (position.page - 1 + pageCount) % pageCount, index: LAST };
  };

  const cardAt = ({ page, index }: Position) => {
    const results = pages[page]?.results;
    return results?.[index === LAST ? results.length - 1 : index];
  };

  const move = (direction: string) => {
    if (arriving || !currentPage) {
      return;
    }
    const target = destination(direction);
    const show = (page: ReplacementsPage) =>
      startTransition(() => {
        addTransitionType(direction);
        setArriving(false);
        setMoved(true);
        setPosition({ page: target.page, index: target.index === LAST ? page.results.length - 1 : target.index });
      });
    const ready = pages[target.page];
    if (ready) {
      show(ready);
      return;
    }
    startTransition(() => {
      addTransitionType(direction);
      setArriving(true);
      setMoved(true);
    });
    load(target.page).then(show, (error) => {
      console.error(error);
      setArriving(false);
    });
  };

  const next = () => move(WHEEL_NEXT);
  const previous = () => move(WHEEL_PREVIOUS);

  const handlers = useSwipeable({
    preventScrollOnSwipe: true,
    onSwipedLeft: next,
    onSwipedRight: previous,
  });

  useEffect(() => {
    load(0).catch((error) => console.error(error));
  }, []);

  // Once the wheel has turned, a card on the edge of its page loads the page across that edge, to slide over at once.
  useEffect(() => {
    if (!moved || pageCount < 2 || !currentPage) {
      return;
    }
    const edges = [
      position.index === 0 && destination(WHEEL_PREVIOUS).page,
      position.index === currentPage.results.length - 1 && destination(WHEEL_NEXT).page,
    ];
    edges.forEach((page) => {
      if (page !== false && !pages[page]) {
        load(page).catch((error) => console.error(error));
      }
    });
  }, [moved, position, pageCount, currentPage]);

  useEffect(() => {
    // the cards a click away, kept loaded so they show at once
    preloaded.current = [destination(WHEEL_PREVIOUS), destination(WHEEL_NEXT)].flatMap((target) => {
      const image = cardAt(target)?.images[0];
      return image ? [Object.assign(new Image(), { src: image })] : [];
    });
  }, [pages, position]);

  useEffect(() => {
    if (current) {
      onCurrentChange?.(current.id);
    }
  }, [current?.id]);

  if (current === undefined) {
    return <Loader />;
  }

  const image = (
    <img
      className="h-full aspect-488/680 rounded-xl bg-cover"
      src={current.images[0]}
      alt={`Template replacement: ${current.name}`}
    />
  );

  return (
    <div className="w-full h-full flex justify-center items-center select-none" {...handlers}>
      <div className="h-full flex justify-center items-center grow">
        <Icon
          name="chevronLeft"
          onClick={(e) => {
            e.preventDefault();
            previous();
          }}
          className="cursor-pointer text-white text-2xl"
        />
      </div>
      <div className="h-full flex justify-center items-center">
        <ViewTransition key={arriving ? 'arriving' : current.id} enter={CARD_ENTER} exit={CARD_EXIT} default="none">
          {arriving ? (
            <div className="h-full aspect-488/680 flex justify-center items-center text-white">
              <Loader />
            </div>
          ) : (
            <SpoilerFog name={current.name} spoiler={current.spoiler} className="h-full">
              <a
                className="h-full"
                href={edhrecService.getCardUrl(current.name ?? '')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {morphName ? (
                  <ViewTransition name={morphName} share={TEMPLATE_MORPH_SHARE} default="none">
                    {image}
                  </ViewTransition>
                ) : (
                  image
                )}
              </a>
            </SpoilerFog>
          )}
        </ViewTransition>
      </div>
      <div className="h-full flex justify-center items-center grow">
        <Icon
          name="chevronRight"
          onClick={(e) => {
            e.preventDefault();
            next();
          }}
          className="cursor-pointer text-white text-2xl"
        />
      </div>
    </div>
  );
};

export default ScryfallResultsWheel;
