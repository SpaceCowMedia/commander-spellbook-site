import admin from "firebase-admin";

type RecordDetails = Record<string, unknown>;

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

  private static getCollection() {
    return getDb().collection(this.CollectionName);
  }

  private static getDocumentRef(id: string) {
    return this.getCollection().doc(id);
  }

  static create(details: RecordDetails) {
    return this.getCollection().add(details);
  }

  static createWithId(id: string, details: RecordDetails) {
    // TODO should probably check for existence
    return this.update(id, details);
  }

  static update(id: string, details: RecordDetails) {
    return this.getDocumentRef(id).set(details);
  }

  static get(id: string) {
    return this.getDocumentRef(id)
      .get()
      .then((doc) => {
        // typescript gets mad at us for doing this, since DocumentBase is
        // an abstract class, but this is the magic to let each of the
        // Document classes return instances of themselves when calling get
        // @ts-ignore
        return new this(doc);
      });
  }

  static exists(id: string): Promise<boolean> {
    return this.get(id).then((instance) => {
      return instance.exists();
    });
  }
}
