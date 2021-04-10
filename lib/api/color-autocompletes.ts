export default [
  {
    value: "colorless",
    label: "Colorless {c}",
  },

  // mono colors
  {
    value: "mono white",
    label: "Mono White {w}",
  },
  {
    value: "mono blue",
    label: "Mono Blue {u}",
    alias: /^u$/,
  },
  {
    value: "mono black",
    label: "Mono Black {b}",
  },
  {
    value: "mono red",
    label: "Mono Red {r}",
  },
  {
    value: "mono green",
    label: "Mono Green {g}",
  },

  // guilds
  {
    value: "azorius",
    label: "Azorius {w}{u}",
    // catch misspellings of azorius
    alias: /^([wu]{0,2}$|azorio)/,
  },
  {
    value: "dimir",
    label: "Dimir {u}{b}",
    alias: /^[ub]{0,2}$/,
  },
  {
    value: "rakdos",
    label: "Rakdos {b}{r}",
    alias: /^[br]{0,2}$/,
  },
  {
    value: "gruul",
    label: "Gruul {r}{g}",
    alias: /^[rg]{0,2}$/,
  },
  {
    value: "selesnya",
    label: "Selesnya {g}{w}",
    alias: /^[gw]{0,2}$/,
  },
  {
    value: "orzhov",
    label: "Orzhov {w}{b}",
    alias: /^[wb]{0,2}$/,
  },
  {
    value: "izzet",
    label: "Izzet {u}{r}",
    alias: /^[ur]{0,2}$/,
  },
  {
    value: "golgari",
    label: "Golgari {b}{g}",
    alias: /^[bg]{0,2}$/,
  },
  {
    value: "boros",
    label: "Boros {r}{w}",
    alias: /^[rw]{0,2}$/,
  },
  {
    value: "simic",
    label: "Simic {g}{u}",
    alias: /^[gu]{0,2}$/,
  },

  // shards/wedges
  {
    value: "esper",
    label: "Esper {w}{u}{b}",
    alias: /^[wub]{0,3}$/,
  },
  {
    value: "grixis",
    label: "Grixis {u}{b}{r}",
    alias: /^[ubr]{0,3}$/,
  },
  {
    value: "jund",
    label: "Jund {b}{r}{g}",
    alias: /^[brg]{0,3}$/,
  },
  {
    value: "naya",
    label: "Naya {r}{g}{w}",
    alias: /^[rgw]{0,3}$/,
  },
  {
    value: "bant",
    label: "Bant {g}{w}{u}",
    alias: /^[gwu]{0,3}$/,
  },
  {
    value: "abzan",
    label: "Abzan {w}{b}{g}",
    alias: /^[wbg]{0,3}$/,
  },
  {
    value: "jeskai",
    label: "Jeskai {u}{r}{w}",
    alias: /^[urw]{0,3}$/,
  },
  {
    value: "sultai",
    label: "Sultai {b}{g}{u}",
    alias: /^[bgu]{0,3}$/,
  },
  {
    value: "mardu",
    label: "Mardu {r}{w}{b}",
    alias: /^[rwb]{0,3}$/,
  },
  {
    value: "temur",
    label: "Temur {g}{u}{r}",
    alias: /^[gur]{0,3}$/,
  },

  // 4 color
  {
    value: "yoretiller",
    label: "Yore-Tiller {w}{u}{b}{r}",
    alias: /^[wubr]{0,4}$/,
  },
  {
    value: "glinteye",
    label: "Glint-Eye {u}{b}{r}{g}",
    alias: /^[ubrg]{0,4}$/,
  },
  {
    value: "dunebrood",
    label: "Dune-Brood {b}{r}{g}{w}",
    alias: /^[brgw]{0,4}$/,
  },
  {
    value: "inktreader",
    label: "Ink-Treader {r}{g}{w}{u}",
    alias: /^[rgwu]{0,4}$/,
  },
  {
    value: "witchmaw",
    label: "Witch-Maw {g}{w}{u}{b}",
    alias: /^[gwub]{0,4}$/,
  },

  // 5 color (comment here mostly for symmetry with the other sections :) )
  {
    value: "five color",
    label: "Five Color {w}{u}{b}{r}{g}",
    alias: /^(5|[wubrg]{0,5})$/,
  },

  // these are their own entries instaead of
  // aliases for their 4 color name so that
  // the 4 color combos don't show up as options
  // when you type the one color they do not contain
  // or the alternate name for the 4 color combos
  {
    value: "sans white",
    label: "Sans White {w}{u}{b}{r}",
  },
  {
    value: "sans blue",
    label: "Sans Blue {b}{r}{g}{w}",
  },
  {
    value: "sans black",
    label: "Sans Black {r}{g}{w}{u}",
  },
  {
    value: "sans red",
    label: "Sans Red {g}{w}{u}{b}",
  },
  {
    value: "sans green",
    label: "Sans Green {w}{u}{b}{r}",
  },
  {
    value: "chaos",
    label: "Chaos {w}{u}{b}{r}",
  },
  {
    value: "aggression",
    label: "Aggression {b}{r}{g}{w}",
  },
  {
    value: "altruism",
    label: "Altruism {r}{g}{w}{u}",
  },
  {
    value: "growth",
    label: "Growth {g}{w}{u}{b}",
  },
  {
    value: "artifice",
    label: "Artifice {w}{u}{b}{r}",
  },
];
