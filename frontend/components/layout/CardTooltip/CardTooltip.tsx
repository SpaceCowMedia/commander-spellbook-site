import styles from "./cardTooltip.module.scss";
import { useRef } from "react";
import getExternalCardData from "lib/getExternalCardData";

type Props = {
  cardName?: string;
  children?: React.ReactNode;
};

const CardTooltip = ({ cardName, children }: Props) => {
  const url = cardName ? getExternalCardData(cardName).images.oracle : "";

  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: any) => {
    if (!divRef.current) return;
    const displayOnRightSide = window.innerWidth / 2 - e.clientX > 0;
    divRef.current.style.display = "unset";
    divRef.current.style.top = e.clientY - 30 + "px";

    if (displayOnRightSide) divRef.current.style.left = e.clientX + 50 + "px";
    else divRef.current.style.left = e.clientX - 290 + "px";
  };

  const handleMouseOut = () => {
    if (divRef.current) divRef.current.style.display = "none";
  };

  return (
    <span onMouseMove={handleMouseMove} onMouseOut={handleMouseOut}>
      <div ref={divRef} className={styles.cardTooltip}>
        {!!cardName && <img src={url} alt={cardName} />}
      </div>
      {children}
    </span>
  );
};

export default CardTooltip;
