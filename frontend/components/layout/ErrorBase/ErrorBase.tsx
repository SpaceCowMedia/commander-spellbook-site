import styles from "./errorBase.module.scss";
import Link from "next/link";

type Props = {
  containerClassName?: string;
  mainMessage: string;
  subMessage?: string;
};

const ErrorBase = ({ containerClassName, mainMessage, subMessage }: Props) => {
  return (
    <div
      className={`-mb-48 text-white w-full bg-center bg-cover ${containerClassName}`}
    >
      <div className="bg-dark bg-opacity-75 w-full h-screen flex flex-col items-center justify-center text-center pb-16">
        <h1 className={`heading-title ${styles.heroTitle}`}>{mainMessage}</h1>
        <h2 className={styles.heroSubtitle}>{subMessage}</h2>
        <Link href="/" className={`button ${styles.button}`}>
          Go to Home Page
        </Link>
      </div>
    </div>
  );
};

export default ErrorBase;
