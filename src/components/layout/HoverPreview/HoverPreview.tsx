import styles from './hoverPreview.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const VISIBLE_TOOLTIP_DISPLAY = 'flex';
const TOOLTIP_RIGHT_SHIFT_PX = 30;
const TOOLTIP_TOP_SHIFT_PX = 30;
// browsers treat a touch that drifts this far as a tap, so we must too
const TAP_MOVE_TOLERANCE_PX = 16;
const EMULATED_MOUSE_WINDOW_MS = 1000;
const VIEWPORT_MARGIN_PX = 10;
export const CARD_IMAGE_WIDTH_PX = 244;
export const CARD_IMAGE_HEIGHT_PX = 340;

interface Props {
  /* Rendered while hidden too, so a preview that loads its own content can start on the first hover. */
  preview: React.ReactNode;
  /* How many card widths the preview takes up, which is what it is positioned around. */
  previewCount?: number;
  /* Off leaves a tap to do whatever the trigger does on its own. */
  tapPreviewEnabled?: boolean;
  /* Swallows the desktop click, for a trigger wrapping a link the preview stands in for. */
  suppressClick?: boolean;
  onFirstShow?: () => void;
  onVisibleChange?: (_visible: boolean, _tapped: boolean) => void;
  /* Lets a tapped preview answer a tap on itself, instead of closing like a tap anywhere else does. */
  onPreviewTap?: () => void;
  children?: React.ReactNode;
}

function movedLikeAScroll(start: { x: number; y: number }, end: React.Touch): boolean {
  return (
    Math.abs(end.clientX - start.x) > TAP_MOVE_TOLERANCE_PX || Math.abs(end.clientY - start.y) > TAP_MOVE_TOLERANCE_PX
  );
}

function tapStart(e: React.TouchEvent): { x: number; y: number } | null {
  const touch = e.touches[0];
  return e.touches.length > 1 || !touch ? null : { x: touch.clientX, y: touch.clientY };
}

const HoverPreview: React.FC<Props> = ({
  preview,
  previewCount = 1,
  tapPreviewEnabled,
  suppressClick,
  onFirstShow,
  onVisibleChange,
  onPreviewTap,
  children,
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const previewTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const emulatedMouseSuppressedRef = useRef(false);
  const emulatedMouseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentlyHovered, setCurrentlyHovered] = useState(false);
  const [tapPreviewOpen, setTapPreviewOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const isVisible = currentlyHovered || tapPreviewOpen;
  const previewTappable = tapPreviewOpen && onPreviewTap !== undefined;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    onVisibleChange?.(isVisible, tapPreviewOpen);
  }, [isVisible, tapPreviewOpen]);

  const noteShown = () => {
    if (hasShownRef.current) {
      return;
    }
    hasShownRef.current = true;
    onFirstShow?.();
  };

  /* Every face is previewed side by side, and a screen too narrow to hold them at full size shrinks
     the whole row rather than cutting it off. The tooltip can only be measured once it has been
     shown, so until then its size is derived the same way the stylesheet constrains it. */
  const previewScale = (): number =>
    Math.min(1, (window.innerWidth - VIEWPORT_MARGIN_PX * 2) / (CARD_IMAGE_WIDTH_PX * Math.max(previewCount, 1)));

  const handleSingleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (suppressClick && !deviceIsMobile()) {
      event.preventDefault();
    }
  };

  // a tap makes the browser fire a mouse sequence afterwards; those events must not be able to
  // show a preview, because that preview would have no tap catcher behind it to dismiss it
  const suppressEmulatedMouse = () => {
    emulatedMouseSuppressedRef.current = true;
    if (emulatedMouseTimerRef.current) {
      clearTimeout(emulatedMouseTimerRef.current);
    }
    emulatedMouseTimerRef.current = setTimeout(() => {
      emulatedMouseSuppressedRef.current = false;
    }, EMULATED_MOUSE_WINDOW_MS);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLSpanElement>) => {
    suppressEmulatedMouse();
    // a hover left over from a mouse must never survive into a touch interaction
    setCurrentlyHovered(false);

    touchStartRef.current = tapStart(e);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLSpanElement>) => {
    suppressEmulatedMouse();

    const start = touchStartRef.current;
    touchStartRef.current = null;

    if (!tapPreviewEnabled || !start) {
      return;
    }

    const touch = e.changedTouches[0];
    if (!touch || movedLikeAScroll(start, touch)) {
      return;
    }

    // cancels the emulated mouse sequence, so the tap never reaches links underneath
    e.preventDefault();
    noteShown();
    setMousePosition({ x: touch.clientX, y: touch.clientY });
    setTapPreviewOpen(true);
  };

  const closeTapPreview = () => {
    setTapPreviewOpen(false);
    setCurrentlyHovered(false);
  };

  const handleTapCatcherTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    closeTapPreview();
  };

  const handleTapCatcherClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    closeTapPreview();
  };

  // the preview sits inside the trigger, which must not take a tap on the preview for its own
  const handlePreviewTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    previewTouchStartRef.current = tapStart(e);
  };

  const handlePreviewTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const start = previewTouchStartRef.current;
    previewTouchStartRef.current = null;
    const touch = e.changedTouches[0];
    if (!start || !touch || movedLikeAScroll(start, touch)) {
      return;
    }
    // cancels the emulated click, so the tap never reaches a link around the trigger
    e.preventDefault();
    onPreviewTap?.();
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onPreviewTap?.();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!divRef.current || tapPreviewOpen || emulatedMouseSuppressedRef.current) {
      return;
    }

    noteShown();

    if (divRef.current.style.display !== VISIBLE_TOOLTIP_DISPLAY) {
      // make tooltip movement smoother
      divRef.current.style.left = getTooltipLeft(e.clientX);
      divRef.current.style.top = getTooltipTop(e.clientY);
    }

    setCurrentlyHovered(true);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLSpanElement>) => {
    // crossing from one child of the trigger to another is not leaving it, and must not restart a countdown
    if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    if (divRef.current) {
      setCurrentlyHovered(false);
    }
  };

  useEffect(() => {
    if (!tapPreviewOpen) {
      return;
    }
    const handleScroll = () => setTapPreviewOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tapPreviewOpen]);

  useEffect(() => {
    return () => {
      if (emulatedMouseTimerRef.current) {
        clearTimeout(emulatedMouseTimerRef.current);
      }
    };
  }, []);

  const getTooltipTop = (mouseY: number): string => {
    const preferredTop = mouseY - TOOLTIP_TOP_SHIFT_PX;

    if (!isMounted || !divRef?.current || !deviceIsMobile()) {
      return preferredTop + 'px';
    }

    const cardBottomLimit = window.innerHeight - VIEWPORT_MARGIN_PX;
    // the div is still hidden the first time a tap opens it, so clientHeight is 0
    const cardHeight = divRef.current.clientHeight || CARD_IMAGE_HEIGHT_PX * previewScale();
    const clampedTop = Math.min(preferredTop, cardBottomLimit - cardHeight);

    return Math.max(VIEWPORT_MARGIN_PX, clampedTop) + 'px';
  };

  function deviceIsMobile(): boolean {
    return isMounted && window?.innerWidth <= 1024;
  }

  const isClickOnScreenLeftSide = (clickX: number) => window?.innerWidth / 2 - clickX > 0;

  const getTooltipLeft = (mouseX: number): string => {
    if (!isMounted || !divRef?.current) {
      return '0px';
    }

    if (deviceIsMobile()) {
      const cardRightLimit = window.innerWidth - VIEWPORT_MARGIN_PX;
      // the div is still hidden the first time a tap opens it, so clientWidth is 0
      const cardWidth = divRef.current.clientWidth || CARD_IMAGE_WIDTH_PX * previewCount * previewScale();

      const cardRightXIfShiftedRight = mouseX + cardWidth + TOOLTIP_RIGHT_SHIFT_PX;

      if (cardRightXIfShiftedRight > cardRightLimit) {
        return cardRightLimit - cardWidth + 'px';
      } else {
        return mouseX + TOOLTIP_RIGHT_SHIFT_PX + 'px';
      }
    } else {
      if (isClickOnScreenLeftSide(mouseX)) {
        return mouseX + TOOLTIP_RIGHT_SHIFT_PX + 'px';
      } else {
        return mouseX - 290 * previewCount + 'px';
      }
    }
  };

  return (
    <span
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseOut={handleMouseOut}
      onClick={handleSingleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {isMounted &&
        tapPreviewOpen &&
        createPortal(
          <div className={styles.tapCatcher} onTouchEnd={handleTapCatcherTouchEnd} onClick={handleTapCatcherClick} />,
          document.body,
        )}
      <div
        ref={divRef}
        className={`${styles.hoverPreview} ${previewTappable ? styles.tappable : ''}`}
        onTouchStart={previewTappable ? handlePreviewTouchStart : undefined}
        onTouchEnd={previewTappable ? handlePreviewTouchEnd : undefined}
        onClick={previewTappable ? handlePreviewClick : undefined}
        style={{
          display: isVisible ? VISIBLE_TOOLTIP_DISPLAY : 'none',
          top: getTooltipTop(mousePosition.y),
          left: getTooltipLeft(mousePosition.x),
        }}
      >
        {preview}
      </div>
      {children}
    </span>
  );
};

export default HoverPreview;
