import React from 'react';
import styles from './textWithSuperscripts.module.scss';

interface Props {
  text: string;
}

const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUPERSCRIPT_RUN = /([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/;

export function hasSuperscripts(text: string): boolean {
  return SUPERSCRIPT_RUN.test(text);
}

/* Superscript figures drawn as ordinary ones, raised. Fonts often have only ¹ ² ³ of their own and
   borrow the rest from another font, which draws them at another height: the 8 and the 3 of 2⁸³. */
const TextWithSuperscripts: React.FC<Props> = ({ text }) => (
  <>
    {text.split(SUPERSCRIPT_RUN).map((part, i) =>
      i % 2 === 1 ? (
        <sup key={i} className={styles.superscript}>
          {/* so it reads and copies as 2^83, not 283 */}
          <span className="sr-only">^</span>
          {[...part].map((digit) => SUPERSCRIPT_DIGITS.indexOf(digit)).join('')}
        </sup>
      ) : (
        part
      ),
    )}
  </>
);

export default TextWithSuperscripts;
