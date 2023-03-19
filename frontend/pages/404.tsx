import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import ErrorBase from "../components/layout/ErrorBase/ErrorBase";
import styles from "./404.module.scss";
import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/router";

const NOT_FOUND_TEMPLATES = [
  [styles.barrenGlory, "You were looking for glory, but found an empty world."],
  [styles.curiosity, "How curious..."],
  [styles.lostInTheWoods, "Must be lost in the woods."],
  [
    styles.oneWithNothing,
    "You were looking for one thing. You found... nothing.",
  ],
  [styles.possibilityStorm, "So many possibilities... just not on this page."],
  [styles.totallyLost, "Looks like you're totally lost..."],
  [styles.unexpectedlyAbsent, "It was unexpectedly absent."],
  [styles.zhalfirinVoid, "Must have phased out."],
];

const NotFoundPage = () => {
  const [notFoundClass, setNotFoundClass] = useState(NOT_FOUND_TEMPLATES[0][0]);
  const [notFoundMessage, setNotFoundMessage] = useState(
    NOT_FOUND_TEMPLATES[0][1]
  );

  const router = useRouter();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * NOT_FOUND_TEMPLATES.length);
    setNotFoundClass(NOT_FOUND_TEMPLATES[randomIndex][0]);
    setNotFoundMessage(NOT_FOUND_TEMPLATES[randomIndex][1]);

    if (router.asPath.includes("/combo/")) {
      const retryId = router.asPath.split("/combo/")[1].split("/")[0];
      router.push(`/combo-retry?id=${retryId}`);
    }
  }, []);

  return (
    <PageWrapper noMarginFooter>
      <ErrorBase
        mainMessage="Page Not Found"
        subMessage={notFoundMessage}
        containerClassName={notFoundClass}
      />
    </PageWrapper>
  );
};

export default NotFoundPage;
