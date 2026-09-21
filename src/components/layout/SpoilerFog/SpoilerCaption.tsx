import React, { useEffect } from 'react';
import PreviewCaption from 'components/layout/HoverPreview/PreviewCaption';
import { revealAllSpoilers } from 'lib/spoilers';

const REVEAL_DELAY_MS = 5000;

interface Props {
  /* A tapped preview is revealed by tapping it, since a hover preview can only be revealed by waiting. */
  tapped?: boolean;
}

/* Shown over a fogged preview for as long as the preview is: hiding it cancels the countdown. */
const SpoilerCaption: React.FC<Props> = ({ tapped }) => {
  useEffect(() => {
    if (tapped) {
      return;
    }
    const countdown = setTimeout(revealAllSpoilers, REVEAL_DELAY_MS);
    return () => clearTimeout(countdown);
  }, [tapped]);

  return tapped ? (
    <PreviewCaption text="Tap the card to show every spoiler until you close this tab" />
  ) : (
    <PreviewCaption
      text="Keep hovering to show every spoiler until you close this tab"
      progress={{ durationMs: REVEAL_DELAY_MS, key: 'countdown' }}
    />
  );
};

export default SpoilerCaption;
