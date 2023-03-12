import styles from "./placeholderText.module.scss";
import { CSSRuleObject } from "tailwindcss/types/config";

type Props = {
  maxLength?: number;
  minLength?: number;
};

const PlaceholderText = ({ maxLength = 90, minLength = 10 }: Props) => {
  const length = Math.floor(Math.random() * maxLength) + minLength;

  const style: CSSRuleObject = { width: `${length}%` };

  return (
    <span className={styles.placeholderText}>
      <div className={styles.textBar} style={style} />
    </span>
  );
};

export default PlaceholderText;
