import cardBack from 'assets/images/card-back.png';
import isFoolsDay from 'lib/foolsDay';
import weatheredCardBack from 'assets/images/weathered-card-back.png';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import React, { useEffect, useState } from 'react';
import TemplateReplacementsModal from 'components/combo/TemplateCard/TemplateReplacementsModal/TemplateReplacementsModal';
import ScryfallResultsWheel from 'components/combo/TemplateCard/ScryfallResultsWheel/ScryfallResultsWheel';
import { Template, TemplateInVariant } from '@space-cow-media/spellbook-client';
import ScryfallService, { ScryfallResultsPage } from 'services/scryfall.service';
import FlipperCard from 'components/layout/FlipperCard/FlipperCard';

type Props = {
  template: TemplateInVariant;
  fetchTemplateReplacements?: (_template: Template, _page: number) => Promise<ScryfallResultsPage>;
};

const TemplateCard: React.FC<Props> = ({
  template,
  fetchTemplateReplacements = ScryfallService.templateReplacements,
}) => {
  const [backFacing, setBackFacing] = useState(true);
  const [readyToFlipToFront, setReadyToFlipToFront] = useState(false);

  const flip = () => {
    setBackFacing((prev) => !prev);
  };

  useEffect(() => {
    setTimeout(() => {
      setReadyToFlipToFront(true);
    }, 350);
  }, [template]);

  useEffect(() => {
    if (backFacing && readyToFlipToFront) {
      flip(); // reveal moment
    }
  }, [readyToFlipToFront]);

  return (
    <div className="rounded-xl">
      <FlipperCard
        flipped={backFacing}
        front={
          <div className="relative">
            <div className="rounded-xl" style={{ backgroundColor: '#404040' }}>
              <div className="absolute top-1 text-center w-full text-white font-bold text-[16px] z-11">
                <TextWithMagicSymbol text={template.template.name} />
              </div>
              <div className="absolute top-[60px] flex flex-col justify-center w-full items-center z-10">
                {<ScryfallResultsWheel fetchResults={(page) => fetchTemplateReplacements(template.template, page)} />}
              </div>
              <div className="absolute -bottom-1 flex flex-col justify-center w-full items-center">
                <TemplateReplacementsModal template={template} fetchTemplateReplacements={fetchTemplateReplacements} />
              </div>
              <img
                className="opacity-10"
                src={isFoolsDay() ? weatheredCardBack.src : cardBack.src}
                alt="MTG Card Back"
              />
            </div>
          </div>
        }
        back={
          <img
            className="rounded-xl"
            src={isFoolsDay() ? weatheredCardBack.src : cardBack.src}
            alt="the back of a classic MtG card"
          />
        }
      />
    </div>
  );
};

export default TemplateCard;
