# Portfolio design system

## Direction

Editorial + cinematic + technical. The fixed photograph, pixel-to-photo transition, typography, and Bawa interaction carry the identity. Avoid adding generic dashboard or SaaS UI chrome.

## Typography

- Display / headings: Manrope 700
- Role / emphasis: Manrope 600–700
- Body: Manrope 400–500
- Metadata only: JetBrains Mono 400–500
- Normal reading copy: 16–17px
- Small metadata: 12.5–13px minimum

Use monospace for dates, labels, and compact factual metadata. Do not use it for whole paragraphs or technology lists.

## Colour

- Main text: `#F7F8FC`
- Secondary text: `#D5D9E5`
- Muted text: `#AEB5C8`
- Accent: `#A5B4FC`
- Background: `#0B0D14`
- Dividers: low-opacity cool white

The photograph should remain visible. Improve legibility with a localized reading scrim rather than globally crushing exposure.

## Spacing

Primary spacing scale: 4 / 8 / 12 / 20 / 32 / 48 / 80px.

Give sections generous editorial whitespace while keeping the final Connect/footer area compact.

## Radius

- Small: 6px
- Medium: 10px

Avoid large rounded rectangles unless the content is genuinely a contained control or surface. Avoid pill shapes for decorative labels.

## Surfaces

Prefer open layouts, hairline dividers, and typography. Work history is the baseline visual language.

Avoid:

- nested cards
- decorative full-page grids
- ambient radial glows
- gradient headline text
- icon/brand assets placed in rounded tiles without a functional reason
- decorative status pills
- tag-chip clouds
- broad shadows paired with borders to describe the same surface

## Projects

SettleWorth is the primary product case study. Use the canonical brand asset unchanged. Prefer a real product screenshot when a current, verified capture is available; never fabricate or reconstruct the UI for the portfolio.

## Motion

The pixel-to-photo background and Bawa rocket are intentional signature interactions. Motion elsewhere should be quiet and functional. Always support `prefers-reduced-motion`.

## Bawa

Resting state should be quiet. Hover/focus may reveal more brightness and the line “open a strange corner of the internet.” It should feel discovered, not dominate every viewport.
