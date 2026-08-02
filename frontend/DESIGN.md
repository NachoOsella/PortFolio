---
name: Ignacio Osella Public Visual System
description: Premium minimal portfolio system for technical work, writing, and contact.
colors:
  bg: "#1d2021"
  bg-soft: "#282828"
  bg-raised: "#32302f"
  fg: "#d4be98"
  fg-soft: "#ddc7a1"
  muted: "#a89984"
  line: "#45403d"
  yellow: "#d8a657"
  orange: "#e78a4e"
  red: "#ea6962"
  green: "#a9b665"
  aqua: "#89b482"
  blue: "#7daea3"
  purple: "#d3869b"
typography:
  display:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(4rem, 8.6vw, 8.2rem)"
    fontWeight: 720
    lineHeight: 0.84
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(4rem, 9vw, 8.8rem)"
    fontWeight: 700
    lineHeight: 0.84
    letterSpacing: "-0.04em"
  section:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.4rem, 7vw, 7rem)"
    fontWeight: 690
    lineHeight: 0.88
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  action:
    fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.6
    letterSpacing: "normal"
  field:
    fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0.08em"
  metadata:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "9px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  square: "0"
  mark: "2px"
  circle: "50%"
spacing:
  rule: "1px"
  shell: "36px"
  tablet-shell: "20px"
  mobile-shell: "16px"
  nav-desktop: "72px"
  nav-mobile: "64px"
  control: "44px"
  hero-action: "52px"
  form-gap: "20px"
components:
  button-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.bg}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "0 20px"
    height: "52px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "0 20px"
    height: "52px"
  button-control:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "0 15px"
    height: "44px"
  field:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    typography: "{typography.field}"
    rounded: "{rounded.square}"
    padding: "0 12px"
    height: "48px"
  project-artwork:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.bg}"
    rounded: "{rounded.square}"
    height: "min(72vh, 720px)"
---

# Design System: Ignacio Osella Public Visual System

<!-- impeccable:design-schema 1 -->

## Overview

**Creative North Star: "The Angular Operating Field"**

**THESIS:** Premium minimal technical precision. The public portfolio is evidence of clear systems, not a generic hero followed by a card grid. It uses restraint, legible structure, and motion that explains relationships. There are no fake terminals, terminal cosplay, or generic card grids.

**OWN-WORLD:** Gruvbox Material Dark Hard is the permanent public ground: hard dark surfaces, warm type, precise hairlines, angular IO geometry, project-specific system diagrams, and full-field semantic colors. Arch and terminal culture appear as subtle material references through monospace metadata, command-like labels, square controls, and system language. The page never pretends to be a terminal.

**STORY:** Meet the developer, move through selected systems, understand the practice, read the thinking, and contact Ignacio. The route system supports home, projects, project stories, blog, articles, about, contact, and the private workspace entry without changing the public visual world.

**FIRST VIEWPORT:** A two-line kinetic title reads "Full-stack products," and "built to last." A pointer-draggable product-systems cube rotates beside it with slow auto-rotation when idle and arrow-key support. The explanatory copy, View work action, and Contact action remain visible in the first viewport.

**FORM:** Premium minimal with subtle Arch and terminal culture. The signature public patterns are a Motion-driven pinned horizontal project gallery, kinetic typography and state transitions, project-specific diagrams, hairline structure, and a vertical mobile and reduced-motion sequence.

**Key Characteristics:**
- Dark hard-ground palette with warm foreground type.
- One pixel rules and square controls instead of soft cards and pills.
- Angular geometry and semantic color fields carry visual emphasis.
- Motion reveals hierarchy without hiding content or function.

## Colors

The public palette is a Gruvbox Material Dark Hard field. Yellow is the primary action and reading accent. Blue, green, orange, aqua, purple, and red carry semantic or project-specific meaning. The dark neutrals establish depth without shadows.

### Primary
- **Warm Yellow:** `colors.yellow` is the primary action, active link, focus, reading progress, and signature accent.

### Secondary
- **Signal Blue:** `colors.blue` marks one face of the hero cube and selected system geometry.
- **Signal Green:** `colors.green` is an available project field and semantic success tone.
- **Signal Orange:** `colors.orange` marks one face of the hero cube and an available project field.
- **Signal Aqua:** `colors.aqua` is an available project field.
- **Signal Purple:** `colors.purple` is an available project field.
- **Signal Red:** `colors.red` is reserved for form errors.

### Neutral
- **Hard Ground:** `colors.bg` is the page, app, input, and mobile menu background.
- **Soft Ground:** `colors.bg-soft` is used behind contact and login forms and as the image placeholder surface.
- **Raised Ground:** `colors.bg-raised` is used for loading lines and inline code.
- **Warm Foreground:** `colors.fg` is the main type and control foreground.
- **Soft Foreground:** `colors.fg-soft` is the long-form reading foreground.
- **Muted Warm Gray:** `colors.muted` is metadata and secondary copy.
- **Structural Line:** `colors.line` is the one pixel rule, border, and diagram structure color.

### Named Rules
**The Full-Field Semantic Rule.** Let semantic colors occupy whole project and writing fields when they carry meaning. Do not reduce them to tiny badges or decorative dots.

**The Warm Contrast Rule.** Pair the hard dark ground with warm foreground type and yellow interaction states. Keep muted text for metadata and supporting copy, not primary reading content.

## Typography

**Display Font:** Archivo Variable with `ui-sans-serif`, `system-ui`, and `sans-serif` fallbacks.
**Body Font:** Manrope Variable with `ui-sans-serif`, `system-ui`, and `sans-serif` fallbacks.
**Label/Mono Font:** `ui-monospace`, `SFMono-Regular`, Consolas, and `monospace`.

**Character:** Archivo Variable gives the system its compressed, technical display voice with strong negative tracking. Manrope Variable keeps body copy calm and readable. Monospace is reserved for technical metadata, labels, dates, project signals, and command-like cues.

### Hierarchy
- **Display** (720, `clamp(4rem, 8.6vw, 8.2rem)`, `0.84` line-height, `-0.04em` tracking): the two-line home title and the largest field headings.
- **Headline** (700, `clamp(4rem, 9vw, 8.8rem)`, `0.84` line-height, `-0.04em` tracking): project, article, and page headers.
- **Section** (690, `clamp(3.4rem, 7vw, 7rem)`, `0.88` line-height, `-0.04em` tracking): selected work, practice, and writing section titles.
- **Body** (400, `15px`, `1.6` line-height): interface copy and general public text. Constrain supporting paragraphs to roughly `34ch` to `60ch` where the implementation specifies a measure.
- **Field** (400, `13px`, `1.6` line-height): contact and login inputs.
- **Label** (600, `10px`, `1.6` line-height, `0.08em` tracking, uppercase): role labels, section labels, and technical metadata.
- **Metadata** (400, `9px`, uppercase where the component specifies it): dates, article metadata, and compact project signals.

### Named Rules
**The Two-Font Rule.** Use Archivo for headings, diagrams, blockquotes, and large calls to action. Use Manrope for body copy and fields. Use monospace only for technical context.

**The Negative-Tracking Rule.** Keep display headings at `-0.04em` tracking, with the diagram monogram tightening further to `-0.09em` at rest and `-0.04em` on hover.

## Layout

The public shell is fluid and capped at `1380px` through `--v2-max`. Desktop shell width is `calc(100% - 72px)`, giving a `36px` minimum gutter on each side. At `980px` and below it becomes `calc(100% - 40px)` with a `20px` gutter. At `768px` and below it becomes `calc(100% - 32px)` with a `16px` gutter.

The fixed navigation is `72px` tall on desktop and `64px` on mobile. Home and full-height route surfaces account for the navigation height. The desktop home hero fills the remaining viewport and centers its title block. The project gallery occupies one viewport and uses a full-width horizontal track. Practice and writing use asymmetric two-column grids with large fluid gaps. Reading pages use a `180px` table of contents rail and a `780px` reading column within a `1034px` layout. Individual project pages move directly from metadata into the reading surface; large decorative case-study artwork is not used.

At `980px`, practice, writing, contact, and login grids collapse to one column, sticky preview and practice headings become static, and project panels reduce their internal column proportions. At `768px`, the navigation becomes a full-height menu, the hero footer stacks, and the project track becomes a vertical sequence with artwork above copy. Practice, writing, article, and contact layouts become single column. The reading table of contents is hidden on mobile while the article content remains available.

### Motion mechanics
- **Hero cube:** a six-faced cube (`PRODUCT / REACT`, `SYSTEM / JAVA`, `DATA / POSTGRES`, `FLOW / SPRING`, `SHIP / DOCKER`, `SCALE / TYPESCRIPT`) rotates with `useAnimationFrame` at a slow idle rate when reduced motion is off and the cube is not being dragged. Dragging uses pointer capture and maps delta to `rotationX`/`rotationY` spring targets with `stiffness: 180`, `damping: 24`, and `mass: 0.7`; `rotationX` is clamped to `±78°`. Arrow keys nudge the cube in `12°`/`10°` increments.
- **Hero entrance:** each title line starts at `y: 108%` with opposite `±1.5deg` rotations and settles over `0.8s`, with staggered `0.08s` delays. The footer fades and rises from `y: 20` over `0.7s` after a `0.46s` delay.
- **Mobile menu:** Motion animates `clip-path` from `inset(0 0 100% 0)` to `inset(0 0 0% 0)` over `0.45s` with `cubic-bezier(0.16, 1, 0.3, 1)`. Reduced motion uses an opacity-only exit.
- **Desktop gallery:** A `ResizeObserver` measures `track.scrollWidth - outer.clientWidth`. The outer height becomes `100svh + travel`; a sticky `100svh` stage clips the rail. Motion maps `useScroll` progress to track `x`, then applies a spring with `stiffness: 120`, `damping: 24`, and `mass: 0.35`. Project panels move through `0.42 / 1 / 0.42` opacity and `0.975 / 1 / 0.975` scale around the viewport center. The active artwork follows a fine pointer by at most `8px` in the opposite direction.
- **Writing preview:** Motion uses `0.5s` transitions. Entering content moves from `opacity: 0, scale: 0.92, rotate: -2deg` to its resting state. Exiting content moves to `opacity: 0, scale: 1.04, rotate: 2deg`.
- **Reading progress:** Motion springs `scrollYProgress` with `stiffness: 120`, `damping: 24`, and `mass: 0.35` into the two pixel scale bar.
- **Reduced motion:** Motion's `useReducedMotion` disables hero pointer movement, desktop gallery pinning, artwork pointer response, and reading progress rendering. The stylesheet sets transition and animation duration to `0.01ms` and changes the gallery to the complete vertical project sequence at every viewport.

Spacing is intentionally sparse. Section padding uses fluid values up to `190px` on desktop and `96px` on mobile. Major public surfaces are separated by one pixel rules. Do not introduce a second container system or a rounded dashboard grid.

## Elevation & Depth

This is a flat-by-default system. There are no decorative box shadows in the public v2 surface. Depth comes from the three dark tonal grounds, full-field accent colors, one pixel rules, clipping, typography scale, a fixed translucent navigation layer, and the low-opacity texture overlay. The navigation uses `color-mix` over the hard ground and `backdrop-filter: blur(18px)`. The only shadow-like treatment is the visible focus ring around fields, which is functional rather than decorative.

### Shadow Vocabulary
- **No ambient shadow:** do not add cards, floating panels, or elevation shadows to public v2 surfaces.
- **Functional field ring:** the field focus state uses a two pixel color-mixed ring around the yellow border.

### Named Rules
**The Flat-By-Default Rule.** A public surface is flat at rest. Change depth through tone, geometry, or rule placement before considering a shadow.

**The Hairline Rule.** Use `1px` structural lines for navigation, section boundaries, form frames, diagrams, reading progress, and next-item transitions.

## Shapes

The public v2 form language is square and angular. Buttons, fields, artwork, code blocks, image placeholders, navigation controls, project panels, and form frames use `border-radius: 0`. The signature mark uses a small `2px` SVG corner radius. The hero cube is the one rounded-volume object, built with `transform-style: preserve-3d` faces at `translateZ(var(--cube-half))` rather than a CSS `border-radius`.

Angular IO geometry is carried by the hero cube (six semantic faces, one pigment each, with monospace index/label and Archivo value), nested borders, axes, and offset nodes. Project diagrams use a central monogram, horizontal and vertical axes, and three labeled nodes. Project artwork is a color field rather than a generic card image. Pills, blobs, excessive gradients, and soft rounded card stacks are outside the system.

## Components

The public components are restrained, outlined, and stateful. Every interactive surface keeps a visible focus treatment and uses a square silhouette.

### Navigation
- **Shape:** fixed top bar with a one pixel bottom rule; `72px` height on desktop and `64px` on mobile.
- **Surface:** hard ground at `88%` opacity with `backdrop-filter: blur(18px)`.
- **Desktop behavior:** brand mark and name at left, linear links for Projects, Blog, About, and Contact, plus a bordered Résumé control at right.
- **States:** links use muted type at rest, warm foreground on hover or active, and a one pixel yellow underline that expands from the current edge. Resume uses the square control hover state.
- **Mobile behavior:** desktop links are replaced by an icon button. The menu fills the viewport below the bar, uses `66px` rows and one pixel rules, and opens with a Motion clip-path transition.

### Buttons and Actions
- **Shape:** square border, no radius, minimum `44px` control height. Home actions use `52px` height and `20px` horizontal padding.
- **Primary:** yellow background, hard-ground text, yellow border. The home View work action is the primary treatment.
- **Secondary:** transparent hard-ground surface, warm foreground text, line border. The home Contact action shares the action group and removes its left border to form a connected pair.
- **Hover:** yellow border and background with hard-ground text for generic controls; the primary home action shifts to warm foreground background. Controls translate `1px` upward over `260ms` with the standard ease.
- **Active and focus:** active controls scale to `0.98`. Focus-visible uses a `2px` yellow outline with `4px` offset.
- **Text links:** underlined text links use a `9px` icon gap at rest and expand to `15px` on hover. Their border changes to yellow.

### Inputs and Fields
- **Style:** wrapped semantic labels, `8px` label gap, one pixel line border, hard-ground background, warm foreground, `48px` minimum height, square corners, and `12px` horizontal padding.
- **Field typography:** Manrope Variable at `13px`.
- **Focus:** yellow border plus a two pixel color-mixed yellow ring. The visible focus state is not replaced by motion.
- **Textarea:** the shared textarea keeps a `130px` minimum height, `12px` top padding, vertical resize, and `1.5` line-height.
- **Error and status:** form errors use the red semantic token and `role="alert"`. Successful contact submission becomes a `role="status"` state with a Send another action.

### Project Gallery
- **Character:** a pinned, full-height sequence of selected systems, not a card grid. It opens with an intro panel, followed by project panels with full-field artwork and a copy column.
- **Desktop structure:** the outer height is `100svh + measured travel`; the sticky stage is `100svh`. The intro panel is `min(70vw, 980px)` wide. Project panels are `min(88vw, 1280px)` wide with a `1.3fr / 0.7fr` artwork and copy split.
- **Artwork:** artwork height is `min(72vh, 720px)` and cycles through yellow, blue, green, orange, purple, and aqua fields. Each field contains a project-specific diagram, three signal nodes, and a technology sweep.
- **Interaction:** vertical progress moves only the horizontal track transform. Panels gain focus through centered scale and opacity ranges, the title baseline moves by `20px`, and the active artwork follows fine-pointer movement by at most `8px`. Hover expands the monogram, offsets diagram nodes, and lifts the open icon.
- **Mobile:** pinning and horizontal mapping are removed. Projects form a vertical sequence in editorial order, with artwork between `220px` and `360px` high and complete copy directly below it.

### Project and System Diagrams
- **Shape:** axes are one pixel lines. Nodes use one pixel current-color borders, square backgrounds, uppercase monospace labels, and `7px 10px` padding.
- **Content:** each project supplies its own three signal labels and a generated monogram. Do not replace these with generic stock screenshots or technology logo clouds.
- **Accessibility:** gallery links carry the project title in their visible copy. Case study artwork exposes a title-specific system diagram label; decorative gallery artwork and diagram internals are hidden from assistive technology.

### Writing Index and Reading Surfaces
- **Index:** a sticky, full-field color preview pairs with a ruled list of articles. Hover or focus on an article updates the preview through Motion.
- **Preview motion:** active previews enter at `0.92` scale and `-2deg`, settle at full scale and zero rotation, and exit at `1.04` scale and `2deg` rotation. The transition is `0.5s` with the standard ease.
- **Reading pages:** article and case study content use Manrope at `17px` and `1.82` line-height. Links and blockquote rules use yellow. Code blocks and inline code use raised dark surfaces with square corners.
- **Progress:** article reading progress is a two pixel fixed yellow bar below the navigation and is spring-smoothed through Motion.

### Contact and Login Surfaces
- **Layout:** large editorial heading at left and a framed form at right on desktop. The form frame uses the soft ground, one pixel line, and fluid `28px` to `50px` padding.
- **Behavior:** contact submits a mailto draft, then renders a status state. Login explains the browser-only simulation and submits through the existing auth boundary.
- **Mobile:** both surfaces stack with `24px` form padding and retain full keyboard access.

### Footer
- **Shape:** a top hairline, large Archivo prompt, underlined Contact action, and a ruled metadata row.
- **Behavior:** the footer repeats the brand mark and provides email access. It collapses to a stacked action layout on mobile.

### Accessibility
- **Landmarks:** the mounted layout uses a labelled header navigation, a `main` region with `id="main-content"`, and a footer. The mobile menu has its own labelled navigation.
- **Keyboard:** all links, menu controls, actions, and form fields remain native controls. Focus-visible uses a `2px` yellow outline with `4px` offset.
- **Forms:** contact and login fields use visible labels. Validation errors use `role="alert"`; the contact success state uses `role="status"`.
- **Loading and progress:** loading states use `aria-live="polite"`. Reading progress and decorative diagrams are hidden from assistive technology.
- **Reduced motion:** content remains present without entrance animation, pointer movement, gallery pinning, or reading progress animation.
- **Skip navigation:** `index.html` provides a skip link to `main#main-content`; it becomes visibly yellow on keyboard focus.

## Do's and Don'ts

### Do:
- **Do** use the exact Gruvbox Material Dark Hard tokens from the frontmatter and keep yellow for actions, focus, active links, and progress.
- **Do** use warm Archivo display type, Manrope body type, and monospace only for technical context.
- **Do** use one pixel hairlines, square controls, clipped angular geometry, and full-field semantic project colors.
- **Do** make the first viewport show the two-line kinetic title, pointer-responsive field, explanatory copy, View work, and Contact actions.
- **Do** use project-specific diagrams that express signals such as input, system, and output for the actual project.
- **Do** preserve the Motion-driven pinned gallery on capable desktop widths and the complete vertical project sequence on mobile and under reduced motion.
- **Do** keep all meaningful content available without motion and honor both Motion's reduced-motion hook and the stylesheet fallback.
- **Do** preserve semantic landmarks, labelled fields, visible focus, status announcements, and accessible names for controls.

### Don't:
- **Don't** add fake terminals, terminal windows used as decoration, generic card grids, fake screenshots, logo clouds, skill percentage bars, blobs, or excessive gradients.
- **Don't** reintroduce white surfaces, cobalt branding, rounded dashboard cards, soft ambient shadows, or a pill-heavy control language to the public v2 routes.
- **Don't** use motion to hide content, remove focus, or make the horizontal gallery the only way to reach project information.
- **Don't** swap the project diagrams for generic illustrations or make semantic colors into tiny ornamental accents.
- **Don't** create a second public navigation, container, typography, or spacing system.
- **Don't** add JavaScript scroll hijacking, touch-only horizontal discovery, or motion that gates project content.
