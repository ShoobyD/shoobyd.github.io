---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/contact/index.astro"]
---

# Home `/`: surface brief

## Scope and mode
- **Surface:** the home page `/`, which also sets the shell for `/contact/` and later pages.
- **Mode:** Experience. The work itself leads from the first viewport.
- **Audiences:** professional visitors (recruiters, employers, colleagues) and curious ones (friends, communities, project visitors), with equal weight. The first viewport shows *him* first.
- **Two modes:** a cinematic scroll-driven climb that carries all the content, plus an optional game mode ("מצב משחק").
- **Constraints:**
  - Hebrew RTL now and he/en later. All readable text is real DOM, using logical CSS properties only.
  - WebGL is one Vue island (TresJS) loaded after the first content paints.
  - Fallbacks: with reduced motion the camera jumps between sections; without WebGL the full content stays readable.
  - Shell tokens and components stay separable, so sibling repos can share them.
- **Must not feel:** too serious, sterile/template, or cheap nostalgia.
- **Approved reference prototype:** `.impeccable/mocks/prototypes/babel/index.html`. It is the composition the build matches.
- **Kept alternates, for possible future redesigns:**
  - `.impeccable/mocks/prototypes/mobius/`
  - `.impeccable/mocks/prototypes/concourse/`

## Direction contract

THESIS: Scrolling climbs a spiral Tower of Babel, and each tier is one of Baruch's worlds: code, mathematics, languages and myth, making, and the summit. Projects are lit doorways set into the ramp. It refuses the category default of a dark scene, one glossy floating object, a headline, a card grid and "SCROLL ↓".

OWN-WORLD:
- **Palette:** sun-baked mudbrick ochre `#c98b4a` / `#a9713a`, limestone cornices `#e9e3d3`, shadow ink `#2d2a26`, and a Flemish sky `#6f8fb3`. The sky owns the field and shifts with altitude: dawn at the base, day, golden dusk, a starry night at the summit.
- **Materials:** a procedural brick tower with instanced arches, lit windows, torches, tiny figures on the ramp, scaffolding and treadwheel cranes at the unfinished top, a patchwork plain with a sea, and drifting clouds.
- **Panels:** arch-topped dark-glass cards with a keystone.
- **Type:** Suez One for monumental display, Frank Ruhl Libre as the carved serif, Assistant for text.
- **Gauge:** an altitude gauge counted in אמות (cubits).

STORY:
1. The visitor meets Baruch Mustakis / ShoobyD at the base.
2. They climb through his worlds and see live projects as doorways they can open.
3. At the summit they find contact details, softened by a Babel joke: the heading scrambles through scripts before it settles.
4. Curious visitors can enter game mode and add bricks to his tower.

FIRST VIEWPORT:
- The tower stands at the inline-end of the viewport at dawn, rising from the plain with its unfinished summit visible.
- At the inline-start, an arch-topped panel holds the kicker "קומת היסוד", the name "ברוך מוסטקיס" at monumental scale, "ShoobyD", one line of who he is, and the scroll hint.
- The header holds brand, game-mode and EN.
- The altitude gauge with the tier buttons runs along the inline-end edge. In LTR the whole composition mirrors.
- **The tower itself never mirrors.** Its geometry is a physical object: the ramp always climbs clockwise, and the project doorways keep the same order along it in both languages. Only the page layout (panels, gauge, which side the tower stands on) follows `dir`. Do not "fix" the doorway order for LTR. (User decision, 2026-11-06.)
- **Signature interaction:** a smoothed scroll helix around the tower, parking at each tier, with sky, sun, fog and window glow tied to altitude.
- **Per-tier moments:** hover-linked doors and cards (code), an armillary sphere (mathematics), orbiting glyphs of many scripts under Genesis 11:1 (languages), strummable guitar strings (making), the scrambling summit heading.
- **Game mode:** brick stacking with overhang slicing. Built bricks persist on the tower.

FORM: Spiral Tower of Babel, #1 on my ordered grounded list in re-roll round 1, chosen by the user as IMPECCABLE’S PICK over the assigned Möbius ride after comparing three live WebGL prototypes. seed:9235411404157c62

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Final project list and year/tech labels (content phase). Until then, use only the confirmed facts in PRODUCT.md.
- English copy beyond the prototype strings.
- Mobile panel height: the panels currently take about 50% of the screen.
- How the summit and night tiers keep enough contrast and brightness.

