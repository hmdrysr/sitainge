# Icon coverage and review: Dadi pictures

Generated from `website/dadi/data/seed.json` (195 distinct glosses) with `node scripts/icon_coverage.js`. Pack: Tabler Icons 3.49.0, outline set, MIT licence.

## Why Tabler

| Pack | Licence | Icons (npm, this review) | Last npm release | Style | Tags and categories in npm |
|---|---|---|---|---|---|
| Tabler (chosen) | MIT | 5,184 outline (plus 1,054 filled) | 2026-10-05 | 24 px, stroke 2, round caps and joins, neutral | yes: every icon has tags and a category |
| Phosphor | MIT | 1,512 per weight | 2024-03 (core), 2024-12 (iconify) | outlines drawn as filled paths, rounded | yes, but not updated for two years |
| Lucide | ISC | about 1,860 tagged | 2026-10-04 | stroke 2, clean, fewer object icons | tags only |
| Ionicons | MIT | 1,357 files (about 515 base icons) | 2026-07-28 | iOS-like, three variants | no tags in the npm package |
| Iconoir | MIT | not counted | 2026-08 (iconify data 2026-10) | thin, geometric | limited |
| Material Symbols | Apache-2.0 | thousands, large files | 2026-10-02 | Google style, not iOS-like | limited |
| Heroicons, Bootstrap Icons, Remix Icon | MIT, MIT, Apache-2.0 | a few hundred to about 3,000 | 2026-05, 2025-05, 2026-01 | UI-focused | no tags |

Counts for Tabler, Phosphor, Lucide and Ionicons were read from the installed npm packages; release dates come from `npm view`. Iconoir, Material Symbols, Heroicons, Bootstrap and Remix were compared on licence, date and style only. GitHub was not reachable from this environment, so stars and issue activity were not checked.

A test on 252 basic words (family, body, food, home, numbers, colours, verbs, nature, time, objects) found a name or tag match for 215 words in Tabler and 168 in Phosphor. Tabler is stroke-based, so one stroke-width setting gives every icon the same weight, close to SF Symbols regular.

## What was built

- `scripts/build_icons.js` reads `@tabler/icons` and `@iconify-json/tabler` (install with `npm install --no-save @tabler/icons @iconify-json/tabler`), keeps path data only, and writes `website/dadi/data/icons.json` (about 116 KB; the old Fluent Emoji file was 1.29 MB).
- Word index: exact icon names and the first two tags, only for icons in concrete categories (food, animals, nature, weather, buildings, vehicles, mood, health, sport, gestures, games, map), only when exactly one icon claims the word, minus a reviewed deny list in `scripts/icon_concepts.js`.
- Hand-checked map: 249 words and phrases (body, food, home, numbers 0 to 11, motion verbs, nature, time, things, places, feelings, signs).
- `DadiIcons.find(gloss)` is strict: phrases longer than two words get nothing; function words, pronouns and colour words never match; plurals and a few irregular forms (men, leaves) are handled; alternatives such as house/home use the first that matches. Return shape is unchanged (an SVG string or null); the class is now `dicon`.
- `DadiIcons.ui(name)` returns 82 interface names (tab bar: learn=book, words=list, write=keyboard, teach=pencil, me=user; play, check, x, search, settings, chevron, volume, mic and more). They are also embedded in `js/icons.js`, so chrome renders before any download.

## Seed gloss results

Glosses: 195. With an icon: 58. None: 137 (of which 47 are sentences or phrases of three or more words, which never get a picture).

"ok" means the icon shows the thing named. Other marks say what kind of match it is.

| Gloss | Icon | Review |
|---|---|---|
| (on/to the) east | navigation-east | compass arrow |
| (on/to the) left | arrow-left | ok |
| (on/to the) north | navigation-north | compass arrow |
| (on/to the) right | arrow-right | ok |
| (on/to the) south | navigation-south | compass arrow |
| (on/to the) west | navigation-west | compass arrow |
| 0 | number-0 | ok (digit) |
| 1 | number-1 | ok (digit) |
| 10 | number-10 | ok (digit) |
| 11 | number-11 | ok (digit) |
| 2 | number-2 | ok (digit) |
| 3 | number-3 | ok (digit) |
| 4 | number-4 | ok (digit) |
| 5 | number-5 | ok (digit) |
| 6 | number-6 | ok (digit) |
| 7 | number-7 | ok (digit) |
| 8 | number-8 | ok (digit) |
| 9 | number-9 | ok (digit) |
| a leaf | leaf | ok |
| a picture | photo | near (photo) |
| bad | thumb-down | symbol (thumb-down is the usual sign for bad; it does not picture the word) |
| bicycle | bike | ok |
| boy | mood-boy | near (boy face) |
| chair | armchair | subtype (armchair) |
| door | door | ok |
| eat | tools-kitchen-2 | sign (fork and knife) |
| ENTRANCE | door-enter | ok |
| EXIT | door-exit | ok |
| food | bowl-spoon | near (bowl with spoon) |
| FORBIDDEN | forbid | standard sign (circle with slash) |
| good | thumb-up | symbol (thumb-up) |
| house/home | building-cottage | first alternative used (cottage) |
| job/work | briefcase | symbol (briefcase) |
| man | man | ok |
| MEN | man | sign (man pictogram) |
| person/human | user | ok |
| shop/store | building-store | ok |
| some leaves | leaf | ok |
| some pictures | photo | near (photo) |
| the book | book | ok |
| the books | book | ok |
| the door | door | ok |
| the doors | door | ok |
| the leaf | leaf | ok |
| the leaves | leaf | ok |
| the man | man | ok |
| the men | man | ok |
| the mountain | mountain | ok |
| the mountains | mountain | ok |
| the picture | photo | near (photo) |
| the pictures | photo | near (photo) |
| the wall | wall | ok |
| the walls | wall | ok |
| to work | briefcase | symbol (briefcase for the verb) |
| TOILET | badge-wc | standard WC sign |
| woman | woman | ok |
| WOMEN | woman | sign (woman pictogram) |
| Yes. | check | standard sign (check) |

### Removed or left empty on purpose

- thank you, thanks: the praying-hands icon can be read as a religious sign. No picture.
- table (only a picnic table exists) and straight (an up arrow could mean "up"): removed after review.
- rice, mother, father, brother, girl, family, hello, nose, mouth: Tabler has no plain icon for them. Left empty.
- Colours (red, blue, green, yellow, black, white, orange, pink, purple): a traffic light or a fruit would mislead. Show a CSS colour swatch instead.
- Numbers 12 to 90: Tabler has number icons only for 0 to 11. Show the digits as text.
- Days of the week, pronouns, question words, "and", "to/at", "all", "my": no picture by rule.
- About 1,200 automatic candidates were reviewed and loose or sensitive ones removed (river as bridge, rock, bolt, light, keyboard as piano, magnifier as money, ocean as submarine, cards, alcohol, weapons, smoking, death and prison topics). See `DENY_WORDS` and `DENY_ICONS`.

## Still doubtful (owner decision)

- bad and good: thumb-down and thumb-up are symbols, not pictures. Keep only if wanted as feedback symbols.
- boy (face icon), chair (armchair), picture (photo icon): near matches.
- eat and job/work: signs (fork and knife, briefcase), not literal.

## Visual check

`docs/dadi/icon-contact-sheet.png` shows 30 interface icons and 40 word pictures at 28 px, light and dark, rendered by Chromium (Playwright) through `DadiIcons.ui` and `DadiIcons.find`. Strokes are even, shapes are plain and nothing is coloured. Weak spots: milk reads as a jar, man and woman are plain pictograms. "rice" correctly shows nothing.

## Licence

Tabler Icons: MIT licence, copyright Paweł Kuna and contributors. The full licence text is in `website/dadi/data/ICONS-LICENSE-tabler.txt` (copied from `node_modules/@tabler/icons/LICENSE`, version 3.49.0). `data/icons.json` also carries a `source` field naming the pack and licence. Ship the licence file with the app and keep the MIT notice with any copy of the icon paths. `js/icons.js` and the hand-made word map are the project's own.

## Wiring notes for the app

- `index.html` tab bar may keep its inline SVGs (same style); to use this pack, call `DadiIcons.ui("learn")` and so on, and keep the visible labels.
- `js/app.js` calls `Icons.get("sparkles")` for the mascot; the sparkle icon still resolves, so remove that call per `UX_RESEARCH.md`.
- Add `.dicon { width: 1.25em; height: 1.25em; }` to `style.css`. `sw.js` already caches `data/icons.json` and `js/icons.js`; bump the cache name when deploying.
- `dictionary.js` passes only single-word glosses to `find`; the stricter matcher means that guard can stay.
