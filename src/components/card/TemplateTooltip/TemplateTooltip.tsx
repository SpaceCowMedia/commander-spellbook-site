import styles from './templateTooltip.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import cardBack from 'assets/images/card-back.png';
import Loader from 'components/ui/Loader/Loader';
import HoverPreview from 'components/layout/HoverPreview/HoverPreview';
import PreviewCaption from 'components/ui/PreviewCaption/PreviewCaption';
import SpoilerFog from 'components/card/SpoilerFog/SpoilerFog';
import SpoilerCaption from 'components/card/SpoilerCaption/SpoilerCaption';
import TextWithMagicSymbol from 'components/symbols/TextWithMagicSymbol/TextWithMagicSymbol';
import { TemplateInVariant } from '@space-cow-media/spellbook-client';
import { ReplacementCard } from 'lib/card/replacements';
import { cachedTemplateReplacements } from 'lib/card/templateReplacementsCache';
import { useSpoilerFogged } from 'lib/card/spoilers';

const ROTATION_MS = 2000;

interface Props {
  template: TemplateInVariant;
  caption?: string;
  children?: React.ReactNode;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

const TemplateTooltip: React.FC<Props> = ({ template, caption, children }) => {
  const requestedRef = useRef(false);
  /* Which replacements the browser already holds, so the rotation only ever moves onto a card that
     is ready to be drawn: a slow image delays its turn instead of flashing an empty frame. */
  const [loadedIds, setLoadedIds] = useState<ReadonlySet<string>>(new Set());
  const loadedRef = useRef(loadedIds);
  const [replacements, setReplacements] = useState<ReplacementCard[]>([]);
  const [count, setCount] = useState<number | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const current = replacements[index] as ReplacementCard | undefined;
  // the rotation waits on a fogged card until its countdown reveals it
  const currentFogged = useSpoilerFogged(current) && loadedIds.has(current!.id);

  const loadReplacements = () => {
    if (requestedRef.current) {
      return;
    }
    requestedRef.current = true;
    cachedTemplateReplacements(template.template, 0)
      .then((page) => {
        setReplacements(page.results);
        setCount(page.count ?? page.results.length);
      })
      .catch((error) => {
        console.error(error);
        setFailed(true);
      });
  };

  const markLoaded = (id: string) => {
    setLoadedIds((previous) => (previous.has(id) ? previous : new Set(previous).add(id)));
  };

  useEffect(() => {
    loadedRef.current = loadedIds;
  }, [loadedIds]);

  useEffect(() => {
    if (!visible || currentFogged || replacements.length < 2 || prefersReducedMotion()) {
      return;
    }
    const rotation = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % replacements.length;
        return loadedRef.current.has(replacements[next].id) ? next : current;
      });
    }, ROTATION_MS);
    return () => clearInterval(rotation);
  }, [visible, currentFogged, replacements]);

  /* Only the card being shown, the one it just replaced and the one coming next are mounted: a
     hover must not fire an image request for every one of a template's hundreds of replacements. */
  const shownIndexes = replacements.length
    ? [...new Set([(index - 1 + replacements.length) % replacements.length, index, (index + 1) % replacements.length])]
    : [];
  const noReplacements = failed || (count !== undefined && replacements.length === 0);
  const captionText =
    caption ?? (count ? `Click to see all ${count} possible replacements` : 'Click to see all possible replacements');

  return (
    <HoverPreview
      onFirstShow={loadReplacements}
      onVisibleChange={setVisible}
      preview={
        <div className={styles.preview}>
          <img className={`${styles.card} ${styles.currentCard}`} src={cardBack.src} alt="Card Back" />
          {replacements.length === 0 && !noReplacements && <Loader centered />}
          {noReplacements && (
            <div className={styles.templateName}>
              <TextWithMagicSymbol text={template.template.name} />
            </div>
          )}
          {shownIndexes.map((shownIndex) => {
            const card = replacements[shownIndex];
            const isShowing = shownIndex === index && loadedIds.has(card.id);
            return (
              <SpoilerFog
                key={card.id}
                name={card.name}
                spoiler={card.spoiler}
                interactive={false}
                className={`${styles.card} ${isShowing ? styles.currentCard : ''}`}
              >
                <img
                  src={card.images[0]}
                  alt={`Template replacement: ${card.name}`}
                  onLoad={() => markLoaded(card.id)}
                />
              </SpoilerFog>
            );
          })}
          {visible && currentFogged ? (
            <SpoilerCaption />
          ) : (
            <PreviewCaption
              text={captionText}
              progress={
                replacements.length > 1
                  ? {
                      durationMs: ROTATION_MS,
                      // remounted on every turn, and when the preview opens, so the bar fills in step
                      // with the timer that is about to change the card
                      key: `${visible}-${index}`,
                      className: styles.rotationProgress,
                    }
                  : undefined
              }
            />
          )}
        </div>
      }
    >
      {children}
    </HoverPreview>
  );
};

export default TemplateTooltip;
