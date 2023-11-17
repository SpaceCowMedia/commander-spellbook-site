import styles from "./noCombosFound.module.scss";
import SplashPage from "../SplashPage/SplashPage";
import Link from "next/link";

type Props = {};

const NoCombosFound = ({}: Props) => {
  const title = "No Combos Found"
  const flavor = "The final pages of the experiment log were blank. Investigators found it abandoned on a desk in the researcher’s lab, open, the pages flipping in the wind from a shattered window."

  return (
    <SplashPage
      pulse={false}
      title={title}
      flavor={flavor}
      artCircleCardName="Frantic Search"
    >
      <div className={`${styles.noCombosFoundButtons} opacity-100`}>
        <p>
          Your search didn’t match any combos. Adjust your search or try one of
          the links below:
        </p>
        <div>
          <Link href="/advanced-search/" className="button">
            Advanced Search
          </Link>
          <Link href="/syntax-guide/" className="button">
            Syntax Guide
          </Link>
        </div>
      </div>
    </SplashPage>
  );
};

export default NoCombosFound;
