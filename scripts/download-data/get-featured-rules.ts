import { doc, getDoc } from "firebase/firestore";
import log from "../shared/log";
import getDb from "../shared/get-firestore-db";

export default async function getFeaturedRules() {
  const db = getDb();
  const docRef = doc(db, "site-settings", "featured-combos");

  try {
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      log("Rules for featured combos do not exist. Skipping.", "red");
      return [];
    }

    return docSnap.data()?.rules;
  } catch (err) {
    log("Something went wrong looking up the rules for featured combos", "red");
    throw err;
  }
}
