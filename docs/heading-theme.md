# Planning Panel Heading Theme

Updated: 2026-11-24.

## Reference And Scope

The supplied Chak On presentation panel informs the type hierarchy: heavy uppercase sans-serif chapter headings, olive rules, smaller bilingual subtitles and flat yellow content bands. No project images, videos, PDFs, roles, employment details or publication states are replaced.

The theme is a buildless enhancement loaded after `styles.css` and `ui.css`. Remove the two `heading-theme` references to return to the previous visual system.

## Hierarchy

- H1: 52px desktop, 42px tablet, 32px mobile. Heavy sans-serif with an olive divider.
- Chapter H2: 36px desktop, 28px mobile. Uppercase English with an 18px / 16px Traditional Chinese subtitle.
- Project H3: 28px desktop, 24px mobile. Original project names remain in title case.
- Compact headings, dates and metadata retain smaller contextual sizes.
- Case groups and professional experience use a flat yellow band with dark olive lettering.

## Background

One fixed linear color field moves through a 32-second CSS loop. Only its transform changes, avoiding a large animated bitmap or per-frame background repaint. There are no decorative orbs. Photographs and all other media files remain unchanged.

The lower-left icon pauses or resumes the background. A user choice is retained when storage is available. The animation also pauses while the document is hidden, respects `prefers-reduced-motion`, and is removed for print. The script works without storage and without a development server.

## Verification

- 16 theme checks passed, including all six chapter headings, actual animated transforms, matching start/end transforms, pause/resume persistence, reduced-motion behavior and stable light-theme colors.
- Pixel sampling across two animation phases confirms visible color changes in the rendered background, not just an animation declaration.
- 320 / 390 / 768 / 1024 / 1440px layouts have no page or heading overflow.
- The existing 24 desktop and 15 mobile interaction checks passed again.
- The six legacy local pages also passed desktop/mobile theme checks, without replacing their content.
- Existing project image/video/PDF blobs are unchanged. The only new media are Lucide pause/play icons, covered by the existing icon license.

Verification used Chromium; this is not a complete cross-browser accessibility audit.
