import admin from "firebase-admin";

export type Document = {
  exists: () => boolean;
};

function getDb(): FirebaseFirestore.Firestore {
  const db = admin.firestore();

  return db;
}

export default abstract class DocumentBase {
  private rawDoc: FirebaseFirestore.DocumentSnapshot;

  constructor(doc: FirebaseFirestore.DocumentSnapshot) {
    this.rawDoc = doc;
  }

  static CollectionName = "IMPLEMENT_IN_CHILD_CLASS";

  exists() {
    return this.rawDoc.exists;
  }

  private static getDocumentSnapshot(id: string) {
    return getDb().collection(this.CollectionName).doc(id).get();
  }

  static get(id: string) {
    return this.getDocumentSnapshot(id).then((doc) => {
      // typescript gets mad at us for doing this, since DocumentBase is
      // an abstract class, but this is the magic to let each of the
      // Document classes return instances of themselves when calling get
      // @ts-ignore
      return new this(doc);
    });
  }
}
