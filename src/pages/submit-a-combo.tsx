import React, {useEffect, useState} from "react";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import {
  defaultFeatureSubmission,
  defaultSubmissionCard,
  defaultTemplateSubmission, FeatureSubmissionType,
  SubmissionCardType,
  TemplateSubmissionType
} from "../types/submission";
import CardSubmission from "../components/submission/CardSubmission/CardSubmission";
import TextWithMagicSymbol from "../components/layout/TextWithMagicSymbol/TextWithMagicSymbol";
import {useRouter} from "next/router";
import {useCookies} from "react-cookie";
import FeatureSubmission from "../components/submission/Feature Submission/FeatureSubmission";
import requestService from "../services/request.service";
import Loader from "../components/layout/Loader/Loader";
import ErrorMessage from "../components/submission/ErrorMessage/ErrorMessage";
import {ComboSubmissionErrorType} from "../lib/types";
import Alert from "components/layout/Alert/Alert";
import {GetServerSideProps} from "next";


type Props = {};
const SubmitACombo: React.FC<Props> = ({}: Props) => {

  const [cards, setCards] = useState<SubmissionCardType[]>([])
  const [templates, setTemplates] = useState<TemplateSubmissionType[]>([])
  const [features, setFeatures] = useState<FeatureSubmissionType[]>([])
  const [steps, setSteps] = useState<string[]>([])
  const [otherPrerequisites, setOtherPrerequisites] = useState('')
  const [manaCost, setManaCost] = useState('')
  const router = useRouter()
  const [cookies, setCookie] = useCookies(['csbUsername', 'csbJwt'])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [_error, setError] = useState('')
  const [errorObj, setErrorObj] = useState<ComboSubmissionErrorType>()

  // Makes sure the keys of lists are distinct after an element is deleted
  const [keyId, setKeyId] = useState<number>(0)

  const handleAddCard = () => {
    setCards([...cards, {...defaultSubmissionCard}])
  }
  const handleAddTemplate = () => {
    setTemplates([...templates, {...defaultTemplateSubmission}])
  }
  const handleAddFeature = () => {
    setFeatures([...features, {...defaultFeatureSubmission}])
  }


  const handleCardChange = (card: SubmissionCardType, index: number) => {
    setCards([...cards.slice(0, index), card, ...cards.slice(index + 1)])
  }
  const handleTemplateChange = (template: TemplateSubmissionType, index: number) => {
    setTemplates([...templates.slice(0, index), template, ...templates.slice(index + 1)])
  }
  const handleFeatureChange = (feature: FeatureSubmissionType, index: number) => {
    setFeatures([...features.slice(0, index), feature, ...features.slice(index + 1)])
  }
  const handleDeleteCard = (index: number) => {
    setCards([...cards.slice(0, index), ...cards.slice(index + 1)])
    setKeyId(keyId + 1)
  }
  const handleDeleteTemplate = (index: number) => {
    setTemplates([...templates.slice(0, index), ...templates.slice(index + 1)])
    setKeyId(keyId + 1)
  }
  const handleDeleteFeature = (index: number) => {
    setFeatures([...features.slice(0, index), ...features.slice(index + 1)])
    setKeyId(keyId + 1)
  }

  const handleDeleteStep = (index: number) => {
    setSteps([...steps.slice(0, index), ...steps.slice(index + 1)])
    setKeyId(keyId + 1)
  }

  const handleSubmit = async () => {
    const submission = {
      uses: cards,
      requires: templates,
      produces: features,
      description: steps.join('\n'),
      otherPrerequisites,
      manaNeeded: manaCost,
    }
    setSubmitting(true)
    setError('')
    setErrorObj(undefined)
    requestService.post('/api/variant-suggestions/', submission)
      .then(() => {
        setSubmitting(false)
        setSuccess(true)
      }).catch((err) => {
        setSubmitting(false)
        if (Array.isArray(err)) setError(err.join('\n'))
        else setError(JSON.stringify(err))
        setErrorObj(err)
      })
  }

  if (success) return (
    <>
      <SpellbookHead
        title="Commander Spellbook: How to Submit a Combo"
        description="Learn how to contribute to Commander Spellbook by submitting a new combo."
      />
      <div className="static-page">
        <ArtCircle
          cardName="Kethis, the Hidden Hand"
          className="m-auto md:block hidden"
        />
        <h1 className="heading-title">Thanks for submitting a suggestion!</h1>
        <div className="flex justify-center">
          <button className="button" onClick={() => router.reload()}>Submit another combo</button>
        </div>

      </div>
    </>
  )

  return (
    <>
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

        <h2 className="heading-subtitle flex justify-start">Specific cards used in this combo ({cards.length})</h2>
        <ErrorMessage list={errorObj?.uses} />
        <div className="flex flex-col">
          {cards.map((card, index) => (
            <CardSubmission
              onDelete={() => handleDeleteCard(index)}
              card={card}
              onChange={card => handleCardChange(card as SubmissionCardType, index)}
              index={index}
              key={`${index}-${keyId}`}
            />
          ))}
        </div>
        <button className="button" onClick={handleAddCard}>Add Card</button>

        <h2 className="heading-subtitle flex justify-start">Generic cards this combo requires ({templates.length})</h2>
        <ErrorMessage list={errorObj?.requires} />
        <div className="flex flex-col">
          {templates.map((card, index) => (
            <CardSubmission
              template
              onDelete={() => handleDeleteTemplate(index)}
              card={card}
              onChange={template => handleTemplateChange(template as TemplateSubmissionType, index)}
              index={index}
              key={`${index}-${keyId}`}
            />
          ))}
        </div>
        <button className="button" onClick={handleAddTemplate}>Add Template</button>

        <h2 className="heading-subtitle flex justify-start">Mana required (optional)</h2>
        <ErrorMessage list={errorObj?.manaNeeded} />
        <div className="flex flex-row gap-1 flex-wrap">
          <input className="textarea flex-1 p-4 border-gray-300 border mb-3" maxLength={51} placeholder="e.g. {2}{U}{U}" value={manaCost} onChange={e => setManaCost(e.target.value)} />
          <div className="bg-gray-200 h-14 flex-1 flex items-center p-3 whitespace-nowrap min-w-max">Preview: <TextWithMagicSymbol text={manaCost} /></div>
        </div>

        <h2 className="heading-subtitle flex justify-start">Other prerequisites (optional)</h2>
        <ErrorMessage list={errorObj?.otherPrerequisites} />
        <textarea
          className="textarea w-full p-4 border-gray-300 border"
          placeholder="e.g. It must be your opponent's turn"
          value={otherPrerequisites}
          onChange={e => setOtherPrerequisites(e.target.value)}
        />



        <h2 className="heading-subtitle flex justify-start">Steps to execute combo ({steps.length})</h2>
        <ErrorMessage list={errorObj?.description} />
        {steps.map((step, index) => (
          <div className="flex items-center relative" key={`${index}-${keyId}`}>
            <span className="mr-2">{index + 1}.</span>
            <input
              className="textarea w-full p-4 border-gray-300 border mb-3"
              placeholder="e.g. Cast Splinter Twin on Deceiver Exarch"
              value={step}
              onChange={e => setSteps([...steps.slice(0, index), e.target.value, ...steps.slice(index + 1)])}
              maxLength={256}
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


        <h2 className="heading-subtitle flex justify-start">Results of this combo ({features.length})</h2>
        <ErrorMessage list={errorObj?.produces} />
        <div className="flex flex-col">
          {features.map((feature, index) => (
            <FeatureSubmission
              feature={feature}
              onChange={f => handleFeatureChange(f, index)}
              onDelete={() => handleDeleteFeature(index)}
              index={index}
              key={`${index}-${keyId}`}
            />
          ))}
        </div>
        <button className="button" onClick={handleAddFeature}>Add Feature</button>

        {cards.length > 5 &&
          <Alert type="warning" icon="triangleExclamation" title="Warning">
            This combo might be denied because it is over our five-card maximum. These tips will increase the chances of the combo making it onto Commander Spellbook:
            <ul className="list-disc list-inside">
              <li>If a card has many replacements in this combo’s color identity, cut it and use the generic card template instead. For example, “A Dragon creature” or “A way to give indestructible” can replace a specific card.</li>
              <li>Cut any cards that are not required to keep the combo going, even if they are needed to win the game. We don’t need to list Blood Artist or Impact Tremors on every page.”</li>
            </ul>
          </Alert>
        }

        <div className="flex justify-center">
          <button disabled={submitting} className="button" onClick={handleSubmit}>{submitting ? <Loader/> : 'Submit Combo'}</button>
        </div>

        {errorObj?.nonFieldErrors && <ErrorMessage list={errorObj.nonFieldErrors}/>}
        {errorObj && !errorObj.nonFieldErrors &&
          <ErrorMessage>
            There were errors in your submission. Please fix the mistakes outlined above and resubmit.
          </ErrorMessage>
        }

      </div>
    </>
  );
};

export default SubmitACombo;


export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.cookies
  if (!cookies.csbUsername || !cookies.csbJwt) {
    return {
      redirect: {
        destination: '/login?final=submit-a-combo',
        permanent: false,
      }
    }
  }
  return {props: {}}
}
