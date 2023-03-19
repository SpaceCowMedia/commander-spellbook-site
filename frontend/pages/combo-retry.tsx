import Combo from "./combo/[id]";
import {useRouter} from "next/router";

/**
 * This page should only be a stopgap until we can get the combo page to work dynamically with a server.
 */
const ComboRetry = () => {
  const router = useRouter();

  return <Combo retryId={`${router.query.id}`}/>
}

export default ComboRetry
