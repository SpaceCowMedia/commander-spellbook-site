import cardBack from 'assets/images/card-back.png';
import isFoolsDay from 'lib/foolsDay';
import weatheredCardBack from 'assets/images/weathered-card-back.png';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import React from 'react';
import TemplateReplacementsModal from 'components/combo/TemplateCard/TemplateReplacementsModal/TemplateReplacementsModal';
import ScryfallResultsWheel from 'components/combo/TemplateCard/ScryfallResultsWheel/ScryfallResultsWheel';
import { Template, TemplateInVariant } from '@space-cow-media/spellbook-client';
import ScryfallService, { ScryfallResultsPage } from 'services/scryfall.service';

type Props = {
  template: TemplateInVariant;
  className?: string;
  imgClassName?: string;
  fetchTemplateReplacements?: (_template: Template, _page: number) => Promise<ScryfallResultsPage>;
};

const TemplateCard: React.FC<Props> = ({
  template,
  className,
  imgClassName,
  fetchTemplateReplacements = ScryfallService.templateReplacements,
}) => {
  return (
    <div className="relative">
      <div className={`rounded-xl ${className ?? ''}`} style={{ backgroundColor: '#404040' }}>
        <div className="absolute -top-5 text-center w-full text-white font-bold text-[16px] mt-7 z-11">
          <TextWithMagicSymbol text={template.template.name} />
        </div>
        <div className="absolute top-[60px] flex flex-col justify-center w-full items-center z-10">
          {<ScryfallResultsWheel fetchResults={(page) => fetchTemplateReplacements(template.template, page)} />}
        </div>
        <div className="absolute -bottom-1 flex flex-col justify-center w-full items-center">
          {/*<div className="text-center w-full font-bold italic text-gray-400">{loading ? <Loader/> : `${resultCount} legal cards`}</div>*/}
          <TemplateReplacementsModal template={template} fetchTemplateReplacements={fetchTemplateReplacements} />
        </div>
        <img
          className={`opacity-10 ${imgClassName ?? ''}`}
          src={isFoolsDay() ? weatheredCardBack.src : cardBack.src}
          alt="MTG Card Back"
        />
      </div>
    </div>
  );
};

export default TemplateCard;
