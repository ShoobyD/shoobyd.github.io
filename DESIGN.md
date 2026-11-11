---
name: ShoobyD
description: The personal home of Baruch Mustakis (ShoobyD), a climb up an unfinished Tower of Babel.
colors:
  sun-baked-mudbrick: "#c98b4a"
  fired-mudbrick: "#a9713a"
  limestone-cornice: "#e9e3d3"
  weathered-limestone: "#cbbf9f"
  shadow-ink: "#2d2a26"
  lamplight-gold: "#f2c37e"
  hot-lamplight: "#ffd89a"
  lamplight-wash: "color-mix(in srgb, #f2c37e 10%, transparent)"
  lamplight-edge: "color-mix(in srgb, #f2c37e 65%, transparent)"
  flemish-sky: "#6f8fb3"
  dawn-zenith: "#2a3a62"
  dawn-horizon: "#f3b98a"
  summit-night: "#101a33"
  limestone-dim: "rgb(233 227 211 / 0.8)"
  cornice-line: "rgb(233 227 211 / 0.2)"
  cornice-line-strong: "rgb(233 227 211 / 0.3)"
  smoked-glass: "rgb(36 32 28 / 0.7)"
  smoked-glass-deep: "rgb(24 22 19 / 0.8)"
  control-glass: "rgb(30 27 24 / 0.58)"
  control-glass-hover: "rgb(30 27 24 / 0.78)"
typography:
  display:
    fontFamily: "Suez One, Frank Ruhl Libre, Georgia, serif"
    fontSize: "clamp(2.6rem, 1.5rem + 4.4vw, 4.9rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Suez One, Frank Ruhl Libre, Georgia, serif"
    fontSize: "clamp(2rem, 1.4rem + 2.2vw, 3.05rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "0.005em"
  title:
    fontFamily: "Suez One, Frank Ruhl Libre, Georgia, serif"
    fontSize: "clamp(1.3rem, 1.1rem + 0.6vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.04
  carved-serif:
    fontFamily: "Frank Ruhl Libre, Georgia, serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "Assistant Variable, Assistant, Segoe UI, system-ui, sans-serif"
    fontSize: "1.16rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Assistant Variable, Assistant, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Assistant Variable, Assistant, Segoe UI, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 700
    letterSpacing: "0.04em"
  caption:
    fontFamily: "Assistant Variable, Assistant, Segoe UI, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 400
    letterSpacing: "0.03em"
rounded:
  arch: "15.5rem 5.6rem"
  arch-small: "30px 22px"
  corner: "6px"
  pill: "999px"
spacing:
  space-1: "0.25rem"
  space-2: "0.5rem"
  space-3: "0.75rem"
  space-4: "1rem"
  space-5: "1.5rem"
  space-6: "2rem"
  space-7: "3rem"
  space-8: "4.5rem"
  gutter: "clamp(16px, 4vw, 56px)"
components:
  control:
    backgroundColor: "{colors.control-glass}"
    textColor: "{colors.limestone-cornice}"
    rounded: "{rounded.pill}"
    padding: "9px 16px"
    height: "44px"
  control-hover:
    backgroundColor: "{colors.control-glass-hover}"
  control-gold:
    backgroundColor: "{colors.lamplight-gold}"
    textColor: "{colors.shadow-ink}"
    rounded: "{rounded.pill}"
    padding: "9px 16px"
    height: "44px"
  control-gold-hover:
    backgroundColor: "{colors.hot-lamplight}"
  arch-panel:
    backgroundColor: "{colors.smoked-glass}"
    textColor: "{colors.limestone-cornice}"
    rounded: "{rounded.arch}"
    padding: "4.4rem 2.1rem 2rem"
    width: "min(31rem, 40vw)"
  project-card:
    textColor: "{colors.limestone-cornice}"
    rounded: "{rounded.arch-small}"
    padding: "12px 14px"
  project-status:
    textColor: "{colors.lamplight-gold}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  path-mark:
    backgroundColor: "{colors.lamplight-gold}"
    rounded: "3px 3px 1px 1px"
    width: "12px"
    height: "12px"
  path-years:
    textColor: "{colors.lamplight-gold}"
  contact-row:
    textColor: "{colors.limestone-cornice}"
    padding: "11px 14px"
  chip:
    textColor: "{colors.limestone-cornice}"
    rounded: "{rounded.pill}"
    padding: "5px 13px"
  gauge-label:
    textColor: "{colors.limestone-cornice}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  gauge-label-current:
    backgroundColor: "{colors.smoked-glass-deep}"
  skip-link:
    backgroundColor: "{colors.lamplight-gold}"
    textColor: "{colors.shadow-ink}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1rem"
---

# Design System: ShoobyD

## Overview

**Creative North Star: "The Unfinished Tower"**

The site is a tower that is always under construction: scaffolding and treadwheel cranes stand at its top, game mode lets a visitor lay more bricks, and the summit owns up to it ("הפסגה עדיין בבנייה"). It is the home of a developer who keeps building, so the system reads warm, humorous and open rather than finished and polished. Scrolling is the climb. Each tier is one of Baruch's worlds, and the sky changes with altitude, from dawn at the base to night at the summit.

The mood is warm, monumental and playful. The monumental part is the name at the base and the tower itself, set in sun-baked mudbrick, limestone and a Flemish sky. Winks balance it: the self-portrait facing a blue error screen, the summit heading that scrambles through scripts before it settles, and the brick-stacking game. The world is loud: a lit, moving 3D tower, or its still picture. The interface stays quiet over it. Panels are dark blurred glass that step back and let the tower lead. Gold appears only where something is alive.

Density is low. One panel holds the screen at a time, with a short lead, a single list or quote, and plenty of the sky and tower around it. The page is Hebrew RTL today and he/en later, so every rule here is written in logical directions (inline-start / inline-end).

The interface is the main piece in the portfolio. Beyond telling visitors who Baruch is and what he makes, it should make them say "wow", and leave them knowing that whoever built it is good at what he does. That is why the home page is a 3D climb with a non-standard scroll. The impression never costs legibility, accessibility or performance: the still climb, reduced motion and keyboard focus are part of the craft, not exceptions to it.

**The Proof Rule.** The site is its own best project. When a choice is between a safe, standard solution and a crafted, distinctive one, choose the crafted one, as long as legibility, accessibility and performance hold. New pages and sections never fall back to a generic template (a card grid, a standard scroll).

**Key Characteristics:**
- A full-page climb: one arch-topped glass panel per tier, fixed at the inline-start over the tower.
- The palette comes from the tower's materials (mudbrick, limestone, ink) and an altitude sky; lamplight gold is the only accent.
- Arches, not rounded rectangles: elliptical arch tops on squared feet, with a limestone keystone.
- Three faces: Suez One (monumental), Frank Ruhl Libre (carved serif), Assistant (text).
- The same page and the same panels with or without WebGL; only the background changes.

## Colors

The palette is the tower's materials under a sky that shifts with altitude, with a single warm lamplight accent.

### Primary
- **Lamplight Gold** (#f2c37e): the "alive" colour. It marks links' underlines, the lit project card's border and wash, the live project's status pill, contact labels and icons, the current gauge tier's mark, quote rules and citations, the handle "ShoobyD", the formula, the selection, the caret and the skip link. Its washes are translucent forms of the same colour: about 10-12% fill and 55-65% border on hovered or lit cards and rows.
- **Hot Lamplight** (#ffd89a): the focus ring (`--sd-focus`), hover on the gold control, and form error text and borders in the game's leaderboard.
- **Lamplight Wash** and **Lamplight Edge** (`--sd-gold-wash`, `--sd-gold-edge`: the gold at 10% and 65%): the warm fill and border of something pointed at, a contact row or a profile pill. Other one-off strengths (the lit project card, the game board's own row, the summit cue) mix the gold the same way, `color-mix(in srgb, var(--sd-gold) N%, transparent)`, rather than copy its value.

### Secondary
- **Sun-baked Mudbrick** (#c98b4a): the tower's own brick. It appears in the brand mark's tiers, the loader's bricks, the lower brick in the game icon and the scrollbar thumb (pale at 28% until the panel is scrolled or hovered).
- **Fired Mudbrick** (#a9713a): the darker course. It is the bricked-up doorway of a closed project and the bottom edge of the loader's bricks.

### Tertiary
- **Flemish Sky** (#6f8fb3): the field (`--sd-field`) and the day stop of the sky.
- **Dawn Zenith** (#2a3a62), **Dawn Horizon** (#f3b98a), **Summit Night** (#101a33): the sky stops. The base sky gradient runs dawn zenith, Flemish sky, dawn horizon. The page's climb gradient runs from the dawn zenith through day, golden dusk and violet to summit night. The summit tier adds a field of sparse warm-white stars, but only when the live tower isn't painting its own sky.

### Neutral
- **Limestone Cornice** (#e9e3d3): all primary text (`--sd-text`), the keystone and the sheet handle, the portrait's mat, and the upper brick in the game icon.
- **Weathered Limestone** (#cbbf9f): the shaded underside of the loader's limestone capstone.
- **Limestone Dim** (limestone at 80%): secondary text over glass (leads on the code tier, asides, hints, the wink, project descriptions at rest, the footer).
- **Cornice Line** (limestone at 20%) and **Cornice Line Strong** (limestone at 30%): panel borders, aside and footer rules, and control borders.
- **Shadow Ink** (#2d2a26): text on gold (selection, gold control, skip link) and the chevron on the sheet handle.
- **Smoked Glass** and **Smoked Glass Deep** (warm near-black at 70% / 80%): the arch panel's top-to-bottom gradient, the current gauge label's pill and the scrollbar track.
- **Control Glass** / **Control Glass Hover** (warm near-black at 58% / 78%): the pill control at rest and on hover.

### Named Rules
**The Lamplight Rule.** Gold appears only where something is alive: a link, the lit doorway and its card, focus, the current tier, a live status, a contact you can reach. Never use gold as decoration on still content.

**The Sky Owns the Field Rule.** The background is always the sky, or the tower and its sky. No flat page colour sits behind the content, and no panel is opaque.

**The Readable Dim Rule.** Secondary text on glass uses Limestone Dim, which keeps at least 4.5:1 over the panels on every tier. Where a surface warms (the lit, hovered or focused project card), its description switches to full Limestone Cornice rather than fading on the warmer glass.

## Typography

**Display Font:** Suez One (with Frank Ruhl Libre, Georgia, serif)
**Carved Serif:** Frank Ruhl Libre (with Georgia, serif)
**Body Font:** Assistant Variable (with Assistant, Segoe UI, system-ui, sans-serif)

**Character:** Suez One is heavy and slab-like, like letters cut into a monument. Frank Ruhl Libre is the inscription's quieter voice, for quotes, asides and the formula. Assistant carries everything you read at length. All three are self-hosted and cover both Hebrew and Latin.

### Hierarchy
- **Display** (400, clamp 2.6rem to 4.9rem, 1.04): the name at the base, the page's single h1. In the base panel its size follows the panel width (`min(display size, 17cqi)`, no wrapping), so it always stays on one line.
- **Headline** (400, clamp 2rem to 3.05rem, 1.04): each tier's title (h2), balanced wrapping.
- **Title** (400, clamp 1.3rem to 1.5rem, 1.04): h3. At similar sizes, Suez One also sets the project names (1.22rem), contact values (1.08rem), the header name (1.32rem), the handle (1.35rem, 0.12em tracking, gold) and the gauge's altitude readout.
- **Carved serif** (400, 1.05rem): asides under a thin rule. It also sets quotes (1.32rem, 1.45 leading), the formula (clamp 1.8rem to 2.4rem, gold) and the portrait caption.
- **Lead** (400, 1.16rem, 1.6, max 68ch): the first paragraph under a tier title (1.02rem on phones).
- **Body** (400, 1.0625rem / 17px, 1.6): running text, with pretty wrapping.
- **Label** (700, 0.85rem, 0.04em tracking): contact labels, project status (0.78rem), and the "גם ב:" lead. Labels never take uppercase transforms (the script is Hebrew).
- **Caption** (400, 0.78rem, 0.03em): the header tagline and small print. Controls use 600 at 0.95rem.

Measured values (altitude, scores, years, ranks) use tabular numerals.

### Named Rules
**The One-Line Name Rule.** The name at the base never wraps. Its size follows the panel through container-query units, never through a smaller fixed size. The summit's "גם ב:" row works the same way: one font size (`clamp(0.75rem, 4cqi, 0.95rem)`) with everything inside in em, so it stays on one line and wraps only once it would drop below 12px.

**The No Kicker Rule.** Nothing sits on its own line above a heading. A label that introduces a group flows inline at the start of that group, like "גם ב:" at the start of its pill row.

## Layout

The page is always the climb. Each tier is a tall scroll span: 1.5 viewports (`150vh`), the summit one viewport. A tier that steps through its items gets half a viewport more per "stop" after the first: the code tier one per project, the experience tier one per stage of its path. The camera parks when a section's top meets the viewport's top. Behind it sits either the live 3D tower (`html.webgl`) or the still picture (StaticTower). Panels, gauge, sheets and scroll spans behave the same in both; only the background differs.

- **Wide screens (above 47.5rem):** each tier's arch panel is fixed at the inline-start (`clamp(16px, 6vw, 112px)` in), vertically centred, `min(31rem, 40vw)` wide and at most the viewport minus 150px tall. A panel taller than that scrolls its body under a fixed title, with the scrollbar running down its straight side, and soft mask fades where more content waits. The body keeps 6px of room (padding with a matching negative margin) on its inline-start and top, so focus rings aren't clipped. The tower stands at the inline-end. The altitude gauge runs down the inline-end edge, `min(58vh, 470px)` tall.
- **Phones (47.5rem and below):** the panel becomes a bottom sheet, inset 8px. Open, it rises to just under the header. Collapsed, only a 150px peek (title and fading first lines) stays above the bottom edge. It opens and closes through the keystone handle, by drag, by a tap outside, or with Esc. On the tiers with stops, the collapsed sheet shows a copy of what is in focus under its title: the project, or the stage of the path (its years and role), each kept to one height from stop to stop. An open sheet whose content fits isn't a scroll box: a swipe on it climbs the tower, up or down, and only its handle or title band drags it closed. A longer one scrolls inside, and the page holds. The gauge moves to the top (from 76px down, 34vh tall), names only the current tier, and dims to 20% while a sheet is open; its label steps aside entirely.
- **Very narrow (30rem and below):** panel padding tightens (3.6rem / 1.4rem) and the arch becomes `50% 3.6rem`.
- **Header:** fixed over the climb, brand at the inline-start and actions (game mode, language) at the inline-end, with `var(--sd-gutter)` inline padding.
- **Without JavaScript or if loading fails:** a full-screen message replaces the page. The whole tower stands on its plain under the dawn sky, with an arch panel saying "האתר צריך JavaScript".
- **Spacing rhythm:** an 8-step scale from 0.25rem to 4.5rem. Tight internal gaps (4-14px) sit inside cards and rows; `space-4`/`space-5` separate blocks inside a panel.

**The Logical Direction Rule.** Use only logical properties (`inline-start/end`, `block-start/end`); there are no physical left/right rules. `lang` and `dir` are set per page, and all strings live in the dictionary (`src/i18n/home.ts`). The page layout mirrors with `dir`.

**The Tower Never Mirrors Rule.** The tower is a physical object. Its ramp always climbs clockwise, and the project doorways keep the same order in both languages. Only the page layout follows `dir`.

**The Same Climb Rule.** With reduced motion, panels only fade (no drift) and the still picture crossfades between tiers instead of travelling. With Save-Data, no pictures are fetched. Neither changes the layout or the spans.

## Elevation & Depth

Depth is atmospheric: translucent, blurred glass over a lit scene, plus one deep, soft, warm shadow that lifts the panel away from the tower. Surfaces inside a panel stay flat and separate by tone (faint warm washes of 3-6% and thin limestone borders), never by their own shadows.

### Shadow Vocabulary
- **Panel lift** (`box-shadow: 0 30px 80px -30px rgb(10 8 6 / 0.65), inset 0 1px 0 rgb(255 240 215 / 0.12)`): the arch panel only. A long offset drop plus a hairline of warm light along its top edge.
- **Legibility glow** (`text-shadow: 0 1px 2px rgb(20 16 12 / 0.85), 0 0 10px rgb(20 16 12 / 0.7)`): text set directly over the scene, such as the header name and tagline, the gauge readout and labels, the loader line and the portrait caption.
- **Mat shadow** (`box-shadow: 0 14px 30px -12px rgb(10 8 6 / 0.7), inset 0 0 0 1px rgb(45 42 38 / 0.15)`; lifted on hover/focus to `0 24px 40px -14px rgb(10 8 6 / 0.75)`): the self-portrait's limestone mat, a physical object hung askew.
- **Glass blur** (`backdrop-filter: blur(16px) saturate(1.15)` on panels, `blur(10px)` on controls): this is what makes the glass read as glass over the moving tower.

### Named Rules
**The Quiet Glass Rule.** Panels are dark, blurred, translucent glass that steps back. The world is loud and the interface is not: no bright surfaces, no opaque cards, no glow effects on the chrome.

**The Glow, Not Scrim Rule.** Text set straight over the scene (header tagline, gauge readout) keeps its legibility glow and gets no pill or scrim behind it. The gauge's tier labels are the exception: they sit on small dark pills (`rgb(30 27 24 / 0.5)`, Smoked Glass Deep for the current one) so they stay legible over any tier.

## Shapes

The geometry is the tower's: arches, not rounded rectangles. A panel has an elliptical arch top (Arch, `15.5rem 5.6rem`) on squared feet (Corner, 6px), with a limestone keystone, a 26 × 20px trapezoid, at its crown. A project card is a small doorway (Arch Small, `30px 22px` top, 6px feet). On phones, the sheet's arch is `50% 2.6rem` with no bottom corners or bottom border, and the keystone becomes a larger 44 × 30px handle carrying a chevron. Pills (999px) serve controls, chips, status tags, gauge labels and inputs. Small shapes repeat the motif: each gauge mark is a tiny arched block (`3px 3px 1px 1px`), and so is each stage's mark on the path, and the door inside a project card is a 26 × 34px arched doorway. The focus ring takes the 6px corner. Contact rows use a plain 8px radius.

## Components

### Buttons (the pill control)
Dark glass that warms to gold on hover.
- **Shape:** full pill (999px), minimum 44px tall and 52px wide.
- **Default:** Control Glass with a Cornice Line Strong 1px border, Limestone text at 600 / 0.95rem, 9px × 16px padding, a 10px backdrop blur.
- **Hover / Active:** the border turns Lamplight Gold and the fill deepens to Control Glass Hover. On press it scales to 0.97. Disabled controls drop to 50% opacity.
- **Display variant:** set in Suez One at 400 (the language switch "EN").
- **Gold variant:** Lamplight Gold fill with Shadow Ink text, turning Hot Lamplight on hover. Use it for the single main action in a dialog or the game (download the CV, submit a score, play again), next to plain controls.
- **Game-mode toggle:** a pill with a brick glyph (a mudbrick course, a limestone brick dropping onto it). It exists only while the live tower is running, never over the still picture, without JavaScript or under the loader.

### Chips
- **Style:** pills with a faint limestone fill (9%) and border (18%), 600 at 0.95rem, 5px × 13px. Used for the language tier's topics.
- **Link chips ("גם ב:" row):** the same pills as links, each with a 16px gold brand icon. On hover/focus they warm to a gold wash (10%) and gold border (65%). The whole row is sized in em from one font size.

### Cards / Containers
- **Arch panel:** see Shapes. Fill is a top-to-bottom gradient from Smoked Glass to Smoked Glass Deep, with a Cornice Line border and the panel-lift shadow. Padding is 4.4rem at the top (under the arch), 2.1rem inline and 2rem at the bottom. Each tier's content has one title, then a body that scrolls.
- **Project doorway card:** a three-column grid (door, name over description, status pill). At rest it has a 3% warm wash and a limestone border at 14%. **Lit** (hover, focus, or the climb's stop on that project, which is also when its doorway in the tower is hovered): a 12% gold wash, 60% gold border, a 2px lift, and the door glows (radial white-gold to amber). The description takes full Limestone Cornice. A closed project's door is bricked up in fired mudbrick and never glows; at its stop only the border brightens.
- **Path (timeline):** the experience tier's stages, newest first, down a 2px rail at the inline-start (limestone at 16%). Each stage has a 12px arched mark, today's in Lamplight Gold. A stage is its years (gold 700 at 0.8rem), its role in Suez One at 1.1rem with the place after it in Limestone Dim (kept whole, never broken at a maqaf), and one or two detail lines (0.93rem, Limestone Dim). **Stepping** (the climb's stops, degree first): the stage in focus opens its details (a grid row sliding from 0fr to 1fr), its role grows to 1.22rem and its mark turns gold at 1.2 scale. The others close to years and role at 50%. The stages already passed keep a muted gold mark and their piece of rail in gold, so the rail fills from the degree up to the focus. The list keeps the height of its tallest state, so the panel never moves between stops. With reduced motion only the fade remains. Without the script every stage stays open. In the live tower the armillary sphere builds up with it: off below the tier, its core lit with the degree and a ring gilded for each later stage, outward to today's; the part in focus flashes as the focus comes to it, either way, and the camera takes the sphere from a side of its own at each stop.
- **Contact row:** a label (gold icon and gold 700 label) and the value in Suez One, space-between, wrapping the value whole under the label if it can't fit. 4% warm wash, 14% limestone border, 8px radius, warming to gold on hover/focus.
- **Craft list:** gold 26px line icons beside 1.06rem text, separated by limestone hairlines at 10%.

### Inputs / Fields
- **Style:** the game leaderboard's name field is a pill, at least 44px tall, with a 6% warm wash and a Cornice Line Strong border.
- **Focus:** the global ring (below).
- **Error:** border and message in Hot Lamplight.

### Navigation
- **Header:** fixed over the climb. The brand is the tower mark plus the name in Suez One with a caption tagline under it, both with the legibility glow. Pill controls sit at the inline-end.
- **Altitude gauge:** the page's navigation, drawn as the tower's height scale counted in אמות. A thin limestone rail (15% to 55%, rising toward the summit) carries arched marks. The current tier's mark turns Lamplight Gold at 1.15 scale and its label pill deepens. The readout above (Suez One, tabular numbers) counts the current altitude. Tiers are plain anchor links to each tier's park. Their labels are a poem of the climb rather than the tiers' titles (היסוד, הקוד, הדרך, העניין, הלב, הפסגה); each link carries its tier's title in its accessible name, after the label, and as a tooltip.
- **Skip link:** a Lamplight Gold pill with Shadow Ink 700 text that slides in on focus.

### Focus
The global ring is a 2px solid Hot Lamplight outline with a 3px offset and the 6px corner. The sheet handle drops its clip while focused and draws a 2px ring at a 2px offset. The self-portrait draws its ring (3px, 3px offset) on its mat, not on the link, so the ring hugs the drawing evenly and lifts with it.

### The Self-Portrait (signature)
Baruch's pen drawing of himself facing a blue error screen, on a limestone mat (10px padding, 3px radius), hung askew at -1.4°. On hover/focus it straightens and lifts. It opens in a native modal over a darkened (72%), blurred backdrop, with a FLIP motion from the small drawing and a carved-serif caption. It is 15rem wide in the base panel and 11rem on phones.

### The Babel Title (signature)
The summit heading scrambles through several scripts before it settles. It stays on one line while it scrambles, so the panel below doesn't jump.

### Tower Loader
A sky-gradient screen where five bricks are laid base-first, with a limestone capstone, and then taken down and laid again. The loading line is in Suez One with the legibility glow. It fades out over the live scene.

## Do's and Don'ts

### Do:
- **Do** use only logical CSS properties and set `lang`/`dir` per page; keep every string in `src/i18n/home.ts`.
- **Do** keep the tower unmirrored in LTR: the ramp climbs clockwise and the doorway order is fixed. Only the page layout follows `dir`.
- **Do** keep the page the climb in every mode: the same spans, panels and sheets over either the live tower or the still picture. With reduced motion, fade instead of drift; with Save-Data, fetch no pictures.
- **Do** spend Lamplight Gold only on what is alive: links, the lit card and door, focus, the current tier, live status, reachable contacts.
- **Do** set secondary text over glass in Limestone Dim (at least 4.5:1 on every tier), and switch it to full Limestone Cornice on a warmed (lit, hovered, focused) surface.
- **Do** keep the base name on one line by sizing it from the panel (`min(var(--sd-text-h1), 17cqi)`), and size one-line rows like "גם ב:" from a single em-based font size.
- **Do** isolate only the English word in a Hebrew line (`<bdi dir="ltr">ShoobyD</bdi>`), with the line itself in the page's direction.
- **Do** keep 6px of room around a scrolling panel body so focus rings are never clipped, and draw the portrait's ring on its mat.
- **Do** give text set straight over the scene the legibility glow; put the gauge's tier labels on dark pills.
- **Do** show game-mode controls only while the live tower is running.
- **Do** use arches for containers: an elliptical top on squared 6px feet, with a keystone at the crown.

### Don't:
- **Don't** let a new page or section fall back to a generic template; the interface is the evidence (The Proof Rule).
- **Don't** put a kicker or eyebrow label on its own line above a heading; an introducing label flows inline at the start of its group.
- **Don't** add a pill or scrim behind the header tagline or the gauge readout; they keep their text-shadow.
- **Don't** use physical left/right properties, or "fix" the doorway order for LTR.
- **Don't** make panels opaque or bright, or give inner cards their own drop shadows; the glass steps back and the tower leads.
- **Don't** use gold as decoration on still content, or bring in a second accent hue.
- **Don't** shrink the name to a fixed smaller size or let it wrap.
- **Don't** render game-mode controls (the header toggle, the summit's touch cue) over the still picture, without JavaScript, or under the loader.
- **Don't** let a page without JavaScript show a broken climb; it shows the full-tower message instead.

