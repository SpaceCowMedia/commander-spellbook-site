import { EstimateBracketResult } from '@space-cow-media/spellbook-client';
import Icon from 'components/layout/Icon/Icon';
import PlaceholderText from 'components/layout/PlaceholderText/PlaceholderText';
import { getBracketFactors } from 'lib/brackets';

interface Props {
  bracketEstimate?: EstimateBracketResult;
}

const BracketInfo = ({ bracketEstimate }: Props) => {
  if (!bracketEstimate) {
    return (
      <>
        <PlaceholderText></PlaceholderText>
        <br />
        <PlaceholderText></PlaceholderText>
        <br />
        <PlaceholderText></PlaceholderText>
      </>
    );
  }
  const factors = getBracketFactors(bracketEstimate, false);

  return (
    <ul className="mt-3 mb-12 flex flex-col items-left gap-2 border border-dark rounded-lg bg-pink-400/10 p-4">
      {factors.map((factor, index) => (
        <li key={index}>
          <Icon name="greaterThan" /> {factor.text}
        </li>
      ))}
      {factors.length === 0 && <li>No factors pushing this combo into a higher bracket were found.</li>}
    </ul>
  );
};

export default BracketInfo;
