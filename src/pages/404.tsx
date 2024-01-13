import ErrorBase from "../components/layout/ErrorBase/ErrorBase";
import styles from "./404.module.scss";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import findMyCombosService from "../services/findMyCombos.service";
import VariantService from "../services/variant.service";

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
  
    const redirect = async () => {
      if (router.asPath.includes("/combo/")) {
        const attemptedId = router.asPath.split("/combo/")[1].split("/")[0];
        const alias = await VariantService.fetchVariantAlias(attemptedId);
        if (alias) {
          await router.push(`/combo/${alias.variant}`);
          return;
        }
        const card_ids = attemptedId.split("--")[0].split("-");
        const results = await findMyCombosService.findFromLists([], card_ids);
        // TODO: display the results and let user decide
        // TODO: consider server side rendering
      }
    }

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * NOT_FOUND_TEMPLATES.length);
    setNotFoundClass(NOT_FOUND_TEMPLATES[randomIndex][0]);
    setNotFoundMessage(NOT_FOUND_TEMPLATES[randomIndex][1]);
    redirect();
  }, []);

  return (
    <>
      <ErrorBase
        mainMessage="Page Not Found"
        subMessage={notFoundMessage}
        containerClassName={notFoundClass}
      />
    </>
  );
};

export default NotFoundPage;
