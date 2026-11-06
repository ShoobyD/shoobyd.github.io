# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro with Vue components (`@astrojs/vue`), static output, deployed to GitHub Pages through GitHub Actions (`.github/workflows/deploy.yml`).
- Pages and layouts are `.astro`. UI components are Vue SFCs, which render to static HTML by default; a component is hydrated (`client:*`) only when it needs interactivity.
- Legacy pages are served verbatim from `public/`.

## Users

The two audiences carry equal weight:
- **Professional visitors**, such as recruiters, employers and colleagues. They want to know who Baruch Mustakis is as a web developer, what he has built, and how to reach him or get his CV.
- **Personal / playground visitors**, such as friends, communities he's part of, and people who arrive from one of his projects. They come to explore the tools, toys and experiments he has published.

## Product Purpose

The personal home of Baruch Mustakis, a.k.a. **ShoobyD**: who he is, what he has made, and how to contact him. It is also the hub for his other projects. Those live in their own GitHub repos and are served on the same origin under `https://shoobyd.github.io/<repo>/` (e.g. `/sudoku/`, `/chinese-vocabulary/`).

Success means two things:
- A professional visitor quickly understands his profile and finds the CV or contact details.
- A curious visitor wants to click into the projects.

## Positioning

The site is a working developer's portfolio and a personal playground, with neither one hidden behind the other. Baruch is a web developer with a B.Sc. in pure mathematics (with honors) plus supplementary computer-science studies. Many of his projects are live, playable things hosted on the same origin, not screenshots.

## Operating Context

- Each project is its own repo deployed to `/<repo>/` on the same origin. This repo owns `/`, the shell pages, and the legacy pages in `public/`.
- **Planned:** some projects currently in this repo (for example the Fresh forum material in `public/fresh/`) will move to their own repos later. Those repos should be able to reuse the same new template and design. Because they share the origin, they can load shared assets from this site (e.g. a versioned `/theme/v1/`), or consume a shared package. The shell and tokens must therefore stay separable from the rest of the site (see Constraints).
- Userscripts were already moved to a separate repo (`ShoobyD/userscripts`).

## Capabilities and Constraints

- **Language & direction:** Hebrew (RTL) today. The site will become bilingual (he/en) in a later phase. Everything built now must be direction-agnostic: logical CSS properties only, `lang`/`dir` set per page, UI strings kept in a dictionary, and a font coverage requirement for both Hebrew and Latin.
- **Static only:** no server code. PHP files in legacy folders do not run on Pages.
- **Separable shell:** keep the design tokens and the shell components (header, nav, footer) in an isolated folder with no dependencies on the rest of the site, so they can later be published for sibling repos.
- **Legacy pages stay byte-for-byte unchanged** until the content phase: `public/balloonz/`, `public/calhobb/`, `public/fresh/`, `public/icmptunnel/` and their shared `public/assets/` (jQuery, `main.css`, `menu.js`).
- **Order of work:** (1) platform (done), (2) modern redesign of the shell, home `/` and `/contact/`, (3) content update: cleaning out old pages, adding the missing projects, refreshing the about text and CV. Content changes are out of scope until phase 3.
- **Undecided:** the final project list and which legacy pages survive, the English copy, and whether sibling repos use a runtime theme or an npm package.

## Brand Commitments

- Name **Baruch Mustakis** (ברוך מוסטקיס) and the nickname **ShoobyD** are part of the identity.
- The **Mario 404 page** (`public/404.html` and `public/assets/404/`) stays as it is.
- **Humorous winks** stay part of the personality, for example the BSoD image (`public/assets/images/BSoD.jpg`) on the home page. The site should not become merely serious.

## Evidence on Hand

- **About copy** (home page): web developer, B.Sc. in pure mathematics with honors, plus supplementary CS studies. Professional experience is not yet on the site; it arrives in the content phase, and none should be invented.
- **CV:** `public/assets/files/Curriculum Vitae.pdf` (likely outdated; it gets refreshed in the content phase).
- **Contact / social:**
  - Facebook `ShoobyD`
  - LinkedIn `in/ShoobyD`
  - email `bmusty@gmail.com`
  - DeviantArt `shoobyd`
  - Hebrew Wikipedia user `ShoobyD`
  - Fresh forum member 90538
- **Projects linked today:**
  - Sudoku Solver (`/sudoku/`, own repo)
  - balloonz (embeddable popping-balloons game)
  - ICMP Tunneling
  - a book-download system (closed to the public)
  - Fresh forum add-ons, counters and skins
  - a Latin course taught on Fresh
  - the "ציירו אותי" Facebook group
  - Calvin & Hobbes (old)
- **Other repos deployed to Pages but not yet linked:**
  - chefdepot-catalog
  - chinese-vocabulary
  - dialog
  - doppler-effect-simulator
  - droploader
  - dynamic-download-links
  - pinterest-widgets
  - sort-my-ass
  - tech-lead-curriculum
- **Absent:** there are no testimonials, client logos, metrics or press. Do not fabricate them.

## Product Principles

1. **Both audiences, one site.** A recruiter and a curious friend should each find their path within seconds, without either path burying the other.
2. **Projects are live things.** Link to the real, running project wherever one exists. Prefer showing the work over describing it.
3. **Personality is a feature.** The humor and the ShoobyD identity are part of what makes the site his. Polish must not sand them off.
4. **Built to be shared and translated.** Every piece of the shell must work in both directions and be reusable by sibling project repos on the same origin.
5. **Nothing old breaks silently.** Legacy pages and existing URLs keep working until they are deliberately retired in the content phase.

