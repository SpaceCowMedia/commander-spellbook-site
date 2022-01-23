import admin from "firebase-admin";
import DocumentBase from "../../src/db/document-base";

jest.mock("firebase-admin");

describe("DocumentBase", () => {
  let collectionSpy: jest.SpyInstance;
  let docSpy: jest.SpyInstance;
  let getSpy: jest.SpyInstance;
  let addSpy: jest.SpyInstance;
  let setSpy: jest.SpyInstance;

  class ChildDocument extends DocumentBase {
    static CollectionName = "child-document";
  }

  beforeEach(() => {
    collectionSpy = jest.fn().mockReturnThis();
    addSpy = jest.fn();
    setSpy = jest.fn();
    docSpy = jest.fn().mockReturnThis();
    getSpy = jest.fn().mockResolvedValue({
      exists: true,
    });
    // @ts-ignore
    admin.firestore = jest.fn().mockReturnValue({
      collection: collectionSpy,
      doc: docSpy,
      get: getSpy,
      add: addSpy,
      set: setSpy,
    });
  });

  describe("static methods", () => {
    describe("create", () => {
      it("adds a document to collection", async () => {
        await ChildDocument.create({ foo: "bar" });

        expect(collectionSpy).toBeCalledTimes(1);
        expect(collectionSpy).toBeCalledWith("child-document");
        expect(addSpy).toBeCalledTimes(1);
        expect(addSpy).toBeCalledWith({ foo: "bar" });
      });
    });

    describe("update", () => {
      it("sets a document on collection", async () => {
        await ChildDocument.update("foo", { foo: "bar" });

        expect(collectionSpy).toBeCalledTimes(1);
        expect(collectionSpy).toBeCalledWith("child-document");
        expect(docSpy).toBeCalledTimes(1);
        expect(docSpy).toBeCalledWith("foo");
        expect(setSpy).toBeCalledTimes(1);
        expect(setSpy).toBeCalledWith({ foo: "bar" });
      });
    });

    describe("careteWithId", () => {
      it("calls update", async () => {
        jest.spyOn(ChildDocument, "update");

        await ChildDocument.createWithId("foo", { foo: "bar" });

        expect(ChildDocument.update).toBeCalledTimes(1);
        expect(ChildDocument.update).toBeCalledWith("foo", { foo: "bar" });
      });
    });

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

    describe("exists", () => {
      it("resolves with true when document exists", async () => {
        jest.spyOn(ChildDocument.prototype, "exists").mockReturnValue(true);

        const exists = await ChildDocument.exists("foo");

        expect(exists).toBe(true);
      });

      it("resolves with false when document does not exist", async () => {
        jest.spyOn(ChildDocument.prototype, "exists").mockReturnValue(false);

        const exists = await ChildDocument.exists("foo");

        expect(exists).toBe(false);
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
