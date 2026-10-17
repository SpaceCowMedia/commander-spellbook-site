import { useRef } from 'react';
import type React from 'react';

/* how far, in pixels, a finger has to move sideways to swipe */
const SWIPE = 40;

/* Pointer handlers that tell which way a finger or a pen swiped: far enough, and more sideways than up
   or down. The element needs `touch-action: pan-y`, so the page still scrolls under the finger but
   leaves sideways moves to the handlers. */
export default function useSwipe(onSwipe: (direction: 'left' | 'right') => void) {
  const start = useRef<{ id: number; x: number; y: number }>(undefined);
  return {
    onPointerDown: ({ pointerType, pointerId, clientX, clientY }: React.PointerEvent) => {
      start.current = pointerType === 'mouse' ? undefined : { id: pointerId, x: clientX, y: clientY };
    },
    onPointerUp: ({ pointerId, clientX, clientY }: React.PointerEvent) => {
      const from = start.current;
      start.current = undefined;
      if (from?.id !== pointerId) {
        return;
      }
      const sideways = clientX - from.x;
      if (Math.abs(sideways) >= SWIPE && Math.abs(sideways) > 2 * Math.abs(clientY - from.y)) {
        onSwipe(sideways < 0 ? 'left' : 'right');
      }
    },
    onPointerCancel: () => {
      start.current = undefined;
    },
  };
}
