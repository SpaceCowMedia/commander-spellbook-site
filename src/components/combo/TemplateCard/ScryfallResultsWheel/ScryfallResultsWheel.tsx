import React, { useEffect, useState } from 'react';
import Icon from 'components/layout/Icon/Icon';
import edhrecService from 'services/edhrec.service';
import ScryfallService, { ScryfallResultsPage } from 'services/scryfall.service';
import Loader from 'components/layout/Loader/Loader';
import { useSwipeable } from 'react-swipeable';

type Props = {
  fetchResults: (_page: number) => Promise<ScryfallResultsPage>;
};

const ScryfallResultsWheel: React.FC<Props> = ({ fetchResults }) => {
  const [pageCount, setPageCount] = useState<number>(0);
  const [index, setIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState<ScryfallResultsPage | undefined>(undefined);
  const [pageSize, setPageSize] = useState(1);
  const [loading, setLoading] = useState(false);

  const next = () => {
    let newIndex = index + 1;
    let newPageIndex = pageIndex;
    if (newIndex >= pageSize || (currentPage !== undefined && newIndex >= currentPage.results.length)) {
      newIndex = 0;
      newPageIndex += 1;
    }
    if (newPageIndex >= pageCount) {
      newPageIndex = 0;
    }
    setIndex(newIndex);
    if (pageIndex !== newPageIndex) {
      setPageIndex(newPageIndex);
    }
  };

  const previous = () => {
    let newIndex = index - 1;
    let newPageIndex = pageIndex;
    if (newIndex < 0) {
      newIndex = pageSize - 1;
      newPageIndex -= 1;
    }
    if (newPageIndex < 0) {
      newPageIndex = pageCount - 1;
    }
    setIndex(newIndex);
    if (pageIndex !== newPageIndex) {
      setPageIndex(newPageIndex);
    }
  };

  const handlers = useSwipeable({
    preventScrollOnSwipe: true,
    onSwipedLeft: next,
    onSwipedRight: previous,
  });

  useEffect(() => {
    if (loading) {
      return;
    }
    setLoading(true);
    fetchResults(pageIndex)
      .then((page) => {
        let size = pageSize;
        if (pageIndex === 0 && page.results.length !== pageSize) {
          size = page.results.length;
          setPageSize(size);
        }
        const count = Math.ceil((page.count ?? 0) / size);
        if (count !== pageCount) {
          setPageCount(count);
        }
        setCurrentPage(page);
        setIndex(Math.min(index, page.results.length - 1));
      })
      .catch((error) => {
        console.error(error);
        setPageCount(0);
        setCurrentPage(undefined);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pageIndex]);

  const current = currentPage?.results[index];
  if (loading || current === undefined) {
    return <Loader />;
  }

  return (
    <div className="w-full h-full flex justify-center items-center select-none" {...handlers}>
      <div className="h-full flex justify-center items-center flex-grow">
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
        <a
          className="h-full"
          href={edhrecService.getCardUrl(current.name ?? '')}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="max-h-full rounded-xl bg-cover"
            src={ScryfallService.getScryfallImage(current)[0]}
            alt={`Template replacement: ${current.name}`}
          />
        </a>
      </div>
      <div className="h-full flex justify-center items-center flex-grow">
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
