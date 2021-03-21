import parseColorFromValue from "@/lib/api/parse-query/parse-color-from-value";

describe("parseColorFromValue", () => {
  it("returns an empty array when nothing matches", () => {
    const input = "acdefhijklmnopqstvxyz";

    expect(parseColorFromValue(input)).toEqual([]);
  });

  it("pulls out only acceptable colors", () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    expect(parseColorFromValue(alphabet)).toEqual(["b", "g", "r", "u", "w"]);
  });

  it("ignores duplicates", () => {
    const input = "wwwuuuwwwwb";

    expect(parseColorFromValue(input)).toEqual(["w", "u", "b"]);
  });

  it.each`
    name             | expectedResult
    ${"c"}           | ${"c"}
    ${"Colorless"}   | ${"c"}
    ${"White"}       | ${"w"}
    ${"Blue"}        | ${"u"}
    ${"Black"}       | ${"b"}
    ${"Red"}         | ${"r"}
    ${"Green"}       | ${"g"}
    ${"MonoWhite"}   | ${"w"}
    ${"MonoBlue"}    | ${"u"}
    ${"MonoBlack"}   | ${"b"}
    ${"MonoRed"}     | ${"r"}
    ${"MonoGreen"}   | ${"g"}
    ${"Mono White"}  | ${"w"}
    ${"Mono Blue"}   | ${"u"}
    ${"Mono Black"}  | ${"b"}
    ${"Mono Red"}    | ${"r"}
    ${"Mono Green"}  | ${"g"}
    ${"Mono-White"}  | ${"w"}
    ${"Mono-Blue"}   | ${"u"}
    ${"Mono-Black"}  | ${"b"}
    ${"Mono-Red"}    | ${"r"}
    ${"Mono-Green"}  | ${"g"}
    ${"Azorius"}     | ${"wu"}
    ${"Dimir"}       | ${"ub"}
    ${"Rakdos"}      | ${"br"}
    ${"Gruul"}       | ${"rg"}
    ${"Selesnya"}    | ${"wg"}
    ${"Orzhov"}      | ${"wb"}
    ${"Izzet"}       | ${"ur"}
    ${"Golgari"}     | ${"bg"}
    ${"Boros"}       | ${"wr"}
    ${"Simic"}       | ${"ug"}
    ${"Naya"}        | ${"wrg"}
    ${"Esper"}       | ${"wub"}
    ${"Grixis"}      | ${"ubr"}
    ${"Jund"}        | ${"brg"}
    ${"Bant"}        | ${"wug"}
    ${"Abzan"}       | ${"wbg"}
    ${"Temur"}       | ${"urg"}
    ${"Jeskai"}      | ${"wur"}
    ${"Mardu"}       | ${"wbr"}
    ${"Sultai"}      | ${"bug"}
    ${"Glint"}       | ${"ubrg"}
    ${"Glinteye"}    | ${"ubrg"}
    ${"Glint Eye"}   | ${"ubrg"}
    ${"Glint-Eye"}   | ${"ubrg"}
    ${"Chaos"}       | ${"ubrg"}
    ${"Dune"}        | ${"wbrg"}
    ${"Dunebrood"}   | ${"wbrg"}
    ${"Dune Brood"}  | ${"wbrg"}
    ${"Dune-Brood"}  | ${"wbrg"}
    ${"Aggression"}  | ${"wbrg"}
    ${"Ink"}         | ${"wurg"}
    ${"Inktreader"}  | ${"wurg"}
    ${"Ink-Treader"} | ${"wurg"}
    ${"Ink Treader"} | ${"wurg"}
    ${"Altruism"}    | ${"wurg"}
    ${"Witch"}       | ${"wubg"}
    ${"Witchmaw"}    | ${"wubg"}
    ${"Witch-Maw"}   | ${"wubg"}
    ${"Witch Maw"}   | ${"wubg"}
    ${"Growth"}      | ${"wubg"}
    ${"Yore"}        | ${"wubr"}
    ${"Yoretiller"}  | ${"wubr"}
    ${"Yore Tiller"} | ${"wubr"}
    ${"Yore-Tiller"} | ${"wubr"}
    ${"Artifice"}    | ${"wubr"}
    ${"Sans White"}  | ${"ubrg"}
    ${"Sans Blue"}   | ${"wbrg"}
    ${"Sans Black"}  | ${"wurg"}
    ${"Sans Red"}    | ${"wubg"}
    ${"Sans Green"}  | ${"wubr"}
    ${"Sans-White"}  | ${"ubrg"}
    ${"Sans-Blue"}   | ${"wbrg"}
    ${"Sans-Black"}  | ${"wurg"}
    ${"Sans-Red"}    | ${"wubg"}
    ${"Sans-Green"}  | ${"wubr"}
    ${"Five Color"}  | ${"wubrg"}
    ${"FiveColor"}   | ${"wubrg"}
    ${"Five Colour"} | ${"wubrg"}
    ${"FiveColour"}  | ${"wubrg"}
  `("reads $name as $expectedResult", ({ name, expectedResult }) => {
    expect(parseColorFromValue(name)).toEqual(expectedResult.split(""));
  });

  it("ignores casing", () => {
    expect(parseColorFromValue("AbzAn")).toEqual(["w", "b", "g"]);
    expect(parseColorFromValue("wUb")).toEqual(["w", "u", "b"]);
  });
});
