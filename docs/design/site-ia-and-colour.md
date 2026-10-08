# Site structure and colour: research and decisions

Status: draft, October 8, 2026. Applies to website/index.html, site.css, site.js, shell.js and the shared header and footer on the dictionary, translator and contribution pages. It follows docs/style/canadian-style-guide.md.

## 1. Why this document exists

The project owner reported four problems with the landing page. The header menu was neither aligned nor evenly spaced; at 390 px the brand sat in its own row and the four links were unevenly spaced, with Dadi set apart. The colour scheme felt gloomy. The page order seemed unplanned, and information about Chittagong appeared only after several screens. The owner also asked that the remedies rest on research.

This document records what was read, what could and could not be verified, and the rules that follow for this site.

## 2. How the sources were checked

- Journal articles were checked against their Crossref record, opened through a web fetch (the Crossref host was not reachable from the command line in this session). Title, authors, year, journal, volume and pages were compared with the citation below.
- Nielsen Norman Group (NN/g) and W3C pages were opened and read; the findings quoted are the ones the pages state.
- A source marked **unverified** could not be opened in this session (rate limiting, or a page that needs JavaScript). Its citation is given from memory and must be confirmed before it is quoted elsewhere.
- Where a table row says "bibliographic record verified", the full text was not read. The finding is then stated only at the level of the title or of a secondary source that was read, and no more.
- A rule marked "design judgment" is a decision of this project. No source read for this document establishes it.

## 3. Findings table

### 3.1 Information architecture and content order

| Principle | Citation | Status | Rule for this site |
|---|---|---|---|
| People look mainly at the top of a page. In a 2018 eye-tracking study, about 57% of viewing time fell above the fold and about 74% within the first two screenfuls. | Fessenden, T. (2018). Scrolling and attention. Nielsen Norman Group. https://www.nngroup.com/articles/scrolling-and-attention/ | Verified (page read) | The first two screens carry the answer to "what is this and where is it spoken". The region and map come before any tool detail, research or history. |
| Users scan in several patterns: F, spotted, layer-cake and commitment. Layer-cake (reading headings, then the section needed) is the most effective short of reading everything. | Pernice, K. (2019). Text scanning patterns: Eyetracking evidence. Nielsen Norman Group. https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/ | Verified (page read) | One idea per section, each with a descriptive heading that opens with the key word ("Where it is spoken", "Tools", "Research"). Keywords in links; bulleted lists for method notes. |
| F-pattern scanning happens when text is unformatted and readers want efficiency; place the main points in the first two paragraphs and group related items visually. | Pernice, K. (2017; reviewed 2026). F-shaped pattern of reading on the web: Misunderstood, but still relevant (even on mobile). Nielsen Norman Group. https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/ | Verified (page read) | The hero gives two sentences; the first names the language and the second the area. Related items sit in cards or bands with borders. |
| Inverted pyramid: lead with the most important information, then supporting detail in descending order of importance. | Schade, A. (2018). Inverted pyramid: Writing for comprehension. Nielsen Norman Group. https://www.nngroup.com/articles/inverted-pyramid/ | Verified (page read) | The page as a whole follows the pyramid: identity and place, then tools, then evidence, then history and facts, then ways to take part, then media. |
| Progressive disclosure: keep the first screen to a small set of core options and put specialized material behind a clearly labelled control; limit to two levels. | Nielsen, J. (2006). Progressive disclosure. Nielsen Norman Group. https://www.nngroup.com/articles/progressive-disclosure/ | Verified (page read) | A compact tools row (name and one-word purpose) appears in the hero. The full tool descriptions sit lower, in the Tools section. The map panel shows detail only after an area is selected. |
| A homepage should say in one sentence what the site does and give clear starting points for the main one to four tasks. | Nielsen, J. (2002). Top 10 guidelines for homepage usability. Nielsen Norman Group. https://www.nngroup.com/articles/top-ten-guidelines-for-homepage-usability/ | Verified (page read). Written in 2002; the tagline and top-task guidance is general, and the date is noted. | The lead sentence states what the project is. Four task links (Dadi, Dictionary, Translator, Extension) sit directly under it. |
| Hidden (hamburger) navigation lowered discoverability and slowed tasks; combination navigation (some items visible, the rest in a menu) performed far better on mobile than hidden navigation alone. In the study, hidden navigation was used in 57% of mobile cases and combination navigation in 86%. | Pernice, K., and Budiu, R. (2016). Hamburger menus and hidden navigation hurt UX metrics. Nielsen Norman Group. https://www.nngroup.com/articles/hamburger-menus/ | Verified (page read) | Do not rely on a menu alone. The task links are repeated in the page body (the tools row), and the header uses a labelled button ("Menu", not an icon alone). See section 5. |
| Tab or navigation bars suit about five options or fewer; hamburger menus fit many options but are the least discoverable; a homepage hub suits task-based sites. Prefer content over chrome on mobile. | Budiu, R. (2015). Basic patterns for mobile navigation: A primer. Nielsen Norman Group. https://www.nngroup.com/articles/mobile-navigation-patterns/ | Verified (page read) | The site has four sections, so full visible links are used from 760 px up. Below that, one row of brand and Menu button keeps chrome to 56 px. The landing page acts as the hub. |
| First impressions of a web page form within 50 ms and are stable. | Lindgaard, G., Fernandes, G., Dudek, C., and Brown, J. (2006). Attention web designers: You have 50 milliseconds to make a good first impression! Behaviour & Information Technology, 25(2), 115–126. https://doi.org/10.1080/01449290500330448 | Bibliographic record verified (Crossref). The 50 ms figure comes from the title; the full text was not read. | The first paint must look finished and calm: the compact hero, a clear heading and a map, with no empty or loading-only area at the top. |
| Grouping by proximity, similarity and enclosure shapes how a page is read (Gestalt principles). | Todorović, D. (2008). Gestalt principles. Scholarpedia, 3(12), 5345. https://doi.org/10.4249/scholarpedia.5345 | Bibliographic record verified (Crossref). Content not read in full. | Equal spacing within a group and larger spacing between groups; alternating plain and tinted bands mark sections. Header items share one baseline and equal gaps. |
| Target size: at least 24 by 24 CSS px (Level AA) and 44 by 44 CSS px (Level AAA). | W3C (2024). Web Content Accessibility Guidelines (WCAG) 2.2, success criteria 2.5.8 and 2.5.5. https://www.w3.org/TR/WCAG22/ | Verified (page read) | Every control is at least 44 px high, including the Menu button, links in the menu sheet, theme buttons and map layer chips. |
| One-handed thumb use on small touchscreens is affected by target size. | Parhi, P., Karlson, A. K., and Bederson, B. B. (2006). Target size study for one-handed thumb use on small touchscreen devices. MobileHCI '06, 203–210. https://doi.org/10.1145/1152215.1152260 | Bibliographic record verified (Crossref). Findings not read. | Supports the 44 px design choice only as background; the rule rests on WCAG 2.5.5. |
| Apple Human Interface Guidelines on navigation and tab bars. | Apple. Human Interface Guidelines, Navigation and search. https://developer.apple.com/design/human-interface-guidelines/navigation-and-search | **Unverified.** The page needs JavaScript and its text could not be read. | None. No rule here depends on it. |

### 3.2 Colour, legibility and trust

| Principle | Citation | Status | Rule for this site |
|---|---|---|---|
| Visual appeal has separable facets: simplicity, diversity, colourfulness and craftsmanship (VisAWI). In an experiment, changing a site's colour scheme affected only the colourfulness facet. | Moshagen, M., and Thielsch, M. T. (2010). Facets of visual aesthetics. International Journal of Human-Computer Studies, 68(10), 689–709. https://doi.org/10.1016/j.ijhcs.2010.05.006 | Verified (author's PDF read for title, facets, volume, pages and DOI) | Treat colour as one facet. Keep simplicity and craftsmanship (alignment, spacing, consistency) strong so that colour is not asked to carry the design. |
| Visual preferences, including those for colourfulness, differ by demographic group around the world. | Reinecke, K., and Gajos, K. Z. (2014). Quantifying visual preferences around the world. CHI '14, 11–20. https://doi.org/10.1145/2556288.2557052 | Bibliographic record verified (Crossref). Detailed findings not read. | Do not tune the palette to one assumed audience. Use moderate saturation and high text contrast, and let each visitor choose the theme. The "moderate saturation" part is a design judgment. |
| Colour appeal in web design differs within and across cultures, and appeal relates to the site's evaluation. | Cyr, D., Head, M., and Larios, H. (2010). Colour appeal in website design within and across cultures: A multi-method evaluation. International Journal of Human-Computer Studies, 68(1–2), 1–21. https://doi.org/10.1016/j.ijhcs.2009.08.005 | Bibliographic record verified (Crossref). Findings stated at the level of the title only. | One accent hue, used consistently, with no culturally loaded pairings. |
| Site design relates to trust, satisfaction and loyalty across cultures. | Cyr, D. (2008). Modeling web site design across cultures: Relationships to trust, satisfaction, and e-loyalty. Journal of Management Information Systems, 24(4), 47–72. https://doi.org/10.2753/MIS0742-1222240402 | Bibliographic record verified (Crossref). Findings stated at the level of the title only. | A research and heritage site depends on trust. Use a calm blue family, plain structure and visible sources. |
| Effects of colour depend on context; a colour has no fixed meaning. | Elliot, A. J., and Maier, M. A. (2014). Color psychology: Effects of perceiving color on psychological functioning in humans. Annual Review of Psychology, 65, 95–120. https://doi.org/10.1146/annurev-psych-010213-115035 | Bibliographic record verified (Crossref). Full text not read. | Never use colour alone to carry meaning. Evidence levels carry text labels and counts; map areas carry text labels. |
| Colour affects the appeal of a website and users' cognitive processes. | Bonnardel, N., Piolat, A., and Le Bigot, L. (2011). The impact of colour on website appeal and users' cognitive processes. Displays, 32(2), 69–80. https://doi.org/10.1016/j.displa.2010.12.002 | Bibliographic record verified (Crossref). Findings not read. | Supports restraint: one primary hue and one highlight rather than many. |
| Dark mode versus light mode: for people with normal vision, light mode (dark text on a light background) generally performs better, and the advantage grows as text gets smaller. Dark mode should not be the default for the general population, but users should always be able to switch to it. Use the operating system's setting where one exists. | Budiu, R. (2020). Dark mode vs. light mode: Which is better? Nielsen Norman Group. https://www.nngroup.com/articles/dark-mode/ | Verified (page read). It is a practitioner summary of the studies below. | Light is the default when the device sets no preference. The device's dark setting is respected, and a visible Auto, Light and Dark control lets the visitor override it. |
| Positive display polarity (dark text on light) improved acuity and proofreading for younger and older adults. | Piepenbrock, C., Mayr, S., and Buchner, A. (2013). Positive display polarity is advantageous for both younger and older adults. Ergonomics, 56(7), 1116–1124. | **Unverified.** A catalogue record with this title was found by search, and the NN/g page cites the 2013 study, but the DOI and pagination were not confirmed. | Used only through the NN/g summary. |
| The positive-polarity advantage is larger for small characters. | Piepenbrock, C., Mayr, S., and Buchner, A. (2014). Positive display polarity is particularly advantageous for small character sizes: Implications for display design. Human Factors, 56(5), 942–951. https://doi.org/10.1177/0018720813515509 | Bibliographic record verified (Crossref; online December 2013, print 2014). | Keep body text at 17 px or larger in both themes and never set small text in low-contrast colours. Small text (13 px) is limited to captions and uses the muted colour, which passes 4.5:1 in both themes. |
| Glance legibility under different ambient light and polarity: no polarity effect in simulated daylight; at night, positive polarity was better, especially for small text. | Dobres, J., Chahine, N., and Reimer, B. (2017). Effects of ambient illumination, contrast polarity, and letter size on text legibility under glance-like reading. Applied Ergonomics, 60, 68–73. https://doi.org/10.1016/j.apergo.2016.11.001 | Bibliographic record verified (Crossref); the finding is stated as summarized by NN/g. | Dark mode is offered, not forced. The dark theme uses a lifted navy rather than near-black to reduce glare at night while keeping text contrast above 10:1. |
| Glance legibility by age, typeface, size and display polarity (psychophysical methods). | Dobres, J., Chahine, N., Reimer, B., Gould, D., Mehler, B., and Wolfe, B. (2016). Utilising psychophysical techniques to investigate the effects of age, typeface design, size and display polarity on glance legibility. Ergonomics, 59(10), 1377–1391. https://doi.org/10.1080/00140139.2015.1137637 | **Unverified.** The Crossref record could not be fetched (rate limit) and the PMC page was blocked. | None. Not relied on. |
| Contrast minimums: text 4.5:1 (3:1 for large text); non-text interface components 3:1; colour not the only means of conveying information. | W3C (2024). WCAG 2.2, success criteria 1.4.3, 1.4.11 and 1.4.1. https://www.w3.org/TR/WCAG22/ | Verified (page read; W3C Recommendation of December 12, 2024) | All text pairs below must reach 4.5:1 and focus rings and the accent border 3:1, in both themes. This site's checks are in section 6. |
| Sequential map colour: use ordered single-hue ramps for ordered data; test legibility with simulated colour-vision deficiency. | Harrower, M., and Brewer, C. A. (2003). ColorBrewer.org: An online tool for selecting colour schemes for maps. The Cartographic Journal, 40(1), 27–37. https://doi.org/10.1179/000870403235002042 | Bibliographic record verified (Crossref). The statement of the rule is a summary of the title and the project's use of a luminance-ordered ramp; the text was not read. | The map fill is a single-hue blue ramp ordered by luminance, so ordering survives every type of colour-vision deficiency. |
| Simulation of colour appearance for dichromats. | Brettel, H., Viénot, F., and Mollon, J. D. (1997). Computerized simulation of color appearance for dichromats. Journal of the Optical Society of America A, 14(10), 2647–2655. https://doi.org/10.1364/JOSAA.14.002647 | Bibliographic record verified (Crossref); only the start page was returned, so the end page is unconfirmed. | Background for the simulation below. The script itself uses the matrices of Machado et al. (next row). |
| Physiologically based simulation of colour-vision deficiency (matrices used by the check script). | Machado, G. M., Oliveira, M. M., and Fernandes, L. A. F. (2009). A physiologically-based model for simulation of color vision deficiency. IEEE Transactions on Visualization and Computer Graphics, 15(6), 1291–1298. https://doi.org/10.1109/TVCG.2009.113 | **Unverified.** The Crossref record could not be fetched; a search confirmed that the paper exists under this title. The matrix values in the script were entered from memory of the published severity 1.0 matrices and have not been checked against the paper. | The simulation is indicative only. The ramps are also chosen to differ in luminance, which does not depend on the simulation. |

## 4. Decision 1: page order

### 4.1 Order chosen

1. **Header** (section 5).
2. **Hero, compact.** A label, the name siṭaiṅge, two sentences (what the project is; where the language is reported to be spoken), and a row of four task links: Dadi, Dictionary, Translator, Extension.
3. **Where it is spoken.** A one-sentence introduction, then the map with the information panel directly beneath it on narrow screens and beside it on wide ones. Map layers follow the panel; the map credit follows the section.
4. **Tools.** Full descriptions of the four tools.
5. **Research.** Project figures read from the repository, the evidence bar, method notes and recent changes.
6. **History and facts.** The timeline, further facts and photographs.
7. **Contribute.** Ways to take part.
8. **Watch and listen.** Videos, loaded only when played.

### 4.2 Justification

- The audiences are heritage speakers, learners, researchers and contributors. All four first need to know what the language is and where it is spoken, so identity and place come first. Attention is concentrated at the top of the page (Fessenden, 2018), and the inverted pyramid (Schade, 2018) puts the most important material first.
- Task-first users (learners and speakers who came to look something up) need a way to act without scrolling. NN/g's homepage guidance (Nielsen, 2002) calls for clear starting points for the main tasks. The four task links in the hero satisfy that, and the full Tools section remains for people who want descriptions (progressive disclosure, Nielsen, 2006).
- Researchers need the evidence and method, which are important but not first-screen content. They follow the region and the tools, because the evidence levels make sense only once a reader knows what is being documented.
- History and facts support the region and the research and are reference material, so they follow the evidence. Contribution comes after readers have seen what exists and how well it is supported. Videos load third-party content and come last.
- On a 390 px phone, the map begins at about 683 px from the top of the page and the panel follows 80 px below its bottom edge. On the previous page, the map began about 4,800 px down at the same width, more than five screens on an 844 px-high phone.

### 4.3 Limits of the evidence

The eye-tracking studies concern general web pages, not language sites. The order above is an application of general findings and has not been tested with this project's visitors. A short test with heritage speakers and learners on phones is recommended before the order is treated as settled.

## 5. Decision 2: header

### 5.1 Findings applied

NN/g found that hidden navigation lowers use and discoverability, and that navigation bars suit a small number of options (Pernice and Budiu, 2016; Budiu, 2015). The site has four destinations. Two layouts were considered.

| Option | Strength | Weakness |
|---|---|---|
| A. All links always visible, brand in its own row at narrow widths | Nothing hidden | Two rows of chrome; four links of different lengths do not divide a 320 px row evenly (the reported fault) |
| B. One row at every width: brand, then either visible links (760 px and up) or a labelled Menu button that opens a sheet with the same links | Single aligned row; same links everywhere; 56 px of chrome | The links are one tap away on phones; the landing page therefore repeats the tasks in the hero |

**Chosen: option B.** The Menu button carries the word "Menu" as well as an icon, because a labelled control is easier to find than an icon alone. The task links are repeated in the page body on the landing page (the hero tools row), which is the compensation NN/g recommends for hidden navigation (Budiu, 2015).

### 5.2 Specification

- One component on every page: brand "siṭaiṅge" at the left. From 760 px, the links Dictionary, Translator and Contribute and the primary action Dadi sit at the right, in a single row. Each item is 44 px high with equal side padding (16 px) and equal gaps (4 px). Dadi is the one filled button.
- Below 760 px, the header is 56 px high with the brand at the left and the Menu button at the right, both centred on the same line. The sheet opens below the header, covers the width of the screen, and lists the same four links in 48 px rows, with Dadi as the primary button.
- Focus order follows reading order on both layouts: brand, then Menu, then the sheet's links; or brand, then the links. The current page carries `aria-current="page"`; on the landing page the brand does.
- The Menu button has `aria-expanded` and `aria-controls`. Escape closes the sheet and returns focus to the button. A click outside the header, moving focus out of the header, or widening the window closes the sheet.
- Without JavaScript the links are always listed below the brand, so nothing is hidden.
- The header is sticky at every width.

## 6. Decision 3: colour

### 6.1 Direction

The previous page was dark teal on near-black whenever the device was in dark mode. The owner called it gloomy. The new scheme is bright and calm, with a blue family that suits a coastal region and a research site (design judgment, supported only loosely by the colour-and-trust studies in section 3.2).

- **Default.** Light when the device expresses no preference. The device's setting is respected. A visible control in the footer of every page offers Auto, Light and Dark and keeps the choice in the browser (localStorage, in try/catch). If storage is blocked, the page follows the device.
- **One primary accent and one highlight.** The accent is an ocean blue (#0b5fae in light, #7dbdff in dark). The highlight is a sun-yellow (#ffc83d in light, #ffd166 in dark), used only for the project label and the selected map area. It is always paired with dark text, never used as text on a light background.
- **Avoided.** Warm cream and terracotta grounds, neon accents and near-black grounds.
- **Dark theme.** Lifted navy surfaces (#14243a page, #203650 cards) instead of near-black; text softened to #e9f1f9 (about 13.7:1, not maximum contrast); a brighter accent. Heavy glare is avoided while ratios stay high.
- **Evidence bar.** Levels A to C use the blue ramp (strongest is darkest in light and brightest in dark); D and E use two yellows; unassessed is grey. Segments are separated by a 2 px gap, and the legend gives counts and labels.
- **Map.** A single-hue blue ramp ordered by luminance, so ordering does not depend on hue. Chittagong District and Cox's Bazar District differ in luminance and are labelled by name. The selected area is drawn in the highlight colour with a text-coloured outline.

### 6.2 Tokens

Tokens are defined on `:root` in site.css, redefined for the device's dark setting under `@media (prefers-color-scheme: dark)` with `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]` for the visitor's choice. A small script in the page head (shell.js) sets `data-theme` before the first paint to avoid a flash of the wrong theme.

### 6.3 Contrast results

The values below were read from site.css and computed with the script in the appendix. The WCAG 2.x relative-luminance formula was used. All text pairs reach 4.5:1 and the non-text pair 3:1. The tinted note is the accent colour at 9% (light) or 16% (dark) opacity over the page colour.


#### Light theme

| Pair | Foreground | Background | Ratio | Needed | Result |
|---|---|---|---|---|---|
| Body text on page | #0f2236 | #ffffff | 16.12 | 4.5:1 | Pass |
| Body text on alternate band | #0f2236 | #eff6fc | 14.79 | 4.5:1 | Pass |
| Body text on card | #0f2236 | #ffffff | 16.12 | 4.5:1 | Pass |
| Muted text on page | #47596b | #ffffff | 7.22 | 4.5:1 | Pass |
| Muted text on alternate band | #47596b | #eff6fc | 6.62 | 4.5:1 | Pass |
| Muted text on card | #47596b | #ffffff | 7.22 | 4.5:1 | Pass |
| Accent link or text on page | #0b5fae | #ffffff | 6.44 | 4.5:1 | Pass |
| Accent text on alternate band | #0b5fae | #eff6fc | 5.90 | 4.5:1 | Pass |
| Accent text on card | #0b5fae | #ffffff | 6.44 | 4.5:1 | Pass |
| Button text on accent fill | #ffffff | #0b5fae | 6.44 | 4.5:1 | Pass |
| Accent text on tinted note | #0b5fae | #e9f1f8 | 5.64 | 4.5:1 | Pass |
| Muted text on tinted note | #47596b | #e9f1f8 | 6.33 | 4.5:1 | Pass |
| Secondary text colour on page | #7a4f00 | #ffffff | 7.13 | 4.5:1 | Pass |
| Text on highlight fill (kicker) | #1c1400 | #ffc83d | 11.82 | 4.5:1 | Pass |
| Accent as focus ring or border vs page (non-text) | #0b5fae | #ffffff | 6.44 | 3.0:1 | Pass |

Map and evidence ramps, light: luminance (WCAG relative) and adjacent-step colour difference (CIE76 dE) under simulated colour-vision deficiency.

| Ramp | Colours (low to high) | Relative luminance | Min adjacent dE: normal / protan / deutan / tritan |
|---|---|---|---|
| Map fill | #e3effa #bad7f1 #82b5e1 #3f87c6 | 0.85, 0.65, 0.43, 0.22 | 13.2 / 11.8 / 13.7 / 13.5 |
| Evidence A to E, unassessed | #0b4f94 #2a7bc4 #7fb2e3 #e0a800 #f2d27a #8d9bab | 0.08, 0.19, 0.42, 0.44, 0.66, 0.32 | 18.0 / 17.1 / 16.4 / 17.9 |

#### Dark theme

| Pair | Foreground | Background | Ratio | Needed | Result |
|---|---|---|---|---|---|
| Body text on page | #e9f1f9 | #14243a | 13.71 | 4.5:1 | Pass |
| Body text on alternate band | #e9f1f9 | #192c45 | 12.38 | 4.5:1 | Pass |
| Body text on card | #e9f1f9 | #203650 | 10.80 | 4.5:1 | Pass |
| Muted text on page | #a9bacb | #14243a | 7.87 | 4.5:1 | Pass |
| Muted text on alternate band | #a9bacb | #192c45 | 7.11 | 4.5:1 | Pass |
| Muted text on card | #a9bacb | #203650 | 6.20 | 4.5:1 | Pass |
| Accent link or text on page | #7dbdff | #14243a | 7.89 | 4.5:1 | Pass |
| Accent text on alternate band | #7dbdff | #192c45 | 7.12 | 4.5:1 | Pass |
| Accent text on card | #7dbdff | #203650 | 6.21 | 4.5:1 | Pass |
| Button text on accent fill | #0a2340 | #7dbdff | 7.98 | 4.5:1 | Pass |
| Accent text on tinted note | #7dbdff | #253c5a | 5.66 | 4.5:1 | Pass |
| Muted text on tinted note | #a9bacb | #253c5a | 5.65 | 4.5:1 | Pass |
| Secondary text colour on page | #ffd166 | #14243a | 10.84 | 4.5:1 | Pass |
| Text on highlight fill (kicker) | #1c1400 | #ffd166 | 12.67 | 4.5:1 | Pass |
| Accent as focus ring or border vs page (non-text) | #7dbdff | #14243a | 7.89 | 3.0:1 | Pass |

Map and evidence ramps, dark: luminance (WCAG relative) and adjacent-step colour difference (CIE76 dE) under simulated colour-vision deficiency.

| Ramp | Colours (low to high) | Relative luminance | Min adjacent dE: normal / protan / deutan / tritan |
|---|---|---|---|
| Map fill | #2a4766 #3b6a99 #4c82b8 #74aadd | 0.06, 0.14, 0.21, 0.38 | 10.0 / 10.0 / 9.9 / 10.4 |
| Evidence A to E, unassessed | #9ccdff #6aa9e6 #3f7fbd #ffd166 #b88a1f #8294a8 | 0.58, 0.37, 0.20, 0.68, 0.28, 0.29 | 15.2 / 15.0 / 15.8 / 15.5 |


Status colours (warning, error and success text on their backgrounds), computed separately: light 6.51, 6.79 and 6.11; dark 9.03, 8.09 and 8.23. All pass 4.5:1.

### 6.4 Colour-vision deficiency

The map ramp keeps its order in luminance, so the lightest-to-darkest reading holds for people with any type of deficiency. The minimum adjacent colour difference stays above 9.9 (CIE76) for the map fill and above 15 for the evidence ramp under each simulation (tables above). The simulation uses matrices that were not verified against their source (section 3.2); treat the numbers as indicative. No meaning rests on colour alone: areas carry names, and evidence levels carry labels and counts.

## 7. What was verified on the page, and what was not

Verified with Chromium (Playwright) against a local copy served on port 8801, with the pages in both colour schemes at widths of 320, 360, 390, 768 and 1280 px:

- No horizontal overflow on the landing, dictionary, translator and contribution pages.
- Header alignment by script: all items share one vertical centre (within 1 px), each target is at least 44 px high, and at 760 px and up the gaps between the links are equal.
- At 390 px wide, the map begins within the first 900 px for viewport heights of 700, 844 and 900 px, with the panel directly beneath it.
- The Menu button opens and closes the sheet; Escape returns focus to the button; Tab moves to the first link.
- The theme control changes the theme, the choice survives navigation and reload, Auto clears it, a visitor's Light overrides a dark device, and a blocked localStorage causes no error.
- Screenshots of the landing page at 390 and 1280 px in both themes, and of the dictionary and translator headers, were viewed and corrected.
- No inline styles or scripts were added; none of the banned words appears on the landing page.

Not verified: any test on a real phone or with assistive technology (screen reader, switch control); testing with heritage speakers or learners; printing; the Dadi app, which was not changed and keeps its own styles and does not read the theme choice; and the live GitHub data, which could not be fetched from the test environment, so the saved copies shipped with the site were used.

## 8. Files changed

website/index.html, site.css, site.js (evidence colours now come from stylesheet classes), shell.js (new), sw.js (adds shell.js to the offline list and raises the cache version), contribute.html, dictionary/index.html and translate/index.html (shared header, footer theme control and head script).

## Appendix: contrast and colour-vision check script

```python
#!/usr/bin/env python3
"""WCAG 2.x contrast and colour-vision-deficiency check for the site tokens (CC0)."""
import json, sys
def lin(c): c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def rgb(h): h=h.lstrip('#'); return [int(h[i:i+2],16) for i in (0,2,4)]
def L(h): r,g,b=[lin(x) for x in rgb(h)]; return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b): la,lb=sorted([L(a),L(b)],reverse=True); return (la+0.05)/(lb+0.05)
def blend(fg,bg,a): f,b=rgb(fg),rgb(bg); return '#%02x%02x%02x'%tuple(round(a*x+(1-a)*y) for x,y in zip(f,b))
def lab(h):
    r,g,b=[lin(x) for x in rgb(h)]
    X=(0.4124*r+0.3576*g+0.1805*b)/0.95047; Y=0.2126*r+0.7152*g+0.0722*b; Z=(0.0193*r+0.1192*g+0.9505*b)/1.08883
    f=lambda t: t**(1/3) if t>0.008856 else 7.787*t+16/116
    return (116*f(Y)-16,500*(f(X)-f(Y)),200*(f(Y)-f(Z)))
def de(a,b): return sum((x-y)**2 for x,y in zip(lab(a),lab(b)))**.5
M={'protanopia':[[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]],
   'deuteranopia':[[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
   'tritanopia':[[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]]}
def enc(c): c=max(0,min(1,c)); return round(255*(12.92*c if c<=0.0031308 else 1.055*c**(1/2.4)-0.055))
def sim(h,k):
    v=[lin(x) for x in rgb(h)]; m=M[k]; return '#%02x%02x%02x'%tuple(enc(sum(m[i][j]*v[j] for j in range(3))) for i in range(3))
T=json.load(open(sys.argv[1]))
out=[]
for th,t in T.items():
    print('\n==',th)
    bg,alt,sf=t['bg'],t['alt'],t['surface']
    rows=[('text on bg','text',bg,4.5),('text on alt','text',alt,4.5),('text on surface','text',sf,4.5),('muted on bg','muted',bg,4.5),('muted on alt','muted',alt,4.5),('muted on surface','muted',sf,4.5),
     ('accent text on bg','accent',bg,4.5),('accent text on alt','accent',alt,4.5),('accent text on surface','accent',sf,4.5),('button text on accent','on-accent',t['accent'],4.5),
     ('accent link on tint over bg','accent',blend(t['accent'],bg,t['tint']),4.5),
     ('ink2 (secondary text) on bg','ink2',bg,4.5),('highlight text on highlight fill','on-hi',t['hi'],4.5),
     ('accent vs bg (focus ring, non-text)','accent',bg,3.0),('line vs bg (decorative)','line',bg,1.0),('muted on tint note','muted',blend(t['accent'],bg,t['tint']),4.5)]
    for name,fg,b,need in rows:
        r=cr(t[fg],b); print(f'{name:38s} {t[fg]} on {b}  {r:5.2f}  need {need}  {"PASS" if r>=need else "FAIL"}'); out.append((th,name,t[fg],b,round(r,2),need,r>=need))
    for rn in ('map','ev'):
        ks=t[rn]; print(rn,'ramp:',' '.join(f'{k}={v}' for k,v in ks.items()))
        names=list(ks)
        print('  luminance order:',[round(L(ks[k]),3) for k in names])
        for k in names: print('  ',k,'vs bg',round(cr(ks[k],bg),2),'vs surface',round(cr(ks[k],sf),2))
        for kind in ['normal']+list(M):
            f=(lambda x:x) if kind=='normal' else (lambda x,kind=kind: sim(x,kind))
            ds=[round(de(f(ks[a]),f(ks[b])),1) for a,b in zip(names,names[1:])]
            print(f'  adjacent dE76 {kind:12s}',ds,'min',min(ds))
```
