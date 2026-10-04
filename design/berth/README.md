# Berth design system

Berth is a Git platform where agents write the code and humans decide what lands. The interface should look like the dock it's named after: poured concrete, painted edge markings, square blocks that fit together, and nothing soft. Build every screen from these rules.

## Voice

- Write like a harbour master: short, factual sentences that tell you what is happening and what you need to do. "Attempt 3 stopped: over budget. Building on attempt 2."
- Use the product's own words, and only those: **task, attempt, change, revision, evidence, vouch, land, escalation, exception.** Never show people branches, SHAs, rebases or merges. Those belong in the agent record.
- Name states exactly as the lifecycle does: Intent, Exploring, Proposed, Vouched, Landing, Landed, Escalated.
- Write numbers as figures with their units: "$0.84 across 3 attempts", "updated 12 s after the last push", "58/80 words".
- Don't hedge, cheerlead, use exclamation marks or use emoji. Don't write "AI-powered", "seamless" or "magic". If something wasn't checked, say so under "Not verified".
- Sentence case everywhere. Uppercase is only for `label` text (buttons, chips, field labels, table headers).

## Logo

Use the lockup in `logos/` that matches the theme: `berth-lockup-on-light.svg` on `concrete` and `slab` in light, `berth-lockup-on-dark.svg` in dark. In running text the name is "Berth"; only the wordmark is lower case. The rules are in `logos/README.md`.

## Colour

The palette comes from a working dock: concrete ground, ink, and four painted colours, each with one job. There is no purple, no gradient and no glow.

- Put pages on `concrete` and bordered content on `slab`. Use `sunk` for recessed wells: code, meter tracks, empty cells, disabled controls.
- Text is `ink`, and secondary text is `ink-muted`. Both hold 5.9:1 or more on every neutral in both themes.
- `quay` (yellow) is the brand colour and means "a human is needed": the primary action, the Proposed state, the Inbox count and the "Not verified" band. It is a fill only. Put `on-quay` text on it and an `ink` border around it.
- `harbour` (blue) means agents are at work: the Exploring state, selection and meter fills. Put `on-harbour` text on it. That token is white in light and ink in dark, because the dark fill is lighter.
- `buoy` (orange) means the queue is moving something: the Landing state. Put `on-buoy` text on it.
- `landed` (green) and `escalated` (red) are only for those two states, conflicts and destructive actions. They differ by 3.5:1 in lightness, so they stay distinct without colour vision, and they always come with a word.
- Use `link` for link text and always underline it. Use `danger-text` for error messages and over-budget figures, and start them with a word ("Error:", "Over:").
- Every coloured fill sits inside a `border-rule` `ink` border. The fills don't need contrast with the ground because the border provides it.

| State | Fill | Text | Marker |
| --- | --- | --- | --- |
| Intent | `slab` | `ink` | hollow square |
| Exploring | `harbour` | `on-harbour` | half-filled square |
| Proposed | `quay` | `on-quay` | solid square |
| Vouched | `vouched` | `on-vouched` | solid square |
| Landing | `buoy` | `on-buoy` | striped square |
| Landed | `landed` | `on-landed` | tick |
| Escalated | `escalated` | `on-escalated` | `!` |

## Type

- **Archivo Expanded** (`display`, `heading`, `label`) is the dock signage: wide, heavy, square. Use it for titles, card headings and labels only. Never use it for sentences longer than one line.
- **Atkinson Hyperlegible Next** (`body-lg`, `body`, `body-strong`, `body-sm`) carries all reading text. It was drawn so that easily confused letters stay distinct for low-vision readers. Set the human record in `body-lg`, everything else in `body`, and nothing smaller than `body-sm`.
- **Atkinson Hyperlegible Mono** (`code`, `data`, `data-strong`) is for anything a machine wrote: paths, trailers, IDs, money, counts. Always use tabular numbers.
- Emphasise with `body-strong`, never italics. Keep reading text to 65 characters per line.
- `display-xl` is for the site hero and video title cards, one per screen.

## Form

- **Square.** `radius-none` everywhere. No pills, no rounded cards and no circles except a real progress dial.
- **Borders do the work.** Give every control, chip, card and panel a `border-rule` in `ink`. Use `border-hair` for dividers between table rows, and `border-heavy` for page-title underlines, the trunk lane, error inputs and the bottom edge of key hints.
- **One shadow.** `shadow-block` is a hard 4px offset with no blur. Use it on buttons at rest, the change under review, and the change currently landing, and nowhere else. A pressed button moves 3px and drops to `shadow-pressed`.
- **Grid.** 4px base, 8px module. Pad cards with `space-4`, separate cards with `space-6` and sections with `space-8`. Use a 16px side gutter on phones and 24px from 720px up. Flush blocks with no gutter are allowed when the blocks belong together, as in the cover.
- **The quay edge.** The HazardBand stripes mark trunk, the line only the queue crosses. Use them on the trunk lane and the change being landed only.
- **Motion** is mechanical: 60ms linear moves, no easing, no fades longer than 120ms, nothing bouncing. Respect `prefers-reduced-motion` by dropping all movement.

## Accessibility

These rules are part of the brand and can't be traded off.

- Every text pair in this system holds at least 4.5:1 in both themes, and most hold 7:1. The usage note on each token names the surfaces it was checked on. Put no other pairings into production without checking them.
- Focus is a solid 3px `focus` outline, 3px outside the element: harbour blue in light, quay yellow in dark. It holds at least 5:1 on every surface. Never remove it.
- Colour never carries meaning alone. Every state has a word and a marker, and every matrix cell has words.
- Berth is keyboard-first. Every primary action has a shortcut, shown as a KeyHint on its button. `J`/`K` moves between changes, `V` vouches, `E` escalates and `?` lists all shortcuts.
- Targets are at least 40px tall on desktop and 44px on touch.

## Iconography

Berth has no icon set. Meaning is carried by words, and state is carried by the square markers on StateChips. If an icon is ever unavoidable, draw it on the 4px grid with square 2px strokes in the text colour, never filled. Don't use emoji or illustrations.

## Components

Components are plain CSS classes in `components.css`, prefixed `bt-`, coloured only through these tokens. Each component's notes say what markup to provide. Wrap a page in `bt-page` to get the ground, ink and body type.

## Using these files

- `tokens.css`: every token as a CSS custom property, plus the fonts and the type classes (`.t-display`, `.t-body`, `.t-label` and so on). Light is the default. Dark follows the OS unless `<html data-theme="light">` is set, and `data-theme="dark"` forces dark. Load it first.
- `components.css`: the `bt-` component classes. Load it after `tokens.css`.
- `tokens.json`: the same tokens as data, for code that needs the values (charts, social images, emails).
- `components/<Name>/README.md` and `example.html`: each component's guidelines and working markup. Copy markup from the example.
- `index.html`: every component on one page, with a light/dark switch. Open it to check a change visually.
- `logos/`: the SVG lockups, marks and app icon.
- `fonts/`: the WOFF2 files and their SIL Open Font Licence texts.

Change colours, sizes and fonts in `tokens.json` and `tokens.css` only. Never write a hex value, a font name or a pixel size for colour, type or spacing anywhere else.
