import React, {useState} from "react";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ExternalLink from "../components/layout/ExternalLink/ExternalLink";
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import {defaultSubmissionCard, SubmissionCardType} from "../types/submission";
import CardSubmission from "../components/submission/CardSubmission/CardSubmission";
import StyledSelect from "../components/layout/StyledSelect/StyledSelect";
import TextWithMagicSymbol from "../components/layout/TextWithMagicSymbol/TextWithMagicSymbol";

const NUMBER_OPTIONS = [
  {value: '0', label: '0'},
  {value: '1', label: '1'},
  {value: '2', label: '2'},
  {value: '3', label: '3'},
  {value: '4', label: '4'},
  {value: '5', label: '5'},
  {value: '6', label: '6'},
  {value: '7', label: '7'},
  {value: '8', label: '8'},
  {value: '9', label: '9'},
  {value: '10', label: '10'},
  {value: '11', label: '11'},
  {value: '12', label: '12'},
  {value: '13', label: '13'},
  {value: '14', label: '14'},
  {value: '15', label: '15'},
  {value: '16', label: '16'},
]

type Props = {};
const HowToSubmitACombo: React.FC<Props> = ({}: Props) => {

  const [cards, setCards] = useState<SubmissionCardType[]>([])
  const [steps, setSteps] = useState<string[]>([])
  const [otherPrerequisites, setOtherPrerequisites] = useState('')
  const [manaCost, setManaCost] = useState('')

  const handleAddCard = () => {
    setCards([...cards, {...defaultSubmissionCard}])
  }


  const handleCardChange = (card: SubmissionCardType, index: number) => {
    setCards([...cards.slice(0, index), card, ...cards.slice(index + 1)])
  }
  const handleDeleteCard = (index: number) => {
    setCards([...cards.slice(0, index), ...cards.slice(index + 1)])
  }

  const handleDeleteStep = (index: number) => {
    setSteps([...steps.slice(0, index), ...steps.slice(index + 1)])
  }

  return (
    <PageWrapper>
      <SpellbookHead
        title="Commander Spellbook: How to Submit a Combo"
        description="Learn how to contribute to Commander Spellbook by submitting a new combo."
      />
      <div className="static-page">
        <ArtCircle
          cardName="Kethis, the Hidden Hand"
          className="m-auto md:block hidden"
        />
        <h1 className="heading-title">Submit a Combo</h1>

        <h2 className="heading-subtitle flex justify-start">Cards used in this combo ({cards.length})</h2>
        <div className="flex flex-col">
          {cards.map((card, index) => (
            <CardSubmission onDelete={() => handleDeleteCard(index)} card={card} onChange={card => handleCardChange(card, index)} index={index} key={index}/>
          ))}
        </div>
        <button className="button" onClick={handleAddCard}>Add Card</button>

        <h2 className="heading-subtitle flex justify-start">Mana required (optional)</h2>
        <div className="flex flex-row gap-1">
          <input className="textarea basis-1/2 p-4 border-gray-300 border mb-3" placeholder="e.g. {2}{U}{U}" value={manaCost} onChange={e => setManaCost(e.target.value)} />
          <div className="bg-gray-200 h-14 basis-1/2 flex items-center p-3">Preview: <TextWithMagicSymbol text={manaCost} /></div>
        </div>

        <h2 className="heading-subtitle flex justify-start">Other prerequisites (optional)</h2>
        <textarea
          className="textarea w-full p-4 border-gray-300 border"
          placeholder="e.g. It must be your opponent's turn"
          value={otherPrerequisites}
          onChange={e => setOtherPrerequisites(e.target.value)}
        />


        <h2 className="heading-subtitle flex justify-start">Steps to execute combo ({steps.length})</h2>
        {steps.map((step, index) => (
          <div className="flex items-center relative" key={index}>
            <span className="mr-2">{index + 1}.</span>
            <input
              className="textarea w-full p-4 border-gray-300 border mb-3"
              placeholder="e.g. Cast Splinter Twin on Deceiver Exarch"
              value={step}
              onChange={e => setSteps([...steps.slice(0, index), e.target.value, ...steps.slice(index + 1)])}
            />

            <button
              className="w-6 h-6 rounded-full flex justify-center text-white bg-red-900 font-bold absolute -right-2 -top-2 hover:scale-125 transform transition-all duration-200 ease-in-out"
              onClick={() => handleDeleteStep(index)}
              title="Remove step from combo"
            >
              x
            </button>

          </div>
        ))}
        <button className="button" onClick={() => setSteps([...steps, ''])}>Add Step</button>

        <div className="text-center">
          <ExternalLink
            role="button"
            className="button"
            href="https://discord.gg/KDnvP5f"
          >
            Join us on Discord
          </ExternalLink>
        </div>
      </div>
    </PageWrapper>
  );
};

export default HowToSubmitACombo;
