import cardBack from 'assets/images/card-back.png';
import useFoolsDay from 'lib/foolsDay';
import weatheredCardBack from 'assets/images/weathered-card-back.png';
import TextWithMagicSymbol from 'components/symbols/TextWithMagicSymbol/TextWithMagicSymbol';
import React, { addTransitionType, startTransition, useEffect, useId, useState } from 'react';
import TemplateReplacementsModal from './TemplateReplacementsModal/TemplateReplacementsModal';
import ScryfallResultsWheel from './ScryfallResultsWheel/ScryfallResultsWheel';
import { TemplateInVariant } from '@space-cow-media/spellbook-client';
import { cachedTemplateReplacements } from 'lib/card/templateReplacementsCache';
import FlipperCard from 'components/card/FlipperCard/FlipperCard';
import useEdibleCard from 'components/card/EdibleCard/useEdibleCard';
import { TEMPLATE_MORPH } from 'lib/viewTransitions';

interface Props {
  template: TemplateInVariant;
  edible?: boolean;
}

const TemplateCard: React.FC<Props> = ({ template, edible }) => {
  const foolsDay = useFoolsDay();
  const { rootProps, frontClassName, backClassName } = useEdibleCard(!!edible);
  const plainCardBack = foolsDay ? weatheredCardBack.src : cardBack.src;
  const [backFacing, setBackFacing] = useState(true);
  const [readyToFlipToFront, setReadyToFlipToFront] = useState(false);
  // The card the wheel shows grows into its place in the replacement list, and shrinks back when it closes.
  const morphName = `template-card${useId()}`;
  const [replacementsOpen, setReplacementsOpen] = useState(false);
  const [wheelCardId, setWheelCardId] = useState<string>();

  const openReplacements = (open: boolean) =>
    startTransition(() => {
      addTransitionType(TEMPLATE_MORPH);
      setReplacementsOpen(open);
    });

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
    <div {...rootProps} className={`rounded-xl ${rootProps.className ?? ''}`}>
      <FlipperCard
        flipped={backFacing}
        front={
          <div className="relative">
            <div
              className={`rounded-xl ${frontClassName}`}
              style={{
                backgroundColor: '#404040',
                textShadow: '1px 1px 5px black',
              }}
            >
              <div className="absolute top-1 text-center w-full text-white font-bold text-[16px] z-20">
                <TextWithMagicSymbol text={template.template.name} />
              </div>
              <div className="absolute top-8 flex flex-col justify-center w-full items-center z-10 h-3/4 hover:z-30">
                <ScryfallResultsWheel
                  fetchResults={(page) => cachedTemplateReplacements(template.template, page)}
                  morphName={replacementsOpen ? undefined : morphName}
                  onCurrentChange={setWheelCardId}
                />
              </div>
              <div className="absolute -bottom-1 flex flex-col justify-center w-full items-center">
                <TemplateReplacementsModal
                  template={template}
                  open={replacementsOpen}
                  onOpenChange={openReplacements}
                  morph={{ name: morphName, cardId: wheelCardId }}
                />
              </div>
              <img className="opacity-10" src={plainCardBack} alt="MTG Card Back" />
            </div>
          </div>
        }
        back={
          <img className={`rounded-xl ${backClassName}`} src={plainCardBack} alt="the back of a classic MtG card" />
        }
      />
    </div>
  );
};

export default TemplateCard;
