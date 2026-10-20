import React from 'react';
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import TextWithMagicSymbol from 'components/symbols/TextWithMagicSymbol/TextWithMagicSymbol';
import TextWithSuperscripts from 'components/ui/TextWithSuperscripts/TextWithSuperscripts';

const raised = (container: HTMLElement) => [...container.querySelectorAll('sup')].map((sup) => sup.textContent);

test('raises ordinary figures in place of superscript ones', () => {
  const { container } = render(<TextWithSuperscripts text="2⁸³ tokens, or 2.42 × 10²⁴" />);
  expect(raised(container)).toEqual(['^83', '^24']);
  expect(container).toHaveTextContent('2^83 tokens, or 2.42 × 10^24');
  expect(container.textContent).not.toMatch(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/);
});

test('leaves text without them alone', () => {
  const { container } = render(<TextWithSuperscripts text="1,234 tokens" />);
  expect(container.querySelector('sup')).toBeNull();
  expect(container).toHaveTextContent('1,234 tokens');
});

test('is how text with symbols draws them', () => {
  const { container } = render(<TextWithMagicSymbol text="{G} for 2¹⁰⁰ tokens" />);
  expect(raised(container)).toEqual(['^100']);
});
