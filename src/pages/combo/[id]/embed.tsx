import {getStaticProps as parentStaticProps, getStaticPaths as parentStaticPaths} from "pages/combo/[id]/index";
import {Variant} from "lib/types";
import {ComboResult} from "components/search/ComboResults/ComboResults";
import styles from "./embed.module.scss"
import classNames from "classnames";
type Props = {
  combo: Variant;
};
const EmbedPage = ({combo}: Props) => {
  return (
      <div className={classNames("border-black border-2 max-w-xs", styles.container)}>
        <ComboResult combo={combo} newTab/>
      </div>
    )
}

export const getStaticPaths = parentStaticPaths;

export const getStaticProps = parentStaticProps;

export default EmbedPage;
