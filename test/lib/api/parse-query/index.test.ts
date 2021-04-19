import parseQuery from "@/lib/api/parse-query";
import parseColorIdentity from "@/lib/api/parse-query/parse-color-identity";
import parseComboData from "@/lib/api/parse-query/parse-combo-data";
import parseTags from "@/lib/api/parse-query/parse-tags";
import parseOrder from "@/lib/api/parse-query/parse-order";
import parseSort from "@/lib/api/parse-query/parse-sort";

jest.mock("@/lib/api/parse-query/parse-color-identity");
jest.mock("@/lib/api/parse-query/parse-combo-data");
jest.mock("@/lib/api/parse-query/parse-tags");
jest.mock("@/lib/api/parse-query/parse-order");
jest.mock("@/lib/api/parse-query/parse-sort");

describe("parseQuery", () => {
  it("parses plain text into cards", () => {
    parseQuery("foo bar baz");

    expect(parseComboData).toBeCalledTimes(3);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "foo"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "bar"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "baz"
    );
  });

  it("parses cards with single quotes in the name in plain text", () => {
    parseQuery("Jhoira's Familiar Sensei's Divining Top");

    expect(parseComboData).toBeCalledTimes(5);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Jhoiras"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Familiar"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Senseis"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Divining"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Top"
    );
  });

  it("parses cards with double quotes in the name in plain text", () => {
    parseQuery('Kongming, "Sleeping Dragon" Opalescence');

    expect(parseComboData).toBeCalledTimes(4);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Kongming"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Sleeping"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Dragon"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Opalescence"
    );
  });

  it("parses cards with numbers in the name in plain text", () => {
    parseQuery("Borrowing 10,000 Arrows");

    expect(parseComboData).toBeCalledTimes(3);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Borrowing"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "10000"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Arrows"
    );
  });

  // TODO this should not support this
  it("supports an empty string for query", () => {
    const result = parseQuery("");

    expect(parseComboData).not.toBeCalled();
    expect(parseColorIdentity).not.toBeCalled();
    expect(parseComboData).not.toBeCalled();

    expect(result).toEqual({
      id: {
        includeFilters: [],
        excludeFilters: [],
      },
      cards: {
        sizeFilters: [],
        includeFilters: [],
        excludeFilters: [],
      },
      colorIdentity: {
        includeFilters: [],
        excludeFilters: [],
        sizeFilters: [],
      },
      prerequisites: {
        includeFilters: [],
        excludeFilters: [],
        sizeFilters: [],
      },
      steps: {
        includeFilters: [],
        excludeFilters: [],
        sizeFilters: [],
      },
      results: {
        includeFilters: [],
        excludeFilters: [],
        sizeFilters: [],
      },
      tags: {},
      errors: [],
    });
  });

  it("provides errors", () => {
    const result = parseQuery(
      "foo unknown:value unknown2:'value 2' unknown3:\"value 3\" bar -card>3"
    );

    expect(parseComboData).toBeCalledTimes(3);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "foo"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "bar"
    );
    expect(parseComboData).toBeCalledWith(expect.anything(), "-card", ">", "3");

    expect(result).toEqual(
      expect.objectContaining({
        errors: [
          {
            key: "unknown",
            value: "value",
            message: 'Could not parse keyword "unknown" with value "value".',
          },
          {
            key: "unknown2",
            value: "value 2",
            message: 'Could not parse keyword "unknown2" with value "value 2".',
          },
          {
            key: "unknown3",
            value: "value 3",
            message: 'Could not parse keyword "unknown3" with value "value 3".',
          },
        ],
      })
    );
  });

  it.each([":", "=", ">=", "<=", "<", ">"])(
    "parses %s operator",
    (operator) => {
      parseQuery(`card${operator}name`);

      expect(parseComboData).toBeCalledWith(
        expect.anything(),
        "card",
        operator,
        "name"
      );
    }
  );

  it("can parse a mix of all queries", () => {
    const result = parseQuery(
      "Kiki ci:wbr -ci=br card:Daxos spellbookid:12345 card:'Grave Titan' card:\"Akroma\" unknown:value -card:Food prerequisites:prereq steps:step results:result -prerequisites:xprereq -steps:xstep -result:xresult is:banned -exclude:spoiled sort:colors order:descending"
    );

    expect(parseComboData).toBeCalledTimes(11);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Kiki"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Daxos"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Grave Titan"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Akroma"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-card",
      ":",
      "Food"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "prerequisites",
      ":",
      "prereq"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-prerequisites",
      ":",
      "xprereq"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "steps",
      ":",
      "step"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-steps",
      ":",
      "xstep"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "results",
      ":",
      "result"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-result",
      ":",
      "xresult"
    );

    expect(parseColorIdentity).toBeCalledTimes(2);
    expect(parseColorIdentity).toBeCalledWith(
      expect.anything(),
      "ci",
      ":",
      "wbr"
    );
    expect(parseColorIdentity).toBeCalledWith(
      expect.anything(),
      "-ci",
      "=",
      "br"
    );

    expect(parseTags).toBeCalledWith(expect.anything(), "is", ":", "banned");
    expect(parseTags).toBeCalledWith(
      expect.anything(),
      "-exclude",
      ":",
      "spoiled"
    );

    expect(parseSort).toBeCalledWith(expect.anything(), ":", "colors");
    expect(parseOrder).toBeCalledWith(expect.anything(), ":", "descending");

    expect(result).toEqual(
      expect.objectContaining({
        id: {
          includeFilters: ["12345"],
          excludeFilters: [],
        },
        errors: [
          {
            key: "unknown",
            value: "value",
            message: 'Could not parse keyword "unknown" with value "value".',
          },
        ],
      })
    );
  });

  it("ignores capitalization on keys", () => {
    const result = parseQuery(
      "Kiki CI:wbr CARD:Daxos SPELLBOOKID:12345 CARD:'Grave Titan' CARD:\"Akroma\" UNKNOWN:value -CARD:Food PREREQUISITES:prereq STEPS:step RESULTS:result -PREREQUISITES:xprereq -STEPS:xstep -RESULT:xresult iS:banned -eXcludE:spoiled"
    );

    expect(parseComboData).toBeCalledTimes(11);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Kiki"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Daxos"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Grave Titan"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Akroma"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-card",
      ":",
      "Food"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "prerequisites",
      ":",
      "prereq"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-prerequisites",
      ":",
      "xprereq"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "steps",
      ":",
      "step"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-steps",
      ":",
      "xstep"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "results",
      ":",
      "result"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-result",
      ":",
      "xresult"
    );

    expect(parseColorIdentity).toBeCalledTimes(1);
    expect(parseColorIdentity).toBeCalledWith(
      expect.anything(),
      "ci",
      ":",
      "wbr"
    );

    expect(parseTags).toBeCalledWith(expect.anything(), "is", ":", "banned");
    expect(parseTags).toBeCalledWith(
      expect.anything(),
      "-exclude",
      ":",
      "spoiled"
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: {
          includeFilters: ["12345"],
          excludeFilters: [],
        },
        errors: [
          {
            key: "unknown",
            value: "value",
            message: 'Could not parse keyword "unknown" with value "value".',
          },
        ],
      })
    );
  });

  it("ignores underscores in keys", () => {
    const result = parseQuery(
      "Kiki c_i:wbr c_ar_d:Daxos spellbook_i_d:12345 ca_rd:'Grave Titan' ca_rd:\"Akroma\" unknow_n:value -c_ard:Food _prere_quisit_es_:prereq st_eps:step r_esu_lts:result -prer_equisites:xprereq -ste_ps:xstep -res_ult:xresult i_s:banned -ex_clu_de:spoiled"
    );

    expect(parseComboData).toBeCalledTimes(11);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Kiki"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Daxos"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Grave Titan"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Akroma"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-card",
      ":",
      "Food"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "prerequisites",
      ":",
      "prereq"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-prerequisites",
      ":",
      "xprereq"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "steps",
      ":",
      "step"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-steps",
      ":",
      "xstep"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "results",
      ":",
      "result"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "-result",
      ":",
      "xresult"
    );

    expect(parseColorIdentity).toBeCalledTimes(1);
    expect(parseColorIdentity).toBeCalledWith(
      expect.anything(),
      "ci",
      ":",
      "wbr"
    );

    expect(parseTags).toBeCalledWith(expect.anything(), "is", ":", "banned");
    expect(parseTags).toBeCalledWith(
      expect.anything(),
      "-exclude",
      ":",
      "spoiled"
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: {
          includeFilters: ["12345"],
          excludeFilters: [],
        },
        errors: [
          {
            key: "unknown",
            value: "value",
            message: 'Could not parse keyword "unknown" with value "value".',
          },
        ],
      })
    );
  });

  it("includes `:` character in the value", () => {
    const result = parseQuery("card:'Circle of Protection: Black'");

    expect(result).toEqual(
      expect.objectContaining({
        errors: [],
      })
    );

    expect(parseComboData).toBeCalledTimes(1);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Circle of Protection: Black"
    );
  });

  it.each(["spellbookid", "sid", "sbid"])(
    "parses %s query into spellbook id",
    (id) => {
      const result = parseQuery(`${id}:12345`);

      expect(result).toEqual(
        expect.objectContaining({
          errors: [],
          id: {
            includeFilters: ["12345"],
            excludeFilters: [],
          },
        })
      );
    }
  );

  it.each(["-spellbookid", "-sid", "-sbid"])(
    "parses %s query into spellbook id",
    (id) => {
      const result = parseQuery(`${id}:12345`);

      expect(result).toEqual(
        expect.objectContaining({
          errors: [],
          id: {
            includeFilters: [],
            excludeFilters: ["12345"],
          },
        })
      );
    }
  );

  it.each([
    "ci",
    "coloridentity",
    "color",
    "colors",
    "c",
    "id",
    "ids",
    "commander",
  ])("parses %s into color identity parser", (kind) => {
    parseQuery(`${kind}:wbr -${kind}:br`);

    expect(parseColorIdentity).toBeCalledTimes(2);
    expect(parseColorIdentity).toBeCalledWith(
      expect.anything(),
      kind,
      ":",
      "wbr"
    );
    expect(parseColorIdentity).toBeCalledWith(
      expect.anything(),
      `-${kind}`,
      ":",
      "br"
    );
  });

  it.each(["card", "cards"])("parses %s into card query parser", (kind) => {
    parseQuery(
      `${kind}:Rashmi ${kind}:"with quotes", -${kind}:'excluded thing'`
    );

    expect(parseComboData).toBeCalledTimes(3);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      kind,
      ":",
      "Rashmi"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      kind,
      ":",
      "with quotes"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      `-${kind}`,
      ":",
      "excluded thing"
    );
  });

  it("can parse names with apostrophes", () => {
    parseQuery(`card:"Freyalise, Llanowar's Fury"`);

    expect(parseComboData).toBeCalledTimes(1);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      "Freyalise, Llanowar's Fury"
    );
  });

  it("can parse names with quotes in the name", () => {
    parseQuery(`card:'Kongming, "Sleeping Dragon"'`);

    expect(parseComboData).toBeCalledTimes(1);
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      "card",
      ":",
      `Kongming, "Sleeping Dragon"`
    );
  });

  it.each([
    "pre",
    "prerequisite",
    "prerequisites",
    "step",
    "steps",
    "res",
    "result",
    "results",
  ])("parses %s through combo data parser", (kind) => {
    parseQuery(
      `${kind}:foo ${kind}:"thing in quotes" -${kind}:"excluded thing"`
    );

    expect(parseComboData).toBeCalledTimes(3);
    expect(parseComboData).toBeCalledWith(expect.anything(), kind, ":", "foo");
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      kind,
      ":",
      "thing in quotes"
    );
    expect(parseComboData).toBeCalledWith(
      expect.anything(),
      `-${kind}`,
      ":",
      "excluded thing"
    );
  });

  it.each([
    "is",
    "-is",
    "not",
    "-not",
    "include",
    "-include",
    "exclude",
    "-exclude",
  ])("parses %s through tag parser", (kind) => {
    parseQuery(`${kind}:banned`);

    expect(parseTags).toBeCalledWith(expect.anything(), kind, ":", "banned");
  });

  it("parses sort through sort parser", () => {
    parseQuery("sort:colors");

    expect(parseSort).toBeCalledWith(expect.anything(), ":", "colors");
  });

  it("parses order through order parser", () => {
    parseQuery("order:ascending");

    expect(parseOrder).toBeCalledWith(expect.anything(), ":", "ascending");
  });
});
