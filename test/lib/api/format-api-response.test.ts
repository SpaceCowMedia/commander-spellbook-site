import formatApiResponse from "@/lib/api/format-api-response";
import Card from "@/lib/api/models/card";
import CardGrouping from "@/lib/api/models/card-grouping";
import SpellbookList from "@/lib/api/models/list";
import ColorIdentity from "@/lib/api/models/color-identity";
import { CompressedApiResponse } from "@/lib/api/types";

describe("api", () => {
  let values: CompressedApiResponse[];

  beforeEach(() => {
    values = [
      {
        d: "1",
        c: ["Guilded Lotus", "Voltaic Servant"],
        i: "c",
        p: "prereq 1. prereq 2. prereq 3",
        s: "step 1. step 2. step 3",
        r: "result 1. result 2. result 3",
      },
      {
        d: "2",
        c: ["Mindmoil", "Psychosis Crawler", "Teferi's Ageless Insight"],
        i: "r,u",
        p: "prereq",
        s: "step",
        r: "result",
      },
      {
        d: "3",
        c: [
          "Sidar Kondo of Jamurra",
          "Tana the Bloodsower",
          "Breath of Furt",
          "Fervor",
        ],
        i: "r,g,w",
        p: "prereq",
        s: "step",
        r: "result",
      },
    ];
  });

  it("formats compressed data into usable object", () => {
    const isBannedSpy = jest.spyOn(CardGrouping.prototype, "isBanned");
    const isPreviewSpy = jest.spyOn(CardGrouping.prototype, "isPreview");

    isBannedSpy.mockReturnValueOnce(false);
    isBannedSpy.mockReturnValueOnce(true);
    isPreviewSpy.mockReturnValueOnce(false);
    isPreviewSpy.mockReturnValueOnce(false);
    isPreviewSpy.mockReturnValueOnce(true);

    const combos = formatApiResponse(values);

    expect(combos[0]).toEqual(
      expect.objectContaining({
        commanderSpellbookId: "1",
        permalink: "https://commanderspellbook.com/combo/1/",
        hasBannedCard: false,
        hasSpoiledCard: false,
      })
    );
    expect(combos[0].cards.length).toBe(2);
    expect(combos[0].cards[0]).toBeInstanceOf(Card);
    expect(combos[0].cards[1]).toBeInstanceOf(Card);
    expect(combos[0].colorIdentity).toBeInstanceOf(ColorIdentity);
    expect(combos[0].prerequisites).toBeInstanceOf(SpellbookList);
    expect(combos[0].steps).toBeInstanceOf(SpellbookList);
    expect(combos[0].results).toBeInstanceOf(SpellbookList);

    expect(combos[1]).toEqual(
      expect.objectContaining({
        commanderSpellbookId: "2",
        permalink: "https://commanderspellbook.com/combo/2/",
        hasBannedCard: true,
        hasSpoiledCard: false,
      })
    );
    expect(combos[1].cards.length).toBe(3);
    expect(combos[1].cards[0]).toBeInstanceOf(Card);
    expect(combos[1].cards[1]).toBeInstanceOf(Card);
    expect(combos[1].cards[2]).toBeInstanceOf(Card);
    expect(combos[1].colorIdentity).toBeInstanceOf(ColorIdentity);
    expect(combos[1].prerequisites).toBeInstanceOf(SpellbookList);
    expect(combos[1].steps).toBeInstanceOf(SpellbookList);
    expect(combos[1].results).toBeInstanceOf(SpellbookList);

    expect(combos[2]).toEqual(
      expect.objectContaining({
        commanderSpellbookId: "3",
        permalink: "https://commanderspellbook.com/combo/3/",
        hasBannedCard: false,
        hasSpoiledCard: true,
      })
    );
    expect(combos[2].cards.length).toBe(4);
    expect(combos[2].cards[0]).toBeInstanceOf(Card);
    expect(combos[2].cards[1]).toBeInstanceOf(Card);
    expect(combos[2].cards[2]).toBeInstanceOf(Card);
    expect(combos[2].cards[3]).toBeInstanceOf(Card);
    expect(combos[2].colorIdentity).toBeInstanceOf(ColorIdentity);
    expect(combos[2].prerequisites).toBeInstanceOf(SpellbookList);
    expect(combos[2].steps).toBeInstanceOf(SpellbookList);
    expect(combos[2].results).toBeInstanceOf(SpellbookList);
  });

  it("applies EDHREC data if it can be found", () => {
    const combos = formatApiResponse(values);

    expect(combos[0].edhrecLink).toContain("https://edhrec.com/combos");
    expect(typeof combos[0].numberOfEDHRECDecks).toBe("number");

    const response = formatApiResponse([
      {
        d: "some-id-that-won't-have-an-edhrec-link",
        c: ["Guilded Lotus", "Voltaic Servant"],
        i: "c",
        p: "prereq 1. prereq 2. prereq 3",
        s: "step 1. step 2. step 3",
        r: "result 1. result 2. result 3",
      },
    ])[0];
    expect(response.edhrecLink).toBe("");
    expect(response.numberOfEDHRECDecks).toBe(0);
  });
});
