const admin = require("firebase-admin");

// @returns Firestore DB instance
function getDb() {
  const db = admin.firestore();

  return db;
}

// abstract class, do not use directly
module.exports = class DocumentBase {
  // @arg FirebaseFirestore.DocumentSnapshot
  constructor(doc) {
    // private, use only internally
    this.rawDoc = doc;
  }

  static CollectionName = "IMPLEMENT_IN_CHILD_CLASS";

  exists() {
    return this.rawDoc.exists;
  }

  // private
  static getCollection() {
    return getDb().collection(this.CollectionName);
  }

  // private
  static getDocumentRef(id) {
    return this.getCollection().doc(id);
  }

  static create(details) {
    return this.getCollection().add(details);
  }

  static createWithId(id, details) {
    // TODO should probably check for existence
    return this.update(id, details);
  }

  static update(id, details) {
    return this.getDocumentRef(id).set(details);
  }

  static get(id) {
    return this.getDocumentRef(id)
      .get()
      .then((doc) => {
        // this is a little odd, since DocumentBase is an abstract class,
        // but this is the magic to let each of the Document child classes
        // return instances of themselves when calling get
        return new this(doc);
      });
  }

  // @returns Promise<boolean>
  static exists(id) {
    return this.get(id).then((instance) => {
      return instance.exists();
    });
  }
};
