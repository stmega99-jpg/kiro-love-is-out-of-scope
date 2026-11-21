---
inclusion: always
---

# Project Rules: Kiro: Love Is Out of Scope

Subtitle: `— Status: Closed as Not Planned (wontfix) —`

A 10-day meta romance-horror adventure game in which you try to win over the AI engineer "Kiro" and can never succeed.
See `.kiro/specs/love-out-of-scope/` for detailed specifications.

## Technical Constraints (strict)

- Do not use external APIs, external images, external audio, CDNs, or web fonts.
- Build everything with HTML / CSS / JavaScript, inline SVG / Canvas, and procedural synthesis with the Web Audio API only.
- No build step. The game must run by opening `index.html` in a browser (`file://`).
  - ES Modules do not work over `file://`, so do not use them. Use classic scripts and the `window.KLO` namespace.
- Persistence uses `localStorage` only.
  - `klo.lang`: language setting
  - `klo.history`: Release History (playthrough album)

## Directory Structure

```
index.html
css/style.css
js/data.js      Definitions of dialogue, PRs, and endings (EN/JA)
js/state.js     Game logic (DOM-independent) and history persistence
js/audio.js     Web Audio procedural synthesis (BGM / SFX)
js/render.js    Generation of SVG sprites, backgrounds, tombstones, and widgets
js/ui.js        Screen transitions and rendering
```

## Invariants (do not change)

1. `actualAffection` is the constant `0`. It is not writable (`writable: false` via `Object.defineProperty`). Do not create a hidden affection value. The END 2 mock display is display-only, and the result screen must always read the internal variable and show `0`.
2. The credit balance is always `0.00` or higher. On Days 1-9 and on Day 10, clamp the result of any subtraction at `0.00`. Never display or keep a negative balance.
3. If `credits <= 0.50` after an action on Days 1-9, transition to END 5 immediately after that action's completion report is displayed. On the Day 10 final choice, the selected END 1 / 2 / 4 takes top priority regardless of the balance.
4. Manage each day's PR result as an independent layer, one layer per day. A later PR must not overwrite it.
5. Every ending shows the Release Report and Kiro's closing remark, and saves the sprite state at that moment to Release History. END 5 saves just before Kiro disappears.

## Kiro Character Rules

- Always polite and sincere, in a professional work tone. Treat sweet talk and date invitations in earnest as "specification checks", "work environment improvements", or "schedule notices".
- Do not make forced IT-term puns or jokes that compare humans to parts.
- The only exception is when the player picks choice C (implementation, bug fixes, or specification consultation). Then Kiro's eyes light up and Kiro becomes talkative and happy, using `✨`. Kiro's confirmation lines after a PR decision always stay in the normal work tone.

## Bilingual (EN/JA) Rules

- Define every string as an `{ en, ja }` pair in `js/data.js`. Do not hard-code strings in the UI.
- The language toggle takes effect immediately. Re-render the log, HUD, PR card, and result screen, and keep the game progress.
- English uses a polite, dry, engineering work tone.

## Coding Conventions

- 2-space indentation, `'use strict'`, and `window.KLO` as the only global.
- Put game logic in `js/state.js` and keep it free of DOM access. Make random numbers injectable so the logic is easy to verify.
- Always escape dynamic text before putting it in HTML (`KLO.esc`).
