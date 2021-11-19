import admin from "firebase-admin";
import DocumentBase from "../../src/db/document-base";

jest.mock("firebase-admin");

describe("DocumentBase", () => {
  let collectionSpy: jest.SpyInstance;
  let docSpy: jest.SpyInstance;
  let getSpy: jest.SpyInstance;

  class ChildDocument extends DocumentBase {
    static CollectionName = "child-document";
  }

  beforeEach(() => {
    collectionSpy = jest.fn().mockReturnThis();
    docSpy = jest.fn().mockReturnThis();
    getSpy = jest.fn().mockResolvedValue({
      exists: true,
    });
    // @ts-ignore
    admin.firestore = jest.fn().mockReturnValue({
      collection: collectionSpy,
      doc: docSpy,
      get: getSpy,
    });
  });

  describe("static methods", () => {
    describe("get", () => {
      it("resolves with an instance of the child class", async () => {
        const doc = await ChildDocument.get("foo");

        expect(doc).toBeInstanceOf(ChildDocument);
      });

      it("looks up the document in the collection for the child class", async () => {
        await ChildDocument.get("foo");

        expect(collectionSpy).toBeCalledTimes(1);
        expect(collectionSpy).toBeCalledWith("child-document");
        expect(docSpy).toBeCalledTimes(1);
        expect(docSpy).toBeCalledWith("foo");
        expect(getSpy).toBeCalledTimes(1);
      });
    });
  });

  describe("exists", () => {
    it("returns true when document reports that it exists", async () => {
      getSpy.mockResolvedValue({
        exists: true,
      });

      const child = await ChildDocument.get("foo");

      expect(child.exists()).toBe(true);
    });

    it("returns false when document reports that it does not exist", async () => {
      getSpy.mockResolvedValue({
        exists: false,
      });

      const child = await ChildDocument.get("foo");

      expect(child.exists()).toBe(false);
    });
  });
});
