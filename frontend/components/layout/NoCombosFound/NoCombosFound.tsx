import styles from './noCombosFound.module.scss'
import SplashPage from "../SplashPage/SplashPage";
import Link from "next/link";

type Props = {
  loaded: boolean
}

const NoCombosFound = ({ loaded }: Props) => {
  const title = loaded ? 'No Combos Found' : 'Looking for Combos'
  const flavor = loaded ? "The final pages of the experiment log were blank. Investigators found it abandoned on a desk in the researcher’s lab, open, the pages flipping in the wind from a shattered window."
    : "It’s hard to say which is more satisfying: the search for that missing piece or fitting that piece into place."

  return (
    <SplashPage pulse={!loaded} title={title} flavor={flavor} artCircleCardName="Frantic Search">
      <div className={`${styles.noCombosFoundButtons} ${loaded ? 'opacity-100' : 'opacity-0'}`}>
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
  )
}

export default NoCombosFound