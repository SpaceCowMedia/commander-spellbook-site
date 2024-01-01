import ErrorBase from "../components/layout/ErrorBase/ErrorBase";
import { useEffect } from "react";
import { useState } from "react";

const UNKNOWN_TEMPLATES = ["apocalypse", "obliterate", "bookBurning"];

const UnknownErrorPage = () => {
  const [unknownErrorClass, setUnknownErrorClass] = useState(
    UNKNOWN_TEMPLATES[0][0]
  );

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * UNKNOWN_TEMPLATES.length);
    setUnknownErrorClass(UNKNOWN_TEMPLATES[randomIndex]);
  }, []);

  return (
    <>
      <ErrorBase
        mainMessage="Uh Oh"
        subMessage="Something went wrong. Try again in a few minutes."
        containerClassName={unknownErrorClass}
      />
    </>
  );
};

export default UnknownErrorPage;
