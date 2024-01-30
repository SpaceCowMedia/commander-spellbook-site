import {Template} from "lib/types";
import cardBack from "assets/images/card-back.png";
import TextWithMagicSymbol from "components/layout/TextWithMagicSymbol/TextWithMagicSymbol";
import {useEffect, useState} from "react";
import requestService from "services/request.service";
import Loader from "components/layout/Loader/Loader";
import ScryfallResultsModal from "components/combo/TemplateCard/ScryfallResultsModal/ScryfallResultsModal";


type Props = {
  template: Template
}

const TemplateCard = ({template}: Props) => {

  const [resultCount, setResultCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestService.get(template.template.scryfallApi)
      .then((response) => {
        setResultCount(response.total_cards);
      })
      .finally(() => setLoading(false))
  }, []);

  return (
    <div>
      <div className="rounded-xl relative" style={{backgroundColor: '#560042'}}>
        <div className="absolute top-10 text-center w-full text-white font-bold text-lg p-10"><TextWithMagicSymbol text={template.template.name}/></div>
        <div className="absolute bottom-10 flex flex-col justify-center w-full items-center">
          <div className="text-center w-full font-bold italic text-gray-400">{loading ? <Loader/> : `${resultCount} legal cards`}</div>
          <ScryfallResultsModal scryfallApiUrl={template.template.scryfallApi}/>
        </div>
        <img className="opacity-10" src={cardBack.src} alt="MTG Card Back"/>
      </div>

    </div>
  )
}

export default TemplateCard;
