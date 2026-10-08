# Dadi and project site: UX research and rules

Purpose: turn published evidence into concrete rules for Dadi (the mobile-first learning app) and the siṭaiṅga project site. Every source below was opened or looked up during this review; where a source could not be opened, that is stated in section 9. Contrast ratios in section 6 were computed from the colours in `website/dadi/style.css`.

How to read this: each section gives principle, evidence, then the rule. Rules marked MUST are testable; rules marked SHOULD are judgement calls.

## 1. Touch targets and reach (Fitts's law)

Principle: time to hit a target falls as the target gets larger and nearer. On a phone held in one hand, the bottom third of the screen is the easiest to reach.

Evidence
- Apple HIG, Accessibility: default control size on iOS is 44 x 44 pt, minimum 28 x 28 pt; about 12 pt padding around bezelled controls and about 24 pt around unbezelled ones. https://developer.apple.com/design/human-interface-guidelines/accessibility
- WCAG 2.2 SC 2.5.8 Target Size (Minimum), Level AA: at least 24 x 24 CSS px, with spacing, equivalent-control, inline, user-agent and essential exceptions. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- NN/g (Harley, 2019): minimum 1 cm x 1 cm physical size; larger for primary actions and for people on the move; about 2 mm between targets. https://www.nngroup.com/articles/touch-target-size/
- Fitts, P. M. (1954), J. Exp. Psychol. 47(6), 381-391, PubMed 13174710. https://pubmed.ncbi.nlm.nih.gov/13174710

Rules
- MUST: every tappable element is at least 44 x 44 CSS px (this exceeds the WCAG AA floor of 24 and Apple's 28 minimum). Use padding, not a bigger glyph, to reach 44.
- MUST: at least 8 px between adjacent targets; 12 px between destructive and non-destructive actions.
- MUST: the primary action and the tab bar sit in the bottom 40% of the screen; the tab bar is 56 px tall plus the safe-area inset.
- SHOULD: the keyboard and answer buttons are full width on phones.

## 2. Choice, structure and one primary action (Hick's law, progressive disclosure)

Principle: decision time grows with the number of equally weighted options, so give each screen one obvious next step and defer the rest.

Evidence
- Hick, W. E. (1952), Q. J. Exp. Psychol. 4(1), 11-26. https://journals.sagepub.com/doi/10.1080/17470215208416600 ; Hyman, R. (1953), J. Exp. Psychol. 45(3), 188-196. https://doi.org/10.1037/h0056940 (a crossref lookup confirmed Hyman's record). Both are choice-reaction-time results, not a licence to cut navigation to nothing; NN/g's navigation work (section 3) shows hiding options costs more than showing them.
- Nielsen (2006), Progressive Disclosure: show a few important options first, put specialist ones behind a clearly labelled second level, and avoid more than two levels. https://www.nngroup.com/articles/progressive-disclosure/
- Nielsen's heuristic 8, Aesthetic and Minimalist Design, and heuristic 6, Recognition Rather than Recall. https://www.nngroup.com/articles/ten-usability-heuristics/

Rules
- MUST: each screen has exactly one filled (accent) button. All others are plain or outlined.
- MUST: a lesson card shows at most one prompt, one answer area and one primary button at a time.
- SHOULD: no more than 5 to 7 items in any unbroken list of choices (grade buttons, settings groups); beyond that, group with headings.
- MUST: no more than two levels of disclosure (screen, then a sheet or detail). No nested menus.

## 3. Navigation and tab labels

Evidence
- Apple HIG, Tab bars: "Include tab labels", "Use single words whenever possible", "Avoid overflow tabs", keep the bar visible, and do not hide or disable tabs; explain an empty section instead. https://developer.apple.com/design/human-interface-guidelines/tab-bars
- NN/g (Budiu, 2015), Mobile navigation patterns: tab bars suit about five options or fewer; hamburger menus are the least discoverable. https://www.nngroup.com/articles/mobile-navigation-patterns/
- NN/g (Pernice and Budiu, 2016), Hamburger menus: hidden navigation was used in 57 percent of cases against 86 percent for combo navigation, and tasks were 15 percent slower on mobile. https://www.nngroup.com/articles/hamburger-menus/
- Nielsen heuristic 1 (visibility of system status) and 4 (consistency and standards).

Rules
- MUST: bottom tab bar, five tabs maximum, each with an icon and a one-word visible label. Current tabs: Learn, Words, Write, Teach, Me. Do not add a sixth; move extras into Me.
- MUST: no hamburger menu on Dadi. On the project site, keep a visible top bar with at most five links.
- MUST: the active tab is shown by weight and colour together (filled accent label plus a heavier icon stroke), never colour alone.
- MUST: the tab bar stays visible on all top-level screens; detail screens add a back button labelled with the parent's name.
- MUST: a tab that has no content shows an empty state (section 8), not a disabled tab.

## 4. Icons: always with text

Evidence
- NN/g (Harley, 2014), Icon Usability: few icons have a standard meaning; labels should be visible without interaction (hover does not exist on touch); an unlabelled clock icon was never tapped by any participant in one study. https://www.nngroup.com/articles/icon-usability/
- Apple HIG, Icons: simple, familiar metaphors; same size, level of detail and stroke weight throughout; match icon weight to adjacent text; provide accessibility labels for custom icons. https://developer.apple.com/design/human-interface-guidelines/icons
- Apple HIG, SF Symbols: weights correspond to the system font's weights; monochrome rendering applies one colour to all layers; custom symbols must match the system's level of detail and optical weight. https://developer.apple.com/design/human-interface-guidelines/sf-symbols
- WCAG 2.2 SC 1.4.11 Non-text Contrast (AA): icons that carry meaning need 3:1 against adjacent colours. https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html

Rules
- MUST: any icon that triggers an action has a visible text label next to it. The only unlabelled exceptions are universally standard controls whose function is also in the accessible name: close (x), back chevron, play/pause inside an audio bar, and search inside a search field.
- MUST: one icon family (Tabler Icons, outline, stroke 1.75 to 2, round caps and joins), one colour (`currentColor`), sizes 20, 24 or 28 px only.
- MUST: decorative icons have `aria-hidden="true"`; meaningful icons have an accessible name.
- MUST: word pictures (the icon beside a gloss) never carry meaning alone; the gloss is always shown, and a missing match shows no picture rather than a wrong one.

## 5. Typography, line length and spacing

Evidence
- Apple HIG, Typography: iOS default 17 pt, minimum 11 pt; Large Title 34, Title 1 28, Title 2 22, Title 3 20, Headline 17 semibold, Body 17, Callout 16, Subhead 15, Footnote 13, Caption 12 and 11; allow enlargement by at least 200 percent. https://developer.apple.com/design/human-interface-guidelines/typography
- Apple HIG, Layout: respect safe areas; use layout guides to restrict text width; group related items with negative space; align to aid scanning. https://developer.apple.com/design/human-interface-guidelines/layout
- WCAG 2.2 SC 1.4.8 (AAA): line width at most 80 characters, line spacing at least 1.5. https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html ; SC 1.4.12 (AA): content must survive line height 1.5, paragraph spacing 2x, letter spacing 0.12, word spacing 0.16. https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html ; SC 1.4.10 Reflow (AA): works at 320 CSS px wide. https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- Dyson, M. C. and Haselgrove, M. (2001), Int. J. Human-Computer Studies 54(4), 585-612. https://doi.org/10.1006/ijhc.2001.0458 (line-length study; the finding that medium lines of about 55 characters work well is quoted from memory of the paper, not re-read here).
- Legge, G. E. and Bigelow, C. A. (2011), J. Vision 11(5), 8. https://doi.org/10.1167/11.5.8 (review of print-size effects; the summary that reading is fast across a broad mid-range of sizes and slows when print is very small is from memory, not re-read here).

Rules
- MUST: body text 17 px (1.0625rem) minimum, line height 1.45 to 1.5; never below 13 px, and 13 px only for captions that repeat information shown elsewhere.
- MUST: reading text (notes, help, project site prose) is capped at 65ch (a ceiling of about 70 characters); cards and lists may be full width.
- Type scale (px, ratio about 1.2, aligned to HIG): 34 / 28 / 22 / 20 / 17 / 15 / 13. Use `rem` so user text-size settings apply. Weights: 400 body, 600 headings and buttons. No weights below 400.
- Chittagonian forms in siṭaiṅga are set at 22 px or larger on cards, in the IPA/Unicode-capable font stack already defined, with the English gloss at 15 to 17 px beneath.
- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48. Page gutter 16 px (12 px under 360 px wide). Related items 8 px apart, groups 24 px apart, sections 32 to 48 px.
- MUST: layout works at 320 px width and 200 percent text without horizontal scroll or clipped text.

## 6. Colour and contrast numbers

Evidence
- WCAG 2.2 SC 1.4.3 (AA): 4.5:1 for text, 3:1 for large text (18 pt, or 14 pt bold). https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html ; SC 1.4.11 (AA): 3:1 for UI components and graphics. SC 2.4.13 Focus Appearance is Level AAA (2 px perimeter, 3:1 change), and SC 2.4.11 Focus Not Obscured (Minimum) is AA. https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html , https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- Apple HIG, Color: do not rely on colour alone; supply light, dark and increased-contrast variants; do not use one colour for two meanings. https://developer.apple.com/design/human-interface-guidelines/color

Measured on the current Dadi palette (computed, not estimated):

| Pair | Light | Dark |
|---|---|---|
| Body text on surface | 18.85:1 | 15.63:1 |
| Muted text on surface | 5.61:1 | 6.24:1 |
| Muted text on page background | 5.03:1 | 7.71:1 |
| Accent text on surface | 7.26:1 | 7.22:1 |
| On-accent text on accent button | 7.26:1 | 7.93:1 |
| Alert (error) text on surface | 5.52:1 | 7.52:1 |
| Good (success) text on surface | 5.03:1 | 9.29:1 |
| Warn on surface | 3.12:1 (fails text) | 9.52:1 |

Rules
- MUST: text 4.5:1 or better, icons and control borders 3:1 or better, in both themes and in all four accent schemes (forest, ocean, plum, contrast). Re-run the check when any token changes.
- FIX NEEDED: light `--warn` (#c98300) is 3.12:1; use it only for icons and borders, and use #8a5a00 (5.93:1 on white, 5.31:1 on the page background) for any warning text.
- MUST: state is never colour-only. Errors carry an icon and words; correct and incorrect answers carry a check or x symbol and the words "Correct" or "Not quite".
- MUST: focus ring 2 px solid accent with a 2 px offset, visible in both themes (meets 3:1; targets the AAA ring).
- SHOULD: one accent colour per screen; neutrals for everything else.

## 7. Motion

Evidence
- Apple HIG, Motion: add motion purposefully; avoid it on frequent interactions; make it optional; let people cancel it. https://developer.apple.com/design/human-interface-guidelines/motion
- NN/g (Laubheimer, 2020), Animation duration: 100 to 500 ms; about 100 ms for simple feedback; 200 to 300 ms for large changes; around 500 ms feels slow. https://www.nngroup.com/articles/animation-duration/
- WCAG 2.2 SC 2.3.3 Animation from Interactions (AAA): motion triggered by interaction can be disabled. https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html

Rules
- MUST: durations 100 ms (toggles, presses), 200 ms (sheets, tab changes), 300 ms maximum for anything else. Ease-out on entry, ease-in on exit.
- MUST: wrap all non-essential motion in `@media (prefers-reduced-motion: no-preference)`; under reduce, use an instant change or a 100 ms fade, with no parallax, bounce or looping.
- MUST: no autoplay animation, confetti, shaking or celebratory bursts after a correct answer. Feedback is a check mark and a short line of text.
- MUST: audio playback never starts by itself; it starts on a tap.

## 8. Empty states, errors and forms

Evidence
- NN/g (Kaplan, 2021), empty states: say what the system status is, offer a learning cue, and give a direct path to the key task. https://www.nngroup.com/articles/empty-state-interface-design/
- NN/g (Krause, 2019, reviewed 2024), form errors: validate inline; place the message beside the field; use colour plus an icon; do not rely on a summary alone; do not show errors before input is complete. https://www.nngroup.com/articles/errors-forms-design-guidelines/
- Nielsen heuristic 9: error messages in plain words, naming the problem and a way to recover. WCAG 2.2 SC 3.3.1 Error Identification and SC 3.3.2 Labels or Instructions (both A) apply to every field.

Rules
- Empty state template (MUST): one sentence on what this place is for, one sentence on why it is empty now, one button that fixes it. No illustration. Example: "No words saved yet. Words you star appear here. [Browse words]".
- Loading is a skeleton line or a plain "Loading", never an empty state shown too early.
- Error template (MUST): what went wrong, what was kept, what to do. Example: "Could not save. Your draft is kept on this device. Try again." The message sits beside or under the field, uses `role="alert"` once, and has an icon plus text.
- Never discard user input on an error; keep the draft locally (this follows the project's data-safety rule).
- Offline is a normal state, not an error: show a quiet "Offline: changes saved on this device" line.

## 9. Cognitive load for learners (Sweller, Mayer)

Evidence
- Sweller, J. (1988), Cognitive Science 12(2), 257-285. https://doi.org/10.1207/s15516709cog1202_4 ; Sweller, van Merrienboer and Paas (1998), Educ. Psychol. Rev. 10(3), 251-296. https://doi.org/10.1023/A:1022193728205
- Mayer, R. E. (2009), Multimedia Learning, 2nd ed., Cambridge University Press. https://doi.org/10.1017/CBO9780511811678 ; Mayer, R. E. and Moreno, R. (2003), Educ. Psychologist 38(1), 43-52. https://doi.org/10.1207/S15326985EP3801_6 (coherence, signalling, redundancy, contiguity as ways to cut extraneous load).
- Harp, S. F. and Mayer, R. E. (1998), J. Educ. Psychol. 90(3), 414-434. https://doi.org/10.1037/0022-0663.90.3.414 ("seductive details": interesting but irrelevant material harmed learning).
- Sung, E. and Mayer, R. E. (2012), Computers in Human Behavior. https://doi.org/10.1016/j.chb.2012.03.026 (decorative graphics raised liking but not learning).

Rules derived
- Coherence: remove anything that does not teach. A picture stays only if it identifies the word's meaning.
- Signalling: highlight the one thing to attend to (the target form), not the whole card.
- Spatial contiguity: the form, its audio button and its gloss sit together; do not separate a label from the thing it names.
- Redundancy: do not read aloud the exact text that is also being shown with a separate animation; one channel does one job.
- Segmenting and pacing: one item per card, learner controls the pace.

Limits of this evidence (stated plainly): the one-line findings attached to the Dyson and Legge entries in section 5 are not verified against the full texts. the learning-science findings come from laboratory and classroom studies of mostly short lessons; they support removing decoration but do not prove that every picture hurts. Fitts and Hick describe reaction time and are applied here by analogy. Not opened in this review: Apple HIG pages render with JavaScript, so Apple text was read from Apple's own JSON documentation feed for those pages (same URLs minus the JavaScript shell), not in a browser; the Fitts and Hick DOIs were confirmed by title search, not by a crossref record (the lookup was rate-limited); NN/g's line-length article returned 404 and is not cited; Material Design is not cited because the comparison is not needed (Dadi follows iOS conventions, and tab bar plus 44 px targets already exceed Material's minimums).

## 10. Remove list

Remove from Dadi and the project site, with the reason:

| Remove | Why |
|---|---|
| Fluent Emoji pictures (`data/icons.json` v1, the old Fluent Emoji index) | Colourful, inconsistent in style and weight; loose keyword matches mislead; "seductive detail" (Harp and Mayer 1998). Replaced by monochrome Tabler outline icons with strict matching. |
| Hand-drawn decorative illustrations in `js/art.js` (water, rice, house, village and the others) | Two competing visual languages; colour carries no meaning; extra weight to cache and maintain. Keep only if a picture is needed and no icon matches, and then prefer none. |
| Mascot art (`Art.dadi()`, the sparkles stand-in) | Adds no information (Sung and Mayer 2012); pulls attention from the one primary action. |
| Emoji-style colourful pictograms in UI chrome, headings and buttons | Render differently on each device, fail the "one icon family" rule, and can fail contrast. |
| Gradients (backgrounds, buttons, headers) | Contrast varies across the surface, making the 4.5:1 check unreliable; not part of the iOS system look. Use flat tokens. |
| Decorative shadows beyond a 1 px separator or a single soft card shadow | Visual noise; the separator token already does the job. |
| Confetti, bouncing, looping animations | Motion rules (section 7). |
| Hamburger or hidden menus; icon-only controls | Sections 3 and 4. |
| Placeholder text used as a label | Disappears on input; fails SC 3.3.2. Use a visible label above the field. |
| Colour-only status (red and green dots) | Section 6. |
| Landing-page wording that names the national language or region instead of siṭaiṅga | Project rule: the landing page names only the language siṭaiṅga and the city Chittagong. |

## 11. Quick checklist before release

1. All targets 44 x 44 px or more; 8 px gaps. 2. One filled button per screen. 3. Five tabs or fewer, each with icon and one-word label. 4. No icon-only action buttons. 5. Text 4.5:1, icons and borders 3:1, both themes, all schemes. 6. Body 17 px, reading width 65ch. 7. Works at 320 px and 200 percent text. 8. Reduced-motion respected; no autoplay. 9. Every empty and error state follows its template. 10. No gradients, mascots or emoji pictograms; icons from the single pack. 11. Canadian spelling in all copy: colour, centre, licence (noun), favourite, catalogue.
