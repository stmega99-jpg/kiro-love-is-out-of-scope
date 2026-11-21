# Design: Kiro: Love Is Out of Scope

See `requirements.md` for the requirements.

## 1. Architecture

A static site with no build step. Classic scripts are loaded in order from `index.html` and register themselves on the namespace `window.KLO`.

```
data.js ──▶ state.js ──▶ audio.js ──▶ render.js ──▶ ui.js
 (text)      (logic)     (BGM/SFX)      (SVG)      (screen control)
```

| File | Responsibility | DOM dependency |
| :-- | :-- | :-- |
| `js/data.js` | Per-day dialogue, PRs, endings, UI text (`{en, ja}`) | None |
| `js/state.js` | `createGame()`, cost calculation, exhaustion check, EARS validation, history persistence | None |
| `js/audio.js` | Synthesis of 3 BGM tracks and SFX, mute | AudioContext |
| `js/render.js` | SVG string generation for sprite, background, tombstone, widgets | None (returns strings) |
| `js/ui.js` | Screen transitions, log, action area, language toggle, shortcuts | Yes |

## 2. State Model

```js
state = {
  day: 1,                       // 1..10
  credits: 4000,                // always >= 0 (rounded to 2 decimals)
  layers: {                     // 'initial' | 'merge' | 'rc'
    affectionUI, bgTheme, costumeBody, bgmMode, itemSlot,
    costumeHead, dateModule, windowFrame, playerInput
  },
  earsText: '',                 // EARS sentence ordered in PR #7
  ended: null,                  // 1..5
  // actualAffection: 0         // defineProperty(writable:false, configurable:false)
}
```

- One PR rewrites only the single layer pointed to by `PRS[day].layer`. No path may be created that touches the layers of other days.
- `Close` leaves the layer as `initial`. There is no penalty.

## 3. Credits

- Subtraction goes through `spend(cost)`, which sets `credits = round2(max(0, credits - cost))`. This applies to every day, Day 1-10.
- Costs are decided from an injectable random number generator `rng`.

| Action | Cost | Duration |
| :-- | :-- | :-- |
| Conversation A/B/C | 0.20-0.45 | 3-8s |
| `Request Changes` | 650-900 | 4-9s |
| Day 10 choice 2 | About 500 (480-520) | 5-9s |

- The exhaustion check `isExhausted()` is `day <= 9 && credits <= 0.50`. The UI layer calls it after a conversation's completion report and after the PR confirmation line.
- Day 10's `finalChoice(n)` does not call the exhaustion check and returns the END that was chosen.

## 4. Screen Flow

```
Title ─▶ Day N intro ─▶ Choice A/B/C ─▶ Kiro's reply (multiple lines / Next)
                                          │ exhausted? ─▶ END 5
                                          ▼
                                    PR #N shown ─▶ Merge / Close / Request Changes
                                          │          (RC on Day 7 is EARS input)
                                          ▼
                                  Kiro's confirmation ─▶ PR #9 Merge ─▶ END 3
                                          │ exhausted? ─▶ END 5
                                          ▼
                                    Day N+1 ... Day 10 ─▶ Final choice ─▶ END 1 / 2 / 4
                                                                            ▼
                                                                   Release Report ─▶ Album
```

- For A/B on Day 8, the reply includes a narration line with a `leave` flag, which makes Kiro's sprite leave the room, and PR #8 is shown as an automatic notification.
- Day 1's A has a three-line reply (Kiro / the protagonist's retort / Kiro). A reply is an array of `{ who: 'kiro' | 'player' | 'narr', t }`, and the usage amount is attached to the last Kiro line.

## 5. Rendering

- The stage overlays two SVGs. `#stage-bg` (background) is rewritten only when `bgTheme` or the scene changes, so the CSS animations for blossoms and bats are not interrupted. `#stage-kiro` (sprite) is regenerated whenever a layer, expression, or presence changes.
- The sprite is composed from SVG groups for body / head / hair / outfit (`costumeBody`) / hat (`costumeHead`).
- Frill counts: `initial` 15 (skirt 9 + collar 3 + sleeves 2 + waist ribbon 1), `merge` 2 (sleeves only; 13/15 ≈ 87% fewer), `rc` 24. They can be checked with `render.frillCount()`.
- The tombstone is a shared SVG part, `tomb()`. It is used in the HUD, slots, and backgrounds.
- The conversation frame switches among the classes `frame-initial` / `frame-merge` (console) / `frame-rc` (grimoire) according to `windowFrame`.
- END 2's mock bar is overlaid on `#stage-fx`. It does not change the state of `affectionUI`.

## 6. Audio

`AudioContext` is created after a user interaction. A look-ahead scheduler (every 50ms, up to 0.2s ahead) reserves the next steps.

| `bgmMode` | Timbre | Content |
| :-- | :-- | :-- |
| `initial` | Sine + overtones | C-major music box, 0.3s/step |
| `merge` | Square | Steady pulse around A2, kick-like blips |
| `rc` | Saw + LPF, triangle | Pads in Dm - B♭ - Gm - A and a harpsichord-like arpeggio, with a melody that has vibrato |

SFX: `click`, `sparkle` (choice C), `thunk` (Merge / tombstone), `magic` (Request Changes), `buzz` (error), `vanish` (END 5), `jingle` (END).

## 7. Persistence and Album

```js
// localStorage['klo.history'] : up to 50 entries, newest first
{ id, at, endId, day, layers, credits, vanished, earsText }
```

- `triggerEnd(endId)` records at its start. END 5 saves before the vanishing effect, so the sprite can be reproduced even after Kiro has disappeared.
- Album cards draw the background and sprite with `render.miniStage(layers)`. A `vanished` card gets the label "Last seen before vanishing".
- Access to `localStorage` is wrapped in `try/catch`, and a failure does not stop progress.

## 8. Error Handling

| Situation | Behavior |
| :-- | :-- |
| EARS sentence is invalid | No charge; Kiro returns the reason. Re-enter or cancel |
| Balance is 0 at `Request Changes` | Disable the button |
| `AudioContext` unsupported | Continue without audio |
| `localStorage` unavailable | Skip saving. The album is shown empty |

## 9. Typewriter Display

- `renderLog()` passes to `startTyping()` only the lines added since the last render. For the body, it empties the text node inside `.txt` once and puts the characters back one at a time.
- Speed is about 22ms/character for EN and about 42ms/character for JA. It is capped at about 2.4 seconds per line, with short pauses at punctuation and at `…` `!` `?`.
- `finishTyping()` is called before a re-render (such as a language switch) or before a new line is added. It immediately shows the text not yet displayed and releases pending work. This keeps the transition to an END from stalling if the language is switched during display.
- Automatic transitions are registered with `whenTyped(fn)`. Register them after `renderGame()` (the function that starts the typing).

## 10. Comedic Effects

- Tombstone drop: `resolvePr` sets `dropLayer`, and only that one `renderGame()` call adds the drop class. `dropLayer` is cleared at the end of rendering, so it does not replay on a re-render. The landing sound effect and the screen shake play about 0.42 seconds after the drop.
- Expression switching: a `reacts` field is attached to a reply line, and `lineFx()` is called "when the display of that line starts". C uses `joy` (star eyes, bounce, glow, stars), and A/B use `work` (eyes down, hand tapping, code screen). The same function is called on a display skip and on paths without typing.
- The glow is drawn in `#stage-glow` (behind Kiro) and the stars in `#stage-burst` (in front), so the glow does not haze Kiro.
- `setKiroClass()` forces a re-render in between, so the same animation can play again on another day.

## 11. Ending Effect Timing, Credits, and Result Screen

- Ending effects are triggered with `lineFx()` by attaching flags to log lines. END 2 uses `mock`, and END 4 uses `reacts` (`joy` is already set on the data side). They are not triggered at the start of `triggerEnd`.
- `syncCredits(target)` interpolates the displayed value with `requestAnimationFrame`. The displayed value is `max(target, from - (from - target) * ease)`, so it never goes below the actual balance. A re-render with the same target value does nothing.
- The rows of the result screen appear in order through CSS animation delays (`--d`). `resultFresh` is true only for the first render right after an ending, which prevents replay on a language switch.
- The END 2 stamp enlarges and lands the element that holds the actual value `0`. It does not rewrite the displayed value starting from `100`.

## 12. Title Intro Effect, Hair Texture, and Ending Effect Wiring

- `titleFresh` is true only on load and on `to-title` from the result screen. `renderTitle()` consumes it and adds or removes `.title-card.fresh`, so the intro effect does not replay on a re-render (language switch).
- The result stamp animates only when it has `.stampv.play`. `.stampv` itself only carries the large font size.
- Ending effects are applied by attaching `endScene` / `endFx` / `cue` / `stopBgm` to log lines, and `lineFx()` applies them when the line starts to display. END 3's narration lines also get `data-i`.
- Hair consists of back locks (dark grooves and light strands), an outer rim light, front bang strands, the shadow of the bangs falling on the forehead (clipped by the face ellipse), and the gloss of the crown (an arc with a horizontal gradient).
