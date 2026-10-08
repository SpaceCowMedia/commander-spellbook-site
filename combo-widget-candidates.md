# Combos that would benefit from a calculator widget

Candidates for [commander-spellbook-site#46](https://github.com/SpaceCowMedia/commander-spellbook-site/issues/46) ("Provide Helper Widgets for Specific Combos"): combos whose requirements or results depend on a number the player knows at the table (spells already cast this turn, life totals, opponents, power, counters, commander tax…). For these, a single value written in the prerequisites is either a worst case, a best case, or simply wrong.

**Data:** production snapshot of 2026-10-08 (`spellbook-prod-20261008T113157Z.dump`), public variants only (status OK or Example). Candidates were found by searching mana needed, prerequisites, descriptions and notes for formulas, thresholds and "depends on" wording. Each kept combo was then checked by hand against its steps and the cards' Oracle text. Loop thresholds were recomputed by simulation (an exhaustive search where the player has choices).

**How to read an entry**

- **Variants / popularity:** all public variants sharing the mechanism, and their summed EDHREC deck count.
- **Generator combo IDs:** the backend `Combo` rows the variants come from. Attaching a widget there would cover all their variants, since variant texts are built from these combos.
- **The database says now:** the relevant text currently shown on the site.
- **Widget math:** inputs, outputs and the formula or simulation the widget needs.
- **Check:** whether that math agrees with the current text; disagreements link to a ready-to-submit report at the end.

Priorities: **High** for non-trivial math on popular combos, **Medium** for useful but simpler cases, **Low** for long-tail or near-trivial ones that a generic widget would cover for free.

## Widget catalogue

| # | Widget | Section | Generator combos | Variants | Popularity |
|---:|---|---|---:|---:|---:|
| 1 | `storm-life-loop` | [Aetherflux Reservoir loops: minimum life by spells already cast this turn](#1-aetherflux-reservoir-loops-minimum-life-by-spells-already-cast-this-turn) | 52 | 109 | 107,961 |
| 2 | `storm-threshold` | [Storm count or commander casts deciding whether a loop sustains](#2-storm-count-or-commander-casts-deciding-whether-a-loop-sustains) | 14 | 18 | 21,954 |
| 3 | `life-to-x` | [Life total turned into X: Channel and Storm Herd](#3-life-total-turned-into-x-channel-and-storm-herd) | 39 | 39 | 9,449 |
| 4 | `lethal-check` | [Will it kill? Checks against opponents' life totals, libraries and poison](#4-will-it-kill-checks-against-opponents-life-totals-libraries-and-poison) | 62 | 120 | 240,295 |
| 5 | `drain-loop` | [Drain loops: life per loop from devotion, opponents and extort](#5-drain-loops-life-per-loop-from-devotion-opponents-and-extort) | 14 | 34 | 17,356 |
| 6 | `stat-scaled-cost` | [Costs that scale with a creature's power, counters or loyalty](#6-costs-that-scale-with-a-creatures-power-counters-or-loyalty) | 53 | 102 | 97,132 |
| 7 | `count-scaled-cost` | [Costs that scale with how many permanents you control](#7-costs-that-scale-with-how-many-permanents-you-control) | 57 | 574 | 35,995 |
| 8 | `finite-output` | [Finite results: how much damage, how many tokens, how many turns](#8-finite-results-how-much-damage-how-many-tokens-how-many-turns) | 20 | 73 | 90,127 |
| 9 | `opponent-count` | [Costs and feasibility by number of opponents](#9-costs-and-feasibility-by-number-of-opponents) | 50 | 50 | 45,540 |
| 10 | `commander-tax` | [Commander tax](#10-commander-tax) | 55 | 132 | 189,631 |

In total: **1251 variants** from **416 generator combos**, plus **13 ready-to-submit update reports** for errors found along the way ([jump to them](#presumed-errors-ready-to-submit-update-reports)).

The commander-tax widget could also cover the **1375 public variants** whose mana or prerequisites mention commander tax; only the ones where tax changes a threshold are listed.

## Top picks

The highest-value widgets, ordered by how often the combos are played:

1. **Krenko, Mob Boss + Skirk Prospector (+ a haste enabler, or Phyrexian Altar / Thermopod)**: `commander-tax`, 37 variant(s), popularity 161,545, e.g. [`38-659-1288`](https://commanderspellbook.com/combo/38-659-1288/)
1. **Peer into the Abyss + Underworld Dreams / Ob Nixilis, the Hate-Twisted**: `lethal-check`, 2 variant(s), popularity 52,762, e.g. [`1561-2720`](https://commanderspellbook.com/combo/1561-2720/)
1. **Sheoldred, the Apocalypse + Peer into the Abyss**: `lethal-check`, 1 variant(s), popularity 50,983, e.g. [`1561-2498`](https://commanderspellbook.com/combo/1561-2498/)
1. **Blasphemous Act + Repercussion**: `finite-output`, 1 variant(s), popularity 39,064, e.g. [`2484-4083`](https://commanderspellbook.com/combo/2484-4083/)
1. **Dragon Tempest + Ancient Gold Dragon**: `finite-output`, 1 variant(s), popularity 28,247, e.g. [`2855-5982`](https://commanderspellbook.com/combo/2855-5982/)
1. **Noctis, Prince of Lucis + Aetherflux Reservoir + an artifact recast from the graveyard (Solemnity + Lotus Petal, Chalice of the Void, Void Mirror, Vexing Bauble, Mox Diamond, Blood Funnel, Power Conduit + Krark-Clan Ironworks)**: `storm-life-loop`, 15 variant(s), popularity 18,986, e.g. [`4740-6613-6614--44`](https://commanderspellbook.com/combo/4740-6613-6614--44/)
1. **Ojer Axonil, Deepest Might + Pyrohemia / Warmonger**: `lethal-check`, 2 variant(s), popularity 12,827, e.g. [`2868-4629`](https://commanderspellbook.com/combo/2868-4629/)
1. **Combos using Animar, Soul of Elements as the cost reducer**: `stat-scaled-cost`, 25 variant(s), popularity 12,796, e.g. [`2-3771`](https://commanderspellbook.com/combo/2-3771/)
1. **Devastating Onslaught + Terror of the Peaks**: `finite-output`, 1 variant(s), popularity 6,981, e.g. [`1110-6785`](https://commanderspellbook.com/combo/1110-6785/)
1. **K'rrik + Chainer, Dementia Master + Gray Merchant of Asphodel + Viscera Seer + Buried Alive + Animate Dead / Necromancy / Reanimate**: `drain-loop`, 3 variant(s), popularity 6,774, e.g. [`328-1377-2292-3211-3260-4078`](https://commanderspellbook.com/combo/328-1377-2292-3211-3260-4078/)
1. **Noctis, Prince of Lucis + Aetherflux Reservoir + Hex Parasite + Lotus Petal**: `storm-life-loop`, 1 variant(s), popularity 2,710, e.g. [`1414-4417-4740-6613`](https://commanderspellbook.com/combo/1414-4417-4740-6613/)
1. **Aetherflux Reservoir + Leshrac's Sigil + K'rrik, Son of Yawgmoth (the example from the request)**: `storm-life-loop`, 1 variant(s), popularity 1,911, e.g. [`2903-3260-4740`](https://commanderspellbook.com/combo/2903-3260-4740/)

## 1. Aetherflux Reservoir loops: minimum life by spells already cast this turn

**Widget id:** `storm-life-loop`

**Widget:** the player enters how many spells they have already cast this turn (storm count) and gets the minimum starting life, the life curve loop by loop, and the loop where the combo turns net positive.

**Engine:** simulate one loop as an ordered list of steps: pay or lose N life, gain N life, or cast a spell (Aetherflux gains the number of spells cast this turn, **counting the spell that triggered it**, per its Oracle text). After every payment or loss your life has to be at least 1: state-based actions run before the Aetherflux trigger resolves, so reaching 0 loses the game even if the trigger would bring you back up. The minimum starting life is 1 minus the lowest point reached. The tables below come from that simulation (`s` = spells already cast this turn).

Most of these combos write a single number in the prerequisites, valid only for one storm count (usually 0). The widget replaces that with the whole curve.

#### Noctis, Prince of Lucis + Aetherflux Reservoir + an artifact recast from the graveyard (Solemnity + Lotus Petal, Chalice of the Void, Void Mirror, Vexing Bauble, Mox Diamond, Blood Funnel, Power Conduit + Krark-Clan Ironworks)
**Priority:** High · **Variants:** 15 · **Popularity:** 18,986 (EDHREC decks, summed)
- **Most popular variant:** [`4740-6613-6614--44`](https://commanderspellbook.com/combo/4740-6613-6614--44/): Noctis, Prince of Lucis | Aetherflux Reservoir | Vexing Bauble
- **Generator combo IDs:** `30145`, `30147`, `30148`, `30149`, `30152`, `30339`, `32574`
- **The database says now:**
  > *Easy prerequisites:* Your life total is at least 4 if you've cast two or more spells this turn, 5 if you've cast one spell this turn, or 7 otherwise.
- **Widget math:** Each loop: cast the artifact from the graveyard for 3 life (Noctis) → Aetherflux gains the spell count. Power Conduit also needs {2} each loop, refunded by Krark-Clan Ironworks.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 7 | 5 | 4 | 4 | 4 | 4 |

- **Check:** Matches the database table (7 / 5 / 4).
- <details><summary><b>Other variants (14)</b></summary>

  [`1414-4053-4740-6613`](https://commanderspellbook.com/combo/1414-4053-4740-6613/), [`2478-4053-4740-6613`](https://commanderspellbook.com/combo/2478-4053-4740-6613/), [`4740-4877-6613`](https://commanderspellbook.com/combo/4740-4877-6613/), [`1540-4740-6613--44`](https://commanderspellbook.com/combo/1540-4740-6613--44/), [`3200-4053-4740-6613`](https://commanderspellbook.com/combo/3200-4053-4740-6613/), [`3518-4053-4740-6613`](https://commanderspellbook.com/combo/3518-4053-4740-6613/), [`4053-4211-4740-6613`](https://commanderspellbook.com/combo/4053-4211-4740-6613/), [`3715-4659-4740-6613`](https://commanderspellbook.com/combo/3715-4659-4740-6613/), [`1492-4053-4740-6613`](https://commanderspellbook.com/combo/1492-4053-4740-6613/), [`3741-4740-6613--44`](https://commanderspellbook.com/combo/3741-4740-6613--44/), [`1500-4740-6613--117`](https://commanderspellbook.com/combo/1500-4740-6613--117/), [`4053-4708-4740-6613`](https://commanderspellbook.com/combo/4053-4708-4740-6613/), [`874-4053-4740-6613`](https://commanderspellbook.com/combo/874-4053-4740-6613/), [`1482-4053-4740-6613`](https://commanderspellbook.com/combo/1482-4053-4740-6613/)

  </details>

#### Noctis, Prince of Lucis + Aetherflux Reservoir + Hex Parasite + Lotus Petal
**Priority:** High · **Variants:** 1 · **Popularity:** 2,710 (EDHREC decks, summed)
- **Most popular variant:** [`1414-4417-4740-6613`](https://commanderspellbook.com/combo/1414-4417-4740-6613/): Noctis, Prince of Lucis | Aetherflux Reservoir | Hex Parasite | Lotus Petal
- **Generator combo IDs:** `30146`
- **The database says now:**
  > *Mana needed:* {1}
  > *Easy prerequisites:* Your life total is at least 4.
  > *Notes:* Your life total will need to be between 4 and 14 depending on your starting storm count. The exact values are as follows, in order from storm count 0 to 4 or higher: 14, 10, 6, 5, 4. These life totals can be reduced further if you have available {B} to pay fo…
- **Widget math:** Each loop: cast Lotus Petal from the graveyard for 3 life → Aetherflux gains the spell count → Hex Parasite removes the finality counter for {1} plus {B/P} paid as 2 life → sacrifice Petal for the next loop's {1}.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 14 | 10 | 7 | 5 | 4 | 4 |

- **Check:** The Notes give 14 / 10 / **6** / 5 / 4; the simulation gives 7 at storm count 2. See [R1](#r1).

#### Aetherflux Reservoir + Leshrac's Sigil + K'rrik, Son of Yawgmoth (the example from the request)
**Priority:** High · **Variants:** 1 · **Popularity:** 1,911 (EDHREC decks, summed)
- **Most popular variant:** [`2903-3260-4740`](https://commanderspellbook.com/combo/2903-3260-4740/): Aetherflux Reservoir | Leshrac's Sigil | K'rrik, Son of Yawgmoth
- **Generator combo IDs:** `12`
- **The database says now:**
  > *Notable prerequisites:* Your life total is at least 33.
- **Widget math:** Each loop: cast Leshrac's Sigil for 4 life via K'rrik → Aetherflux gains the spell count → return Sigil with {B}{B} paid as 4 life.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 33 | 26 | 20 | 15 | 11 | 8 |

- **Check:** Matches the database (33 at storm count 0).

#### Aetherflux Reservoir turned into a lifelink creature (Cyberdrive Awakener, Skilled Animator, Captain Rex Nebula + Vampiric Link)
**Priority:** Medium · **Variants:** 3 · **Popularity:** 7,231 (EDHREC decks, summed)
- **Most popular variant:** [`2734-4740`](https://commanderspellbook.com/combo/2734-4740/): Aetherflux Reservoir | Cyberdrive Awakener
- **Generator combo IDs:** `12597`, `19314`, `19315`
- **The database says now:**
  > *Mana needed:* {5}{U}
  > *Notable prerequisites:* You have a way to give Aetherflux Reservoir lifelink. / Your life total is at least 50 minus your storm count.
- **Widget math:** One spell is cast (Aetherflux gains storm count + 1), then pay 50 life / gain 50 life forever. Minimum life = 50 − storm count.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 50 | 49 | 48 | 47 | 46 | 45 |

- **Check:** Matches the database ("50 minus your storm count").
- **Other variants (2):** [`172-4740`](https://commanderspellbook.com/combo/172-4740/), [`1410-1544-4740`](https://commanderspellbook.com/combo/1410-1544-4740/)

#### Mortuary + a sacrifice outlet + Aetherflux Reservoir + Gwenom, Remorseless or Bolas's Citadel
**Priority:** Medium · **Variants:** 30 · **Popularity:** 6,142 (EDHREC decks, summed)
- **Most popular variant:** [`2292-4740-5220-6900`](https://commanderspellbook.com/combo/2292-4740-5220-6900/): Mortuary | Viscera Seer | Aetherflux Reservoir | Gwenom, Remorseless
- **Generator combo IDs:** `23853`
- **The database says now:**
  > *Easy prerequisites:* Your life total is at least 2.
- **Widget math:** Each loop: sacrifice the creature → Mortuary puts it on top of the library → recast it from there paying life equal to its mana value m → Aetherflux gains the spell count. Inputs: storm count and m. At storm count 0 the minimum is m(m+1)/2 + 1. Sling-Gang Lieutenant (m = 4) also drains 3 per loop, so it needs only 5.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life (mana value 1) | 2 | 2 | 2 | 2 | 2 | 2 |
| Minimum life (mana value 2) | 4 | 3 | 3 | 3 | 3 | 3 |
| Minimum life (mana value 3) | 7 | 5 | 4 | 4 | 4 | 4 |
| Minimum life (mana value 4) | 11 | 8 | 6 | 5 | 5 | 5 |
| Minimum life (mana value 5) | 16 | 12 | 9 | 7 | 6 | 6 |
| Minimum life (mana value 6) | 22 | 17 | 13 | 10 | 8 | 7 |

- **Check:** Matches the Notes of the Phyrexian Altar version ("from mana value 1 (left) to 10 (right): 2, 4, 7, 11, 16, 22, 29, 37, 46, 56"), which assume storm count 0; most other variable-mana-value versions state no life requirement at all.
- <details><summary><b>Other variants (29)</b></summary>

  [`4740-5220-6798-6900`](https://commanderspellbook.com/combo/4740-5220-6798-6900/), [`2173-2292-4740-5220`](https://commanderspellbook.com/combo/2173-2292-4740-5220/), [`2173-4740-5220-6798`](https://commanderspellbook.com/combo/2173-4740-5220-6798/), [`2173-4050-4740-5220`](https://commanderspellbook.com/combo/2173-4050-4740-5220/), [`4050-4740-5220-6900`](https://commanderspellbook.com/combo/4050-4740-5220-6900/), [`2034-2173-4740-5220`](https://commanderspellbook.com/combo/2034-2173-4740-5220/), [`2034-4740-5220-6900`](https://commanderspellbook.com/combo/2034-4740-5220-6900/), [`997-4740-5220-6900`](https://commanderspellbook.com/combo/997-4740-5220-6900/), [`4740-5220-5256-6900`](https://commanderspellbook.com/combo/4740-5220-5256-6900/), [`2173-4740-5220-5256`](https://commanderspellbook.com/combo/2173-4740-5220-5256/), [`997-2173-4740-5220`](https://commanderspellbook.com/combo/997-2173-4740-5220/), [`413-2173-4740-5220`](https://commanderspellbook.com/combo/413-2173-4740-5220/), [`2173-3967-4740-5220`](https://commanderspellbook.com/combo/2173-3967-4740-5220/), [`2173-4740-5147-5220`](https://commanderspellbook.com/combo/2173-4740-5147-5220/), [`3967-4740-5220-6900`](https://commanderspellbook.com/combo/3967-4740-5220-6900/), [`413-4740-5220-6900`](https://commanderspellbook.com/combo/413-4740-5220-6900/), [`38-2173-4740-5220`](https://commanderspellbook.com/combo/38-2173-4740-5220/), [`2173-2921-4740-5220`](https://commanderspellbook.com/combo/2173-2921-4740-5220/), [`1099-2173-4740-5220`](https://commanderspellbook.com/combo/1099-2173-4740-5220/), [`1099-4740-5220-6900`](https://commanderspellbook.com/combo/1099-4740-5220-6900/), [`4740-5147-5220-6900`](https://commanderspellbook.com/combo/4740-5147-5220-6900/), [`2173-4740-5220-6797`](https://commanderspellbook.com/combo/2173-4740-5220-6797/), [`4740-5220-6797-6900`](https://commanderspellbook.com/combo/4740-5220-6797-6900/), [`2173-2813-4740-5220`](https://commanderspellbook.com/combo/2173-2813-4740-5220/), [`2173-4740-5220-5686`](https://commanderspellbook.com/combo/2173-4740-5220-5686/), [`2813-4740-5220-6900`](https://commanderspellbook.com/combo/2813-4740-5220-6900/), [`2921-4740-5220-6900`](https://commanderspellbook.com/combo/2921-4740-5220-6900/), [`38-4740-5220-6900`](https://commanderspellbook.com/combo/38-4740-5220-6900/), [`4740-5220-5686-6900`](https://commanderspellbook.com/combo/4740-5220-5686-6900/)

  </details>

#### K'rrik + Gravecrawler + Aetherflux Reservoir + a sacrifice outlet
**Priority:** Medium · **Variants:** 4 · **Popularity:** 4,716 (EDHREC decks, summed)
- **Most popular variant:** [`2438-2577-3260-4740`](https://commanderspellbook.com/combo/2438-2577-3260-4740/): K'rrik, Son of Yawgmoth | Gravecrawler | Aetherflux Reservoir | Carrion Feeder
- **Generator combo IDs:** `10151`, `10152`, `10153`, `10154`
- **The database says now:**
  > *Notable prerequisites:* Your storm count is at least one. / Your life total is at least three.
- **Widget math:** Each loop: sacrifice Gravecrawler → recast it for 2 life (K'rrik) → Aetherflux gains the spell count.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 4 | 3 | 3 | 3 | 3 | 3 |

- **Check:** The database states the storm count 1 point ("storm count is at least one", "at least three" life), which matches. At storm count 0 the combo still works with 4 life.
- **Other variants (3):** [`2292-2577-3260-4740`](https://commanderspellbook.com/combo/2292-2577-3260-4740/), [`2034-2577-3260-4740`](https://commanderspellbook.com/combo/2034-2577-3260-4740/), [`997-2577-3260-4740`](https://commanderspellbook.com/combo/997-2577-3260-4740/)

#### Treasonous Ogre + Aetherflux Reservoir + Grinning Ignus
**Priority:** Medium · **Variants:** 1 · **Popularity:** 900 (EDHREC decks, summed)
- **Most popular variant:** [`411-4740-5313`](https://commanderspellbook.com/combo/411-4740-5313/): Treasonous Ogre | Aetherflux Reservoir | Grinning Ignus
- **Generator combo IDs:** `4394`
- **The database says now:**
  > *Notable prerequisites:* You have a storm count of at least two. / Your life total is at least four.
- **Widget math:** Each loop: Treasonous Ogre pays 3 life for {R} → Grinning Ignus bounces for {C}{C}{R} and is recast → Aetherflux gains the spell count.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 7 | 5 | 4 | 4 | 4 | 4 |

- **Check:** The database states only the storm count 2 point ("storm count of at least two", "at least four" life), which matches.

#### Sensei's Divining Top + Aetherflux Reservoir + Treasonous Ogre + Mystic Forge (or another way to cast Top from the library)
**Priority:** Medium · **Variants:** 11 · **Popularity:** 813 (EDHREC decks, summed)
- **Most popular variant:** [`985-4740-5078-5313`](https://commanderspellbook.com/combo/985-4740-5078-5313/): Sensei's Divining Top | Aetherflux Reservoir | Treasonous Ogre | Mystic Forge
- **Generator combo IDs:** `29305`
- **The database says now:**
  > *Mana needed:* {2} minus {1} for each 3 life you have and minus {1} if your storm count is 2 or greater
- **Widget math:** Each loop costs {1} to recast Top from the library, paid either from your mana pool or by paying 3 life to Treasonous Ogre (you need at least 4 life to do that). Aetherflux then gains the spell count. Inputs: life, storm count and available mana. Output: the starting mana needed. Paying with Ogre whenever life ≥ 4 and spending pool mana otherwise is optimal (checked against an exhaustive search).

| Mana needed at life → | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 spells already cast | {2} | {2} | {2} | {1} | {1} | {1} | {0} | {0} | {0} | {0} |
| 1 spell already cast | {2} | {1} | {1} | {1} | {0} | {0} | {0} | {0} | {0} | {0} |
| 2 spells already cast | {1} | {1} | {1} | {0} | {0} | {0} | {0} | {0} | {0} | {0} |
| 3+ spells already cast | {1} | {1} | {1} | {0} | {0} | {0} | {0} | {0} | {0} | {0} |

- **Check:** The database encodes this as "{2} minus {1} for each 3 life you have and minus {1} if your storm count is 2 or greater". An exhaustive search of every mix of Ogre activations and pool mana disagrees in five spots, three of which ask for too little mana. See [R9](#r9).
- <details><summary><b>Other variants (10)</b></summary>

  [`4316-4740-5078-5313`](https://commanderspellbook.com/combo/4316-4740-5078-5313/), [`4740-5078-5243-5313`](https://commanderspellbook.com/combo/4740-5078-5243-5313/), [`1395-4740-5078-5313`](https://commanderspellbook.com/combo/1395-4740-5078-5313/), [`1456-4740-5078-5313`](https://commanderspellbook.com/combo/1456-4740-5078-5313/), [`4740-5078-5313-5741`](https://commanderspellbook.com/combo/4740-5078-5313-5741/), [`4311-4740-5078-5313`](https://commanderspellbook.com/combo/4311-4740-5078-5313/), [`4740-5078-5313-6766`](https://commanderspellbook.com/combo/4740-5078-5313-6766/), [`4740-5078-5313-6650`](https://commanderspellbook.com/combo/4740-5078-5313-6650/), [`1661-4740-5078-5313`](https://commanderspellbook.com/combo/1661-4740-5078-5313/), [`4740-5078-5313-6918`](https://commanderspellbook.com/combo/4740-5078-5313-6918/)

  </details>

#### Timeline Culler + Aetherflux Reservoir + Phyrexian Altar
**Priority:** Medium · **Variants:** 1 · **Popularity:** 461 (EDHREC decks, summed)
- **Most popular variant:** [`4050-4740-6742`](https://commanderspellbook.com/combo/4050-4740-6742/): Timeline Culler | Aetherflux Reservoir | Phyrexian Altar
- **Generator combo IDs:** `31325`
- **The database says now:**
  > *Mana needed:* {B}{B} at most
  > *Easy prerequisites:* Your life total is 2 or higher, plus an additional 2 life if you cast Timeline Culler using its warp ability.
  > *Notes:* The amount of life and mana you need to start the combo varies based on how many spells you've cast this turn and where Timeline Culler starts. The life pre-requisite assumes you've cast no spells this turn.
- **Widget math:** First cast from hand for {B}{B} (no life) or via warp ({B} + 2 life); each later loop warps Timeline Culler from the graveyard for {B} + 2 life → Aetherflux gains the spell count → Phyrexian Altar sacrifices it for the {B} of the next warp.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life (first cast from hand) | 2 | 1 | 1 | 1 | 1 | 1 |
| Minimum life (first cast with warp) | 4 | 3 | 3 | 3 | 3 | 3 |

- **Check:** Matches the database ("2 or higher, plus an additional 2 life if … warp"); its Notes ask for exactly this widget.

#### Timeline Culler + Aetherflux Reservoir + Warren Soultrader
**Priority:** Medium · **Variants:** 1 · **Popularity:** 455 (EDHREC decks, summed)
- **Most popular variant:** [`4740-5670-6742`](https://commanderspellbook.com/combo/4740-5670-6742/): Timeline Culler | Aetherflux Reservoir | Warren Soultrader
- **Generator combo IDs:** `31324`
- **The database says now:**
  > *Mana needed:* {B}{B} at most
  > *Easy prerequisites:* Your life total is 4 or higher, plus an additional 2 life if you cast Timeline Culler using its warp ability.
  > *Notes:* The amount of life and mana you need to start the combo varies based on how many spells you've cast this turn and where Timeline Culler starts. The life pre-requisite assumes you've cast no spells this turn.
- **Widget math:** First cast from hand for {B}{B} (no life) or via warp ({B} + 2 life); each later loop warps Timeline Culler from the graveyard for {B} + 2 life → Aetherflux gains the spell count → Warren Soultrader pays 1 life to sacrifice it for the Treasure that pays the next {B}.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life (first cast from hand) | 4 | 2 | 1 | 1 | 1 | 1 |
| Minimum life (first cast with warp) | 6 | 4 | 3 | 3 | 3 | 3 |

- **Check:** Matches the database ("4 or higher, plus an additional 2 life if you cast Timeline Culler using its warp ability"), which assumes storm count 0; its Notes ask for exactly this widget.

#### Aetherflux Reservoir + Cloudstone Curio + a Defiler (of Vigor, Dreams, Faith, Flesh or Instinct)
**Priority:** Medium · **Variants:** 5 · **Popularity:** 370 (EDHREC decks, summed)
- **Most popular variant:** [`1560-2232-4740`](https://commanderspellbook.com/combo/1560-2232-4740/): Aetherflux Reservoir | Cloudstone Curio | Defiler of Vigor
- **Generator combo IDs:** `10960`, `10961`, `10962`, `10963`, `10964`
- **The database says now:**
  > *Notable prerequisites:* Your life total is at least 5. / You have a green nonartifact permanent card in hand with mana cost {G}. / You control a nontoken nonartifact green permanent with mana cost {G} that shares a card type with the card in hand.
- **Widget math:** Each loop: cast a one-pip permanent for 2 life (Defiler) → Aetherflux gains the spell count → Cloudstone Curio returns the other permanent.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 4 | 3 | 3 | 3 | 3 | 3 |

- **Check:** The database asks for 5 life; the simulation needs 4 at storm count 0. See [R3](#r3).
- **Other variants (4):** [`2232-4399-4740`](https://commanderspellbook.com/combo/2232-4399-4740/), [`2232-3091-4740`](https://commanderspellbook.com/combo/2232-3091-4740/), [`823-2232-4740`](https://commanderspellbook.com/combo/823-2232-4740/), [`2232-2312-4740`](https://commanderspellbook.com/combo/2232-2312-4740/)

#### Treasonous Ogre + Aetherflux Reservoir + Squee, the Immortal + Ashnod's Altar
**Priority:** Medium · **Variants:** 1 · **Popularity:** 79 (EDHREC decks, summed)
- **Most popular variant:** [`2034-3705-4740-5313`](https://commanderspellbook.com/combo/2034-3705-4740-5313/): Treasonous Ogre | Aetherflux Reservoir | Squee, the Immortal | Ashnod's Altar
- **Generator combo IDs:** `4639`
- **The database says now:**
  > *Notable prerequisites:* You have a storm count of at least five. / Your life total is at least seven.
- **Widget math:** Each loop: two Treasonous Ogre activations (3 life each) → sacrifice Squee to Ashnod's Altar → recast Squee for {1}{R}{R} → Aetherflux gains the spell count.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 22 | 17 | 13 | 10 | 8 | 7 |

- **Check:** The database states only the storm count 5 point ("storm count of at least five", "at least seven" life), which matches. At storm count 0 the combo needs 22 life.

#### Mirror of Fate + Aetherflux Reservoir + Bolas's Citadel + Necrodominance
**Priority:** Medium · **Variants:** 10 · **Popularity:** 61 (EDHREC decks, summed)
- **Most popular variant:** [`1164-2173-4740-6123`](https://commanderspellbook.com/combo/1164-2173-4740-6123/): Mirror of Fate | Aetherflux Reservoir | Bolas's Citadel | Necrodominance
- **Generator combo IDs:** `34247`
- **The database says now:**
  > *Easy prerequisites:* Your life total is 16 or higher.
- **Widget math:** Each loop: cast Mirror of Fate from the top of the library for 5 life (Bolas's Citadel) → Aetherflux gains the spell count.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 16 | 12 | 9 | 7 | 6 | 6 |

- **Check:** Matches the database (16); its Notes say you can start with less life after casting spells.
- <details><summary><b>Other variants (9)</b></summary>

  [`1164-2173-3114-4740`](https://commanderspellbook.com/combo/1164-2173-3114-4740/), [`1164-3114-4740-6900`](https://commanderspellbook.com/combo/1164-3114-4740-6900/), [`1164-4740-6123-6900`](https://commanderspellbook.com/combo/1164-4740-6123-6900/), [`1164-2173-4666-4740`](https://commanderspellbook.com/combo/1164-2173-4666-4740/), [`1164-2173-4740-6333`](https://commanderspellbook.com/combo/1164-2173-4740-6333/), [`1164-2173-3002-4740`](https://commanderspellbook.com/combo/1164-2173-3002-4740/), [`1164-3002-4740-6900`](https://commanderspellbook.com/combo/1164-3002-4740-6900/), [`1164-4666-4740-6900`](https://commanderspellbook.com/combo/1164-4666-4740-6900/), [`1164-4740-6333-6900`](https://commanderspellbook.com/combo/1164-4740-6333-6900/)

  </details>

#### K'rrik + Ayara, First of Locthwain + Cloudstone Curio + Aetherflux Reservoir
**Priority:** Medium · **Variants:** 1 · **Popularity:** 40 (EDHREC decks, summed)
- **Most popular variant:** [`884-2232-3260-4740`](https://commanderspellbook.com/combo/884-2232-3260-4740/): K'rrik, Son of Yawgmoth | Ayara, First of Locthwain | Cloudstone Curio | Aetherflux Reservoir
- **Generator combo IDs:** `2897`
- **The database says now:**
  > *Notable prerequisites:* Your life total is at least ten. / You have a creature card in hand with mana cost {B}.
- **Widget math:** Each loop casts two spells: the {B} creature for 2 life (+ storm, + 1 from Ayara's trigger), then Ayara for 6 life (+ storm, + 1 from Ayara's trigger).

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 8 | 6 | 5 | 4 | 3 | 3 |

- **Check:** The database asks for 10 life; the simulation needs 8 at storm count 0. See [R2](#r2).

#### K'rrik + Aetherflux Reservoir + Mourning + a cost reducer or untapper (Helm of Awakening, Cloud Key, Mana Matrix, Umori, Starnheim Courser)
**Priority:** Medium · **Variants:** 5 · **Popularity:** 23 (EDHREC decks, summed)
- **Most popular variant:** [`1594-3260-3540-4740`](https://commanderspellbook.com/combo/1594-3260-3540-4740/): K'rrik, Son of Yawgmoth | Aetherflux Reservoir | Mourning | Helm of Awakening
- **Generator combo IDs:** `21182`, `21183`, `21184`, `21185`, `21186`
- **The database says now:**
  > *Notable prerequisites:* Your life total is at least nine if your storm count is equal to zero, at least six if your storm count is equal to one, at least four if your storm count is equal to two, or at least three otherwise.
- **Widget math:** Each loop: cast Mourning for 2 life → Aetherflux gains the spell count → return Mourning with {B} paid as 2 life.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 9 | 6 | 4 | 3 | 3 | 3 |

- **Check:** Matches the database table (9 / 6 / 4 / 3).
- **Other variants (4):** [`2146-3260-3540-4740`](https://commanderspellbook.com/combo/2146-3260-3540-4740/), [`2427-3260-3540-4740`](https://commanderspellbook.com/combo/2427-3260-3540-4740/), [`3260-3540-4030-4740`](https://commanderspellbook.com/combo/3260-3540-4030-4740/), [`341-3260-3540-4740`](https://commanderspellbook.com/combo/341-3260-3540-4740/)

#### Yavimaya Bloomsage // Channel + Aetherflux Reservoir + Sprout Swarm
**Priority:** Medium · **Variants:** 1 · **Popularity:** 5 (EDHREC decks, summed)
- **Most popular variant:** [`3209-4740-7439`](https://commanderspellbook.com/combo/3209-4740-7439/): Yavimaya Bloomsage // Channel | Aetherflux Reservoir | Sprout Swarm
- **Generator combo IDs:** `32936`
- **The database says now:**
  > *Mana needed:* {G}{G} plus an additional {G} if you don't control an untapped green creature
  > *Easy prerequisites:* Your life total is at least 11.
  > *Notes:* After the first loop, you'll want to tap the Saproling to reduce Sprout Swarm's cost by {G} via its convoke ability.
- **Widget math:** Casting the Channel copy is itself a spell (+ storm). Then each loop: Channel 4 life into {C}{C}{C}{C} → cast Sprout Swarm with buyback, convoking the previous Saproling for {G} → Aetherflux gains the spell count.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 7 | 4 | 2 | 1 | 1 | 1 |

- **Check:** The database asks for 11 life, which is what you get if the Channel copy did not trigger Aetherflux; with that trigger the combo needs 7. See [R4](#r4).

#### Grave Researcher // Reanimate + Biblioplex Tomekeeper + Aetherflux Reservoir + Phyrexian Altar
**Priority:** Medium · **Variants:** 1 · **Popularity:** 1 (EDHREC decks, summed)
- **Most popular variant:** [`4050-4740-7498-7541`](https://commanderspellbook.com/combo/4050-4740-7498-7541/): Grave Researcher // Reanimate | Biblioplex Tomekeeper | Aetherflux Reservoir | Phyrexian Altar
- **Generator combo IDs:** `33611`
- **The database says now:**
  > *Easy prerequisites:* You have at least 7 life.
  > *Notes:* The minimum life you need to start this combo is reduced depending on how many spells you have cast this turn.
- **Widget math:** Each loop: cast the prepared Reanimate copy (Aetherflux gains the spell count) → Reanimate returns Biblioplex Tomekeeper and you lose 4 life.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 7 | 4 | 2 | 1 | 1 | 1 |

- **Check:** Matches the database (7); its Notes say the minimum drops with spells cast this turn.

#### Pay-1-life-per-spell Aetherflux loops (Sensei's Divining Top + Bolas's Citadel; Warren Soultrader + Gravecrawler; Glarb + Valley Floodcaller + Eye of Duskmantle + Top)
**Priority:** Low · **Variants:** 4 · **Popularity:** 62,436 (EDHREC decks, summed)
- **Most popular variant:** [`2173-4740-5078`](https://commanderspellbook.com/combo/2173-4740-5078/): Sensei's Divining Top | Aetherflux Reservoir | Bolas's Citadel
- **Generator combo IDs:** `152`, `28383`, `29336`
- **The database says now:**
  > *Easy prerequisites:* Your life total is at least 2.
- **Widget math:** Never net negative, so 2 life always suffices. The useful output is how many loops it takes to fire Aetherflux: after n loops life is L + n·s + n(n−1)/2; the first activation needs 51.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 2 | 2 | 2 | 2 | 2 | 2 |

- **Check:** Matches the database (2).
- **Other variants (3):** [`4740-5078-6900`](https://commanderspellbook.com/combo/4740-5078-6900/), [`2577-4740-5670`](https://commanderspellbook.com/combo/2577-4740-5670/), [`4740-5078-5864-5948-6021`](https://commanderspellbook.com/combo/4740-5078-5864-5948-6021/)

#### Defiler of Flesh + Aetherflux Reservoir + Gravecrawler + a sacrifice outlet
**Priority:** Low · **Variants:** 4 · **Popularity:** 302 (EDHREC decks, summed)
- **Most popular variant:** [`823-2034-2577-4740`](https://commanderspellbook.com/combo/823-2034-2577-4740/): Defiler of Flesh | Aetherflux Reservoir | Gravecrawler | Ashnod's Altar
- **Generator combo IDs:** `14327`, `14328`, `14329`, `14330`
- **The database says now:**
  > *Notable prerequisites:* Your life total is at least 4.
- **Widget math:** Each loop: sacrifice Gravecrawler → recast it from the graveyard for 2 life (Defiler) → Aetherflux gains the spell count.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 4 | 3 | 3 | 3 | 3 | 3 |

- **Check:** Matches the database (4).
- **Other variants (3):** [`823-2438-2577-4740`](https://commanderspellbook.com/combo/823-2438-2577-4740/), [`823-2292-2577-4740`](https://commanderspellbook.com/combo/823-2292-2577-4740/), [`823-2577-4740-5256`](https://commanderspellbook.com/combo/823-2577-4740-5256/)

#### Free recast, then pay 2 life (Hibernation Sliver with Morophon or Aluren; Dargo + Razaketh with Birgi or Pitiless Plunderer)
**Priority:** Low · **Variants:** 4 · **Popularity:** 185 (EDHREC decks, summed)
- **Most popular variant:** [`321-877-4740`](https://commanderspellbook.com/combo/321-877-4740/): Morophon, the Boundless | Hibernation Sliver | Aetherflux Reservoir
- **Generator combo IDs:** `16325`, `16326`, `16856`, `16860`
- **The database says now:**
  > *Notable prerequisites:* Your life total is at least two, or you have cast at least one spell this turn.
- **Widget math:** Each loop: cast for free → Aetherflux gains the spell count → pay 2 life (Hibernation Sliver bounce or Razaketh). Never needs more than 2 life.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 2 | 1 | 1 | 1 | 1 | 1 |

- **Check:** Matches the database.
- **Other variants (3):** [`321-4191-4740`](https://commanderspellbook.com/combo/321-4191-4740/), [`3247-3327-4740-4871`](https://commanderspellbook.com/combo/3247-3327-4740-4871/), [`392-3247-3327-4740`](https://commanderspellbook.com/combo/392-3247-3327-4740/)

#### Library-limited Aetherflux loops (Defiler of Dreams + Shrieking Drake; Mazzy + Unbridled Growth + Defiler of Vigor)
**Priority:** Low · **Variants:** 2 · **Popularity:** 125 (EDHREC decks, summed)
- **Most popular variant:** [`751-3091-4740`](https://commanderspellbook.com/combo/751-3091-4740/): Defiler of Dreams | Shrieking Drake | Aetherflux Reservoir
- **Generator combo IDs:** `10925`, `14386`
- **The database says now:**
  > *Notable prerequisites:* Your life total is at least four.
- **Widget math:** Each loop: cast for 2 life → Aetherflux gains the spell count → draw a card. The loop ends when the library runs out, so the widget can also show the life reached after drawing D cards: L + D·s + D(D+1)/2 − 2D, and how many 50-damage activations that pays for.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 4 | 3 | 3 | 3 | 3 | 3 |

- **Check:** Matches the database (4).
- **Other variants (1):** [`1560-2029-3953-4740`](https://commanderspellbook.com/combo/1560-2029-3953-4740/)

#### Guile + Temporal Extortion + Aetherflux Reservoir
**Priority:** Low · **Variants:** 1 · **Popularity:** 5 (EDHREC decks, summed)
- **Most popular variant:** [`1623-2125-4740`](https://commanderspellbook.com/combo/1623-2125-4740/): Guile | Temporal Extortion | Aetherflux Reservoir
- **Generator combo IDs:** `11616`
- **The database says now:**
  > *Mana needed:* {B}{B}{B}{B}
- **Widget math:** Each loop: Aetherflux gains the spell count, then you pay half your life rounded up to counter your own Temporal Extortion (Guile recasts it). Life after loop k is ⌊(life + s + k) / 2⌋, so it never drops to 0. The widget answers how many loops until life + gain ≥ 51, so Aetherflux can be activated in response to the half-life payment.

#### K'rrik + Necromancer's Magemark + Glistening Oil + Death Cultist + Aetherflux Reservoir
**Priority:** Low · **Variants:** 1 · **Popularity:** 4 (EDHREC decks, summed)
- **Most popular variant:** [`386-2851-3260-4230-4740`](https://commanderspellbook.com/combo/386-2851-3260-4230-4740/): K'rrik, Son of Yawgmoth | Necromancer's Magemark | Glistening Oil | Death Cultist | Aetherflux Reservoir
- **Generator combo IDs:** `13719`
- **The database says now:**
  > *Notable prerequisites:* You have at least 5 life.
- **Widget math:** Each loop: Death Cultist sacrifice (+1 life) → recast it for {B/P} as 2 life (+ storm) → recast Glistening Oil for 4 life (+ storm).

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 5 | 4 | 3 | 2 | 2 | 2 |

- **Check:** Matches the database (5).

#### Dargo, the Shipwrecker + Defiler of Instinct + Razaketh, the Foulblooded + Aetherflux Reservoir
**Priority:** Low · **Variants:** 1 · **Popularity:** 0 (EDHREC decks, summed)
- **Most popular variant:** [`2312-3247-3327-4740`](https://commanderspellbook.com/combo/2312-3247-3327-4740/): Dargo, the Shipwrecker | Defiler of Instinct | Razaketh, the Foulblooded | Aetherflux Reservoir
- **Generator combo IDs:** `16862`
- **The database says now:**
  > *Notable prerequisites:* Your life total is at least nine. / You have sacrificed at least three artifacts and/or creatures this turn, plus an additional artifact or creature for each time you've cast Dargo from the command zone this game.
- **Widget math:** Each loop: cast Dargo from the command zone for 2 life (Defiler) → Aetherflux gains the spell count → Razaketh pays 2 life and sacrifices Dargo.

| Spells already cast this turn | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|---:|
| Minimum life | 9 | 6 | 4 | 3 | 3 | 3 |

- **Check:** Matches the database (9).

## 2. Storm count or commander casts deciding whether a loop sustains

**Widget id:** `storm-threshold`

**Widget:** inputs are storm count (spells already cast this turn), the number of times the commander has been cast from the command zone, and, where relevant, untapped creatures or mana. Output is whether the loop sustains, the mana surplus or deficit per iteration, and the minimum storm count needed.

#### Storm-Kiln Artist + Thousand-Year Storm + Narset's Reversal
**Priority:** Medium · **Variants:** 1 · **Popularity:** 20,682 (EDHREC decks, summed)
- **Most popular variant:** [`11-3584-5195`](https://commanderspellbook.com/combo/11-3584-5195/): Storm-Kiln Artist | Thousand-Year Storm | Narset's Reversal
- **Generator combo IDs:** `23849`
- **The database says now:**
  > *Mana needed:* {U} if you have not cast an instant or sorcery this turn
  > *Notable prerequisites:* You have another instant and/or sorcery card in hand that can be cast using X or less colored mana, where X is equal to four plus twice the number of instants and sorceries you've cast this turn.
- **Widget math:** The other instant or sorcery can cost up to X colored mana, where X = 4 + 2 × (instants and sorceries already cast this turn); Treasures made per loop grow with the same count. Input: instants and sorceries cast this turn. Outputs: maximum spell cost and Treasures per loop.

#### Aeve, Progenitor Ooze + Food Chain
**Priority:** Medium · **Variants:** 1 · **Popularity:** 957 (EDHREC decks, summed)
- **Most popular variant:** [`353-3519`](https://commanderspellbook.com/combo/353-3519/): Aeve, Progenitor Ooze | Food Chain
- **Generator combo IDs:** `9728`
- **The database says now:**
  > *Mana needed:* {2}{G}{G}{G} plus enough mana to pay for commander tax, if applicable
  > *Notable prerequisites:* Your storm count is equal to or greater than the number of times you've cast Aeve this game divided by three, rounded up.
- **Widget math:** Each Aeve cast makes storm-count copies; each Aeve exiled to Food Chain gives 6 creature-only mana; the next Aeve costs {2}{G}{G}{G} + 2 per previous cast. Database condition: storm count ≥ ⌈casts / 3⌉.

#### Thousand-Year Storm + Sprout Swarm
**Priority:** Low · **Variants:** 1 · **Popularity:** 131 (EDHREC decks, summed)
- **Most popular variant:** [`3209-3584`](https://commanderspellbook.com/combo/3209-3584/): Thousand-Year Storm | Sprout Swarm
- **Generator combo IDs:** `1894`
- **The database says now:**
  > *Notable prerequisites:* Storm count at least 4.
- **Widget math:** With n instants and sorceries already cast this turn, Thousand-Year Storm copies Sprout Swarm n times, so each cast makes n + 1 Saprolings that convoke the next cast ({1}{G} + buyback {3}). Database condition: storm count ≥ 4; below that the widget computes the extra mana needed.

#### Aeve, Progenitor Ooze + Ashnod's Altar + a third card (Phyrexian Altar, Prismite, Signpost Scarecrow, Crossroads Candleguide, Stonework Packbeast, Energy Refractor, Urn of Godfire, Gemstone Array)
**Priority:** Low · **Variants:** 8 · **Popularity:** 92 (EDHREC decks, summed)
- **Most popular variant:** [`353-2034-4050`](https://commanderspellbook.com/combo/353-2034-4050/): Aeve, Progenitor Ooze | Ashnod's Altar | Phyrexian Altar
- **Generator combo IDs:** `18981`, `20008`, `20009`, `20010`, `20011`, `20012`, `20013`, `20014`
- **The database says now:**
  > *Mana needed:* {2}{G}{G}{G} plus enough mana to pay for commander tax, if applicable
  > *Notable prerequisites:* Your storm count is equal to or higher than five plus the number of times you've cast Aeve from the command zone this game.
- **Widget math:** Same loop with Ashnod's Altar ({C}{C} per Aeve) plus a filter for the green pips. Database condition: storm count ≥ 5 + commander casts.
- **Other variants (7):** [`353-2034-4055`](https://commanderspellbook.com/combo/353-2034-4055/), [`353-2034-5115`](https://commanderspellbook.com/combo/353-2034-5115/), [`353-2034-2054`](https://commanderspellbook.com/combo/353-2034-2054/), [`353-1812-2034`](https://commanderspellbook.com/combo/353-1812-2034/), [`353-2034-4720`](https://commanderspellbook.com/combo/353-2034-4720/), [`353-2034-4758`](https://commanderspellbook.com/combo/353-2034-4758/), [`353-913-2034`](https://commanderspellbook.com/combo/353-913-2034/)

#### Prismari, the Inspiration + Inspired Skypainter // Maestro's Gift + Sakashima of a Thousand Faces
**Priority:** Low · **Variants:** 5 · **Popularity:** 91 (EDHREC decks, summed)
- **Most popular variant:** [`2719-7546-7683`](https://commanderspellbook.com/combo/2719-7546-7683/): Prismari, the Inspiration | Inspired Skypainter // Maestro's Gift | Sakashima of a Thousand Faces
- **Generator combo IDs:** `33127`
- **The database says now:**
  > *Mana needed:* {9}{U}{U}{U}{R}{R}{R}
  > *Notable prerequisites:* You have a storm count of 1 or higher.
  > *Notes:* You can also compensate for less mana by having a higher storm count.
- **Widget math:** Copies created = storm count per storm trigger, and each Prismari copy adds another storm trigger to the next Maestro's Gift. Inputs: storm count and mana (Maestro's Gift costs {3}{U}{R} per cast). Output: Prismari copies and tokens after each cast (the Notes say a higher storm count compensates for less mana).
- **Other variants (4):** [`1434-7546-7683`](https://commanderspellbook.com/combo/1434-7546-7683/), [`7546-7683-7752`](https://commanderspellbook.com/combo/7546-7683-7752/), [`4600-7546-7683`](https://commanderspellbook.com/combo/4600-7546-7683/), [`4836-7546-7683`](https://commanderspellbook.com/combo/4836-7546-7683/)

#### Aeve, Progenitor Ooze + Temur Sabertooth + Mana Echoes + Chromatic Orrery or Mycosynth Lattice
**Priority:** Low · **Variants:** 2 · **Popularity:** 1 (EDHREC decks, summed)
- **Most popular variant:** [`215-353-1283-2440`](https://commanderspellbook.com/combo/215-353-1283-2440/): Aeve, Progenitor Ooze | Temur Sabertooth | Mana Echoes | Chromatic Orrery
- **Generator combo IDs:** `12840`, `12841`
- **The database says now:**
  > *Notable prerequisites:* You have a storm count of at least three.
- **Widget math:** Each Aeve entering makes Mana Echoes add {C} equal to the number of Oozes you control. Database condition: storm count ≥ 3; the widget shows the mana per iteration for any storm count.
- **Other variants (1):** [`215-353-2440-3263`](https://commanderspellbook.com/combo/215-353-2440-3263/)

## 3. Life total turned into X: Channel and Storm Herd

**Widget id:** `life-to-x`

**Widget:** input your life total (plus extra mana and the opponents' life totals, hands and permanents where relevant). Output the maximum X and what it does to each opponent: damage per target, life lost, or tokens.

For Channel, colorless mana available = life − 1, because you have to stay at 1 life or more after paying. The colored pips of the X spell, and {G}{G} for Channel itself, come from elsewhere.

#### Storm Herd + Cathars' Crusade
**Priority:** Medium · **Variants:** 1 · **Popularity:** 5,568 (EDHREC decks, summed)
- **Most popular variant:** [`2067-2744`](https://commanderspellbook.com/combo/2067-2744/): Storm Herd | Cathars' Crusade
- **Generator combo IDs:** `30847`
- **The database says now:**
  > *Mana needed:* {8}{W}{W}
  > *Notes:* The combo causes each creature you control as well as each Pegasus tokens to get a number of +1/+1 counters on them equal to your life total as Storm Herd resolves.
- **Widget math:** X = your life total: X Pegasus tokens enter together, Crusade triggers X times, so each creature you control gets X +1/+1 counters. The Pegasi are (X+1)/(X+1) fliers with X·(X+1) total power; other creatures get +X/+X.

#### Channel (or Yavimaya Bloomsage // Channel) + Exsanguinate (or Stensian Sanguinist // Exsanguinate)
**Priority:** Medium · **Variants:** 4 · **Popularity:** 2,472 (EDHREC decks, summed)
- **Most popular variant:** [`7433-7439`](https://commanderspellbook.com/combo/7433-7439/): Yavimaya Bloomsage // Channel | Stensian Sanguinist // Exsanguinate
- **Generator combo IDs:** `32701`, `32702`, `33330`, `33331`
- **The database says now:**
  > *Notes:* The more life you have, the more life your opponents will lose.
- **Widget math:** X = (life − 1) + extra generic mana; each opponent loses X and you gain X × opponents.
- **Other variants (3):** [`3245-7439`](https://commanderspellbook.com/combo/3245-7439/), [`1172-3245`](https://commanderspellbook.com/combo/1172-3245/), [`1172-7433`](https://commanderspellbook.com/combo/1172-7433/)

#### Channel (or Yavimaya Bloomsage // Channel) + Torment of Hailfire
**Priority:** Medium · **Variants:** 2 · **Popularity:** 393 (EDHREC decks, summed)
- **Most popular variant:** [`7439-7442`](https://commanderspellbook.com/combo/7439-7442/): Yavimaya Bloomsage // Channel | Torment of Hailfire
- **Generator combo IDs:** `32704`, `33333`
- **The database says now:**
  > *Notes:* The more life you have, the more life your opponents will lose.
- **Widget math:** X repetitions; each opponent loses 3 life per repetition unless they sacrifice a nonland permanent or discard. Opponent i loses 3 × max(0, X − (cards in hand + nonland permanents)), adjusted for the order in which players choose. Inputs per opponent: life, hand size, nonland permanents.
- **Other variants (1):** [`1172-7442`](https://commanderspellbook.com/combo/1172-7442/)

#### Channel (or Yavimaya Bloomsage // Channel) + Crackle with Power
**Priority:** Medium · **Variants:** 2 · **Popularity:** 273 (EDHREC decks, summed)
- **Most popular variant:** [`7439-7440`](https://commanderspellbook.com/combo/7439-7440/): Yavimaya Bloomsage // Channel | Crackle with Power
- **Generator combo IDs:** `32697`, `33326`
- **The database says now:**
  > *Notes:* The more life you have, the more damage you will deal, and you'll also get more targets to deal damage to.
- **Widget math:** X = ⌊generic mana / 3⌋ ({X}{X}{X}{R}{R}); deals 5X damage to each of up to X targets.
- **Other variants (1):** [`1172-7440`](https://commanderspellbook.com/combo/1172-7440/)

#### Channel (or Yavimaya Bloomsage // Channel) + Comet Storm
**Priority:** Medium · **Variants:** 2 · **Popularity:** 156 (EDHREC decks, summed)
- **Most popular variant:** [`5071-7439`](https://commanderspellbook.com/combo/5071-7439/): Yavimaya Bloomsage // Channel | Comet Storm
- **Generator combo IDs:** `32698`, `33327`
- **The database says now:**
  > *Notes:* The more life you have, the more damage you will deal.
- **Widget math:** With k multikicks: X = generic mana − k; deals X damage to each of k + 1 targets. The widget picks the k that kills the most opponents.
- **Other variants (1):** [`1172-5071`](https://commanderspellbook.com/combo/1172-5071/)

#### Channel (or Yavimaya Bloomsage // Channel) + Debt to the Deathless
**Priority:** Medium · **Variants:** 2 · **Popularity:** 29 (EDHREC decks, summed)
- **Most popular variant:** [`805-7439`](https://commanderspellbook.com/combo/805-7439/): Yavimaya Bloomsage // Channel | Debt to the Deathless
- **Generator combo IDs:** `32703`, `33332`
- **The database says now:**
  > *Notes:* The more life you have, the more life your opponents will lose.
- **Widget math:** X = (life − 1) + extra generic mana; each opponent loses 2X and you gain all of it. Kills everyone when 2X ≥ the highest opponent life.
- **Other variants (1):** [`805-1172`](https://commanderspellbook.com/combo/805-1172/)

#### Storm Herd board-size thresholds (Epic Struggle; Halo Fountain + Cryptolith Rite or Akroma's Memorial; Mayael's Aria + Queen Allenal, Geist-Honored Monk or Hanweir Militia Captain)
**Priority:** Low · **Variants:** 6 · **Popularity:** 217 (EDHREC decks, summed)
- **Most popular variant:** [`2067-4688`](https://commanderspellbook.com/combo/2067-4688/): Storm Herd | Epic Struggle
- **Generator combo IDs:** `8271`, `8272`, `9832`, `13496`, `13497`, `13500`
- **The database says now:**
  > *Mana needed:* {8}{W}{W}
  > *Notable prerequisites:* Your life total plus the number of creatures you control is equal to or greater than twenty.
- **Widget math:** Storm Herd makes one Pegasus per life point, so these combos are gated by life total + creatures you control ≥ a constant (20, 15, 18 or 19). The widget shows that sum against the constant.
- **Other variants (5):** [`512-1322-2067-4289`](https://commanderspellbook.com/combo/512-1322-2067-4289/), [`512-2067-3499-4289`](https://commanderspellbook.com/combo/512-2067-3499-4289/), [`560-2067-3858`](https://commanderspellbook.com/combo/560-2067-3858/), [`2067-3858-5323`](https://commanderspellbook.com/combo/2067-3858-5323/), [`1450-2067-3858`](https://commanderspellbook.com/combo/1450-2067-3858/)

#### Channel (or Yavimaya Bloomsage // Channel) + Jaya's Immolating Inferno
**Priority:** Low · **Variants:** 2 · **Popularity:** 125 (EDHREC decks, summed)
- **Most popular variant:** [`4271-7439`](https://commanderspellbook.com/combo/4271-7439/): Yavimaya Bloomsage // Channel | Jaya's Immolating Inferno
- **Generator combo IDs:** `32699`, `33328`
- **The database says now:**
  > *Notes:* The more life you have, the more damage you will deal.
- **Widget math:** X = generic mana; deals X damage to each of up to three targets (needs a legendary creature or planeswalker).
- **Other variants (1):** [`1172-4271`](https://commanderspellbook.com/combo/1172-4271/)

#### Exalted Sunborn + Storm Herd (Moonlit Meditation or Mystic Reflection)
**Priority:** Low · **Variants:** 2 · **Popularity:** 105 (EDHREC decks, summed)
- **Most popular variant:** [`2067-6753-6787`](https://commanderspellbook.com/combo/2067-6753-6787/): Moonlit Meditation | Exalted Sunborn | Storm Herd
- **Generator combo IDs:** `30694`, `30697`
- **The database says now:**
  > *Mana needed:* {8}{W}{W}
  > *Notes:* If you have 20 life, this combo makes 40 tokens in step 1, and then applies a multiplier of 2^41 for each token created afterwards, accounting for the 40 tokens and the nontoken Exalted Sunborn.
- **Widget math:** Life L gives 2L Exalted Sunborn copies, then a token multiplier of 2^(2L+1) (the Notes work out 20 life → 40 tokens and 2^41). Mostly for show; low value.
- **Other variants (1):** [`1000-2067-6753`](https://commanderspellbook.com/combo/1000-2067-6753/)

#### Channel (or Yavimaya Bloomsage // Channel) + Fireball
**Priority:** Low · **Variants:** 2 · **Popularity:** 74 (EDHREC decks, summed)
- **Most popular variant:** [`7439-7441`](https://commanderspellbook.com/combo/7439-7441/): Yavimaya Bloomsage // Channel | Fireball
- **Generator combo IDs:** `33335`, `33336`
- **The database says now:**
  > *Notes:* The more life you have, the more damage you will deal.
- **Widget math:** With t targets: X = generic mana − (t − 1); each target takes ⌊X / t⌋.
- **Other variants (1):** [`1172-7441`](https://commanderspellbook.com/combo/1172-7441/)

#### Venerated Rotpriest + Storm Herd + a spell that targets all your creatures
**Priority:** Low · **Variants:** 12 · **Popularity:** 31 (EDHREC decks, summed)
- **Most popular variant:** [`639-2067-2542`](https://commanderspellbook.com/combo/639-2067-2542/): Venerated Rotpriest | Storm Herd | Scapegoat
- **Generator combo IDs:** `14792`, `14825`, `15720`, `15721`, `15722`, `15723`, `15724`, `15725`, `20339`, `20340`, `20341`, `20343`
- **The database says now:**
  > *Mana needed:* {8}{W}{W}{W}
  > *Notable prerequisites:* Your life total is at least thirty, minus one for each poison counter your opponents have and for each other creature you control.
- **Widget math:** Each targeted creature gives an opponent a poison counter. Database conditions: life ≥ 30 − poison counters − other creatures, and with Mirrorwing Dragon or Zada life ≥ 10 × opponents − 2 − poison counters.
- <details><summary><b>Other variants (11)</b></summary>

  [`2067-2542-2975`](https://commanderspellbook.com/combo/2067-2542-2975/), [`2067-2258-2542`](https://commanderspellbook.com/combo/2067-2258-2542/), [`906-2067-2542`](https://commanderspellbook.com/combo/906-2067-2542/), [`2067-2542-2614`](https://commanderspellbook.com/combo/2067-2542-2614/), [`2067-2542-3299`](https://commanderspellbook.com/combo/2067-2542-3299/), [`2067-2542-4323`](https://commanderspellbook.com/combo/2067-2542-4323/), [`2067-2542-5018`](https://commanderspellbook.com/combo/2067-2542-5018/), [`2067-2542-5274`](https://commanderspellbook.com/combo/2067-2542-5274/), [`1811-2067-2542`](https://commanderspellbook.com/combo/1811-2067-2542/), [`2067-2542-3353`](https://commanderspellbook.com/combo/2067-2542-3353/), [`2067-2542-3509`](https://commanderspellbook.com/combo/2067-2542-3509/)

  </details>

#### Channel (or Yavimaya Bloomsage // Channel) + Cut // Ribbons
**Priority:** Low · **Variants:** 2 · **Popularity:** 6 (EDHREC decks, summed)
- **Most popular variant:** [`494-7439`](https://commanderspellbook.com/combo/494-7439/): Yavimaya Bloomsage // Channel | Cut // Ribbons
- **Generator combo IDs:** `32700`, `33329`
- **The database says now:**
  > *Notes:* The more life you have, the more life your opponents will lose.
- **Widget math:** Ribbons (aftermath): X = (life − 1) + extra mana; each opponent loses X.
- **Other variants (1):** [`494-1172`](https://commanderspellbook.com/combo/494-1172/)

## 4. Will it kill? Checks against opponents' life totals, libraries and poison

**Widget id:** `lethal-check`

**Widget:** one row per opponent (life, and where relevant library size, poison counters, cards in hand) plus your own resources. Output: who dies, who survives and by how much, and the minimum resource needed. In most of these the prerequisite approximates an exact rounding formula, or states it for one opponent only.

#### Peer into the Abyss + Underworld Dreams / Ob Nixilis, the Hate-Twisted
**Priority:** High · **Variants:** 2 · **Popularity:** 52,762 (EDHREC decks, summed)
- **Most popular variant:** [`1561-2720`](https://commanderspellbook.com/combo/1561-2720/): Peer into the Abyss | Underworld Dreams
- **Generator combo IDs:** `2690`, `4369`
- **The database says now:**
  > *Mana needed:* {4}{B}{B}{B}
  > *Notable prerequisites:* An opponent has cards in their library greater than their life total.
- **Widget math:** 1 damage per card drawn: lethal exactly when ⌈library / 2⌉ ≥ ⌊life / 2⌋, roughly library ≥ life − 1. The database asks for library > life (Underworld Dreams) or ≥ life (Ob Nixilis), which is safe but strict.
- **Other variants (1):** [`1561-5165`](https://commanderspellbook.com/combo/1561-5165/)

#### Sheoldred, the Apocalypse + Peer into the Abyss
**Priority:** High · **Variants:** 1 · **Popularity:** 50,983 (EDHREC decks, summed)
- **Most popular variant:** [`1561-2498`](https://commanderspellbook.com/combo/1561-2498/): Sheoldred, the Apocalypse | Peer into the Abyss
- **Generator combo IDs:** `10802`
- **The database says now:**
  > *Mana needed:* {4}{B}{B}{B}
  > *Notable prerequisites:* An opponent has a library size that is at least half their life total.
- **Widget math:** The opponent draws ⌈library / 2⌉ (2 life each from Sheoldred) and loses ⌈life / 2⌉. Lethal exactly when 2·⌈library / 2⌉ ≥ ⌊life / 2⌋. The database's "library at least half their life" is a slightly conservative version of this.

#### Ojer Axonil, Deepest Might + Pyrohemia / Warmonger
**Priority:** High · **Variants:** 2 · **Popularity:** 12,827 (EDHREC decks, summed)
- **Most popular variant:** [`2868-4629`](https://commanderspellbook.com/combo/2868-4629/): Ojer Axonil, Deepest Might // Temple of Power | Pyrohemia
- **Generator combo IDs:** `24383`, `24384`
- **The database says now:**
  > *Mana needed:* {R} equal to the highest life total among your opponents divided by Ojer Axonil's power, rounded up
  > *Notable prerequisites:* Your life total is equal to or greater than the highest life total among your opponents divided by Ojer Axonil's power, rounded up. / You have a way to give Ojer Axonil indestructible or protection from red if its toughness is less than the highest life total…
- **Widget math:** Activations needed n = ⌈highest opponent life / Ojer's power⌉; mana n·{R} (Pyrohemia) or n·{2} (Warmonger). You take 1 damage per activation, so you need **more than** n life: at exactly n the last activation kills you too and the game is a draw.
- **Check:** The database says "equal to or greater than"; see [R5](#r5).
- **Other variants (1):** [`2663-2868`](https://commanderspellbook.com/combo/2663-2868/)

#### Windfall + a draw punisher with infect (Nekusar, Fate Unraveler, Razorkin Needlehead, Orcish Bowmasters or Kederekt Parasite + Phyresis, Tainted Strike or Grafted Exoskeleton)
**Priority:** Medium · **Variants:** 30 · **Popularity:** 40,276 (EDHREC decks, summed)
- **Most popular variant:** [`790-1972-4651`](https://commanderspellbook.com/combo/790-1972-4651/): Windfall | Nekusar, the Mindrazer | Phyresis
- **Generator combo IDs:** `29809`
- **The database says now:**
  > *Mana needed:* {2}{U}
  > *Notable prerequisites:* A player has a number of cards in hand that is greater than or equal to 10 minus the lowest amount of poison counters an opponent has.
- **Widget math:** Each opponent gets a poison counter per card drawn, and Windfall draws as many as the biggest hand discarded: lethal for an opponent when largest hand ≥ 10 − their poison counters.
- <details><summary><b>Other variants (29)</b></summary>

  [`790-2152-4651`](https://commanderspellbook.com/combo/790-2152-4651/), [`790-4651-5919`](https://commanderspellbook.com/combo/790-4651-5919/), [`790-3862-4651`](https://commanderspellbook.com/combo/790-3862-4651/), [`790-4651-5076`](https://commanderspellbook.com/combo/790-4651-5076/), [`790-1218-1972`](https://commanderspellbook.com/combo/790-1218-1972/), [`790-1218-3862`](https://commanderspellbook.com/combo/790-1218-3862/), [`790-1972-3681`](https://commanderspellbook.com/combo/790-1972-3681/), [`790-1218-5919`](https://commanderspellbook.com/combo/790-1218-5919/), [`790-1218-2152`](https://commanderspellbook.com/combo/790-1218-2152/), [`790-3681-5919`](https://commanderspellbook.com/combo/790-3681-5919/), [`790-1218-5076`](https://commanderspellbook.com/combo/790-1218-5076/), [`790-2152-3681`](https://commanderspellbook.com/combo/790-2152-3681/), [`386-790-1972`](https://commanderspellbook.com/combo/386-790-1972/), [`790-3681-3862`](https://commanderspellbook.com/combo/790-3681-3862/), [`790-3681-5076`](https://commanderspellbook.com/combo/790-3681-5076/), [`386-790-2152`](https://commanderspellbook.com/combo/386-790-2152/), [`386-790-3862`](https://commanderspellbook.com/combo/386-790-3862/), [`386-790-5919`](https://commanderspellbook.com/combo/386-790-5919/), [`386-790-5076`](https://commanderspellbook.com/combo/386-790-5076/), [`790-4179-5919`](https://commanderspellbook.com/combo/790-4179-5919/), [`731-790-5919`](https://commanderspellbook.com/combo/731-790-5919/), [`731-790-1972`](https://commanderspellbook.com/combo/731-790-1972/), [`731-790-2152`](https://commanderspellbook.com/combo/731-790-2152/), [`731-790-5076`](https://commanderspellbook.com/combo/731-790-5076/), [`731-790-3862`](https://commanderspellbook.com/combo/731-790-3862/), [`790-3862-4179`](https://commanderspellbook.com/combo/790-3862-4179/), [`790-1972-4179`](https://commanderspellbook.com/combo/790-1972-4179/), [`790-2152-4179`](https://commanderspellbook.com/combo/790-2152-4179/), [`790-4179-5076`](https://commanderspellbook.com/combo/790-4179-5076/)

  </details>

#### Malcolm, Keen-Eyed Navigator + Glint-Horn Buccaneer
**Priority:** Medium · **Variants:** 1 · **Popularity:** 22,599 (EDHREC decks, summed)
- **Most popular variant:** [`4508-4869`](https://commanderspellbook.com/combo/4508-4869/): Malcolm, Keen-Eyed Navigator | Glint-Horn Buccaneer
- **Generator combo IDs:** `4690`
- **The database says now:**
  > *Mana needed:* {1}{R}
  > *Easy prerequisites:* You have a card in hand. / You have at least two opponents.
  > *Notes:* Depending on the life totals of your opponents and your deck size, the combo may also stop once your library is empty.
- **Widget math:** Each activation ({1}{R} + discard) pings every opponent and makes one Treasure per opponent hit; it sustains while at least 2 opponents are alive, and 3+ opponents bank spare Treasures for the last one. Inputs: opponents' life totals, library size, starting Treasures. Output: whether everyone dies before the library or the Treasures run out.

#### Duskmantle Guildmage + Maddening Cacophony
**Priority:** Medium · **Variants:** 1 · **Popularity:** 15,761 (EDHREC decks, summed)
- **Most popular variant:** [`5069-5080`](https://commanderspellbook.com/combo/5069-5080/): Duskmantle Guildmage | Maddening Cacophony
- **Generator combo IDs:** `11108`
- **The database says now:**
  > *Mana needed:* {5}{U}{U}{U}{B}
  > *Notable prerequisites:* Each opponent has a life total that is less than or equal to half their library size, rounded up.
- **Widget math:** Kicked: each opponent mills ⌈library / 2⌉ and loses 1 life per card, lethal when ⌈library / 2⌉ ≥ life. Unkicked: 8 life each. The widget evaluates every opponent at once.

#### Drogskol Reaver + Queza, Augur of Agonies or Starving Revenant; Queza + Lich / Nefarious Lich
**Priority:** Medium · **Variants:** 4 · **Popularity:** 11,818 (EDHREC decks, summed)
- **Most popular variant:** [`444-1786`](https://commanderspellbook.com/combo/444-1786/): Drogskol Reaver | Queza, Augur of Agonies
- **Generator combo IDs:** `8387`, `8389`, `14014`
- **The database says now:**
  > *Notable prerequisites:* Your deck size is greater than your opponents' combined life totals.
- **Widget math:** Each card drawn drains 1 from an opponent of your choice. Lethal for the table when library size ≥ the sum of the opponents' life totals (the drain on the last card resolves before the next draw).
- **Other variants (3):** [`444-5796`](https://commanderspellbook.com/combo/444-5796/), [`1786-4126`](https://commanderspellbook.com/combo/1786-4126/), [`202-1786`](https://commanderspellbook.com/combo/202-1786/)

#### Be'lakor, the Dark Master + Rite of Replication / Orthion, Hero of Lavabrink
**Priority:** Medium · **Variants:** 2 · **Popularity:** 7,986 (EDHREC decks, summed)
- **Most popular variant:** [`1744-4071`](https://commanderspellbook.com/combo/1744-4071/): Be'lakor, the Dark Master | Rite of Replication
- **Generator combo IDs:** `22404`, `22405`
- **The database says now:**
  > *Mana needed:* {7}{U}{U}
  > *Notable prerequisites:* Opponents have a collective life total of 150 or less, or your deck size is equal to or greater than 5 times the number of Demons you control and your life total is equal to or greater than that number plus one.
- **Widget math:** Five Be'lakor copies deal 150 damage in total (30 + 120, split as you like); if that isn't enough, the draw-and-lose-life triggers resolve: 5 cards and 5 life per Demon. Inputs: opponents' life totals, Demons, deck size, your life. Output: whether the damage alone kills, or whether you survive the draws.
- **Other variants (1):** [`2136-4071`](https://commanderspellbook.com/combo/2136-4071/)

#### Yarus, Roar of the Old Gods + Ashcloud Phoenix + a sacrifice outlet (Goblin Bombardment, Marauding Raptor, Aether Flash)
**Priority:** Medium · **Variants:** 21 · **Popularity:** 6,233 (EDHREC decks, summed)
- **Most popular variant:** [`144-5147-5434`](https://commanderspellbook.com/combo/144-5147-5434/): Yarus, Roar of the Old Gods | Ashcloud Phoenix | Goblin Bombardment
- **Generator combo IDs:** `26202`, `26203`, `26470`
- **The database says now:**
  > *Notable prerequisites:* Your life total is at least 2 greater than the largest life total among your opponents.
- **Widget math:** Each loop deals 2 damage to every player (Phoenix turning face up) plus 2 extra damage from the outlet (Goblin Bombardment: two pings you aim). Inputs: every life total. Output: loops needed, the best way to aim the pings, and whether you survive (being at 0 together with the last opponent is a draw). The database's "at least 2 more than the largest opponent life" is a safe but strict shortcut: the pings roughly halve what you actually need against one opponent.
- <details><summary><b>Other variants (20)</b></summary>

  [`144-2034-5434`](https://commanderspellbook.com/combo/144-2034-5434/), [`144-4050-5434`](https://commanderspellbook.com/combo/144-4050-5434/), [`144-413-5434`](https://commanderspellbook.com/combo/144-413-5434/), [`144-3899-5434`](https://commanderspellbook.com/combo/144-3899-5434/), [`144-5256-5434`](https://commanderspellbook.com/combo/144-5256-5434/), [`144-5231-5434`](https://commanderspellbook.com/combo/144-5231-5434/), [`144-2062-5434`](https://commanderspellbook.com/combo/144-2062-5434/), [`144-3385-5434`](https://commanderspellbook.com/combo/144-3385-5434/), [`144-2292-5434`](https://commanderspellbook.com/combo/144-2292-5434/), [`144-997-5434`](https://commanderspellbook.com/combo/144-997-5434/), [`144-2438-5434`](https://commanderspellbook.com/combo/144-2438-5434/), [`144-3967-5434`](https://commanderspellbook.com/combo/144-3967-5434/), [`144-2511-5434`](https://commanderspellbook.com/combo/144-2511-5434/), [`144-2921-5434`](https://commanderspellbook.com/combo/144-2921-5434/), [`144-4247-5434`](https://commanderspellbook.com/combo/144-4247-5434/), [`144-5434-5686`](https://commanderspellbook.com/combo/144-5434-5686/), [`144-5434-6495`](https://commanderspellbook.com/combo/144-5434-6495/), [`144-5434-6797`](https://commanderspellbook.com/combo/144-5434-6797/), [`144-5434-8095`](https://commanderspellbook.com/combo/144-5434-8095/), [`144-728-5434`](https://commanderspellbook.com/combo/144-728-5434/)

  </details>

#### Will, Scion of Peace + Debt to the Deathless + Revival // Revenge
**Priority:** Medium · **Variants:** 1 · **Popularity:** 360 (EDHREC decks, summed)
- **Most popular variant:** [`698-805-4624`](https://commanderspellbook.com/combo/698-805-4624/): Will, Scion of Peace | Debt to the Deathless | Revival // Revenge
- **Generator combo IDs:** `20911`
- **The database says now:**
  > *Mana needed:* {4}{W}{W}{W}{B}{B}{B}
  > *Notable prerequisites:* Your life total is equal to or greater than half the second highest life total among your opponents, rounded up.
- **Widget math:** Revenge doubles your life (X = L) and halves the targeted opponent (rounded up), then each opponent loses 2L. Lethal when 2L ≥ max(⌊highest / 2⌋, second highest).
- **Check:** The database only checks the second highest; see [R10](#r10).

#### Angel of Destiny + Seize the Day
**Priority:** Medium · **Variants:** 1 · **Popularity:** 197 (EDHREC decks, summed)
- **Most popular variant:** [`2481-2790`](https://commanderspellbook.com/combo/2481-2790/): Angel of Destiny | Seize the Day
- **Generator combo IDs:** `11703`
- **The database says now:**
  > *Mana needed:* {5}{R}{R}
  > *Notable prerequisites:* Opponents are unable to block and kill Angel of Destiny. / Your life total is at least 11 greater than your starting life total plus an additional 2 life for each opponent beyond the first. / You have no more than three opponents.
- **Widget math:** Angel of Destiny (2/6, double strike) gains you 4 life per combat. The win check needs starting life + 15 at your end step, so the requirement now is starting life + 15 − 4 × combats. The listed steps use three combats, which is +3.
- **Check:** The database formula goes the wrong way with more opponents; see [R6](#r6).

#### Rowan, Scion of War + Debt to the Deathless + a pay-life outlet (Lord of the Forsaken, Necropotence, Wall of Blood)
**Priority:** Medium · **Variants:** 3 · **Popularity:** 119 (EDHREC decks, summed)
- **Most popular variant:** [`140-805-3591`](https://commanderspellbook.com/combo/140-805-3591/): Rowan, Scion of War | Debt to the Deathless | Necropotence
- **Generator combo IDs:** `20915`, `20916`, `20917`
- **The database says now:**
  > *Mana needed:* {W}{W}{B}{B}
  > *Notable prerequisites:* Your life total is equal to or greater than half the highest life total among your opponents, rounded up.
- **Widget math:** X = life lost this turn; each opponent loses 2X, so you must lose ⌈highest / 2⌉ life first and survive it: life > ⌈highest / 2⌉ (life already lost this turn counts).
- **Check:** The database says "equal to or greater than"; see [R11](#r11).
- **Other variants (2):** [`140-805-2749`](https://commanderspellbook.com/combo/140-805-2749/), [`140-805-1745`](https://commanderspellbook.com/combo/140-805-1745/)

#### Angel of Destiny + The Master, Multiplied + Blade of Selves
**Priority:** Medium · **Variants:** 6 · **Popularity:** 31 (EDHREC decks, summed)
- **Most popular variant:** [`2790-3851-4836`](https://commanderspellbook.com/combo/2790-3851-4836/): Angel of Destiny | The Master, Multiplied | Blade of Selves
- **Generator combo IDs:** `34097`
- **The database says now:**
  > *Easy prerequisites:* Your life total is equal to or greater than 55 minus 4 for each opponent you have.
  > *Notable prerequisites:* Opponents cannot block creatures you control.
- **Widget math:** With N opponents there are N attacking Angels; each damage event triggers every Angel, so you gain 4N² life. Requirement: life ≥ starting life + 15 − 4N² (51 / 39 / 19 for 1 / 2 / 3 opponents at 40 starting life).
- **Check:** The database uses 55 − 4N; see [R7](#r7).
- **Other variants (5):** [`2790-4836-4989`](https://commanderspellbook.com/combo/2790-4836-4989/), [`2790-4711-4836`](https://commanderspellbook.com/combo/2790-4711-4836/), [`2790-4836-6721`](https://commanderspellbook.com/combo/2790-4836-6721/), [`2790-4836-5361`](https://commanderspellbook.com/combo/2790-4836-5361/), [`2790-4836-6330`](https://commanderspellbook.com/combo/2790-4836-6330/)

#### Twenty-Toed Toad + Peer into the Abyss / Enter the Infinite
**Priority:** Low · **Variants:** 2 · **Popularity:** 5,610 (EDHREC decks, summed)
- **Most popular variant:** [`953-5850`](https://commanderspellbook.com/combo/953-5850/): Twenty-Toed Toad | Enter the Infinite
- **Generator combo IDs:** `27669`, `27670`
- **The database says now:**
  > *Mana needed:* {8}{U}{U}{U}{U}
  > *Notable prerequisites:* Your deck size is at least 21, minus 1 for each card in your hand.
- **Widget math:** Win needs 20 cards in hand. Peer: hand + ⌈library / 2⌉ ≥ 20 (library ≥ 39 − 2·hand) and life ≥ 2. Enter the Infinite: hand + library − 1 ≥ 20.
- **Other variants (1):** [`1561-5850`](https://commanderspellbook.com/combo/1561-5850/)

#### Glint-Horn Buccaneer loops (Ghostly Pilferer, Aquamoeba, Cephalid Inkshrouder, Patchwork Gnomes, Murderer's Axe)
**Priority:** Low · **Variants:** 18 · **Popularity:** 4,048 (EDHREC decks, summed)
- **Most popular variant:** [`406-3017-4869`](https://commanderspellbook.com/combo/406-3017-4869/): Glint-Horn Buccaneer | Ghostly Pilferer | Tandem Lookout
- **Generator combo IDs:** `6250`, `6251`, `6252`, `6253`, `6255`, `6256`, `6257`, `6258`, `6260`, `6261`, `6262`, `6263`, `6265`, `6266`, `6270`, `6271`, `6272`, `6273`
- **The database says now:**
  > *Notable prerequisites:* An additional card in hand. / The number of cards in library is greater than each opponent's life total.
- **Widget math:** Each discard deals 1 damage to each opponent and each loop draws a card, so total damage ≈ cards left in the library. Lethal when library > each opponent's life (as stated); the widget shows how many opponents a given library can finish.
- <details><summary><b>Other variants (17)</b></summary>

  [`2396-3017-4869`](https://commanderspellbook.com/combo/2396-3017-4869/), [`2396-4106-4869`](https://commanderspellbook.com/combo/2396-4106-4869/), [`406-4106-4869`](https://commanderspellbook.com/combo/406-4106-4869/), [`2396-4820-4869`](https://commanderspellbook.com/combo/2396-4820-4869/), [`406-4820-4869`](https://commanderspellbook.com/combo/406-4820-4869/), [`148-3017-4869`](https://commanderspellbook.com/combo/148-3017-4869/), [`3017-3311-4869`](https://commanderspellbook.com/combo/3017-3311-4869/), [`2396-3442-4869`](https://commanderspellbook.com/combo/2396-3442-4869/), [`406-3442-4869`](https://commanderspellbook.com/combo/406-3442-4869/), [`2396-2651-4869`](https://commanderspellbook.com/combo/2396-2651-4869/), [`406-2651-4869`](https://commanderspellbook.com/combo/406-2651-4869/), [`148-3442-4869`](https://commanderspellbook.com/combo/148-3442-4869/), [`3311-3442-4869`](https://commanderspellbook.com/combo/3311-3442-4869/), [`148-4106-4869`](https://commanderspellbook.com/combo/148-4106-4869/), [`3311-4106-4869`](https://commanderspellbook.com/combo/3311-4106-4869/), [`148-2651-4869`](https://commanderspellbook.com/combo/148-2651-4869/), [`2651-3311-4869`](https://commanderspellbook.com/combo/2651-3311-4869/)

  </details>

#### Heartless Hidetsugu with infect (Grafted Exoskeleton, Tainted Strike, Phyresis, Glistening Oil, Triumph of the Hordes, Corrupted Conscience)
**Priority:** Low · **Variants:** 6 · **Popularity:** 4,044 (EDHREC decks, summed)
- **Most popular variant:** [`3011-3681`](https://commanderspellbook.com/combo/3011-3681/): Heartless Hidetsugu | Grafted Exoskeleton
- **Generator combo IDs:** `9370`, `14087`, `14985`, `14986`, `14987`, `14988`
- **The database says now:**
  > *Notable prerequisites:* Heartless Hidetsugu does not have summoning sickness. / Grafted Exoskeleton attached to Heartless Hidetsugu. / Your opponents have a life total of twenty or greater, minus two for each poison counter they have. / Your life total is no greater than nineteen, m…
- **Widget math:** Each player gets ⌊life / 2⌋ poison counters. An opponent dies when ⌊life / 2⌋ + poison ≥ 10; you survive only if your own ⌊life / 2⌋ + poison ≤ 9. Database: opponents ≥ 20 − 2·poison, you ≤ 19 − 2·poison.
- **Other variants (5):** [`1218-3011`](https://commanderspellbook.com/combo/1218-3011/), [`3011-4651`](https://commanderspellbook.com/combo/3011-4651/), [`386-3011`](https://commanderspellbook.com/combo/386-3011/), [`3011-4179`](https://commanderspellbook.com/combo/3011-4179/), [`731-3011`](https://commanderspellbook.com/combo/731-3011/)

#### Library-size finishers (Brion Stoutarm + Body of Research; Enter the Infinite + Psychic Corrosion)
**Priority:** Low · **Variants:** 2 · **Popularity:** 3,032 (EDHREC decks, summed)
- **Most popular variant:** [`953-4032`](https://commanderspellbook.com/combo/953-4032/): Enter the Infinite | Psychic Corrosion
- **Generator combo IDs:** `4658`, `14697`
- **The database says now:**
  > *Notable prerequisites:* Number of cards in library is at least half of the highest number of cards among opponents' libraries. / {8}{U}{U}{U}{U} availabe.
- **Widget math:** Body of Research's power = your library size, so it's lethal when that ≥ the opponent's life. Psychic Corrosion mills 2 per card drawn, so you need library ≥ half the largest opponent library.
- **Other variants (1):** [`648-5253`](https://commanderspellbook.com/combo/648-5253/)

#### Will, Scion of Peace + Debt to the Deathless + Beacon of Immortality
**Priority:** Low · **Variants:** 1 · **Popularity:** 1,217 (EDHREC decks, summed)
- **Most popular variant:** [`698-805-4996`](https://commanderspellbook.com/combo/698-805-4996/): Will, Scion of Peace | Debt to the Deathless | Beacon of Immortality
- **Generator combo IDs:** `20910`
- **The database says now:**
  > *Mana needed:* {5}{W}{W}{W}{B}{B}
  > *Notable prerequisites:* Your life total is equal to or greater than half the highest life total among your opponents, rounded up.
- **Widget math:** Beacon doubles your life, so X = life gained = your life L; each opponent loses 2L. Lethal when L ≥ ⌈highest opponent life / 2⌉.
- **Check:** Matches the database.

#### Hallar, the Firefletcher + an infect enabler (Grafted Exoskeleton, Triumph of the Hordes, Phyresis, Tainted Strike, …)
**Priority:** Low · **Variants:** 6 · **Popularity:** 175 (EDHREC decks, summed)
- **Most popular variant:** [`1880-3681--147`](https://commanderspellbook.com/combo/1880-3681--147/): Hallar, the Firefletcher | Grafted Exoskeleton
- **Generator combo IDs:** `32612`
- **The database says now:**
  > *Notable prerequisites:* Hallar has a number of +1/+1 counters on it equal to or greater than 9 minus the smallest number of poison counters an opponent has.
- **Widget math:** Each kicked spell adds a counter and Hallar deals that many infect damage: counters ≥ 9 − the smallest poison count among opponents.
- **Other variants (5):** [`1880-4179--147`](https://commanderspellbook.com/combo/1880-4179--147/), [`1880-4651--147`](https://commanderspellbook.com/combo/1880-4651--147/), [`731-1880--147`](https://commanderspellbook.com/combo/731-1880--147/), [`1218-1880--147`](https://commanderspellbook.com/combo/1218-1880--147/), [`386-1880--147`](https://commanderspellbook.com/combo/386-1880--147/)

#### Eternity Vessel + Dragonspark Reactor (+ Dismantle or Fate Transfer)
**Priority:** Low · **Variants:** 3 · **Popularity:** 100 (EDHREC decks, summed)
- **Most popular variant:** [`1870-3190-3316`](https://commanderspellbook.com/combo/1870-3190-3316/): Eternity Vessel | Dragonspark Reactor | Dismantle
- **Generator combo IDs:** `20020`, `20021`, `20022`
- **The database says now:**
  > *Mana needed:* {6}{R}
  > *Notable prerequisites:* The number of charge counters on Eternity Vessel plus the number of charge counters on Dragonspark Reactor is greater than or equal to an opponent's life total.
- **Widget math:** Charge counters on Eternity Vessel + Dragonspark Reactor ≥ an opponent's life total.
- **Other variants (2):** [`1011-1870-3190-4694`](https://commanderspellbook.com/combo/1011-1870-3190-4694/), [`1011-1870-3190-4241`](https://commanderspellbook.com/combo/1011-1870-3190-4241/)

#### Ingris Stingerquill + Plague of Vermin
**Priority:** Low · **Variants:** 1 · **Popularity:** 94 (EDHREC decks, summed)
- **Most popular variant:** [`5035-8159`](https://commanderspellbook.com/combo/5035-8159/): Ingris Stingerquill | Plague of Vermin
- **Generator combo IDs:** `33984`
- **The database says now:**
  > *Easy prerequisites:* Your life total is 2 or higher.
  > *Notes:* It's recommended to execute this combo when the number of creatures you control that can attack plus (your life total - 1) is greater than or equal to the highest life total among your opponents.
- **Widget math:** Pay life for Rats, then each attacker pings every opponent: lethal when attacking creatures + (life − 1) ≥ highest opponent life (from the Notes).

#### Cacophodon + Hammerfist Giant + Heroic Intervention / Avacyn
**Priority:** Low · **Variants:** 2 · **Popularity:** 14 (EDHREC decks, summed)
- **Most popular variant:** [`3614-4831-4849`](https://commanderspellbook.com/combo/3614-4831-4849/): Cacophodon | Hammerfist Giant | Heroic Intervention
- **Generator combo IDs:** `12703`, `12705`
- **The database says now:**
  > *Mana needed:* {1}{G}
  > *Notable prerequisites:* Your life total is at least four greater than each opponent's life total.
- **Widget math:** Each activation deals 4 damage to every player. Exact requirement: your life ≥ 4·⌈highest opponent life / 4⌉ + 1, versus the database's simpler "4 more than each opponent".
- **Other variants (1):** [`3149-4831-4849`](https://commanderspellbook.com/combo/3149-4831-4849/)

#### Hive Mind + Revival // Revenge + Tainted Remedy / Rain of Gore
**Priority:** Low · **Variants:** 2 · **Popularity:** 5 (EDHREC decks, summed)
- **Most popular variant:** [`759-1371-4624`](https://commanderspellbook.com/combo/759-1371-4624/): Hive Mind | Revival // Revenge | Tainted Remedy
- **Generator combo IDs:** `15043`, `15044`
- **The database says now:**
  > *Mana needed:* {4}{W}{B}
  > *Notable prerequisites:* Your life total is equal to or greater than 2^X, where X is the number of opponents you have.
- **Widget math:** Every opponent's copy halves your life (rounded up) once, so you need life ≥ 2^opponents.
- **Other variants (1):** [`179-1371-4624`](https://commanderspellbook.com/combo/179-1371-4624/)

#### Tireless Tribe + Inside Out
**Priority:** Low · **Variants:** 1 · **Popularity:** 2 (EDHREC decks, summed)
- **Most popular variant:** [`1653-7814`](https://commanderspellbook.com/combo/1653-7814/): Tireless Tribe | Inside Out
- **Generator combo IDs:** `33349`
- **The database says now:**
  > *Notable prerequisites:* An opponent cannot block Tireless Tribe.
  > *Notes:* It's recommended to start the combo having a number of cards in hand equal to (X-5)/4, rounded up, where X is the opponent's life total.
- **Widget math:** Each discard adds 4 power after the switch: cards in hand besides Inside Out ≥ ⌈(opponent life − 5) / 4⌉ (from the Notes).

#### Cosmogoyf + Jarad, Golgari Lich Lord + Arc-Slogger
**Priority:** Low · **Variants:** 1 · **Popularity:** 2 (EDHREC decks, summed)
- **Most popular variant:** [`182-6907-6908`](https://commanderspellbook.com/combo/182-6907-6908/): Cosmogoyf | Jarad, Golgari Lich Lord | Arc-Slogger
- **Generator combo IDs:** `31236`
- **The database says now:**
  > *Mana needed:* {1}{B}{G} plus an additional amount of {R}
  > *Notes:* The amount of {R} needed is recommended to be equal to your deck size divided by 10 (rounded up) or equal to (the largest life total among your opponents - the number of cards you own in exile)/10, rounded up - whichever is less. This will ensure you cause ma…
- **Widget math:** Each {R} exiles 10 cards (+10 power) and deals 2 damage. {R} needed = min(⌈deck size / 10⌉, ⌈(largest opponent life − cards you own in exile) / 10⌉) (from the Notes).

## 5. Drain loops: life per loop from devotion, opponents and extort

**Widget id:** `drain-loop`

**Widget:** inputs devotion to black, number of opponents and (for extort) creatures with extort. Outputs the starting life needed (best step order), the net life per loop and the drain per opponent per loop. Every one of these combos hard-codes a single devotion/opponent case in its prerequisites.

#### K'rrik + Chainer, Dementia Master + Gray Merchant of Asphodel + Viscera Seer + Buried Alive + Animate Dead / Necromancy / Reanimate
**Priority:** High · **Variants:** 3 · **Popularity:** 6,774 (EDHREC decks, summed)
- **Most popular variant:** [`328-1377-2292-3211-3260-4078`](https://commanderspellbook.com/combo/328-1377-2292-3211-3260-4078/): K'rrik, Son of Yawgmoth | Buried Alive | Reanimate | Chainer, Dementia Master | Viscera Seer | Gray Merchant of Asphodel
- **Generator combo IDs:** `882`, `884`, `886`
- **The database says now:**
  > *Mana needed:* {2}
  > *Notable prerequisites:* Your life total is at least 23. / Your devotion to black is at least ten or you have at least two opponents.
- **Widget math:** Each loop: Chainer returns Gray Merchant for 9 life ({B}{B}{B} via K'rrik + 3), Gray Merchant drains devotion × opponents. Before the first drain you pay Buried Alive 2 + reanimation spell 2 (+ Reanimate 2 and 5 for Chainer's mana value) + one or two Chainer activations. Net per loop = devotion × opponents − 9.

| Devotion × opponents (drain per loop) | 9 | 10 | 12 | 14 | 18 | 27 |
|---|---:|---:|---:|---:|---:|---:|
| Animate Dead / Necromancy, Viscera Seer first (as written) | 23 | 23 | 23 | 23 | 23 | 23 |
| Animate Dead / Necromancy, Gray Merchant first | 23 | 22 | 20 | 18 | 14 | 14 |
| Reanimate, Viscera Seer first (as written) | 28 | 28 | 28 | 28 | 28 | 28 |
| Reanimate, Gray Merchant first | 28 | 27 | 25 | 23 | 19 | 19 |
| Net life per loop | +0 | +1 | +3 | +5 | +9 | +18 |

- **Check:** The database's 18 (23 with Reanimate) is only enough when Gray Merchant is returned before Viscera Seer and devotion × opponents is at least 14; see [R8](#r8).
- **Other variants (2):** [`328-2292-3211-3260-4078-4812`](https://commanderspellbook.com/combo/328-2292-3211-3260-4078-4812/), [`328-2292-2896-3211-3260-4078`](https://commanderspellbook.com/combo/328-2292-2896-3211-3260-4078/)

#### Chainer, Dementia Master + K'rrik + Gray Merchant of Asphodel + a sacrifice outlet (Dimir House Guard, Sadistic Hypnotist, Spawning Pit)
**Priority:** Medium · **Variants:** 3 · **Popularity:** 7,676 (EDHREC decks, summed)
- **Most popular variant:** [`328-3260-4078-4448`](https://commanderspellbook.com/combo/328-3260-4078-4448/): Chainer, Dementia Master | K'rrik, Son of Yawgmoth | Gray Merchant of Asphodel | Dimir House Guard
- **Generator combo IDs:** `2359`, `2395`, `2397`, `2398`
- **The database says now:**
  > *Notable prerequisites:* Your life total is at least ten. / Your devotion to black is at least ten or you have at least two opponents.
- **Widget math:** Each loop: 9 life to return Gray Merchant, then drain devotion × opponents. Needs 10 life; net per loop = devotion × opponents − 9 (positive from 10).
- **Check:** Matches the database.
- **Other variants (2):** [`28-328-3260-4078`](https://commanderspellbook.com/combo/28-328-3260-4078/), [`328-3260-3899-4078`](https://commanderspellbook.com/combo/328-3260-3899-4078/)

#### K'rrik + Chainer, Dementia Master + Kokusho, the Evening Star + Viscera Seer + Buried Alive + Animate Dead / Necromancy / Reanimate
**Priority:** Medium · **Variants:** 3 · **Popularity:** 1,773 (EDHREC decks, summed)
- **Most popular variant:** [`1377-2123-2292-3211-3260-4078`](https://commanderspellbook.com/combo/1377-2123-2292-3211-3260-4078/): K'rrik, Son of Yawgmoth | Buried Alive | Reanimate | Chainer, Dementia Master | Viscera Seer | Kokusho, the Evening Star
- **Generator combo IDs:** `883`, `885`, `887`
- **The database says now:**
  > *Mana needed:* {2}
  > *Notable prerequisites:* Your life total is at least 23. / Your devotion to black is at least ten or you have at least two opponents.
- **Widget math:** Kokusho drains 5 × opponents when it dies, so Viscera Seer has to be on the battlefield first. Life needed is 23 (28 with Reanimate) whatever the table size; net per loop = 5 × opponents − 9, so it needs 2+ opponents.
- **Check:** The database says 18 (23 with Reanimate); see [R8](#r8).
- **Other variants (2):** [`2123-2292-3211-3260-4078-4812`](https://commanderspellbook.com/combo/2123-2292-3211-3260-4078-4812/), [`2123-2292-2896-3211-3260-4078`](https://commanderspellbook.com/combo/2123-2292-2896-3211-3260-4078/)

#### K'rrik + Leshrac's Sigil + Pontiff of Blight
**Priority:** Medium · **Variants:** 1 · **Popularity:** 681 (EDHREC decks, summed)
- **Most popular variant:** [`1698-2903-3260`](https://commanderspellbook.com/combo/1698-2903-3260/): K'rrik, Son of Yawgmoth | Leshrac's Sigil | Pontiff of Blight
- **Generator combo IDs:** `4664`
- **The database says now:**
  > *Easy prerequisites:* You have at least 7 life. / You have at least three opponents.
  > *Notable prerequisites:* You control at least six additional creatures.
- **Widget math:** E creatures with extort, N opponents: each loop pays 8 life for Leshrac's Sigil, and each extort pays 2 and drains N. Net per loop = E·(N − 2) − 8; each opponent loses E per loop.
- **Check:** Matches the database (8 extorters, 3 opponents: net 0, 8 drained per opponent per loop).

#### K'rrik + Pontiff of Blight + Mourning + Helm of Awakening
**Priority:** Medium · **Variants:** 22 · **Popularity:** 56 (EDHREC decks, summed)
- **Most popular variant:** [`1594-1698-3260-3540`](https://commanderspellbook.com/combo/1594-1698-3260-3540/): K'rrik, Son of Yawgmoth | Pontiff of Blight | Mourning | Helm of Awakening
- **Generator combo IDs:** `28855`
- **The database says now:**
  > *Mana needed:* {B/P} plus either {W/B} or {B/P}
  > *Notable prerequisites:* You control at least four creatures. / You have at least three opponents.
- **Widget math:** Same with Mourning (4 life per loop): net per loop = E·(N − 2) − 4. The Notes already say it stops working below three opponents.
- **Check:** Matches the database.
- <details><summary><b>Other variants (21)</b></summary>

  [`501-1698-3260-3540`](https://commanderspellbook.com/combo/501-1698-3260-3540/), [`1698-3260-3540-6580`](https://commanderspellbook.com/combo/1698-3260-3540-6580/), [`1698-2146-3260-3540`](https://commanderspellbook.com/combo/1698-2146-3260-3540/), [`1698-2427-3260-3540`](https://commanderspellbook.com/combo/1698-2427-3260-3540/), [`1698-2510-3260-3540`](https://commanderspellbook.com/combo/1698-2510-3260-3540/), [`1698-2350-3260-3540`](https://commanderspellbook.com/combo/1698-2350-3260-3540/), [`1698-3260-3540-4030`](https://commanderspellbook.com/combo/1698-3260-3540-4030/), [`1698-3260-3540-4668`](https://commanderspellbook.com/combo/1698-3260-3540-4668/), [`1698-3260-3540-5645`](https://commanderspellbook.com/combo/1698-3260-3540-5645/), [`1698-3260-3540-5901`](https://commanderspellbook.com/combo/1698-3260-3540-5901/), [`1698-3260-3540-5930`](https://commanderspellbook.com/combo/1698-3260-3540-5930/), [`1698-3260-3540-6121`](https://commanderspellbook.com/combo/1698-3260-3540-6121/), [`1698-3260-3540-6259`](https://commanderspellbook.com/combo/1698-3260-3540-6259/), [`1698-3260-3540-6556`](https://commanderspellbook.com/combo/1698-3260-3540-6556/), [`1698-3260-3540-6595`](https://commanderspellbook.com/combo/1698-3260-3540-6595/), [`1698-3260-3540-6747`](https://commanderspellbook.com/combo/1698-3260-3540-6747/), [`1698-3260-3540-7010`](https://commanderspellbook.com/combo/1698-3260-3540-7010/), [`1698-3260-3540-7056`](https://commanderspellbook.com/combo/1698-3260-3540-7056/), [`1698-3260-3540-7753`](https://commanderspellbook.com/combo/1698-3260-3540-7753/), [`341-1698-3260-3540`](https://commanderspellbook.com/combo/341-1698-3260-3540/), [`392-1698-3260-3540`](https://commanderspellbook.com/combo/392-1698-3260-3540/)

  </details>

#### Gray Merchant of Asphodel + Blood Celebrant + Phyrexian Reclamation + K'rrik + Ashnod's / Phyrexian Altar
**Priority:** Low · **Variants:** 2 · **Popularity:** 396 (EDHREC decks, summed)
- **Most popular variant:** [`328-2034-2358-2693-3260`](https://commanderspellbook.com/combo/328-2034-2358-2693-3260/): Gray Merchant of Asphodel | Blood Celebrant | Phyrexian Reclamation | Ashnod's Altar | K'rrik, Son of Yawgmoth
- **Generator combo IDs:** `696`, `697`
- **The database says now:**
  > *Mana needed:* {3}
  > *Notable prerequisites:* Your life total is at least 5. / You have at least three opponents.
- **Widget math:** Life paid per loop: Gray Merchant 4 + Phyrexian Reclamation 4 + Blood Celebrant 3 per mana still needed (2 activations with Ashnod's Altar, 3 with Phyrexian Altar), so 14 or 17 life per loop. Net per loop = devotion × opponents − 14 (Ashnod's) or − 17 (Phyrexian).
- **Check:** The Phyrexian Altar version undercounts Blood Celebrant; see [R12](#r12).
- **Other variants (1):** [`328-2358-2693-3260-4050`](https://commanderspellbook.com/combo/328-2358-2693-3260-4050/)

## 6. Costs that scale with a creature's power, counters or loyalty

**Widget id:** `stat-scaled-cost`

**Widget:** input the relevant number (power, +1/+1 counters, toughness, loyalty, other planeswalkers). Output the mana or life needed, or the number of activations. Several of these already carry a lookup table in their Notes that the widget would make interactive.

#### Combos using Animar, Soul of Elements as the cost reducer
**Priority:** High · **Variants:** 25 · **Popularity:** 12,796 (EDHREC decks, summed)
- **Most popular variant:** [`2-3771`](https://commanderspellbook.com/combo/2-3771/): Ancestral Statue | Animar, Soul of Elements
- **Generator combo IDs:** `35`, `14896`, `30387`, `31270`, `31271`, `31297`, `31614`, `31615`, `32324`, `32408`
- **The database says now:**
  > *Notes:* You can start the combo if Animar has fewer +1/+1 counters on it, but will need to provide mana to compensate.
- **Widget math:** Each creature spell costs {1} less per +1/+1 counter on Animar, and each cast adds a counter. With Ancestral Statue ({4}) the total starting mana is Σ max(0, 4 − counters − k + 1) over successive casts: 10 / 6 / 3 / 1 / 0 for 0 / 1 / 2 / 3 / 4+ counters. The other variants spell out their own reduction in the Notes (e.g. +{3} at 0 counters, +{1} at 1).
- **Check:** The Ancestral Statue variant has no mana requirement at all, only "provide mana to compensate" in the Notes.
- <details><summary><b>Other variants (24)</b></summary>

  [`3771-6867-7043`](https://commanderspellbook.com/combo/3771-6867-7043/), [`3771-6867-6869`](https://commanderspellbook.com/combo/3771-6867-6869/), [`3771-6867-6884`](https://commanderspellbook.com/combo/3771-6867-6884/), [`3771-6869-6884`](https://commanderspellbook.com/combo/3771-6869-6884/), [`3771-6867-7042`](https://commanderspellbook.com/combo/3771-6867-7042/), [`876-3771-7070`](https://commanderspellbook.com/combo/876-3771-7070/), [`1824-3771-4549`](https://commanderspellbook.com/combo/1824-3771-4549/), [`273-3771-7070`](https://commanderspellbook.com/combo/273-3771-7070/), [`1069-3771-7070`](https://commanderspellbook.com/combo/1069-3771-7070/), [`141-3771-7101`](https://commanderspellbook.com/combo/141-3771-7101/), [`141-3771-7302`](https://commanderspellbook.com/combo/141-3771-7302/), [`147-3771-7300`](https://commanderspellbook.com/combo/147-3771-7300/), [`2060-3771-4415-6930`](https://commanderspellbook.com/combo/2060-3771-4415-6930/), [`2060-3771-4518-6930`](https://commanderspellbook.com/combo/2060-3771-4518-6930/), [`2060-3771-4770-6930`](https://commanderspellbook.com/combo/2060-3771-4770-6930/), [`2191-3771-7070`](https://commanderspellbook.com/combo/2191-3771-7070/), [`2816-3771-7070`](https://commanderspellbook.com/combo/2816-3771-7070/), [`3771-4217-7101`](https://commanderspellbook.com/combo/3771-4217-7101/), [`3771-4217-7300`](https://commanderspellbook.com/combo/3771-4217-7300/), [`3771-4484-4871-5643-5686`](https://commanderspellbook.com/combo/3771-4484-4871-5643-5686/), [`3771-4955-7070`](https://commanderspellbook.com/combo/3771-4955-7070/), [`3771-5638-7070`](https://commanderspellbook.com/combo/3771-5638-7070/), [`3771-5639-7070`](https://commanderspellbook.com/combo/3771-5639-7070/), [`703-3771-7012`](https://commanderspellbook.com/combo/703-3771-7012/)

  </details>

#### Teferi, Master of Time / Huatli, Radiant Champion + Ichormoon Gauntlet
**Priority:** Medium · **Variants:** 5 · **Popularity:** 37,968 (EDHREC decks, summed)
- **Most popular variant:** [`1124-1543-2247`](https://commanderspellbook.com/combo/1124-1543-2247/): Teferi, Master of Time | Ichormoon Gauntlet | The Chain Veil
- **Generator combo IDs:** `20103`, `20104`, `21541`, `21710`, `21711`
- **The database says now:**
  > *Mana needed:* {4} each turn
  > *Notable prerequisites:* You control at least two other planeswalkers. / Teferi has an amount of loyalty counters on it equal to eleven minus twice the number of other planeswalkers you control.
- **Widget math:** Loyalty needed on Teferi = 11 − 2 × other planeswalkers (11 − other planeswalkers with Rowan's Talent); Huatli: creatures + 2 × other planeswalkers ≥ 11.
- **Other variants (4):** [`1543-2247-2369`](https://commanderspellbook.com/combo/1543-2247-2369/), [`652-1543-2247`](https://commanderspellbook.com/combo/652-1543-2247/), [`1543-2311-2369`](https://commanderspellbook.com/combo/1543-2311-2369/), [`1124-1543-2311`](https://commanderspellbook.com/combo/1124-1543-2311/)

#### Mechanized Production finishers (Obeka, Splitter of Seconds; Ant-Man, Elusive Avenger; Azor's Elocutors + Obeka)
**Priority:** Medium · **Variants:** 3 · **Popularity:** 11,946 (EDHREC decks, summed)
- **Most popular variant:** [`2047-5471`](https://commanderspellbook.com/combo/2047-5471/): Obeka, Splitter of Seconds | Mechanized Production
- **Generator combo IDs:** `28976`, `31616`, `33160`
- **The database says now:**
  > *Notable prerequisites:* Obeka's power is greater than or equal to 8 minus the number of artifacts you control that share a name with the artifact that has Mechanized Production attached. / An opponent cannot block Obeka.
- **Widget math:** Upkeeps gained = power, and Mechanized Production needs 8 artifacts sharing a name: Obeka's power ≥ 8 − copies already owned; Ant-Man ≥ 8 − Treasures (− 1 if it's attached to a Treasure); with Azor's Elocutors power ≥ 5 − filibuster counters.
- **Other variants (2):** [`2047-7748`](https://commanderspellbook.com/combo/2047-7748/), [`5471-6217`](https://commanderspellbook.com/combo/5471-6217/)

#### Greven, Predator Captain + a pay-life outlet (Wall of Blood, Treasonous Ogre, Immolating Souleater, Necropotence, … or Fire Covenant)
**Priority:** Medium · **Variants:** 27 · **Popularity:** 5,464 (EDHREC decks, summed)
- **Most popular variant:** [`2749-4567`](https://commanderspellbook.com/combo/2749-4567/): Greven, Predator Captain | Wall of Blood
- **Generator combo IDs:** `19714`, `19717`
- **The database says now:**
  > *Notable prerequisites:* Your life total is at least 22 minus Greven's power.
- **Widget math:** Greven gets +1/+0 per life lost this turn and needs 21 power for commander damage. With an outlet paying c life per activation you lose c·⌈(21 − power) / c⌉, so life ≥ c·⌈(21 − power) / c⌉ + 1 (22 − power for 1-life outlets and Fire Covenant). Useful extra inputs: commander damage already dealt by Greven (needs 21 − that) and the opponent's life (normal damage may already be enough).
- **Check:** Correct for the 1-life outlets and Fire Covenant; the roundings written for 2-, 3-, 4- and 8-life outlets are wrong, several of them too low. See [R13](#r13).
- <details><summary><b>Other variants (26)</b></summary>

  [`4567-5174`](https://commanderspellbook.com/combo/4567-5174/), [`1203-4567`](https://commanderspellbook.com/combo/1203-4567/), [`4567-5313`](https://commanderspellbook.com/combo/4567-5313/), [`4567-4860`](https://commanderspellbook.com/combo/4567-4860/), [`791-4567`](https://commanderspellbook.com/combo/791-4567/), [`2852-4567`](https://commanderspellbook.com/combo/2852-4567/), [`2358-4567`](https://commanderspellbook.com/combo/2358-4567/), [`3591-4567`](https://commanderspellbook.com/combo/3591-4567/), [`4567-6735`](https://commanderspellbook.com/combo/4567-6735/), [`2063-4567`](https://commanderspellbook.com/combo/2063-4567/), [`4417-4567`](https://commanderspellbook.com/combo/4417-4567/), [`4567-6733`](https://commanderspellbook.com/combo/4567-6733/), [`4567-6731`](https://commanderspellbook.com/combo/4567-6731/), [`4567-6732`](https://commanderspellbook.com/combo/4567-6732/), [`1745-4567`](https://commanderspellbook.com/combo/1745-4567/), [`4567-6736`](https://commanderspellbook.com/combo/4567-6736/), [`4567-7688`](https://commanderspellbook.com/combo/4567-7688/), [`558-4567`](https://commanderspellbook.com/combo/558-4567/), [`1839-4567`](https://commanderspellbook.com/combo/1839-4567/), [`3238-4567`](https://commanderspellbook.com/combo/3238-4567/), [`4567-6734`](https://commanderspellbook.com/combo/4567-6734/), [`4567-7074`](https://commanderspellbook.com/combo/4567-7074/), [`13-4567`](https://commanderspellbook.com/combo/13-4567/), [`2935-4567`](https://commanderspellbook.com/combo/2935-4567/), [`3527-4567`](https://commanderspellbook.com/combo/3527-4567/), [`3859-4567`](https://commanderspellbook.com/combo/3859-4567/)

  </details>

#### Mayael's Aria + a power doubler (Tyvar, the Pummeler, Targ Nar, Chameleon Colossus, Casey Jones, Junk Jet)
**Priority:** Medium · **Variants:** 5 · **Popularity:** 1,001 (EDHREC decks, summed)
- **Most popular variant:** [`3858-6864`](https://commanderspellbook.com/combo/3858-6864/): Mayael's Aria | Chameleon Colossus
- **Generator combo IDs:** `28308`, `28829`, `30553`, `31026`, `32354`
- **The database says now:**
  > *Mana needed:* {6} plus six {G}
  > *Notes:* The mana prerequisite assumes Chameleon Colossus has 4 power when executing the combo. If it has more power, the mana cost will be reduced accordingly.
- **Widget math:** Mayael's Aria adds a +1/+1 counter before its win check, so the creature needs power 19. Activations n = ⌈log2(19 / power)⌉ (0 at 19+); cost n × the activation ({3}{G}{G}, {2}{R}{G}, {2}{G}{G}, {4}, or {3} plus an artifact).
- **Check:** Matches the tables in the Tyvar and Targ Nar Notes (Chameleon Colossus aims at 20 and only differs at power 19).
- **Other variants (4):** [`3858-6189`](https://commanderspellbook.com/combo/3858-6189/), [`3858-6008`](https://commanderspellbook.com/combo/3858-6008/), [`3858-6729`](https://commanderspellbook.com/combo/3858-6729/), [`3858-7326`](https://commanderspellbook.com/combo/3858-7326/)

#### Runaway Steam-Kin loops
**Priority:** Low · **Variants:** 19 · **Popularity:** 8,242 (EDHREC decks, summed)
- **Most popular variant:** [`411-3101`](https://commanderspellbook.com/combo/411-3101/): Grinning Ignus | Runaway Steam-Kin
- **Generator combo IDs:** `1953`, `3363`, `21982`, `21983`, `24107`, `24172`, `24982`, `26982`, `28054`, `28279`, `28280`, `28681`, `28682`, `29424`, `30970`, `32901`
- **The database says now:**
  > *Mana needed:* {2}{R} plus an additional amount of {R} available equal to three minus the number of +1/+1 counters on Runaway Steam-Kin
- **Widget math:** Starting red mana = 3 − the +1/+1 counters on Runaway Steam-Kin (it removes three counters for {R}{R}{R} once full).
- <details><summary><b>Other variants (18)</b></summary>

  [`1368-2172-3101`](https://commanderspellbook.com/combo/1368-2172-3101/), [`2421-3101-3705-5231`](https://commanderspellbook.com/combo/2421-3101-3705-5231/), [`2421-3101-3705-4050`](https://commanderspellbook.com/combo/2421-3101-3705-4050/), [`3101-3705-5231-5997`](https://commanderspellbook.com/combo/3101-3705-5231-5997/), [`3101-3705-4050-5997`](https://commanderspellbook.com/combo/3101-3705-4050-5997/), [`1235-3101-4867`](https://commanderspellbook.com/combo/1235-3101-4867/), [`2871-3101-3199`](https://commanderspellbook.com/combo/2871-3101-3199/), [`2100-3101-6259`](https://commanderspellbook.com/combo/2100-3101-6259/), [`3101-3940-6259`](https://commanderspellbook.com/combo/3101-3940-6259/), [`2959-3101-4867`](https://commanderspellbook.com/combo/2959-3101-4867/), [`3101-4867-5487`](https://commanderspellbook.com/combo/3101-4867-5487/), [`2871-3101-6259`](https://commanderspellbook.com/combo/2871-3101-6259/), [`3101-4050-5920`](https://commanderspellbook.com/combo/3101-4050-5920/), [`967-3101-5258-5618-6131`](https://commanderspellbook.com/combo/967-3101-5258-5618-6131/), [`3101-3199-3209`](https://commanderspellbook.com/combo/3101-3199-3209/), [`3101-4871-5258-5618-6131`](https://commanderspellbook.com/combo/3101-4871-5258-5618-6131/), [`413-2302-3101-3440-4867`](https://commanderspellbook.com/combo/413-2302-3101-3440-4867/), [`618-3101-4456-7494`](https://commanderspellbook.com/combo/618-3101-4456-7494/)

  </details>

#### Workhorse + Grenzo, Dungeon Warden + Tomb Trawler
**Priority:** Low · **Variants:** 7 · **Popularity:** 7,449 (EDHREC decks, summed)
- **Most popular variant:** [`1799-5296-5496`](https://commanderspellbook.com/combo/1799-5296-5496/): Grenzo, Dungeon Warden | Workhorse | Tomb Trawler
- **Generator combo IDs:** `27962`
- **The database says now:**
  > *Mana needed:* {4} minus {1} for each +1/+1 counter on Workhorse
- **Widget math:** Starting mana = {4} minus the +1/+1 counters on Workhorse.
- **Other variants (6):** [`1799-5296-5795`](https://commanderspellbook.com/combo/1799-5296-5795/), [`1799-5296-5497`](https://commanderspellbook.com/combo/1799-5296-5497/), [`1799-2048-5296`](https://commanderspellbook.com/combo/1799-2048-5296/), [`49-1799-5296`](https://commanderspellbook.com/combo/49-1799-5296/), [`1799-5296-6005`](https://commanderspellbook.com/combo/1799-5296-6005/), [`275-1799-5296`](https://commanderspellbook.com/combo/275-1799-5296/)

#### Incubation Druid + Agatha's Soul Cauldron + Devoted Druid (or another untapper)
**Priority:** Low · **Variants:** 3 · **Popularity:** 4,358 (EDHREC decks, summed)
- **Most popular variant:** [`3990-4613-4762`](https://commanderspellbook.com/combo/3990-4613-4762/): Devoted Druid | Agatha's Soul Cauldron | Incubation Druid
- **Generator combo IDs:** `29895`, `29896`, `29897`
- **The database says now:**
  > *Mana needed:* {3}{G}{G} minus {1}{G}{G} for each +1/+1 counter on Incubation Druid
- **Widget math:** Starting mana = {3}{G}{G} minus {1}{G}{G} per +1/+1 counter on Incubation Druid ({0} with 2 or more).
- **Other variants (2):** [`1242-3990-4613`](https://commanderspellbook.com/combo/1242-3990-4613/), [`2335-3990-4613`](https://commanderspellbook.com/combo/2335-3990-4613/)

#### Other power-based costs (Ezio + Tree of Perdition; The Dominion Bracelet + Karn + Displacer Kitten; Jackal, Genius Geneticist; Helga, Skittish Seer)
**Priority:** Low · **Variants:** 4 · **Popularity:** 3,651 (EDHREC decks, summed)
- **Most popular variant:** [`2615-5712`](https://commanderspellbook.com/combo/2615-5712/): Ezio Auditore da Firenze | Tree of Perdition
- **Generator combo IDs:** `27271`, `28057`, `31001`, `32889`
- **The database says now:**
  > *Mana needed:* {W}{U}{B}{R}{G}
  > *Notable prerequisites:* Tree of Perdition's toughness is equal to or less than 10 plus Ezio's power. / An opponent cannot block Ezio.
- **Widget math:** Tree of Perdition's toughness ≤ 10 + Ezio's power; {X} each turn with X = 14 − greatest power; {X} = Jackal's power − 1; generic mana = {7} − Helga's power.
- **Other variants (3):** [`3542-4067-5922`](https://commanderspellbook.com/combo/3542-4067-5922/), [`1170-5089-6855`](https://commanderspellbook.com/combo/1170-5089-6855/), [`1027-7611-7612`](https://commanderspellbook.com/combo/1027-7611-7612/)

#### Haldir, Lórien Lieutenant + Devoted Druid
**Priority:** Low · **Variants:** 1 · **Popularity:** 3,040 (EDHREC decks, summed)
- **Most popular variant:** [`4762-6315`](https://commanderspellbook.com/combo/4762-6315/): Haldir, Lórien Lieutenant | Devoted Druid
- **Generator combo IDs:** `29311`
- **The database says now:**
  > *Mana needed:* {5} minus {X}, where X is Devoted Druid's toughness minus one
  > *Notable prerequisites:* Haldir has at least six +1/+1 counters on it.
- **Widget math:** Starting mana = {5} minus (Devoted Druid's toughness − 1).

#### Mana creature + pump-and-untap (Topiary Lecturer + Umbral Mantle; Mona Lisa, Science Geek + Seedcradle Witch)
**Priority:** Low · **Variants:** 2 · **Popularity:** 1,189 (EDHREC decks, summed)
- **Most popular variant:** [`2816-7488`](https://commanderspellbook.com/combo/2816-7488/): Umbral Mantle | Topiary Lecturer
- **Generator combo IDs:** `2725`, `27971`
- **The database says now:**
  > *Mana needed:* {2} at most
  > *Notes:* The amount of mana needed to start is equal to {3} minus Topiary Lecturer's power.
- **Widget math:** Topiary Lecturer: starting mana = {3} − its power. Mona Lisa: {2}{G}{W} − its power, at least {G/W}.
- **Other variants (1):** [`2024-7308`](https://commanderspellbook.com/combo/2024-7308/)

#### Mayael's Aria + Hatred
**Priority:** Low · **Variants:** 1 · **Popularity:** 28 (EDHREC decks, summed)
- **Most popular variant:** [`1877-3858`](https://commanderspellbook.com/combo/1877-3858/): Mayael's Aria | Hatred
- **Generator combo IDs:** `10015`
- **The database says now:**
  > *Mana needed:* {3}{B}{B}
  > *Notable prerequisites:* You control at least one creature. / Your life total is greater than or equal to twenty minus the highest power among creatures you control.
- **Widget math:** Pay X = 19 − greatest power: life ≥ 20 − greatest power.
- **Check:** Matches the database.

## 7. Costs that scale with how many permanents you control

**Widget id:** `count-scaled-cost`

**Widget:** input the number of creatures, artifacts, Clues, Gates, Knights, creatures sharing a type, and so on. Output the mana needed (once, or per turn) and, for Mana Echoes-style loops, the full dip-then-climb mana curve.

#### Affinity-like costs (Kitsa + Blinkmoth Infusion; Rootpath Purifier + Maze's End; Mutagen Man; Knights' Charge + Cavalier of Dawn; James // Follow Him; Officious Interrogation + Mechanized Production)
**Priority:** Medium · **Variants:** 22 · **Popularity:** 15,041 (EDHREC decks, summed)
- **Most popular variant:** [`2047-5443`](https://commanderspellbook.com/combo/2047-5443/): Officious Interrogation | Mechanized Production
- **Generator combo IDs:** `13132`, `13133`, `26229`, `26618`, `28154`, `29604`, `29664`, `29797`, `29860`, `32398`
- **The database says now:**
  > *Mana needed:* {W}{U}, plus an additional {W}{U} per opponent as necessary
  > *Notable prerequisites:* The number of creatures on the battlefield is equal to or greater than eight minus the number of Clue tokens you control.
- **Widget math:** {11}{U}{U} − other artifacts; {12}{G} − unique Gates (and lands ≥ 9 − Gates); {8}{G}{G} − Mutagens (−1 more if attached to a Mutagen); {7}{W}{W}{B}{B} − nontoken Knights; {8}{U}{U} − Clues (−1 more) + commander tax, or +{1} per command-zone cast; Clues created = creatures controlled by the targeted players, with {W}{U} per target.
- <details><summary><b>Other variants (21)</b></summary>

  [`2047-6465`](https://commanderspellbook.com/combo/2047-6465/), [`2047-7343`](https://commanderspellbook.com/combo/2047-7343/), [`4050-4675-6511`](https://commanderspellbook.com/combo/4050-4675-6511/), [`4231-4659-6465`](https://commanderspellbook.com/combo/4231-4659-6465/), [`2473-3063-5094`](https://commanderspellbook.com/combo/2473-3063-5094/), [`457-4659-6465`](https://commanderspellbook.com/combo/457-4659-6465/), [`55-3063-5094`](https://commanderspellbook.com/combo/55-3063-5094/), [`486-3401-5803`](https://commanderspellbook.com/combo/486-3401-5803/), [`3401-4639-5803`](https://commanderspellbook.com/combo/3401-4639-5803/), [`2750-3401-5803`](https://commanderspellbook.com/combo/2750-3401-5803/), [`3263-3401-5803`](https://commanderspellbook.com/combo/3263-3401-5803/), [`662-3401-5803`](https://commanderspellbook.com/combo/662-3401-5803/), [`1781-3401-5803`](https://commanderspellbook.com/combo/1781-3401-5803/), [`2392-3401-5803`](https://commanderspellbook.com/combo/2392-3401-5803/), [`1007-1558-3454-5443`](https://commanderspellbook.com/combo/1007-1558-3454-5443/), [`1379-3401-5803`](https://commanderspellbook.com/combo/1379-3401-5803/), [`3401-5056-5803`](https://commanderspellbook.com/combo/3401-5056-5803/), [`3401-5517-5803`](https://commanderspellbook.com/combo/3401-5517-5803/), [`3401-5776-5803`](https://commanderspellbook.com/combo/3401-5776-5803/), [`549-3401-5803`](https://commanderspellbook.com/combo/549-3401-5803/), [`625-3401-5803`](https://commanderspellbook.com/combo/625-3401-5803/)

  </details>

#### The Legend of Kuruk // Avatar Kuruk extra-turn loops
**Priority:** Medium · **Variants:** 272 · **Popularity:** 4,808 (EDHREC decks, summed)
- **Most popular variant:** [`2719-7009-7012`](https://commanderspellbook.com/combo/2719-7009-7012/): The Legend of Kuruk // Avatar Kuruk | Sakashima of a Thousand Faces | Airbender Ascension
- **Generator combo IDs:** `31546`, `31562`, `31563`, `31564`, `31565`, `31566`, `31567`, `31568`, `32607`
- **The database says now:**
  > *Mana needed:* {20} minus {1} for each creature and artifact you control each turn
- **Widget math:** Each turn the Kuruk activation costs {20} minus {1} per creature and artifact you can tap (plus the listed fixed part). Input: creatures + artifacts. Output: mana per turn.
- <details><summary><b>Other variants (271)</b></summary>

  [`3908-4428-7009`](https://commanderspellbook.com/combo/3908-4428-7009/), [`933-3908-7009`](https://commanderspellbook.com/combo/933-3908-7009/), [`3908-6568-7009`](https://commanderspellbook.com/combo/3908-6568-7009/), [`3908-7009-7068`](https://commanderspellbook.com/combo/3908-7009-7068/), [`1409-3908-7009`](https://commanderspellbook.com/combo/1409-3908-7009/), [`6913-7009-7068`](https://commanderspellbook.com/combo/6913-7009-7068/), [`2719-4428-7009`](https://commanderspellbook.com/combo/2719-4428-7009/), [`6568-6913-7009`](https://commanderspellbook.com/combo/6568-6913-7009/), [`933-6913-7009`](https://commanderspellbook.com/combo/933-6913-7009/), [`3908-7009-7012`](https://commanderspellbook.com/combo/3908-7009-7012/), [`933-2719-7009`](https://commanderspellbook.com/combo/933-2719-7009/), [`2719-7009-7068`](https://commanderspellbook.com/combo/2719-7009-7068/), [`4772-7009-7012`](https://commanderspellbook.com/combo/4772-7009-7012/), [`6913-7009-7012`](https://commanderspellbook.com/combo/6913-7009-7012/), [`4428-6913-7009`](https://commanderspellbook.com/combo/4428-6913-7009/), [`1409-6913-7009`](https://commanderspellbook.com/combo/1409-6913-7009/), [`2719-6568-7009`](https://commanderspellbook.com/combo/2719-6568-7009/), [`1409-2719-7009`](https://commanderspellbook.com/combo/1409-2719-7009/), [`7009-7402`](https://commanderspellbook.com/combo/7009-7402/), [`804-4428-7009`](https://commanderspellbook.com/combo/804-4428-7009/), [`804-7009-7012`](https://commanderspellbook.com/combo/804-7009-7012/), [`2334-3908-7009`](https://commanderspellbook.com/combo/2334-3908-7009/), [`1305-3557-7009`](https://commanderspellbook.com/combo/1305-3557-7009/), [`2334-2719-7009`](https://commanderspellbook.com/combo/2334-2719-7009/), [`804-6568-7009`](https://commanderspellbook.com/combo/804-6568-7009/), [`2334-6913-7009`](https://commanderspellbook.com/combo/2334-6913-7009/), [`3908-3963-7009`](https://commanderspellbook.com/combo/3908-3963-7009/), [`804-7009-7068`](https://commanderspellbook.com/combo/804-7009-7068/), [`933-4772-7009`](https://commanderspellbook.com/combo/933-4772-7009/), [`1369-7009`](https://commanderspellbook.com/combo/1369-7009/), [`804-933-7009`](https://commanderspellbook.com/combo/804-933-7009/), [`933-5361-7009`](https://commanderspellbook.com/combo/933-5361-7009/), [`2963-3908-7009`](https://commanderspellbook.com/combo/2963-3908-7009/), [`4428-5361-7009`](https://commanderspellbook.com/combo/4428-5361-7009/), [`3557-3908-7009`](https://commanderspellbook.com/combo/3557-3908-7009/), [`3963-6913-7009`](https://commanderspellbook.com/combo/3963-6913-7009/), [`5361-6568-7009`](https://commanderspellbook.com/combo/5361-6568-7009/), [`2719-2963-7009`](https://commanderspellbook.com/combo/2719-2963-7009/), [`2719-3557-7009`](https://commanderspellbook.com/combo/2719-3557-7009/), [`1409-5361-7009`](https://commanderspellbook.com/combo/1409-5361-7009/), [`2963-6913-7009`](https://commanderspellbook.com/combo/2963-6913-7009/), [`1409-5963-7009`](https://commanderspellbook.com/combo/1409-5963-7009/), [`804-1409-7009`](https://commanderspellbook.com/combo/804-1409-7009/), [`3908-4499-7009`](https://commanderspellbook.com/combo/3908-4499-7009/), [`6568-6995-7009`](https://commanderspellbook.com/combo/6568-6995-7009/), [`804-2334-7009`](https://commanderspellbook.com/combo/804-2334-7009/), [`2719-4499-7009`](https://commanderspellbook.com/combo/2719-4499-7009/), [`933-5963-7009`](https://commanderspellbook.com/combo/933-5963-7009/), [`4428-6995-7009`](https://commanderspellbook.com/combo/4428-6995-7009/), [`4499-6913-7009`](https://commanderspellbook.com/combo/4499-6913-7009/), [`3908-7009-7638`](https://commanderspellbook.com/combo/3908-7009-7638/), [`5361-7009-7068`](https://commanderspellbook.com/combo/5361-7009-7068/), [`2719-3963-7009`](https://commanderspellbook.com/combo/2719-3963-7009/), [`3557-6913-7009`](https://commanderspellbook.com/combo/3557-6913-7009/), [`804-2963-7009`](https://commanderspellbook.com/combo/804-2963-7009/), [`4428-4772-7009`](https://commanderspellbook.com/combo/4428-4772-7009/), [`2963-4772-7009`](https://commanderspellbook.com/combo/2963-4772-7009/), [`4428-5963-7009`](https://commanderspellbook.com/combo/4428-5963-7009/), [`804-3557-7009`](https://commanderspellbook.com/combo/804-3557-7009/), [`933-6995-7009`](https://commanderspellbook.com/combo/933-6995-7009/), [`2719-7009-7638`](https://commanderspellbook.com/combo/2719-7009-7638/), [`3933-7009-7068`](https://commanderspellbook.com/combo/3933-7009-7068/), [`5361-7009-7012`](https://commanderspellbook.com/combo/5361-7009-7012/), [`5900-5963-7009`](https://commanderspellbook.com/combo/5900-5963-7009/), [`5963-6568-7009`](https://commanderspellbook.com/combo/5963-6568-7009/), [`5902-7009-7012`](https://commanderspellbook.com/combo/5902-7009-7012/), [`5963-7009-7638`](https://commanderspellbook.com/combo/5963-7009-7638/), [`6995-7009-7012`](https://commanderspellbook.com/combo/6995-7009-7012/), [`804-4499-7009`](https://commanderspellbook.com/combo/804-4499-7009/), [`1305-7009-7638`](https://commanderspellbook.com/combo/1305-7009-7638/), [`2665-2719-7009`](https://commanderspellbook.com/combo/2665-2719-7009/), [`804-7009-7638`](https://commanderspellbook.com/combo/804-7009-7638/), [`2334-5361-7009`](https://commanderspellbook.com/combo/2334-5361-7009/), [`3557-5361-7009`](https://commanderspellbook.com/combo/3557-5361-7009/), [`3908-7009-7715`](https://commanderspellbook.com/combo/3908-7009-7715/), [`4772-6568-7009`](https://commanderspellbook.com/combo/4772-6568-7009/), [`5963-7009-7012`](https://commanderspellbook.com/combo/5963-7009-7012/), [`6913-7009-7638`](https://commanderspellbook.com/combo/6913-7009-7638/), [`1305-7009-7012`](https://commanderspellbook.com/combo/1305-7009-7012/), [`2963-6995-7009`](https://commanderspellbook.com/combo/2963-6995-7009/), [`3557-5963-7009`](https://commanderspellbook.com/combo/3557-5963-7009/), [`3908-5900-7009`](https://commanderspellbook.com/combo/3908-5900-7009/), [`3963-5361-7009`](https://commanderspellbook.com/combo/3963-5361-7009/), [`2334-5963-7009`](https://commanderspellbook.com/combo/2334-5963-7009/), [`3557-6995-7009`](https://commanderspellbook.com/combo/3557-6995-7009/), [`5900-5902-7009`](https://commanderspellbook.com/combo/5900-5902-7009/), [`5902-6568-7009`](https://commanderspellbook.com/combo/5902-6568-7009/), [`6995-7009-7638`](https://commanderspellbook.com/combo/6995-7009-7638/), [`1305-2963-7009`](https://commanderspellbook.com/combo/1305-2963-7009/), [`1409-4772-7009`](https://commanderspellbook.com/combo/1409-4772-7009/), [`1434-2665-7009`](https://commanderspellbook.com/combo/1434-2665-7009/), [`2334-4772-7009`](https://commanderspellbook.com/combo/2334-4772-7009/), [`2334-6995-7009`](https://commanderspellbook.com/combo/2334-6995-7009/), [`3963-5963-7009`](https://commanderspellbook.com/combo/3963-5963-7009/), [`4428-5902-7009`](https://commanderspellbook.com/combo/4428-5902-7009/), [`804-3963-7009`](https://commanderspellbook.com/combo/804-3963-7009/), [`933-1305-7009`](https://commanderspellbook.com/combo/933-1305-7009/), [`1305-1409-7009`](https://commanderspellbook.com/combo/1305-1409-7009/), [`1887-7009-7012`](https://commanderspellbook.com/combo/1887-7009-7012/), [`2334-5902-7009`](https://commanderspellbook.com/combo/2334-5902-7009/), [`2963-5963-7009`](https://commanderspellbook.com/combo/2963-5963-7009/), [`3908-4013-7009`](https://commanderspellbook.com/combo/3908-4013-7009/), [`3908-5775-7009`](https://commanderspellbook.com/combo/3908-5775-7009/), [`3908-7009-7309`](https://commanderspellbook.com/combo/3908-7009-7309/), [`3963-6995-7009`](https://commanderspellbook.com/combo/3963-6995-7009/), [`4499-4772-7009`](https://commanderspellbook.com/combo/4499-4772-7009/), [`5361-7009-7638`](https://commanderspellbook.com/combo/5361-7009-7638/), [`5900-6913-7009`](https://commanderspellbook.com/combo/5900-6913-7009/), [`5963-7009-7068`](https://commanderspellbook.com/combo/5963-7009-7068/), [`6913-7009-7309`](https://commanderspellbook.com/combo/6913-7009-7309/), [`6913-7009-7715`](https://commanderspellbook.com/combo/6913-7009-7715/), [`933-5902-7009`](https://commanderspellbook.com/combo/933-5902-7009/), [`1305-2334-7009`](https://commanderspellbook.com/combo/1305-2334-7009/), [`2665-4600-7009`](https://commanderspellbook.com/combo/2665-4600-7009/), [`2963-5361-7009`](https://commanderspellbook.com/combo/2963-5361-7009/), [`3557-4772-7009`](https://commanderspellbook.com/combo/3557-4772-7009/), [`3933-7009-7715`](https://commanderspellbook.com/combo/3933-7009-7715/), [`4772-5900-7009`](https://commanderspellbook.com/combo/4772-5900-7009/), [`4772-7009-7638`](https://commanderspellbook.com/combo/4772-7009-7638/), [`5775-6913-7009`](https://commanderspellbook.com/combo/5775-6913-7009/), [`5963-7009-7309`](https://commanderspellbook.com/combo/5963-7009-7309/), [`6995-7009-7068`](https://commanderspellbook.com/combo/6995-7009-7068/), [`933-1887-7009`](https://commanderspellbook.com/combo/933-1887-7009/), [`1305-4428-7009`](https://commanderspellbook.com/combo/1305-4428-7009/), [`1305-7009-7309`](https://commanderspellbook.com/combo/1305-7009-7309/), [`1409-1446-7009`](https://commanderspellbook.com/combo/1409-1446-7009/), [`1446-2963-7009`](https://commanderspellbook.com/combo/1446-2963-7009/), [`2003-7009-7068`](https://commanderspellbook.com/combo/2003-7009-7068/), [`2719-4013-7009`](https://commanderspellbook.com/combo/2719-4013-7009/), [`2719-7009-7309`](https://commanderspellbook.com/combo/2719-7009-7309/), [`2719-7009-7715`](https://commanderspellbook.com/combo/2719-7009-7715/), [`2963-5902-7009`](https://commanderspellbook.com/combo/2963-5902-7009/), [`3062-4428-7009`](https://commanderspellbook.com/combo/3062-4428-7009/), [`4013-5361-7009`](https://commanderspellbook.com/combo/4013-5361-7009/), [`4883-7009-7068`](https://commanderspellbook.com/combo/4883-7009-7068/), [`5361-5775-7009`](https://commanderspellbook.com/combo/5361-5775-7009/), [`5361-7009-7309`](https://commanderspellbook.com/combo/5361-7009-7309/), [`6995-7009-7715`](https://commanderspellbook.com/combo/6995-7009-7715/), [`804-7009-7309`](https://commanderspellbook.com/combo/804-7009-7309/), [`933-1446-7009`](https://commanderspellbook.com/combo/933-1446-7009/), [`933-3062-7009`](https://commanderspellbook.com/combo/933-3062-7009/), [`1305-6568-7009`](https://commanderspellbook.com/combo/1305-6568-7009/), [`1305-7009-7715`](https://commanderspellbook.com/combo/1305-7009-7715/), [`1446-6568-7009`](https://commanderspellbook.com/combo/1446-6568-7009/), [`1543-7009-7068`](https://commanderspellbook.com/combo/1543-7009-7068/), [`1887-2334-7009`](https://commanderspellbook.com/combo/1887-2334-7009/), [`1887-4013-7009`](https://commanderspellbook.com/combo/1887-4013-7009/), [`1887-6568-7009`](https://commanderspellbook.com/combo/1887-6568-7009/), [`2719-4116-7009`](https://commanderspellbook.com/combo/2719-4116-7009/), [`2719-5775-7009`](https://commanderspellbook.com/combo/2719-5775-7009/), [`3963-5902-7009`](https://commanderspellbook.com/combo/3963-5902-7009/), [`4013-5963-7009`](https://commanderspellbook.com/combo/4013-5963-7009/), [`4013-6913-7009`](https://commanderspellbook.com/combo/4013-6913-7009/), [`4353-7009-7068`](https://commanderspellbook.com/combo/4353-7009-7068/), [`4499-5902-7009`](https://commanderspellbook.com/combo/4499-5902-7009/), [`4772-7009-7068`](https://commanderspellbook.com/combo/4772-7009-7068/), [`4883-7009-7715`](https://commanderspellbook.com/combo/4883-7009-7715/), [`5361-5900-7009`](https://commanderspellbook.com/combo/5361-5900-7009/), [`5902-7009-7638`](https://commanderspellbook.com/combo/5902-7009-7638/), [`804-4013-7009`](https://commanderspellbook.com/combo/804-4013-7009/), [`804-5775-7009`](https://commanderspellbook.com/combo/804-5775-7009/), [`112-7009-7068`](https://commanderspellbook.com/combo/112-7009-7068/), [`112-7009-7715`](https://commanderspellbook.com/combo/112-7009-7715/), [`1305-4499-7009`](https://commanderspellbook.com/combo/1305-4499-7009/), [`1305-5900-7009`](https://commanderspellbook.com/combo/1305-5900-7009/), [`1305-7009-7068`](https://commanderspellbook.com/combo/1305-7009-7068/), [`1409-1887-7009`](https://commanderspellbook.com/combo/1409-1887-7009/), [`1409-5902-7009`](https://commanderspellbook.com/combo/1409-5902-7009/), [`1434-4116-7009`](https://commanderspellbook.com/combo/1434-4116-7009/), [`1446-2334-7009`](https://commanderspellbook.com/combo/1446-2334-7009/), [`1446-3963-7009`](https://commanderspellbook.com/combo/1446-3963-7009/), [`1446-4428-7009`](https://commanderspellbook.com/combo/1446-4428-7009/), [`1446-7009-7068`](https://commanderspellbook.com/combo/1446-7009-7068/), [`1887-2963-7009`](https://commanderspellbook.com/combo/1887-2963-7009/), [`1887-3557-7009`](https://commanderspellbook.com/combo/1887-3557-7009/), [`1887-3963-7009`](https://commanderspellbook.com/combo/1887-3963-7009/), [`1887-4428-7009`](https://commanderspellbook.com/combo/1887-4428-7009/), [`1887-4499-7009`](https://commanderspellbook.com/combo/1887-4499-7009/), [`1887-7009-7068`](https://commanderspellbook.com/combo/1887-7009-7068/), [`1887-7009-7638`](https://commanderspellbook.com/combo/1887-7009-7638/), [`2665-7009-7752`](https://commanderspellbook.com/combo/2665-7009-7752/), [`2719-5900-7009`](https://commanderspellbook.com/combo/2719-5900-7009/), [`3062-7009-7012`](https://commanderspellbook.com/combo/3062-7009-7012/), [`3334-7009-7715`](https://commanderspellbook.com/combo/3334-7009-7715/), [`3557-5902-7009`](https://commanderspellbook.com/combo/3557-5902-7009/), [`3963-4772-7009`](https://commanderspellbook.com/combo/3963-4772-7009/), [`4013-5902-7009`](https://commanderspellbook.com/combo/4013-5902-7009/), [`4116-4600-7009`](https://commanderspellbook.com/combo/4116-4600-7009/), [`4499-5963-7009`](https://commanderspellbook.com/combo/4499-5963-7009/), [`5663-7009-7068`](https://commanderspellbook.com/combo/5663-7009-7068/), [`5775-5963-7009`](https://commanderspellbook.com/combo/5775-5963-7009/), [`5902-7009-7068`](https://commanderspellbook.com/combo/5902-7009-7068/), [`5902-7009-7715`](https://commanderspellbook.com/combo/5902-7009-7715/), [`5963-7009-7715`](https://commanderspellbook.com/combo/5963-7009-7715/), [`6702-7009-7068`](https://commanderspellbook.com/combo/6702-7009-7068/), [`7009-7012-7704`](https://commanderspellbook.com/combo/7009-7012-7704/), [`804-5900-7009`](https://commanderspellbook.com/combo/804-5900-7009/), [`804-7009-7715`](https://commanderspellbook.com/combo/804-7009-7715/), [`1305-3963-7009`](https://commanderspellbook.com/combo/1305-3963-7009/), [`1305-4013-7009`](https://commanderspellbook.com/combo/1305-4013-7009/), [`1305-5775-7009`](https://commanderspellbook.com/combo/1305-5775-7009/), [`1305-7009-7334`](https://commanderspellbook.com/combo/1305-7009-7334/), [`1409-3062-7009`](https://commanderspellbook.com/combo/1409-3062-7009/), [`1446-1733-7009`](https://commanderspellbook.com/combo/1446-1733-7009/), [`1446-3557-7009`](https://commanderspellbook.com/combo/1446-3557-7009/), [`1446-4013-7009`](https://commanderspellbook.com/combo/1446-4013-7009/), [`1446-4499-7009`](https://commanderspellbook.com/combo/1446-4499-7009/), [`1446-5900-7009`](https://commanderspellbook.com/combo/1446-5900-7009/), [`1446-7009-7012`](https://commanderspellbook.com/combo/1446-7009-7012/), [`1446-7009-7638`](https://commanderspellbook.com/combo/1446-7009-7638/), [`1446-7009-7715`](https://commanderspellbook.com/combo/1446-7009-7715/), [`1543-7009-7715`](https://commanderspellbook.com/combo/1543-7009-7715/), [`1887-5775-7009`](https://commanderspellbook.com/combo/1887-5775-7009/), [`1887-5900-7009`](https://commanderspellbook.com/combo/1887-5900-7009/), [`1887-7009-7334`](https://commanderspellbook.com/combo/1887-7009-7334/), [`1887-7009-7715`](https://commanderspellbook.com/combo/1887-7009-7715/), [`2003-7009-7715`](https://commanderspellbook.com/combo/2003-7009-7715/), [`2334-3062-7009`](https://commanderspellbook.com/combo/2334-3062-7009/), [`2334-7009-7704`](https://commanderspellbook.com/combo/2334-7009-7704/), [`2334-7009-7803`](https://commanderspellbook.com/combo/2334-7009-7803/), [`2719-7009-7334`](https://commanderspellbook.com/combo/2719-7009-7334/), [`2963-3062-7009`](https://commanderspellbook.com/combo/2963-3062-7009/), [`2963-7009-7704`](https://commanderspellbook.com/combo/2963-7009-7704/), [`2963-7009-7803`](https://commanderspellbook.com/combo/2963-7009-7803/), [`3062-3557-7009`](https://commanderspellbook.com/combo/3062-3557-7009/), [`3062-3963-7009`](https://commanderspellbook.com/combo/3062-3963-7009/), [`3062-4013-7009`](https://commanderspellbook.com/combo/3062-4013-7009/), [`3062-4499-7009`](https://commanderspellbook.com/combo/3062-4499-7009/), [`3062-5775-7009`](https://commanderspellbook.com/combo/3062-5775-7009/), [`3062-5900-7009`](https://commanderspellbook.com/combo/3062-5900-7009/), [`3062-6568-7009`](https://commanderspellbook.com/combo/3062-6568-7009/), [`3062-7009-7068`](https://commanderspellbook.com/combo/3062-7009-7068/), [`3062-7009-7334`](https://commanderspellbook.com/combo/3062-7009-7334/), [`3062-7009-7638`](https://commanderspellbook.com/combo/3062-7009-7638/), [`3062-7009-7715`](https://commanderspellbook.com/combo/3062-7009-7715/), [`3334-7009-7068`](https://commanderspellbook.com/combo/3334-7009-7068/), [`3908-7009-7334`](https://commanderspellbook.com/combo/3908-7009-7334/), [`3921-7009-7068`](https://commanderspellbook.com/combo/3921-7009-7068/), [`3921-7009-7638`](https://commanderspellbook.com/combo/3921-7009-7638/), [`3921-7009-7715`](https://commanderspellbook.com/combo/3921-7009-7715/), [`4013-4772-7009`](https://commanderspellbook.com/combo/4013-4772-7009/), [`4116-7009-7752`](https://commanderspellbook.com/combo/4116-7009-7752/), [`4428-7009-7704`](https://commanderspellbook.com/combo/4428-7009-7704/), [`4428-7009-7803`](https://commanderspellbook.com/combo/4428-7009-7803/), [`4499-5361-7009`](https://commanderspellbook.com/combo/4499-5361-7009/), [`4772-5775-7009`](https://commanderspellbook.com/combo/4772-5775-7009/), [`4772-7009-7334`](https://commanderspellbook.com/combo/4772-7009-7334/), [`4772-7009-7715`](https://commanderspellbook.com/combo/4772-7009-7715/), [`5101-7009-7068`](https://commanderspellbook.com/combo/5101-7009-7068/), [`5101-7009-7715`](https://commanderspellbook.com/combo/5101-7009-7715/), [`5361-7009-7334`](https://commanderspellbook.com/combo/5361-7009-7334/), [`5361-7009-7715`](https://commanderspellbook.com/combo/5361-7009-7715/), [`5663-7009-7715`](https://commanderspellbook.com/combo/5663-7009-7715/), [`5775-5902-7009`](https://commanderspellbook.com/combo/5775-5902-7009/), [`5780-7009-7803`](https://commanderspellbook.com/combo/5780-7009-7803/), [`5902-7009-7334`](https://commanderspellbook.com/combo/5902-7009-7334/), [`6568-7009-7704`](https://commanderspellbook.com/combo/6568-7009-7704/), [`6568-7009-7803`](https://commanderspellbook.com/combo/6568-7009-7803/), [`6702-7009-7715`](https://commanderspellbook.com/combo/6702-7009-7715/), [`6774-7009-7068`](https://commanderspellbook.com/combo/6774-7009-7068/), [`6774-7009-7715`](https://commanderspellbook.com/combo/6774-7009-7715/), [`6913-7009-7334`](https://commanderspellbook.com/combo/6913-7009-7334/), [`7009-7012-7803`](https://commanderspellbook.com/combo/7009-7012-7803/), [`7009-7309-7704`](https://commanderspellbook.com/combo/7009-7309-7704/), [`7009-7309-7803`](https://commanderspellbook.com/combo/7009-7309-7803/), [`7009-7638-7704`](https://commanderspellbook.com/combo/7009-7638-7704/), [`7009-7638-7803`](https://commanderspellbook.com/combo/7009-7638-7803/), [`7009-7704-7715`](https://commanderspellbook.com/combo/7009-7704-7715/), [`804-7009-7334`](https://commanderspellbook.com/combo/804-7009-7334/), [`933-7009-7704`](https://commanderspellbook.com/combo/933-7009-7704/), [`933-7009-7803`](https://commanderspellbook.com/combo/933-7009-7803/)

  </details>

#### Other Mana Echoes loops (Cayth, Kiora of Fire and Ashes, Inspired Skypainter, Campus Composer, Chrome Dome, Sliver Overlord, Saheeli, Improvised Arsenal, Retrofitter Foundry)
**Priority:** Medium · **Variants:** 178 · **Popularity:** 944 (EDHREC decks, summed)
- **Most popular variant:** [`1283-2273-2440`](https://commanderspellbook.com/combo/1283-2273-2440/): Sliver Overlord | Mana Echoes | Chromatic Orrery
- **Generator combo IDs:** `25543`, `25544`, `25545`, `26412`, `27757`, `28204`, `32298`, `32388`, `32390`, `32832`, `32855`, `33998`
- **The database says now:**
  > *Mana needed:* {4}
  > *Notable prerequisites:* There are at least three Slivers on the battlefield. / At least NOTE: The amount of mana required to execute this combo fluctuates depending on the lowest mana value of Slivers in your library, as well as how many Slivers are on the battlefield as you execute…
- **Widget math:** Same engine: cost per token vs {C} per creature sharing a type, counting the new one. Input: creatures already sharing the type. Output: starting mana (the Notes say it "drops significantly for each additional" creature).
- <details><summary><b>Other variants (177)</b></summary>

  [`2440-2797`](https://commanderspellbook.com/combo/2440-2797/), [`2273-2440-3263`](https://commanderspellbook.com/combo/2273-2440-3263/), [`2440-7282`](https://commanderspellbook.com/combo/2440-7282/), [`2440-8167`](https://commanderspellbook.com/combo/2440-8167/), [`1012-2273-2440`](https://commanderspellbook.com/combo/1012-2273-2440/), [`2440-2645-5663`](https://commanderspellbook.com/combo/2440-2645-5663/), [`2440-2816-5663`](https://commanderspellbook.com/combo/2440-2816-5663/), [`2440-5200-5663`](https://commanderspellbook.com/combo/2440-5200-5663/), [`2440-5090-5663`](https://commanderspellbook.com/combo/2440-5090-5663/), [`1537-1812-2440-4183`](https://commanderspellbook.com/combo/1537-1812-2440-4183/), [`1537-2054-2440-4183`](https://commanderspellbook.com/combo/1537-2054-2440-4183/), [`1537-2440-4055-4183`](https://commanderspellbook.com/combo/1537-2440-4055-4183/), [`1537-2440-4183-4720`](https://commanderspellbook.com/combo/1537-2440-4183-4720/), [`1765-2054-2440-7311`](https://commanderspellbook.com/combo/1765-2054-2440-7311/), [`1765-2440-4055-7311`](https://commanderspellbook.com/combo/1765-2440-4055-7311/), [`1765-2440-4758-7311`](https://commanderspellbook.com/combo/1765-2440-4758-7311/), [`1812-2198-2440-4183`](https://commanderspellbook.com/combo/1812-2198-2440-4183/), [`1812-2440-2534-4183`](https://commanderspellbook.com/combo/1812-2440-2534-4183/), [`1812-2440-2905-4183`](https://commanderspellbook.com/combo/1812-2440-2905-4183/), [`1812-2440-4183-4404`](https://commanderspellbook.com/combo/1812-2440-4183-4404/), [`1812-2440-4183-4894`](https://commanderspellbook.com/combo/1812-2440-4183-4894/), [`1812-2440-4183-7220`](https://commanderspellbook.com/combo/1812-2440-4183-7220/), [`2054-2198-2440-4183`](https://commanderspellbook.com/combo/2054-2198-2440-4183/), [`2054-2440-2534-4183`](https://commanderspellbook.com/combo/2054-2440-2534-4183/), [`2054-2440-2905-4183`](https://commanderspellbook.com/combo/2054-2440-2905-4183/), [`2054-2440-4183-4404`](https://commanderspellbook.com/combo/2054-2440-4183-4404/), [`2054-2440-4183-4894`](https://commanderspellbook.com/combo/2054-2440-4183-4894/), [`2054-2440-4183-7220`](https://commanderspellbook.com/combo/2054-2440-4183-7220/), [`2198-2440-4055-4183`](https://commanderspellbook.com/combo/2198-2440-4055-4183/), [`2198-2440-4183-4720`](https://commanderspellbook.com/combo/2198-2440-4183-4720/), [`2440-2534-4055-4183`](https://commanderspellbook.com/combo/2440-2534-4055-4183/), [`2440-2534-4183-4720`](https://commanderspellbook.com/combo/2440-2534-4183-4720/), [`2440-2905-4055-4183`](https://commanderspellbook.com/combo/2440-2905-4055-4183/), [`2440-2905-4183-4720`](https://commanderspellbook.com/combo/2440-2905-4183-4720/), [`2440-4055-4183-4404`](https://commanderspellbook.com/combo/2440-4055-4183-4404/), [`2440-4055-4183-4894`](https://commanderspellbook.com/combo/2440-4055-4183-4894/), [`2440-4055-4183-7220`](https://commanderspellbook.com/combo/2440-4055-4183-7220/), [`2440-4183-4404-4720`](https://commanderspellbook.com/combo/2440-4183-4404-4720/), [`2440-4183-4720-4894`](https://commanderspellbook.com/combo/2440-4183-4720-4894/), [`2440-4183-4720-7220`](https://commanderspellbook.com/combo/2440-4183-4720-7220/), [`2440-4720-7546`](https://commanderspellbook.com/combo/2440-4720-7546/), [`252-2054-2440-7311`](https://commanderspellbook.com/combo/252-2054-2440-7311/), [`1170-1812-2440-7499`](https://commanderspellbook.com/combo/1170-1812-2440-7499/), [`1170-1812-2440-7517`](https://commanderspellbook.com/combo/1170-1812-2440-7517/), [`1170-1812-2440-7528`](https://commanderspellbook.com/combo/1170-1812-2440-7528/), [`1170-1812-2440-7577`](https://commanderspellbook.com/combo/1170-1812-2440-7577/), [`1170-2054-2440-7499`](https://commanderspellbook.com/combo/1170-2054-2440-7499/), [`1170-2054-2440-7517`](https://commanderspellbook.com/combo/1170-2054-2440-7517/), [`1170-2054-2440-7528`](https://commanderspellbook.com/combo/1170-2054-2440-7528/), [`1170-2054-2440-7577`](https://commanderspellbook.com/combo/1170-2054-2440-7577/), [`1170-2440-4055-7499`](https://commanderspellbook.com/combo/1170-2440-4055-7499/), [`1170-2440-4055-7517`](https://commanderspellbook.com/combo/1170-2440-4055-7517/), [`1170-2440-4055-7528`](https://commanderspellbook.com/combo/1170-2440-4055-7528/), [`1170-2440-4055-7577`](https://commanderspellbook.com/combo/1170-2440-4055-7577/), [`1170-2440-4720-7499`](https://commanderspellbook.com/combo/1170-2440-4720-7499/), [`1170-2440-4720-7517`](https://commanderspellbook.com/combo/1170-2440-4720-7517/), [`1170-2440-4720-7528`](https://commanderspellbook.com/combo/1170-2440-4720-7528/), [`1170-2440-4720-7577`](https://commanderspellbook.com/combo/1170-2440-4720-7577/), [`1170-2440-4758-7499`](https://commanderspellbook.com/combo/1170-2440-4758-7499/), [`1170-2440-4758-7517`](https://commanderspellbook.com/combo/1170-2440-4758-7517/), [`1170-2440-4758-7528`](https://commanderspellbook.com/combo/1170-2440-4758-7528/), [`1170-2440-4758-7577`](https://commanderspellbook.com/combo/1170-2440-4758-7577/), [`1170-2440-5115-7499`](https://commanderspellbook.com/combo/1170-2440-5115-7499/), [`1170-2440-5115-7517`](https://commanderspellbook.com/combo/1170-2440-5115-7517/), [`1170-2440-5115-7528`](https://commanderspellbook.com/combo/1170-2440-5115-7528/), [`1170-2440-5115-7577`](https://commanderspellbook.com/combo/1170-2440-5115-7577/), [`1537-2440-4183-4758`](https://commanderspellbook.com/combo/1537-2440-4183-4758/), [`1537-2440-4183-5115`](https://commanderspellbook.com/combo/1537-2440-4183-5115/), [`1765-1812-2440-7311`](https://commanderspellbook.com/combo/1765-1812-2440-7311/), [`1765-2440-4720-7311`](https://commanderspellbook.com/combo/1765-2440-4720-7311/), [`1765-2440-5115-7311`](https://commanderspellbook.com/combo/1765-2440-5115-7311/), [`1812-2059-2440-4183`](https://commanderspellbook.com/combo/1812-2059-2440-4183/), [`1812-2423-2440-4183`](https://commanderspellbook.com/combo/1812-2423-2440-4183/), [`1812-2440-3464-4183`](https://commanderspellbook.com/combo/1812-2440-3464-4183/), [`1812-2440-3562-4183`](https://commanderspellbook.com/combo/1812-2440-3562-4183/), [`1812-2440-4183-4730`](https://commanderspellbook.com/combo/1812-2440-4183-4730/), [`1812-2440-4183-7747`](https://commanderspellbook.com/combo/1812-2440-4183-7747/), [`1812-2440-4183-7895`](https://commanderspellbook.com/combo/1812-2440-4183-7895/), [`1812-2440-6737-7311`](https://commanderspellbook.com/combo/1812-2440-6737-7311/), [`1812-2440-7082-7311`](https://commanderspellbook.com/combo/1812-2440-7082-7311/), [`1812-2440-7546`](https://commanderspellbook.com/combo/1812-2440-7546/), [`2054-2059-2440-4183`](https://commanderspellbook.com/combo/2054-2059-2440-4183/), [`2054-2423-2440-4183`](https://commanderspellbook.com/combo/2054-2423-2440-4183/), [`2054-2440-3464-4183`](https://commanderspellbook.com/combo/2054-2440-3464-4183/), [`2054-2440-3562-4183`](https://commanderspellbook.com/combo/2054-2440-3562-4183/), [`2054-2440-4183-4730`](https://commanderspellbook.com/combo/2054-2440-4183-4730/), [`2054-2440-4183-7747`](https://commanderspellbook.com/combo/2054-2440-4183-7747/), [`2054-2440-4183-7895`](https://commanderspellbook.com/combo/2054-2440-4183-7895/), [`2054-2440-6737-7311`](https://commanderspellbook.com/combo/2054-2440-6737-7311/), [`2054-2440-7082-7311`](https://commanderspellbook.com/combo/2054-2440-7082-7311/), [`2054-2440-7546`](https://commanderspellbook.com/combo/2054-2440-7546/), [`2059-2440-4055-4183`](https://commanderspellbook.com/combo/2059-2440-4055-4183/), [`2059-2440-4183-4720`](https://commanderspellbook.com/combo/2059-2440-4183-4720/), [`2059-2440-4183-4758`](https://commanderspellbook.com/combo/2059-2440-4183-4758/), [`2059-2440-4183-5115`](https://commanderspellbook.com/combo/2059-2440-4183-5115/), [`2198-2440-4183-4758`](https://commanderspellbook.com/combo/2198-2440-4183-4758/), [`2198-2440-4183-5115`](https://commanderspellbook.com/combo/2198-2440-4183-5115/), [`2423-2440-4055-4183`](https://commanderspellbook.com/combo/2423-2440-4055-4183/), [`2423-2440-4183-4720`](https://commanderspellbook.com/combo/2423-2440-4183-4720/), [`2423-2440-4183-4758`](https://commanderspellbook.com/combo/2423-2440-4183-4758/), [`2423-2440-4183-5115`](https://commanderspellbook.com/combo/2423-2440-4183-5115/), [`2440-2534-4183-4758`](https://commanderspellbook.com/combo/2440-2534-4183-4758/), [`2440-2534-4183-5115`](https://commanderspellbook.com/combo/2440-2534-4183-5115/), [`2440-2905-4183-4758`](https://commanderspellbook.com/combo/2440-2905-4183-4758/), [`2440-2905-4183-5115`](https://commanderspellbook.com/combo/2440-2905-4183-5115/), [`2440-3464-4055-4183`](https://commanderspellbook.com/combo/2440-3464-4055-4183/), [`2440-3464-4183-4720`](https://commanderspellbook.com/combo/2440-3464-4183-4720/), [`2440-3464-4183-4758`](https://commanderspellbook.com/combo/2440-3464-4183-4758/), [`2440-3464-4183-5115`](https://commanderspellbook.com/combo/2440-3464-4183-5115/), [`2440-3562-4055-4183`](https://commanderspellbook.com/combo/2440-3562-4055-4183/), [`2440-3562-4183-4720`](https://commanderspellbook.com/combo/2440-3562-4183-4720/), [`2440-3562-4183-4758`](https://commanderspellbook.com/combo/2440-3562-4183-4758/), [`2440-3562-4183-5115`](https://commanderspellbook.com/combo/2440-3562-4183-5115/), [`2440-4055-4183-4730`](https://commanderspellbook.com/combo/2440-4055-4183-4730/), [`2440-4055-4183-7747`](https://commanderspellbook.com/combo/2440-4055-4183-7747/), [`2440-4055-4183-7895`](https://commanderspellbook.com/combo/2440-4055-4183-7895/), [`2440-4055-6737-7311`](https://commanderspellbook.com/combo/2440-4055-6737-7311/), [`2440-4055-7082-7311`](https://commanderspellbook.com/combo/2440-4055-7082-7311/), [`2440-4055-7546`](https://commanderspellbook.com/combo/2440-4055-7546/), [`2440-4183-4404-4758`](https://commanderspellbook.com/combo/2440-4183-4404-4758/), [`2440-4183-4404-5115`](https://commanderspellbook.com/combo/2440-4183-4404-5115/), [`2440-4183-4720-4730`](https://commanderspellbook.com/combo/2440-4183-4720-4730/), [`2440-4183-4720-7747`](https://commanderspellbook.com/combo/2440-4183-4720-7747/), [`2440-4183-4720-7895`](https://commanderspellbook.com/combo/2440-4183-4720-7895/), [`2440-4183-4730-4758`](https://commanderspellbook.com/combo/2440-4183-4730-4758/), [`2440-4183-4730-5115`](https://commanderspellbook.com/combo/2440-4183-4730-5115/), [`2440-4183-4758-4894`](https://commanderspellbook.com/combo/2440-4183-4758-4894/), [`2440-4183-4758-7220`](https://commanderspellbook.com/combo/2440-4183-4758-7220/), [`2440-4183-4758-7747`](https://commanderspellbook.com/combo/2440-4183-4758-7747/), [`2440-4183-4758-7895`](https://commanderspellbook.com/combo/2440-4183-4758-7895/), [`2440-4183-4894-5115`](https://commanderspellbook.com/combo/2440-4183-4894-5115/), [`2440-4183-5115-7220`](https://commanderspellbook.com/combo/2440-4183-5115-7220/), [`2440-4183-5115-7747`](https://commanderspellbook.com/combo/2440-4183-5115-7747/), [`2440-4183-5115-7895`](https://commanderspellbook.com/combo/2440-4183-5115-7895/), [`2440-4720-6737-7311`](https://commanderspellbook.com/combo/2440-4720-6737-7311/), [`2440-4720-7082-7311`](https://commanderspellbook.com/combo/2440-4720-7082-7311/), [`2440-4758-6737-7311`](https://commanderspellbook.com/combo/2440-4758-6737-7311/), [`2440-4758-7082-7311`](https://commanderspellbook.com/combo/2440-4758-7082-7311/), [`2440-4758-7546`](https://commanderspellbook.com/combo/2440-4758-7546/), [`2440-5115-6737-7311`](https://commanderspellbook.com/combo/2440-5115-6737-7311/), [`2440-5115-7082-7311`](https://commanderspellbook.com/combo/2440-5115-7082-7311/), [`2440-5115-7546`](https://commanderspellbook.com/combo/2440-5115-7546/), [`252-1812-2440-7311`](https://commanderspellbook.com/combo/252-1812-2440-7311/), [`252-2440-4055-7311`](https://commanderspellbook.com/combo/252-2440-4055-7311/), [`252-2440-4720-7311`](https://commanderspellbook.com/combo/252-2440-4720-7311/), [`252-2440-4758-7311`](https://commanderspellbook.com/combo/252-2440-4758-7311/), [`252-2440-5115-7311`](https://commanderspellbook.com/combo/252-2440-5115-7311/), [`252-913-2440-7311`](https://commanderspellbook.com/combo/252-913-2440-7311/), [`729-1812-2440-4183`](https://commanderspellbook.com/combo/729-1812-2440-4183/), [`729-2054-2440-4183`](https://commanderspellbook.com/combo/729-2054-2440-4183/), [`729-2440-4055-4183`](https://commanderspellbook.com/combo/729-2440-4055-4183/), [`729-2440-4183-4720`](https://commanderspellbook.com/combo/729-2440-4183-4720/), [`729-2440-4183-4758`](https://commanderspellbook.com/combo/729-2440-4183-4758/), [`729-2440-4183-5115`](https://commanderspellbook.com/combo/729-2440-4183-5115/), [`729-913-2440-4183`](https://commanderspellbook.com/combo/729-913-2440-4183/), [`913-1170-2440-7499`](https://commanderspellbook.com/combo/913-1170-2440-7499/), [`913-1170-2440-7517`](https://commanderspellbook.com/combo/913-1170-2440-7517/), [`913-1170-2440-7528`](https://commanderspellbook.com/combo/913-1170-2440-7528/), [`913-1170-2440-7577`](https://commanderspellbook.com/combo/913-1170-2440-7577/), [`913-1537-2440-4183`](https://commanderspellbook.com/combo/913-1537-2440-4183/), [`913-1765-2440-7311`](https://commanderspellbook.com/combo/913-1765-2440-7311/), [`913-2059-2440-4183`](https://commanderspellbook.com/combo/913-2059-2440-4183/), [`913-2198-2440-4183`](https://commanderspellbook.com/combo/913-2198-2440-4183/), [`913-2423-2440-4183`](https://commanderspellbook.com/combo/913-2423-2440-4183/), [`913-2440-2534-4183`](https://commanderspellbook.com/combo/913-2440-2534-4183/), [`913-2440-2905-4183`](https://commanderspellbook.com/combo/913-2440-2905-4183/), [`913-2440-3464-4183`](https://commanderspellbook.com/combo/913-2440-3464-4183/), [`913-2440-3562-4183`](https://commanderspellbook.com/combo/913-2440-3562-4183/), [`913-2440-4183-4404`](https://commanderspellbook.com/combo/913-2440-4183-4404/), [`913-2440-4183-4730`](https://commanderspellbook.com/combo/913-2440-4183-4730/), [`913-2440-4183-4894`](https://commanderspellbook.com/combo/913-2440-4183-4894/), [`913-2440-4183-7220`](https://commanderspellbook.com/combo/913-2440-4183-7220/), [`913-2440-4183-7747`](https://commanderspellbook.com/combo/913-2440-4183-7747/), [`913-2440-4183-7895`](https://commanderspellbook.com/combo/913-2440-4183-7895/), [`913-2440-6737-7311`](https://commanderspellbook.com/combo/913-2440-6737-7311/), [`913-2440-7082-7311`](https://commanderspellbook.com/combo/913-2440-7082-7311/), [`913-2440-7546`](https://commanderspellbook.com/combo/913-2440-7546/)

  </details>

#### Fire Nation Archers + Mana Echoes
**Priority:** Medium · **Variants:** 1 · **Popularity:** 30 (EDHREC decks, summed)
- **Most popular variant:** [`2440-6873`](https://commanderspellbook.com/combo/2440-6873/): Fire Nation Archers | Mana Echoes
- **Generator combo IDs:** `31087`
- **The database says now:**
  > *Mana needed:* {14}
  > *Notes:* The starting mana cost assumes you control no other Soldiers when starting the combo. If you control more Soldiers, the mana needed is as follows: {10} for one Soldier, {8} for two Soldiers, {6} for three Soldiers and {5} for four or more Soldiers. If you con…
- **Widget math:** Each activation costs {5} and makes a Soldier; Mana Echoes refunds one {C} per Soldier. Starting mana by Soldiers already controlled: {14} / {10} / {8} / {6} / {5} for 0 / 1 / 2 / 3 / 4+ (with 0 Soldiers you activate twice holding priority).
- **Check:** Matches the table in the Notes (re-derived by simulation).

#### Break-even thresholds (Rise of the Dark Realms + Phyrexian Altar; Urza, Prince of Kroog + Simulacrum Synthesizer; Professional Face-Breaker + Mardu Siegebreaker)
**Priority:** Low · **Variants:** 22 · **Popularity:** 6,025 (EDHREC decks, summed)
- **Most popular variant:** [`864-2080-4050`](https://commanderspellbook.com/combo/864-2080-4050/): Rise of the Dark Realms | Phyrexian Altar | Eternal Witness
- **Generator combo IDs:** `19676`, `29183`, `29633`
- **The database says now:**
  > *Mana needed:* {7}{B} at most
  > *Notable prerequisites:* The number of nontoken creatures you control plus the number of creature cards in all graveyards is at least nine.
- **Widget math:** Nontoken creatures + creature cards in all graveyards ≥ 9; breaks even from three Synthesizer copies; breaks even from five Face-Breaker tokens (needs more mana with fewer opponents). The widget shows the mana deficit until break-even.
- <details><summary><b>Other variants (21)</b></summary>

  [`2080-4050-4823`](https://commanderspellbook.com/combo/2080-4050-4823/), [`2043-4659-5747`](https://commanderspellbook.com/combo/2043-4659-5747/), [`2815-3750-6473`](https://commanderspellbook.com/combo/2815-3750-6473/), [`2034-2043-5747`](https://commanderspellbook.com/combo/2034-2043-5747/), [`2080-4050-5913`](https://commanderspellbook.com/combo/2080-4050-5913/), [`2080-2493-4050`](https://commanderspellbook.com/combo/2080-2493-4050/), [`1018-2080-4050`](https://commanderspellbook.com/combo/1018-2080-4050/), [`2080-4050-4477`](https://commanderspellbook.com/combo/2080-4050-4477/), [`2080-2239-4050`](https://commanderspellbook.com/combo/2080-2239-4050/), [`813-2080-4050`](https://commanderspellbook.com/combo/813-2080-4050/), [`2080-4050-4863`](https://commanderspellbook.com/combo/2080-4050-4863/), [`2080-2556-4050`](https://commanderspellbook.com/combo/2080-2556-4050/), [`1809-2080-4050`](https://commanderspellbook.com/combo/1809-2080-4050/), [`1309-2080-4050`](https://commanderspellbook.com/combo/1309-2080-4050/), [`2080-4050-4125`](https://commanderspellbook.com/combo/2080-4050-4125/), [`101-2080-4050`](https://commanderspellbook.com/combo/101-2080-4050/), [`2080-3277-4050`](https://commanderspellbook.com/combo/2080-3277-4050/), [`2080-4050-6991`](https://commanderspellbook.com/combo/2080-4050-6991/), [`2080-4050-7487`](https://commanderspellbook.com/combo/2080-4050-7487/), [`2080-4050-7874`](https://commanderspellbook.com/combo/2080-4050-7874/), [`64-2080-4050`](https://commanderspellbook.com/combo/64-2080-4050/)

  </details>

#### Aftermath Analyst + Takenuma + Golgari Rot Farm + Squandered Resources
**Priority:** Low · **Variants:** 12 · **Popularity:** 5,024 (EDHREC decks, summed)
- **Most popular variant:** [`280-2167-4548-5721`](https://commanderspellbook.com/combo/280-2167-4548-5721/): Aftermath Analyst | Takenuma, Abandoned Mire | Golgari Rot Farm | Squandered Resources
- **Generator combo IDs:** `33842`
- **The database says now:**
  > *Easy prerequisites:* You control lands that can tap to produce at least {7}{G}{G}{B} (but see notes).
  > *Notes:* Each legendary creature you control reduces the amount of mana required by {1}, up to a maximum of {3}.
- **Widget math:** Mana required drops by {1} per legendary creature you control (up to {3}); milled lands can also raise later loops.
- <details><summary><b>Other variants (11)</b></summary>

  [`907-2167-4548-5721`](https://commanderspellbook.com/combo/907-2167-4548-5721/), [`1671-2167-4548-5721`](https://commanderspellbook.com/combo/1671-2167-4548-5721/), [`573-2167-4548-5721`](https://commanderspellbook.com/combo/573-2167-4548-5721/), [`2167-3861-4548-5721`](https://commanderspellbook.com/combo/2167-3861-4548-5721/), [`2167-3478-4548-5721`](https://commanderspellbook.com/combo/2167-3478-4548-5721/), [`2167-3257-4548-5721`](https://commanderspellbook.com/combo/2167-3257-4548-5721/), [`2167-4548-5621-5721`](https://commanderspellbook.com/combo/2167-4548-5621-5721/), [`765-2167-4548-5721`](https://commanderspellbook.com/combo/765-2167-4548-5721/), [`2167-3147-4548-5721`](https://commanderspellbook.com/combo/2167-3147-4548-5721/), [`2167-3756-4548-5721`](https://commanderspellbook.com/combo/2167-3756-4548-5721/), [`2167-4548-5233-5721`](https://commanderspellbook.com/combo/2167-4548-5233-5721/)

  </details>

#### Creature-count costs (Aron, Benalia's Ruin; Stormsplitter)
**Priority:** Low · **Variants:** 23 · **Popularity:** 2,895 (EDHREC decks, summed)
- **Most popular variant:** [`204-3940-5851`](https://commanderspellbook.com/combo/204-3940-5851/): Stormsplitter | Sorcerer Class | Haze of Rage
- **Generator combo IDs:** `10834`, `10835`, `27672`, `27991`, `28089`
- **The database says now:**
  > *Mana needed:* {8} at most, depending on how many Stormsplitters and/or other creatures you control without summoning sickness
  > *Notable prerequisites:* Sorcerer Class is at least level 2.
- **Widget math:** Aron: +{1} per other creature you control. Stormsplitter: up to {8}, minus untapped creatures without summoning sickness.
- <details><summary><b>Other variants (22)</b></summary>

  [`204-3368-5851`](https://commanderspellbook.com/combo/204-3368-5851/), [`3209-5851`](https://commanderspellbook.com/combo/3209-5851/), [`204-2100-5851`](https://commanderspellbook.com/combo/204-2100-5851/), [`204-2871-5851`](https://commanderspellbook.com/combo/204-2871-5851/), [`204-3923-5851`](https://commanderspellbook.com/combo/204-3923-5851/), [`204-4182-5851`](https://commanderspellbook.com/combo/204-4182-5851/), [`204-3716-5851`](https://commanderspellbook.com/combo/204-3716-5851/), [`112-204-5851`](https://commanderspellbook.com/combo/112-204-5851/), [`204-2450-5851`](https://commanderspellbook.com/combo/204-2450-5851/), [`204-2909-5851`](https://commanderspellbook.com/combo/204-2909-5851/), [`2871-4050-5851`](https://commanderspellbook.com/combo/2871-4050-5851/), [`2609-4050-5851`](https://commanderspellbook.com/combo/2609-4050-5851/), [`3923-4050-5851`](https://commanderspellbook.com/combo/3923-4050-5851/), [`112-4050-5851`](https://commanderspellbook.com/combo/112-4050-5851/), [`2450-4050-5851`](https://commanderspellbook.com/combo/2450-4050-5851/), [`1354-4050-5851`](https://commanderspellbook.com/combo/1354-4050-5851/), [`2909-4050-5851`](https://commanderspellbook.com/combo/2909-4050-5851/), [`3887-4050-5851`](https://commanderspellbook.com/combo/3887-4050-5851/), [`1954-4050-5851`](https://commanderspellbook.com/combo/1954-4050-5851/), [`203-4050-5851`](https://commanderspellbook.com/combo/203-4050-5851/), [`2034-2178-3343-3490-4871`](https://commanderspellbook.com/combo/2034-2178-3343-3490-4871/), [`2178-3343-3490-4659-4871`](https://commanderspellbook.com/combo/2178-3343-3490-4659-4871/)

  </details>

#### Long-tail count thresholds (Magmatic Galleon, Valkyrie's Call, Aatchik, Akiri)
**Priority:** Low · **Variants:** 43 · **Popularity:** 1,228 (EDHREC decks, summed)
- **Most popular variant:** [`1527-1678`](https://commanderspellbook.com/combo/1527-1678/): Magmatic Galleon | Mayhem Devil
- **Generator combo IDs:** `25708`, `25709`, `25710`, `25711`, `25712`, `25713`, `25714`, `25715`, `25716`, `25718`, `25719`, `28474`, `29160`, `29161`, `30665`
- **The database says now:**
  > *Notable prerequisites:* An opponent controls an indestructible creature, or you have a way to give an opponent's creature indestructible. / You control a number of Treasure tokens greater than the indestructible creature's toughness.
- **Widget math:** Treasures > the indestructible creature's toughness (or artifacts > 2 × it); artifacts ≥ crew − 2; artifact and creature cards in the graveyard ≥ 9 / 7; fewer artifacts if you add mana until Akiri reaches power 8.
- <details><summary><b>Other variants (42)</b></summary>

  [`1527-4911-5184`](https://commanderspellbook.com/combo/1527-4911-5184/), [`1527-4231-4911`](https://commanderspellbook.com/combo/1527-4231-4911/), [`1527-2415`](https://commanderspellbook.com/combo/1527-2415/), [`215-4050-6251`](https://commanderspellbook.com/combo/215-4050-6251/), [`2232-4050-6251`](https://commanderspellbook.com/combo/2232-4050-6251/), [`3719-5300-5626`](https://commanderspellbook.com/combo/3719-5300-5626/), [`1527-2097-4911`](https://commanderspellbook.com/combo/1527-2097-4911/), [`2034-5747-6243--123`](https://commanderspellbook.com/combo/2034-5747-6243--123/), [`1527-4772-4911`](https://commanderspellbook.com/combo/1527-4772-4911/), [`1527-3129-4911`](https://commanderspellbook.com/combo/1527-3129-4911/), [`2829-5747-6243--123`](https://commanderspellbook.com/combo/2829-5747-6243--123/), [`4050-5747-6243--123`](https://commanderspellbook.com/combo/4050-5747-6243--123/), [`1308-1527-4911`](https://commanderspellbook.com/combo/1308-1527-4911/), [`1527-2557-4911`](https://commanderspellbook.com/combo/1527-2557-4911/), [`4659-5747-6243--123`](https://commanderspellbook.com/combo/4659-5747-6243--123/), [`3698-5747-6243--123`](https://commanderspellbook.com/combo/3698-5747-6243--123/), [`1477-5747-6243--123`](https://commanderspellbook.com/combo/1477-5747-6243--123/), [`1527-4365-4911`](https://commanderspellbook.com/combo/1527-4365-4911/), [`3899-5747-6243--123`](https://commanderspellbook.com/combo/3899-5747-6243--123/), [`413-5747-6243--123`](https://commanderspellbook.com/combo/413-5747-6243--123/), [`5256-5747-6243--123`](https://commanderspellbook.com/combo/5256-5747-6243--123/), [`851-1527-4911`](https://commanderspellbook.com/combo/851-1527-4911/), [`2099-5747-6243--123`](https://commanderspellbook.com/combo/2099-5747-6243--123/), [`2292-5747-6243--123`](https://commanderspellbook.com/combo/2292-5747-6243--123/), [`2438-5747-6243--123`](https://commanderspellbook.com/combo/2438-5747-6243--123/), [`2511-5747-6243--123`](https://commanderspellbook.com/combo/2511-5747-6243--123/), [`2921-5747-6243--123`](https://commanderspellbook.com/combo/2921-5747-6243--123/), [`2981-5747-6243--123`](https://commanderspellbook.com/combo/2981-5747-6243--123/), [`3967-5747-6243--123`](https://commanderspellbook.com/combo/3967-5747-6243--123/), [`4247-5747-6243--123`](https://commanderspellbook.com/combo/4247-5747-6243--123/), [`4779-5747-6243--123`](https://commanderspellbook.com/combo/4779-5747-6243--123/), [`5147-5747-6243--123`](https://commanderspellbook.com/combo/5147-5747-6243--123/), [`5226-5747-6243--123`](https://commanderspellbook.com/combo/5226-5747-6243--123/), [`5231-5747-6243--123`](https://commanderspellbook.com/combo/5231-5747-6243--123/), [`5315-5747-6243--123`](https://commanderspellbook.com/combo/5315-5747-6243--123/), [`5330-5747-6243--123`](https://commanderspellbook.com/combo/5330-5747-6243--123/), [`5686-5747-6243--123`](https://commanderspellbook.com/combo/5686-5747-6243--123/), [`5747-6243-6495--123`](https://commanderspellbook.com/combo/5747-6243-6495--123/), [`5747-6243-6798--123`](https://commanderspellbook.com/combo/5747-6243-6798--123/), [`5747-6243-8095--123`](https://commanderspellbook.com/combo/5747-6243-8095--123/), [`728-5747-6243--123`](https://commanderspellbook.com/combo/728-5747-6243--123/), [`997-5747-6243--123`](https://commanderspellbook.com/combo/997-5747-6243--123/)

  </details>

#### Ruthless Technomancer + Perigee Beckoner + Nim Shambler
**Priority:** Low · **Variants:** 1 · **Popularity:** 0 (EDHREC decks, summed)
- **Most popular variant:** [`1966-3719-6981`](https://commanderspellbook.com/combo/1966-3719-6981/): Ruthless Technomancer | Perigee Beckoner | Nim Shambler
- **Generator combo IDs:** `33220`
- **The database says now:**
  > *Notes:* You can reduce the number of artifacts you control to start by adding additional mana. The remaining three can be reduced by adding up to {4}{B}{B} in mana to pay for Ruthless Technomancer's abilities. The needed mana is as follows: {4}{B}{B} extra if you con…
- **Widget math:** Extra mana by artifacts controlled: {4}{B}{B} / {4} / {2} / {0} for 7 / 8 / 9 / 10+ (from the Notes).

## 8. Finite results: how much damage, how many tokens, how many turns

**Widget id:** `finite-output`

**Widget:** inputs are the variable that sets the size of the result (mana spent, X, life, permanents, a die roll). Outputs are the damage, tokens or extra turns, compared with the opponents' life totals. These combos are not infinite, so the result depends entirely on the board.

#### Blasphemous Act + Repercussion
**Priority:** High · **Variants:** 1 · **Popularity:** 39,064 (EDHREC decks, summed)
- **Most popular variant:** [`2484-4083`](https://commanderspellbook.com/combo/2484-4083/): Blasphemous Act | Repercussion
- **Generator combo IDs:** `28202`
- **The database says now:**
  > *Mana needed:* {8}{R} at most
  > *Notes:* This combo will also deal damage to you equal to 13 times the number of creatures you control. It is recommended that your life total is above this number to ensure you don't lose the game from the damage if your opponents will not take lethal damage from thi…
- **Widget math:** Every player, you included, takes 13 × the number of creatures they control. Blasphemous Act costs {8}{R} minus {1} per creature on the battlefield. Inputs: creatures and life per player. Output: who dies, and a warning when you die too (all players at 0 at once is a draw).

#### Dragon Tempest + Ancient Gold Dragon
**Priority:** High · **Variants:** 1 · **Popularity:** 28,247 (EDHREC decks, summed)
- **Most popular variant:** [`2855-5982`](https://commanderspellbook.com/combo/2855-5982/): Dragon Tempest | Ancient Gold Dragon
- **Generator combo IDs:** `28211`
- **The database says now:**
  > *Notable prerequisites:* Ancient Gold Dragon does not have summoning sickness and cannot be blocked by an opponent.
  > *Notes:* The amount of damage this combo deals is highly variable by how many Dragons you control and the result of the d20 roll. The more Dragons you control, the more damage will be dealt.
- **Widget math:** A d20 roll of R makes R Faerie Dragons enter together, giving R triggers that each deal (Dragons before + R) damage: R·(D + R). Expected damage 10.5·D + 143.5. Input: Dragons you control. Outputs: damage per roll, expected damage, and the chance of killing given life totals.

#### Devastating Onslaught + Terror of the Peaks
**Priority:** High · **Variants:** 1 · **Popularity:** 6,981 (EDHREC decks, summed)
- **Most popular variant:** [`1110-6785`](https://commanderspellbook.com/combo/1110-6785/): Devastating Onslaught | Terror of the Peaks
- **Generator combo IDs:** `30689`
- **The database says now:**
  > *Mana needed:* {10}{R}
  > *Notes:* Paying {10} while casting Devastating Onslaught is a recommendation. You can pay more or less depending on what mana you have available and how much damage you wish to deal. {10} allows three opponents to be dealt at least 40 damage.
- **Widget math:** X copies ({X}{X}{R}, 2X + 1 mana) → X² triggers of 5 damage = 5X² ({10}{R}: X = 5 → 125). Input: mana. Outputs: X, total damage, and how to split it among opponents.
- **Check:** Matches the Notes ({10} → three opponents at 40).

#### Hollowhenge Overlord + Parallel Lives + Doubling Season
**Priority:** Medium · **Variants:** 45 · **Popularity:** 6,381 (EDHREC decks, summed)
- **Most popular variant:** [`2557-4772-7858`](https://commanderspellbook.com/combo/2557-4772-7858/): Hollowhenge Overlord | Parallel Lives | Doubling Season
- **Generator combo IDs:** `33426`
- **The database says now:**
  > *Notes:* The number of Wolves and/or Werewolves you'll control after performing steps 1 and 2 is equal to 5^X * Y, where X is the number of iterations of those steps you've performed (starting at 1), and Y is the initial number of Wolves and/or Werewolves you started…
- **Widget math:** Each iteration creates m tokens per Wolf, where m is the product of the token multipliers (4 with two doublers, 6 with Ojer Taq and a doubler, …), so Wolves after X iterations = (1 + m)^X × starting Wolves (the Notes give 5^X for Parallel Lives + Doubling Season). Output: iterations to reach a target number of tokens or total power.
- <details><summary><b>Other variants (44)</b></summary>

  [`3129-4772-7858`](https://commanderspellbook.com/combo/3129-4772-7858/), [`2557-3129-7858`](https://commanderspellbook.com/combo/2557-3129-7858/), [`1308-2557-7858`](https://commanderspellbook.com/combo/1308-2557-7858/), [`1308-4772-7858`](https://commanderspellbook.com/combo/1308-4772-7858/), [`4365-4772-7858`](https://commanderspellbook.com/combo/4365-4772-7858/), [`1270-4772-7858`](https://commanderspellbook.com/combo/1270-4772-7858/), [`1270-2557-7858`](https://commanderspellbook.com/combo/1270-2557-7858/), [`2557-4365-7858`](https://commanderspellbook.com/combo/2557-4365-7858/), [`1308-4365-7858`](https://commanderspellbook.com/combo/1308-4365-7858/), [`1270-1308-7858`](https://commanderspellbook.com/combo/1270-1308-7858/), [`1270-4365-7858`](https://commanderspellbook.com/combo/1270-4365-7858/), [`4772-6441-7858`](https://commanderspellbook.com/combo/4772-6441-7858/), [`1308-3129-7858`](https://commanderspellbook.com/combo/1308-3129-7858/), [`2557-6441-7858`](https://commanderspellbook.com/combo/2557-6441-7858/), [`851-2557-7858`](https://commanderspellbook.com/combo/851-2557-7858/), [`1270-3129-7858`](https://commanderspellbook.com/combo/1270-3129-7858/), [`1308-6441-7858`](https://commanderspellbook.com/combo/1308-6441-7858/), [`851-4772-7858`](https://commanderspellbook.com/combo/851-4772-7858/), [`3129-4365-7858`](https://commanderspellbook.com/combo/3129-4365-7858/), [`4365-6441-7858`](https://commanderspellbook.com/combo/4365-6441-7858/), [`1270-6441-7858`](https://commanderspellbook.com/combo/1270-6441-7858/), [`3129-6441-7858`](https://commanderspellbook.com/combo/3129-6441-7858/), [`4365-6753-7858`](https://commanderspellbook.com/combo/4365-6753-7858/), [`4772-6753-7858`](https://commanderspellbook.com/combo/4772-6753-7858/), [`2557-6753-7858`](https://commanderspellbook.com/combo/2557-6753-7858/), [`1308-6753-7858`](https://commanderspellbook.com/combo/1308-6753-7858/), [`6441-6753-7858`](https://commanderspellbook.com/combo/6441-6753-7858/), [`851-3129-7858`](https://commanderspellbook.com/combo/851-3129-7858/), [`1270-6753-7858`](https://commanderspellbook.com/combo/1270-6753-7858/), [`3129-6753-7858`](https://commanderspellbook.com/combo/3129-6753-7858/), [`851-1308-7858`](https://commanderspellbook.com/combo/851-1308-7858/), [`851-4365-7858`](https://commanderspellbook.com/combo/851-4365-7858/), [`851-1270-7858`](https://commanderspellbook.com/combo/851-1270-7858/), [`851-6441-7858`](https://commanderspellbook.com/combo/851-6441-7858/), [`851-6753-7858`](https://commanderspellbook.com/combo/851-6753-7858/), [`1270-7824-7858`](https://commanderspellbook.com/combo/1270-7824-7858/), [`4365-7824-7858`](https://commanderspellbook.com/combo/4365-7824-7858/), [`6753-7824-7858`](https://commanderspellbook.com/combo/6753-7824-7858/), [`851-7824-7858`](https://commanderspellbook.com/combo/851-7824-7858/), [`1308-7824-7858`](https://commanderspellbook.com/combo/1308-7824-7858/), [`2557-7824-7858`](https://commanderspellbook.com/combo/2557-7824-7858/), [`4772-7824-7858`](https://commanderspellbook.com/combo/4772-7824-7858/), [`6441-7824-7858`](https://commanderspellbook.com/combo/6441-7824-7858/), [`3129-7824-7858`](https://commanderspellbook.com/combo/3129-7824-7858/)

  </details>

#### Scourge of Valkas + Devastating Onslaught
**Priority:** Medium · **Variants:** 1 · **Popularity:** 919 (EDHREC decks, summed)
- **Most popular variant:** [`2676-6785`](https://commanderspellbook.com/combo/2676-6785/): Scourge of Valkas | Devastating Onslaught
- **Generator combo IDs:** `32892`
- **The database says now:**
  > *Mana needed:* {10}{R}
  > *Notes:* You can cast Devastating Onslaught for any desired amount of mana, meaning {10}{R} for the cost is simply a recommendation and should be tailored based on your needs at the time.
- **Widget math:** X copies → X·(X + 1) triggers, each dealing the number of Dragons you control (X + 1 + other Dragons): X = 5 → 30 × 6 = 180.
- **Check:** Matches the database (180).

#### Extra-turn counts (Eternity Vessel + Magistrate's Scepter + Resourceful Defense; Sin + Body of Research + Sage of Hours; Eternity Vessel + Drafna or Meticulous Excavation)
**Priority:** Medium · **Variants:** 5 · **Popularity:** 824 (EDHREC decks, summed)
- **Most popular variant:** [`1870-3609-4153`](https://commanderspellbook.com/combo/1870-3609-4153/): Eternity Vessel | Magistrate's Scepter | Resourceful Defense
- **Generator combo IDs:** `30551`, `30552`, `32241`, `32270`
- **The database says now:**
  > *Mana needed:* {6}
  > *Notes:* The total number of turns you will get is equal to: (your life total + the number of charge counters on Magistrate's Scepter)/3, rounded down.
- **Widget math:** From the Notes: turns = ⌊(life + charge counters) / 3⌋; turns = ⌊2 × (deck size + counters) / 5⌋; mana paid each turn depends on the starting life total.
- **Other variants (4):** [`1870-3609-7280`](https://commanderspellbook.com/combo/1870-3609-7280/), [`648-1494-6730`](https://commanderspellbook.com/combo/648-1494-6730/), [`1870-3609-4153-4331`](https://commanderspellbook.com/combo/1870-3609-4153-4331/), [`1350-1870-3609-4153`](https://commanderspellbook.com/combo/1350-1870-3609-4153/)

#### Quadratic drains (Omnath, Locus of Rage + Mirrorform; Mirrorform + Vela the Night-Clad; Aatchik + Esix)
**Priority:** Medium · **Variants:** 3 · **Popularity:** 468 (EDHREC decks, summed)
- **Most popular variant:** [`4862-7181`](https://commanderspellbook.com/combo/4862-7181/): Omnath, Locus of Rage | Mirrorform
- **Generator combo IDs:** `32188`, `32253`, `33690`
- **The database says now:**
  > *Mana needed:* {4}{U}{U}
  > *Notes:* The amount of total damage that will be dealt is equal to 3*X*(X-1), where X is the number of nonland permanents you control (including Omnath) as you perform the combo. For example, if you control seven nonland permanents, you will deal 3*7*6 or 126 total da…
- **Widget math:** From the Notes: 3·X·(X − 1) total damage with X nonland permanents; X·(X + 1) life loss per opponent; n cards → n² life loss per opponent.
- **Other variants (2):** [`6316-7181`](https://commanderspellbook.com/combo/6316-7181/), [`430-6251`](https://commanderspellbook.com/combo/430-6251/)

#### Orthion, Hero of Lavabrink lines (Scourge of Valkas; Dragonhawk, Fate's Tempest with The Master / Cadric / Rite of Replication / Sakashima; Craterclaw Colossus)
**Priority:** Low · **Variants:** 14 · **Popularity:** 3,752 (EDHREC decks, summed)
- **Most popular variant:** [`2136-7842`](https://commanderspellbook.com/combo/2136-7842/): Orthion, Hero of Lavabrink | Craterclaw Colossus
- **Generator combo IDs:** `30068`, `30069`, `30070`, `30071`, `31900`, `33383`
- **The database says now:**
  > *Notes:* If you control no other artifacts, each creature you control will get +30/+0 until end of turn, accounting for each of the Craterclaw Colossus you control.
- **Widget math:** From the Notes: 180 damage + 30 per other Dragon; up to 60 (70 with Cadric) damage per opponent, − 2 per exiled card you play, + 10 per other creature with power 4 or greater; +30/+0 per Craterclaw Colossus without other artifacts.
- <details><summary><b>Other variants (13)</b></summary>

  [`2136-2676`](https://commanderspellbook.com/combo/2136-2676/), [`2136-4836-6567`](https://commanderspellbook.com/combo/2136-4836-6567/), [`1434-2136-6567`](https://commanderspellbook.com/combo/1434-2136-6567/), [`2136-3604-6567`](https://commanderspellbook.com/combo/2136-3604-6567/), [`1744-2719-6567`](https://commanderspellbook.com/combo/1744-2719-6567/), [`1434-1744-6567`](https://commanderspellbook.com/combo/1434-1744-6567/), [`2136-4600-6567`](https://commanderspellbook.com/combo/2136-4600-6567/), [`2136-2719-6567`](https://commanderspellbook.com/combo/2136-2719-6567/), [`1744-3604-6567`](https://commanderspellbook.com/combo/1744-3604-6567/), [`1744-4600-6567`](https://commanderspellbook.com/combo/1744-4600-6567/), [`1744-4836-6567`](https://commanderspellbook.com/combo/1744-4836-6567/), [`1744-6567-7752`](https://commanderspellbook.com/combo/1744-6567-7752/), [`2136-6567-7752`](https://commanderspellbook.com/combo/2136-6567-7752/)

  </details>

#### Devastating Onslaught + Exalted Sunborn
**Priority:** Low · **Variants:** 1 · **Popularity:** 2,327 (EDHREC decks, summed)
- **Most popular variant:** [`6753-6785`](https://commanderspellbook.com/combo/6753-6785/): Devastating Onslaught | Exalted Sunborn
- **Generator combo IDs:** `30690`
- **The database says now:**
  > *Mana needed:* {6}{R} at least
  > *Notes:* Paying {6}{R} to cast Devastating Onslaught is a minimum recommendation. The more mana you can pay, the more tokens you'll generate. For every {2} additional you pay, you'll create two extra Exalted Sunborn tokens, which will result in 4x more tokens.
- **Widget math:** X copies, doubled by the original, give 2X + 1 Exalted Sunborns, so later tokens are multiplied by 2^(2X+1) ({6}{R} → ×128; each extra {2} → ×4).
- **Check:** Matches the Notes.

#### Mass of Mysteries + Prismabasher + Twinflame Travelers
**Priority:** Low · **Variants:** 1 · **Popularity:** 1,164 (EDHREC decks, summed)
- **Most popular variant:** [`7253-7254-7255`](https://commanderspellbook.com/combo/7253-7254-7255/): Mass of Mysteries | Prismabasher | Twinflame Travelers
- **Generator combo IDs:** `32180`
- **The database says now:**
  > *Easy prerequisites:* You have two or more opponents.
  > *Notes:* If your commander is attacking, you can boost its power to 21 or higher, which will deal lethal commander damage to an opponent. It isn't required for opponents to not block your creatures, as all the Prismabashers have trample, but it is recommended when pos…
- **Widget math:** Damage scales with the number of opponents (from the Notes).

## 9. Costs and feasibility by number of opponents

**Widget id:** `opponent-count`

**Widget:** one shared "opponents at the table" input (default 3; 1 for duel formats) that resolves "for each opponent" into concrete numbers and shows whether the combo works at that table size at all.

#### Duskmantle Guildmage + Mindcrank / The Master of Lake-town
**Priority:** Medium · **Variants:** 2 · **Popularity:** 20,680 (EDHREC decks, summed)
- **Most popular variant:** [`936-5069`](https://commanderspellbook.com/combo/936-5069/): Duskmantle Guildmage | Mindcrank
- **Generator combo IDs:** `404`, `33463`
- **The database says now:**
  > *Mana needed:* {1}{U}{B} plus an additional {2}{U}{B} for each opponent you have
  > *Notable prerequisites:* Each opponent has a life total that is less than or equal to their library size.
- **Widget math:** {1}{U}{B} once, plus {2}{U}{B} per opponent to start each opponent's mill-drain loop; an opponent dies only if their life total ≤ their library size, so the widget also checks each opponent.
- **Other variants (1):** [`5069-7848`](https://commanderspellbook.com/combo/5069-7848/)

#### Combos that need three opponents (Najeela + Professional Face-Breaker / Grim Hireling; Mardu Siegebreaker + Aggravated Assault + Rose Room Treasurer)
**Priority:** Low · **Variants:** 3 · **Popularity:** 12,311 (EDHREC decks, summed)
- **Most popular variant:** [`2011-2815--108`](https://commanderspellbook.com/combo/2011-2815--108/): Najeela, the Blade-Blossom | Professional Face-Breaker
- **Generator combo IDs:** `29624`, `31800`, `31801`
- **The database says now:**
  > *Easy prerequisites:* You have three or more opponents.
  > *Notable prerequisites:* Opponents cannot block creatures you control.
- **Widget math:** Treasures per combat = opponents dealt damage; Aggravated Assault needs 5. The widget shows the surplus or deficit per combat as opponents die.
- **Other variants (2):** [`2011-2215`](https://commanderspellbook.com/combo/2011-2215/), [`3750-5520-6473`](https://commanderspellbook.com/combo/3750-5520-6473/)

#### Zedruu the Greathearted lines (Transcendence; Warstorm Surge + Dissipation Field; Notion Thief + Consecrated Sphinx; Staff of Compleation + Linvala)
**Priority:** Low · **Variants:** 4 · **Popularity:** 4,701 (EDHREC decks, summed)
- **Most popular variant:** [`2736-3473`](https://commanderspellbook.com/combo/2736-3473/): Zedruu the Greathearted | Transcendence
- **Generator combo IDs:** `2117`, `3269`, `14799`, `25573`
- **The database says now:**
  > *Mana needed:* {W}{U}{R} per opponent with 20 or more life
  > *Notable prerequisites:* You have less than 20 life.
- **Widget math:** {W}{U}{R} per opponent (with Transcendence, per opponent at 20 or more life).
- **Other variants (3):** [`1778-2736-2773-3892`](https://commanderspellbook.com/combo/1778-2736-2773-3892/), [`2736-3221-3283`](https://commanderspellbook.com/combo/2736-3221-3283/), [`209-2344-2736-4067-4158`](https://commanderspellbook.com/combo/209-2344-2736-4067-4158/)

#### Time Sieve + Cybermen Squadron / Legion Loyalty
**Priority:** Low · **Variants:** 2 · **Popularity:** 3,338 (EDHREC decks, summed)
- **Most popular variant:** [`181-1558`](https://commanderspellbook.com/combo/181-1558/): Time Sieve | Cybermen Squadron
- **Generator combo IDs:** `25673`, `25674`
- **The database says now:**
  > *Notable prerequisites:* You have at least two opponents. / You control a number of nonlegendary artifact creatures that do not have summoning sickness equal to five divided by the number of opponents you have minus one, rounded up. / Opponents cannot block and kill creatures you con…
- **Widget math:** Attacking artifact creatures needed = ⌈5 / (opponents − 1)⌉.
- **Other variants (1):** [`1558-4711`](https://commanderspellbook.com/combo/1558-4711/)

#### Per-opponent mana (Esoteric Duplicator + Mindslaver; Yosei + Nim Deathmantle; Frodo, Sauron's Bane lines; Possessed Portal + Ant Queen; Mayael's Aria + Devilish Valet; Fractured Identity + Lich; Blightsteel + Fiendlash + Pyrohemia; Umbris + Hive Mind)
**Priority:** Low · **Variants:** 17 · **Popularity:** 2,446 (EDHREC decks, summed)
- **Most popular variant:** [`1167-5483`](https://commanderspellbook.com/combo/1167-5483/): Esoteric Duplicator | Mindslaver
- **Generator combo IDs:** `7175`, `7176`, `7538`, `12001`, `16652`, `16653`, `16654`, `16655`, `16656`, `16657`, `16658`, `16659`, `19565`, `23131`, `23132`, `24447`, `26879`
- **The database says now:**
  > *Mana needed:* {6} for each opponent you have each turn
  > *Notes:* You can use this combo to control as many opponents as mana will allow, at a cost of {6} per opponent per turn cycle.
- **Widget math:** Mana = base + per-opponent cost × opponents ({6}; {2} or {3}; {W/B}{W/B}{B}{B}{B}; {1}{G}; {1}{W}; {1}; {R}; {1}{U} or {B}{B}{B}), plus life thresholds where stated (life > opponents, life > 3 × opponents).
- <details><summary><b>Other variants (16)</b></summary>

  [`2014-2034-5003`](https://commanderspellbook.com/combo/2014-2034-5003/), [`1434-2305-3851`](https://commanderspellbook.com/combo/1434-2305-3851/), [`2014-4050-5003`](https://commanderspellbook.com/combo/2014-4050-5003/), [`1535-2457`](https://commanderspellbook.com/combo/1535-2457/), [`1434-2305-4711`](https://commanderspellbook.com/combo/1434-2305-4711/), [`2305-3851-4600`](https://commanderspellbook.com/combo/2305-3851-4600/), [`1571-1873-4629`](https://commanderspellbook.com/combo/1571-1873-4629/), [`988-1211-1371-1409-1771`](https://commanderspellbook.com/combo/988-1211-1371-1409-1771/), [`2305-4600-4711`](https://commanderspellbook.com/combo/2305-4600-4711/), [`1634-3160-3858`](https://commanderspellbook.com/combo/1634-3160-3858/), [`988-1211-1371-1771-4078`](https://commanderspellbook.com/combo/988-1211-1371-1771-4078/), [`190-202-4591-4701`](https://commanderspellbook.com/combo/190-202-4591-4701/), [`2305-2719-3851`](https://commanderspellbook.com/combo/2305-2719-3851/), [`2305-3604-3851`](https://commanderspellbook.com/combo/2305-3604-3851/), [`2305-2719-4711`](https://commanderspellbook.com/combo/2305-2719-4711/), [`2305-3604-4711`](https://commanderspellbook.com/combo/2305-3604-4711/)

  </details>

#### One extra resource per opponent (Araumi of the Dead Tide lines; Rakdos, the Muscle + Doomsday Excruciator; Virulent Silencer + Mirrorweave)
**Priority:** Low · **Variants:** 12 · **Popularity:** 2,025 (EDHREC decks, summed)
- **Most popular variant:** [`5618-5909`](https://commanderspellbook.com/combo/5618-5909/): Rakdos, the Muscle | Doomsday Excruciator
- **Generator combo IDs:** `8849`, `8850`, `9121`, `9130`, `9808`, `11924`, `11925`, `11926`, `15544`, `15545`, `30240`, `31817`
- **The database says now:**
  > *Mana needed:* {B}{B}{B}{B}{B}{B}
  > *Notes:* You can repeat steps 3 and 4 using other methods of sacrificing to exile other opponents' libraries. In order for this to work, you'll need to control an extra creature with power 6 or greater for each other opponent you have.
- **Widget math:** One extra graveyard card per opponent; one extra power-6+ creature per other opponent; one unblockable creature per opponent.
- <details><summary><b>Other variants (11)</b></summary>

  [`1056-1719-4684`](https://commanderspellbook.com/combo/1056-1719-4684/), [`950-1056-4684`](https://commanderspellbook.com/combo/950-1056-4684/), [`1056-2084`](https://commanderspellbook.com/combo/1056-2084/), [`1056-2085-4684`](https://commanderspellbook.com/combo/1056-2085-4684/), [`1056-1719-4639`](https://commanderspellbook.com/combo/1056-1719-4639/), [`1056-2085-4639`](https://commanderspellbook.com/combo/1056-2085-4639/), [`474-1056-2034`](https://commanderspellbook.com/combo/474-1056-2034/), [`2378-7118`](https://commanderspellbook.com/combo/2378-7118/), [`474-1056-4050`](https://commanderspellbook.com/combo/474-1056-4050/), [`890-1056-2410`](https://commanderspellbook.com/combo/890-1056-2410/), [`1056-1571-4284`](https://commanderspellbook.com/combo/1056-1571-4284/)

  </details>

#### Venerated Rotpriest + Gatherer of Graces + Defiler of Vigor
**Priority:** Low · **Variants:** 1 · **Popularity:** 27 (EDHREC decks, summed)
- **Most popular variant:** [`1240-1560-2542-3018`](https://commanderspellbook.com/combo/1240-1560-2542-3018/): Venerated Rotpriest | Gatherer of Graces | Defiler of Vigor | Rancor
- **Generator combo IDs:** `25882`
- **The database says now:**
  > *Mana needed:* {G/P} equal to twenty times the number of opponents you have, minus one for each poison counter your opponents have
- **Widget math:** {G/P} equal to 20 × opponents − their poison counters.

#### Unspeakable Symbol + Sage of Hours + Gray Merchant of Asphodel + a blinker
**Priority:** Low · **Variants:** 4 · **Popularity:** 7 (EDHREC decks, summed)
- **Most popular variant:** [`328-791-1494-4428`](https://commanderspellbook.com/combo/328-791-1494-4428/): Unspeakable Symbol | Sage of Hours | Gray Merchant of Asphodel | Thassa, Deep-Dwelling
- **Generator combo IDs:** `4096`, `4097`, `19348`, `19349`
- **The database says now:**
  > *Notable prerequisites:* Your devotion to black times the number of opponents you have is greater than or equal to 15.
- **Widget math:** Devotion to black × opponents ≥ 15.
- **Other variants (3):** [`328-791-1494-2334`](https://commanderspellbook.com/combo/328-791-1494-2334/), [`328-791-1494-2963`](https://commanderspellbook.com/combo/328-791-1494-2963/), [`328-791-933-1494`](https://commanderspellbook.com/combo/328-791-933-1494/)

#### Codie, Vociferous Codex + Rakdos, Lord of Riots + Lampad of Death's Vigil
**Priority:** Low · **Variants:** 5 · **Popularity:** 5 (EDHREC decks, summed)
- **Most popular variant:** [`1322-2906-3100-3371`](https://commanderspellbook.com/combo/1322-2906-3100-3371/): Codie, Vociferous Codex | Rakdos, Lord of Riots | Lampad of Death's Vigil | Concordant Crossroads
- **Generator combo IDs:** `18974`, `18975`, `18976`, `18977`, `18978`
- **The database says now:**
  > *Mana needed:* {4}
  > *Notable prerequisites:* Codie does not have summoning sickness.You have at least two opponents. / Opponents have lost at least 3 life this turn plus an additional 2 life for each time you've cast Codie from the command zone this game, minus 1 life for each opponent you have beyond t…
- **Widget math:** Opponents must have lost at least 3 + 2 × Codie's command-zone casts − (opponents − 2) life this turn.
- **Other variants (4):** [`1849-2906-3100-3371`](https://commanderspellbook.com/combo/1849-2906-3100-3371/), [`254-2906-3100-3371`](https://commanderspellbook.com/combo/254-2906-3100-3371/), [`647-2906-3100-3371`](https://commanderspellbook.com/combo/647-2906-3100-3371/), [`969-2906-3100-3371`](https://commanderspellbook.com/combo/969-2906-3100-3371/)

## 10. Commander tax

**Widget id:** `commander-tax`

**Widget:** input the number of times the commander has been cast from the command zone. Output the cost, or the threshold, at that tax and how it grows each loop.

Hundreds of other variants just say "plus commander tax, if applicable". A single global "times cast" input on the combo page would cover them; they're counted in the summary rather than listed.

#### Krenko, Mob Boss + Skirk Prospector (+ a haste enabler, or Phyrexian Altar / Thermopod)
**Priority:** High · **Variants:** 37 · **Popularity:** 161,545 (EDHREC decks, summed)
- **Most popular variant:** [`38-659-1288`](https://commanderspellbook.com/combo/38-659-1288/): Krenko, Mob Boss | Skirk Prospector | Goblin Warchief
- **Generator combo IDs:** `18215`, `18216`, `18217`, `18218`, `18219`, `18220`, `18221`, `18222`, `18223`, `18224`, `18225`, `29074`, `29075`, `29871`, `29872`, `29873`, `31782`
- **The database says now:**
  > *Notable prerequisites:* You control a number of Goblins that is equal to or greater than six plus Krenko's commander tax.
- **Widget math:** Krenko doubles your Goblins, then you sacrifice 4 + tax of them to recast Krenko. With G Goblins and tax t, the next loop has 2G − 3 − t Goblins and tax t + 2, so G − t changes to 2(G − t) − 5. It is stable at 5 (endless, no surplus) and grows from 6. Database: Goblins ≥ 6 + tax. The widget shows Goblins, tax and surplus mana loop by loop.
- **Check:** Matches the database for the surplus results (5 + tax would only sustain the loop).
- <details><summary><b>Other variants (36)</b></summary>

  [`38-659-3954`](https://commanderspellbook.com/combo/38-659-3954/), [`38-659-6410`](https://commanderspellbook.com/combo/38-659-6410/), [`38-659-5295`](https://commanderspellbook.com/combo/38-659-5295/), [`38-659-1879`](https://commanderspellbook.com/combo/38-659-1879/), [`38-659-969`](https://commanderspellbook.com/combo/38-659-969/), [`38-659-1849`](https://commanderspellbook.com/combo/38-659-1849/), [`659-1288-4050`](https://commanderspellbook.com/combo/659-1288-4050/), [`659-3954-4050`](https://commanderspellbook.com/combo/659-3954-4050/), [`38-659-6633`](https://commanderspellbook.com/combo/38-659-6633/), [`38-659-1115`](https://commanderspellbook.com/combo/38-659-1115/), [`659-4050-6410`](https://commanderspellbook.com/combo/659-4050-6410/), [`38-659-4068`](https://commanderspellbook.com/combo/38-659-4068/), [`659-1849-4050`](https://commanderspellbook.com/combo/659-1849-4050/), [`38-659-4885`](https://commanderspellbook.com/combo/38-659-4885/), [`659-1288-5231`](https://commanderspellbook.com/combo/659-1288-5231/), [`38-659-4412`](https://commanderspellbook.com/combo/38-659-4412/), [`659-3954-5231`](https://commanderspellbook.com/combo/659-3954-5231/), [`38-647-659`](https://commanderspellbook.com/combo/38-647-659/), [`659-4050-4068`](https://commanderspellbook.com/combo/659-4050-4068/), [`659-5231-6410`](https://commanderspellbook.com/combo/659-5231-6410/), [`38-659-3499`](https://commanderspellbook.com/combo/38-659-3499/), [`659-1849-5231`](https://commanderspellbook.com/combo/659-1849-5231/), [`38-659-3480`](https://commanderspellbook.com/combo/38-659-3480/), [`38-659-7175`](https://commanderspellbook.com/combo/38-659-7175/), [`659-4068-5231`](https://commanderspellbook.com/combo/659-4068-5231/), [`38-659-6791`](https://commanderspellbook.com/combo/38-659-6791/), [`38-659-7060`](https://commanderspellbook.com/combo/38-659-7060/), [`38-659-7296`](https://commanderspellbook.com/combo/38-659-7296/), [`38-659-6968`](https://commanderspellbook.com/combo/38-659-6968/), [`38-659-7297`](https://commanderspellbook.com/combo/38-659-7297/), [`38-659-7103`](https://commanderspellbook.com/combo/38-659-7103/), [`38-659-4460`](https://commanderspellbook.com/combo/38-659-4460/), [`38-206-659`](https://commanderspellbook.com/combo/38-206-659/), [`38-659-4742`](https://commanderspellbook.com/combo/38-659-4742/), [`38-659-4785`](https://commanderspellbook.com/combo/38-659-4785/), [`38-659-5434`](https://commanderspellbook.com/combo/38-659-5434/)

  </details>

#### Teferi, Temporal Archmage + The Chain Veil
**Priority:** Medium · **Variants:** 1 · **Popularity:** 24,278 (EDHREC decks, summed)
- **Most popular variant:** [`787-1124`](https://commanderspellbook.com/combo/787-1124/): Teferi, Temporal Archmage | The Chain Veil
- **Generator combo IDs:** `1785`
- **The database says now:**
  > *Notable prerequisites:* Teferi has at least five loyalty counters on it. / You control a combination of up to three permanents on the battlefield with the ability to produce a total of at least {4}. / You control an additional permanent that can be tapped to add at least {U}.You hav…
- **Widget math:** Each recast from the command zone costs 2 more; the description computes the extra activations as ⌊(Chain Veil activations − 4) / 2⌋. Input: times Teferi has been recast. Output: activations and mana per cycle.

#### Elenda, the Dusk Rose lines
**Priority:** Low · **Variants:** 4 · **Popularity:** 2,493 (EDHREC decks, summed)
- **Most popular variant:** [`1988-2876-4050`](https://commanderspellbook.com/combo/1988-2876-4050/): Elenda, the Dusk Rose | Phyrexian Altar | Blade of the Bloodchief
- **Generator combo IDs:** `12466`, `26226`, `31167`, `31590`
- **The database says now:**
  > *Mana needed:* {3}{W/B} plus commander tax if applicable
  > *Notable prerequisites:* Elenda's power is at least 4 plus its commander tax.
  > *Notes:* Once you have infinite Vampires and infinite mana, you can attach Blade of the Bloodchief to any creature you control and sacrifice Vampires to put +1/+1 counters on those creature(s).
- **Widget math:** Elenda's power (or counters, or creatures) has to be at least a base number plus one for each previous command-zone cast (or its tax).
- **Other variants (3):** [`2876-3757-4050`](https://commanderspellbook.com/combo/2876-3757-4050/), [`1270-2876-4050`](https://commanderspellbook.com/combo/1270-2876-4050/), [`2876-4050-7049`](https://commanderspellbook.com/combo/2876-4050-7049/)

#### Cost-reducing commanders (The Balrog, Durin's Bane; Ghalta, Primal Hunger; The Pride of Hull Clade; Emry, Lurker of the Loch)
**Priority:** Low · **Variants:** 26 · **Popularity:** 1,088 (EDHREC decks, summed)
- **Most popular variant:** [`4050-4516-4871`](https://commanderspellbook.com/combo/4050-4516-4871/): The Balrog, Durin's Bane | Phyrexian Altar | Pitiless Plunderer
- **Generator combo IDs:** `18159`, `18160`, `18161`, `18162`, `18163`, `18164`, `18165`, `18166`, `29123`, `29124`, `31152`, `32970`, `33116`, `33205`
- **The database says now:**
  > *Mana needed:* {B}{R}
  > *Notable prerequisites:* There have been a number of permanents sacrificed this turn equal to five plus The Balrog's commander tax.
- **Widget math:** Permanents sacrificed this turn ≥ 5 + tax; total power ≥ 10 + tax; total toughness of other creatures ≥ 10 + tax; artifacts ≥ 2 + tax.
- <details><summary><b>Other variants (25)</b></summary>

  [`470-1560-3519`](https://commanderspellbook.com/combo/470-1560-3519/), [`4050-4314-4516`](https://commanderspellbook.com/combo/4050-4314-4516/), [`2393-4050-4516`](https://commanderspellbook.com/combo/2393-4050-4516/), [`849-4050-4516`](https://commanderspellbook.com/combo/849-4050-4516/), [`4050-4516-4556`](https://commanderspellbook.com/combo/4050-4516-4556/), [`4050-4516-5075`](https://commanderspellbook.com/combo/4050-4516-5075/), [`4050-4516-4976`](https://commanderspellbook.com/combo/4050-4516-4976/), [`470-1560-4050-6270`](https://commanderspellbook.com/combo/470-1560-4050-6270/), [`4050-5353-6887`](https://commanderspellbook.com/combo/4050-5353-6887/), [`4050-4516-5254`](https://commanderspellbook.com/combo/4050-4516-5254/), [`470-2034-2661-7635`](https://commanderspellbook.com/combo/470-2034-2661-7635/), [`470-2661-4050-7635`](https://commanderspellbook.com/combo/470-2661-4050-7635/), [`470-2661-5256-7635`](https://commanderspellbook.com/combo/470-2661-5256-7635/), [`1329-2047-3169-4050`](https://commanderspellbook.com/combo/1329-2047-3169-4050/), [`1329-3169-4050-4483`](https://commanderspellbook.com/combo/1329-3169-4050-4483/), [`1329-3169-4050-5491`](https://commanderspellbook.com/combo/1329-3169-4050-5491/), [`1329-3169-4050-5726`](https://commanderspellbook.com/combo/1329-3169-4050-5726/), [`413-470-2661-7635`](https://commanderspellbook.com/combo/413-470-2661-7635/), [`66-1329-3169-4050`](https://commanderspellbook.com/combo/66-1329-3169-4050/), [`1329-1469-3169-4050`](https://commanderspellbook.com/combo/1329-1469-3169-4050/), [`1329-3169-4050-5129`](https://commanderspellbook.com/combo/1329-3169-4050-5129/), [`1329-3169-4050-6618`](https://commanderspellbook.com/combo/1329-3169-4050-6618/), [`797-1329-3169-4050`](https://commanderspellbook.com/combo/797-1329-3169-4050/), [`964-1329-3169-4050`](https://commanderspellbook.com/combo/964-1329-3169-4050/), [`972-1329-3169-4050`](https://commanderspellbook.com/combo/972-1329-3169-4050/)

  </details>

#### Other tax-dependent thresholds (The Cyber-Controller, Sin, The Swarmlord, Farmer Cotton, Henzie "Toolbox" Torre, Uro + Ezzaroot Channeler, Abby, Nadier)
**Priority:** Low · **Variants:** 23 · **Popularity:** 120 (EDHREC decks, summed)
- **Most popular variant:** [`4010-4050-4659`](https://commanderspellbook.com/combo/4010-4050-4659/): Farmer Cotton | Phyrexian Altar | Krark-Clan Ironworks
- **Generator combo IDs:** `5962`, `10523`, `11509`, `14346`, `17637`, `25943`, `25944`, `30780`, `33405`
- **The database says now:**
  > *Mana needed:* {3}{G}{W} plus an additional {3} available for each time you've cast Farmer Cotton from the command zone this game
- **Widget math:** Each threshold grows with the number of command-zone casts (+2 artifacts per cast, +1 counter per cast, +{3} per cast, …), as worded in each variant.
- <details><summary><b>Other variants (22)</b></summary>

  [`215-866-3291`](https://commanderspellbook.com/combo/215-866-3291/), [`457-3003-3263-4659-5341`](https://commanderspellbook.com/combo/457-3003-3263-4659-5341/), [`2347-3304-4067-5047`](https://commanderspellbook.com/combo/2347-3304-4067-5047/), [`654-1671-2895-3497`](https://commanderspellbook.com/combo/654-1671-2895-3497/), [`527-1636-5256-6730`](https://commanderspellbook.com/combo/527-1636-5256-6730/), [`81-1636-5256-6730`](https://commanderspellbook.com/combo/81-1636-5256-6730/), [`1336-1636-2034-6730`](https://commanderspellbook.com/combo/1336-1636-2034-6730/), [`1336-1636-4050-6730`](https://commanderspellbook.com/combo/1336-1636-4050-6730/), [`1336-1636-5256-6730`](https://commanderspellbook.com/combo/1336-1636-5256-6730/), [`1636-2034-6478-6730`](https://commanderspellbook.com/combo/1636-2034-6478-6730/), [`1636-4050-6478-6730`](https://commanderspellbook.com/combo/1636-4050-6478-6730/), [`1636-5256-6478-6730`](https://commanderspellbook.com/combo/1636-5256-6478-6730/), [`2034-4050-6970-7850`](https://commanderspellbook.com/combo/2034-4050-6970-7850/), [`3035-3519`](https://commanderspellbook.com/combo/3035-3519/), [`413-1336-1636-6730`](https://commanderspellbook.com/combo/413-1336-1636-6730/), [`413-1636-6478-6730`](https://commanderspellbook.com/combo/413-1636-6478-6730/), [`413-527-1636-6730`](https://commanderspellbook.com/combo/413-527-1636-6730/), [`527-1636-2034-6730`](https://commanderspellbook.com/combo/527-1636-2034-6730/), [`527-1636-4050-6730`](https://commanderspellbook.com/combo/527-1636-4050-6730/), [`81-1636-2034-6730`](https://commanderspellbook.com/combo/81-1636-2034-6730/), [`81-1636-4050-6730`](https://commanderspellbook.com/combo/81-1636-4050-6730/), [`81-413-1636-6730`](https://commanderspellbook.com/combo/81-413-1636-6730/)

  </details>

#### Dargo, the Shipwrecker lines
**Priority:** Low · **Variants:** 41 · **Popularity:** 107 (EDHREC decks, summed)
- **Most popular variant:** [`624-784-3327-3719`](https://commanderspellbook.com/combo/624-784-3327-3719/): Dargo, the Shipwrecker | Silas Renn, Seeker Adept | Ruthless Technomancer | Phantasmal Image
- **Generator combo IDs:** `4895`, `4896`, `16624`, `16626`, `16627`, `25482`, `25483`, `26513`, `26526`, `28611`
- **The database says now:**
  > *Mana needed:* {2}{B}{R}
  > *Notable prerequisites:* You have sacrificed at least two artifacts and/or creatures this turn, plus an additional artifact or creature for each time you've cast Dargo from the command zone this game.
- **Widget math:** Artifacts and/or creatures sacrificed this turn ≥ 2 or 3 + one per previous command-zone cast.
- <details><summary><b>Other variants (40)</b></summary>

  [`3327-4050`](https://commanderspellbook.com/combo/3327-4050/), [`2034-3327-4549`](https://commanderspellbook.com/combo/2034-3327-4549/), [`3327-4549-5147`](https://commanderspellbook.com/combo/3327-4549-5147/), [`3327-5231`](https://commanderspellbook.com/combo/3327-5231/), [`392-2034-3327`](https://commanderspellbook.com/combo/392-2034-3327/), [`392-3327-5256`](https://commanderspellbook.com/combo/392-3327-5256/), [`3327-4549-5256`](https://commanderspellbook.com/combo/3327-4549-5256/), [`784-3327-3719-4089`](https://commanderspellbook.com/combo/784-3327-3719-4089/), [`1368-1414-3327-5256`](https://commanderspellbook.com/combo/1368-1414-3327-5256/), [`392-413-3327`](https://commanderspellbook.com/combo/392-413-3327/), [`413-3327-4549`](https://commanderspellbook.com/combo/413-3327-4549/), [`784-1810-3327-3719`](https://commanderspellbook.com/combo/784-1810-3327-3719/), [`784-3327-3719-4284`](https://commanderspellbook.com/combo/784-3327-3719-4284/), [`784-3327-3719-4615`](https://commanderspellbook.com/combo/784-3327-3719-4615/), [`2292-3327-4549`](https://commanderspellbook.com/combo/2292-3327-4549/), [`2438-3327-4549`](https://commanderspellbook.com/combo/2438-3327-4549/), [`2511-3327-4549`](https://commanderspellbook.com/combo/2511-3327-4549/), [`2921-3327-4549`](https://commanderspellbook.com/combo/2921-3327-4549/), [`3327-3899-4549`](https://commanderspellbook.com/combo/3327-3899-4549/), [`3327-3967-4549`](https://commanderspellbook.com/combo/3327-3967-4549/), [`3327-4247-4549`](https://commanderspellbook.com/combo/3327-4247-4549/), [`3327-4549-5686`](https://commanderspellbook.com/combo/3327-4549-5686/), [`3327-4549-6495`](https://commanderspellbook.com/combo/3327-4549-6495/), [`3327-4549-6797`](https://commanderspellbook.com/combo/3327-4549-6797/), [`3327-4549-6798`](https://commanderspellbook.com/combo/3327-4549-6798/), [`3327-4549-8095`](https://commanderspellbook.com/combo/3327-4549-8095/), [`392-2292-3327`](https://commanderspellbook.com/combo/392-2292-3327/), [`392-2438-3327`](https://commanderspellbook.com/combo/392-2438-3327/), [`392-2511-3327`](https://commanderspellbook.com/combo/392-2511-3327/), [`392-2921-3327`](https://commanderspellbook.com/combo/392-2921-3327/), [`392-3327-3899`](https://commanderspellbook.com/combo/392-3327-3899/), [`392-3327-3967`](https://commanderspellbook.com/combo/392-3327-3967/), [`392-3327-4247`](https://commanderspellbook.com/combo/392-3327-4247/), [`392-3327-5686`](https://commanderspellbook.com/combo/392-3327-5686/), [`392-3327-6495`](https://commanderspellbook.com/combo/392-3327-6495/), [`392-3327-6797`](https://commanderspellbook.com/combo/392-3327-6797/), [`392-3327-6798`](https://commanderspellbook.com/combo/392-3327-6798/), [`392-3327-8095`](https://commanderspellbook.com/combo/392-3327-8095/), [`392-997-3327`](https://commanderspellbook.com/combo/392-997-3327/), [`997-3327-4549`](https://commanderspellbook.com/combo/997-3327-4549/)

  </details>

## Presumed errors: ready-to-submit update reports

Each block maps one-to-one onto the update form at [https://commanderspellbook.com/submit-an-update/](https://commanderspellbook.com/submit-an-update/) (Update Kind → Combos displaying the issue(s) → Describe the problem → Propose a possible solution → Comments). The form link pre-fills the first combo. The rules points the reports rely on:

- Aetherflux Reservoir's Oracle text is "you gain 1 life for each spell you've cast this turn", which includes the spell that triggered it.
- Paying or losing life down to 0 loses the game at the next state-based action check, before any pending trigger can gain the life back.
- If you and the last opponent reach 0 together, the game is a draw.

<a id="r1"></a>

### R1: Noctis + Hex Parasite + Lotus Petal: storm count 2 needs 7 life, not 6

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=1414-4417-4740-6613
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (1):** `1414-4417-4740-6613`
- **Describe the problem:**

  > The Notes give the minimum life by starting storm count as 14, 10, 6, 5, 4. The value for storm count 2 is wrong: it is 7. Each loop pays 3 life for Noctis, then Aetherflux Reservoir gains the number of spells cast this turn (including Lotus Petal), then Hex Parasite's {B/P} costs 2 life. With two spells already cast, life relative to the start goes −3, 0, −2 / −5, −1, −3 / −6, −1, −3 / −6, 0, −2 and then rises. The low point is −6, and paying down to 0 loses the game before the Aetherflux trigger resolves, so you need 7. Also, the easy prerequisite "Your life total is at least 4" only holds when you've already cast four or more spells this turn.

- **Propose a possible solution:**

  > Notes: change the values to 14, 10, 7, 5, 4. Prerequisite: "Your life total is at least 14 if you haven't cast a spell this turn, 10 if you've cast one, 7 if two, 5 if three, or 4 otherwise."

- **Comments:**

  > Worked out by simulating the loop step by step, with every life payment leaving at least 1 life.

<a id="r2"></a>

### R2: K'rrik + Ayara + Cloudstone Curio + Aetherflux: 8 life is enough, not 10

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=884-2232-3260-4740
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (1):** `884-2232-3260-4740`
- **Describe the problem:**

  > The prerequisite asks for at least ten life, but the loop needs 8 with no spells cast before it. Per loop: the {B} creature costs 2 life, Aetherflux gains the spell count, Ayara's trigger gains 1; Ayara costs 6 life, Aetherflux gains the spell count, Ayara's trigger gains 1. Life relative to the start: −2, −1, 0, −6, −4, −3 (loop 1); −5, −2, −1, −7, −3, −2 (loop 2); −4, +1, +2, −4, +2, +3 (loop 3), and it keeps rising. The low point is −7.

- **Propose a possible solution:**

  > "Your life total is at least eight", or by storm count: 8 / 6 / 5 / 4 / 3 with 0 / 1 / 2 / 3 / 4+ spells already cast this turn.

- **Comments:**

  > Aetherflux counts the spell that triggered it ("for each spell you've cast this turn").

<a id="r3"></a>

### R3: Aetherflux + Cloudstone Curio + Defiler: 4 life is enough, and step 4 misquotes Aetherflux

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=1560-2232-4740 (pre-fills the first combo; add the others by hand)
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (5):** `1560-2232-4740`, `2232-4399-4740`, `2232-3091-4740`, `823-2232-4740`, `2232-2312-4740`
- **Describe the problem:**

  > The prerequisite asks for at least 5 life, but 4 is enough: each loop pays 2 life (Defiler) and Aetherflux then gains the number of spells cast this turn, including the one that triggered it. From 4 life with no earlier spells: 4 → 2 → 3 → 1 → 3 → 1 → 4 → 2 → 6, never below 1. Step 4 also says "gain 1 life for each spell you've cast before it this turn", but Aetherflux Reservoir's Oracle text counts each spell you've cast this turn, the triggering one included.

- **Propose a possible solution:**

  > Prerequisite: "Your life total is at least 4" (3 if you've already cast a spell this turn). Step 4: "…causing you to gain 1 life for each spell you've cast this turn."

- **Comments:**

  > Same text on all five Defiler versions (Vigor, Dreams, Faith, Flesh, Instinct).

<a id="r4"></a>

### R4: Channel + Aetherflux + Sprout Swarm: casting Channel triggers Aetherflux, so 7 life is enough

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=3209-4740-7439
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (1):** `3209-4740-7439`
- **Describe the problem:**

  > The prerequisite asks for at least 11 life. That's the value you'd get if casting the copy of Channel (step 1) didn't trigger Aetherflux Reservoir, but casting a copy is casting a spell. Counting that trigger, 7 life is enough with no earlier spells: 7 → 8 (Channel) → 4 → 6 → 2 → 5 → 1 → 5 → 1 → 6 → 2 → 8 → 4 → 11 … (each loop: 4 life into Channel mana, then Sprout Swarm's trigger). With 6 life the third Sprout Swarm can't be paid.

- **Propose a possible solution:**

  > Prerequisite: "Your life total is at least 7" (4, 2 or 1 if you've already cast one, two, or three or more spells this turn). Add after step 1: "Aetherflux Reservoir triggers, causing you to gain 1 life for each spell you've cast this turn."

- **Comments:**

  > The Notes already say the requirement drops with earlier spells; this just moves the base value.

<a id="r5"></a>

### R5: Ojer Axonil + Pyrohemia / Warmonger: at exactly the listed life the game ends in a draw

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=2868-4629 (pre-fills the first combo; add the others by hand)
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (2):** `2868-4629`, `2663-2868`
- **Describe the problem:**

  > The prerequisite says your life total must be equal to or greater than the highest opponent life total divided by Ojer Axonil's power, rounded up. That quotient is exactly the number of activations needed, and each activation also deals 1 damage to you. With exactly that much life, the last activation brings you and the last opponent to 0 at the same time, and the game is a draw. Example: highest opponent at 40, Ojer at power 4: 10 activations, and at 10 life you finish at 0.

- **Propose a possible solution:**

  > "Your life total is greater than the highest life total among your opponents divided by Ojer Axonil's power, rounded up."

- **Comments:**

  > The mana prerequisite (the same quotient in {R}, or twice it for Warmonger) is correct.

<a id="r6"></a>

### R6: Angel of Destiny + Seize the Day: life requirement grows the wrong way with opponents

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=2481-2790
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (1):** `2481-2790`
- **Describe the problem:**

  > Prerequisite: "Your life total is at least 11 greater than your starting life total plus an additional 2 life for each opponent beyond the first." Angel of Destiny is a 2/6 with double strike, so each combat it deals 2 + 2 damage to a player and you gain 4 life. The end step check needs 15 life above your starting total. The listed steps give three combats (normal, Seize the Day, flashback), so you gain 12 and only need 3 above your starting total beforehand. Even counting one combat per opponent, each extra opponent attacked lowers the requirement by 4 (11, 7, 3) instead of raising it by 2.

- **Propose a possible solution:**

  > "Your life total is at least 3 greater than your starting life total." (The steps always use three combats; with fewer than three opponents, attack an opponent again.)

- **Comments:**

  > Life gained by the opponents doesn't matter for Angel of Destiny's end step check.

<a id="r7"></a>

### R7: Angel of Destiny + The Master, Multiplied + Blade of Selves: every Angel triggers on every hit (4N², not 4N)

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=2790-3851-4836 (pre-fills the first combo; add the others by hand)
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (6):** `2790-3851-4836`, `2790-4836-4989`, `2790-4711-4836`, `2790-4836-6721`, `2790-4836-5361`, `2790-4836-6330`
- **Describe the problem:**

  > Prerequisite: "Your life total is equal to or greater than 55 minus 4 for each opponent you have." With N opponents, myriad gives N attacking Angels of Destiny. Each Angel triggers whenever any creature you control deals combat damage to a player. So the 2N damage events (double strike) each trigger all N Angels for 2 life: you gain 4N² life, not 4N. The requirement is 55 − 4N² at 40 starting life: 51 / 39 / 19 with 1 / 2 / 3 opponents. The current formula gives 51 / 47 / 43. Step 2 has the same undercount.

- **Propose a possible solution:**

  > Prerequisite: "Your life total is at least 55 minus 4 times the square of the number of opponents you have (51 with one opponent, 39 with two, 19 with three)." Step 2: each Angel of Destiny triggers once for each Angel that dealt combat damage, so you gain 4N² life in total.

- **Comments:**

  > Applies to all six variants of this combo.

<a id="r8"></a>

### R8: K'rrik + Chainer + Gray Merchant / Kokusho + Buried Alive: life prerequisite too low for the listed steps

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=328-1377-2292-3211-3260-4078 (pre-fills the first combo; add the others by hand)
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (6):** `328-1377-2292-3211-3260-4078`, `328-2292-3211-3260-4078-4812`, `328-2292-2896-3211-3260-4078`, `1377-2123-2292-3211-3260-4078`, `2123-2292-3211-3260-4078-4812`, `2123-2292-2896-3211-3260-4078`
- **Describe the problem:**

  > With the steps as written, all life is paid before the first drain: Buried Alive 2 + Animate Dead or Necromancy 2 (Reanimate: 2 + 5 for Chainer's mana value) + Chainer returning Viscera Seer 9 + Chainer returning the drainer 9 = 22 (27 with Reanimate). Staying at 1 or more needs 23 (28 with Reanimate), not the listed 18 (23). The listed values are only enough if Gray Merchant comes back before Viscera Seer and devotion × opponents is at least 14 (at exactly 14 they are the minimum). With Gray Merchant first, the minimum is 22 (27) at devotion 10 with one opponent, 18 (23) at a drain of 14, and 14 (19) at a drain of 18 or more. The Kokusho versions can't reorder (Viscera Seer is needed to kill Kokusho), so they need 23 (28) at any table size.

- **Propose a possible solution:**

  > Gray Merchant versions: either keep the steps and change the life prerequisite to 23 (28 with Reanimate), or return Gray Merchant before Viscera Seer and give the life needed by drain amount (22 / 18 / 14 at devotion × opponents 10 / 14 / 18+, plus 5 with Reanimate). Kokusho versions: 23 (28 with Reanimate).

- **Comments:**

  > Example with 18 life (Animate Dead): 16 → 14 → 5 after returning Viscera Seer, and the second Chainer activation (9 life) can't be paid.

<a id="r9"></a>

### R9: Sensei's Top + Aetherflux + Treasonous Ogre + Mystic Forge: mana formula off in five cells

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=985-4740-5078-5313 (pre-fills the first combo; add the others by hand)
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (11):** `985-4740-5078-5313`, `4316-4740-5078-5313`, `4740-5078-5243-5313`, `1395-4740-5078-5313`, `1456-4740-5078-5313`, `4740-5078-5313-5741`, `4311-4740-5078-5313`, `4740-5078-5313-6766`, `4740-5078-5313-6650`, `1661-4740-5078-5313`, `4740-5078-5313-6918`
- **Describe the problem:**

  > Mana needed is written as "{2} minus {1} for each 3 life you have and minus {1} if your storm count is 2 or greater". An exhaustive search of the loop (each Top recast costs {1}, paid from the pool or with 3 life via Treasonous Ogre, which needs at least 4 life; Aetherflux then gains the spell count) gives: storm 0: {2} at 1–3 life, {1} at 4–6, {0} at 7+; storm 1: {2} at 1 life, {1} at 2–4, {0} at 5+; storm 2+: {1} at 1–3 life, {0} at 4+. The formula asks for too little at storm 0 with 3 or 6 life and at storm 2+ with 3 life, and too much at storm 1 with 2 or 5 life. Example: storm 0, 6 life, no mana: Ogre → 3, Aetherflux +1 → 4; Ogre → 1, +2 → 3; the third loop can't be paid.

- **Propose a possible solution:**

  > Mana needed: "{2} if your life total is 3 or less, {1} if it is 6 or less, if you haven't cast a spell this turn; {2} at 1 life or {1} at 4 or less if you've cast one spell; {1} at 3 or less life if you've cast two or more."

- **Comments:**

  > Shared by all eleven variants of this combo.

<a id="r10"></a>

### R10: Will + Debt to the Deathless + Revival // Revenge: prerequisite ignores the halved highest opponent

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=698-805-4624
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (1):** `698-805-4624`
- **Describe the problem:**

  > Prerequisite: "Your life total is equal to or greater than half the second highest life total among your opponents, rounded up." Revenge only halves the targeted opponent, so they can still have more life than the second highest. Example: opponents at 40 and 15. The prerequisite asks for 8 life; Revenge doubles you to 16 (X = 8) and drops the first opponent to 20. Debt to the Deathless makes each opponent lose 16, and the first one survives at 4.

- **Propose a possible solution:**

  > "Your life total is at least half the greater of the second highest life total among your opponents and half the highest one (rounded down), rounded up."

- **Comments:**

  > In the example 10 life is needed.

<a id="r11"></a>

### R11: Rowan + Debt to the Deathless: losing exactly that much life leaves you at 0

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=140-805-3591 (pre-fills the first combo; add the others by hand)
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (3):** `140-805-3591`, `140-805-2749`, `140-805-1745`
- **Describe the problem:**

  > Prerequisite: "Your life total is equal to or greater than half the highest life total among your opponents, rounded up." X is the life you lost this turn, so you lose that much life before casting Debt to the Deathless. With exactly that much life you are at 0 and lose the game before Debt to the Deathless resolves.

- **Propose a possible solution:**

  > "Your life total is greater than half the highest life total among your opponents, rounded up (life already lost this turn counts toward it)."

- **Comments:**

  > The Will, Scion of Peace + Beacon of Immortality version is correct as written: there X is life gained.

<a id="r13"></a>

### R13: Greven + a 2-, 3-, 4- or 8-life outlet: the rounded life formulas are wrong, several too low

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=4567-5174 (pre-fills the first combo; add the others by hand)
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (15):** `4567-5174`, `4567-5313`, `4567-4860`, `791-4567`, `2852-4567`, `4567-6735`, `4417-4567`, `4567-6733`, `4567-6731`, `4567-6732`, `4567-6736`, `4567-7688`, `3238-4567`, `4567-6734`, `13-4567`
- **Describe the problem:**

  > Greven needs 21 power, so you must lose at least 21 − power life. With an outlet paying c life per activation, you lose that amount rounded up to a multiple of c and must stay at 1 or more: life ≥ c·⌈(21 − power) / c⌉ + 1. The written formulas don't match this. 2-life outlets ("22 minus Greven's power, rounded up to the nearest multiple of 2") are one short at even power: at power 6 they say 16, but 15 power takes 8 activations (16 life). 3-life outlets ("24 minus …, rounded up to … 3") are always 2 too high (21 at base power 5 where 19 is enough). M.O.D.O.K. ("22 minus …, rounded down to … 3") is too low at every power (15 at base power 5 where 19 is needed). Marrow Bats ("23 minus …, multiple of 4") and Phyrexian Colossus ("23 minus …, multiple of 8") are too low at power 7 (16 where 17 is needed) and too high at base power (20 and 24 where 17 is enough).

- **Propose a possible solution:**

  > Use one wording for all of them: "Your life total is greater than 21 minus Greven's power, rounded up to the nearest multiple of N", with N = life paid per activation (2, 3, 4 or 8). This matches the 1-life versions ("at least 22 minus Greven's power").

- **Comments:**

  > Life needed at power 5 / 6 / 7 / 8: 2-life 17 / 17 / 15 / 15, 3-life 19 / 16 / 16 / 16, 4-life 17 / 17 / 17 / 17, 8-life 17 / 17 / 17 / 17.

<a id="r12"></a>

### R12: Gray Merchant + Blood Celebrant + Phyrexian Reclamation + Phyrexian Altar: Blood Celebrant needs 9 life, not 6

- **Form:** https://commanderspellbook.com/submit-an-update/?comboId=328-2358-2693-3260-4050
- **Update Kind:** Incorrect Information
- **Combos displaying the issue(s) (1):** `328-2358-2693-3260-4050`
- **Describe the problem:**

  > Step 5 says "Activate Blood Celebrant by paying 6 life, adding {B}{B}{B}". Each Blood Celebrant activation costs {B} (2 life with K'rrik) plus 1 life and adds one mana, so {B}{B}{B} costs 9 life. Phyrexian Altar's {B} pays Phyrexian Reclamation's {1}, so Gray Merchant's {3} has to come from three Blood Celebrant activations. Per loop you pay 4 + 4 + 9 = 17 life against 21 drained at devotion 7 with three opponents. It still works, netting 4 per loop rather than 7.

- **Propose a possible solution:**

  > Step 5: "Activate Blood Celebrant three times by paying 9 life, adding {B}{B}{B}."

- **Comments:**

  > The Ashnod's Altar version (two activations, 6 life) is correct.

