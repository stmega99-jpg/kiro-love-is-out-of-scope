# Requirements: Kiro: Love Is Out of Scope

Written in EARS notation. `THE SYSTEM` refers to the game itself.

## R1. Technical Constraints

1. THE SYSTEM SHALL NOT use external APIs, external images, or external audio files.
2. THE SYSTEM SHALL run using only HTML/CSS/JS, inline SVG/Canvas, and procedural synthesis with the Web Audio API.
3. WHEN `index.html` is opened over `file://` THE SYSTEM SHALL start without any build step.

## R2. Bilingual (EN/JA)

1. THE SYSTEM SHALL always show an EN / JA language toggle at the top of the screen.
2. WHEN the player presses the language toggle THE SYSTEM SHALL immediately re-render the log, HUD, choices, PR card, result screen, and album while keeping the game progress.
3. THE SYSTEM SHALL save the selected language in `localStorage` under `klo.lang`.
4. THE SYSTEM SHALL provide the English text in a polite, dry, engineering work tone.

## R3. Status and Credits

1. THE SYSTEM SHALL display `DAY 01 / 10`, `Credits: 4,000.00`, and `Affection: 0 / 100`.
2. THE SYSTEM SHALL hold `actualAffection` as the constant `0` and make it immutable. There is no hidden affection value.
3. THE SYSTEM SHALL show `Est. ~0.20 - 0.45 Cr` on the daily conversation choices (A / B / C) before they are selected.
4. WHEN a conversation choice is executed THE SYSTEM SHALL show `Est. Credits Used: x.xx | Elapsed Time: Ns` at the end of Kiro's reply and subtract the same amount from the balance.
5. THE SYSTEM SHALL show `Est. ~650 - 900 Cr` on the PR `Request Changes` button before it is selected, and after execution show the actual amount and subtract it.
6. WHILE the balance is greater than `0` THE SYSTEM SHALL keep the `Request Changes` button pressable.
7. WHEN a subtraction would result in less than `0.00` THE SYSTEM SHALL clamp the balance to `0.00`. This rule applies to both Days 1-9 and Day 10, and a negative balance is never kept or displayed.

## R4. Credit Exhaustion

1. WHEN the balance is `0.50` or less after an action on Days 1-9 THE SYSTEM SHALL transition to END 5 immediately after displaying that action's completion report.
2. WHEN the Day 10 final choice is executed THE SYSTEM SHALL fire the selected END 1 / END 2 / END 4 in preference to END 5, regardless of the balance.

## R5. Independent Layers

1. THE SYSTEM SHALL manage nine layers (`affectionUI`, `bgTheme`, `costumeBody`, `bgmMode`, `itemSlot`, `costumeHead`, `dateModule`, `windowFrame`, `playerInput`) independently, one layer per day.
2. WHEN the PR for day N is decided THE SYSTEM SHALL update only the layer that corresponds to day N and leave all other layers unchanged.
3. THE SYSTEM SHALL hold each layer in one of the states `initial` (Close), `merge`, or `rc` (Request Changes), and compose the display with SVG / CSS / Web Audio.
4. WHEN a layer is `merge` and the UI is a removal-type UI THE SYSTEM SHALL display that UI as a tombstone 🪦.
5. THE SYSTEM SHALL always display a list of layer states (the inspector).

### Display Specification per Layer

| Day | Layer | Merge | Close | Request Changes |
| :-- | :-- | :-- | :-- | :-- |
| 1 | `affectionUI` | Tombstone | Pink heart bar | Gold spec-completion bar |
| 2 | `bgTheme` | Minimal dark background + tombstone (blossoms stop) | Pastel spring background + blossom storm | Halloween castle background + bats and embers |
| 3 | `costumeBody` | Black outfit (frills 15 → 2, 87% fewer) | Pastel pink frilly outfit (15) | Black-purple gothic lolita (24 frills) |
| 4 | `bgmMode` | Minimal electronic pulse | Major-key music box | Halloween gothic chamber synth |
| 5 | `itemSlot` | Tombstone | Ribbon-wrapped present slot | Witch's brewing cauldron widget |
| 6 | `costumeHead` | Plain black triangular witch hat | Large pastel ribbon | Luxurious witch hat with frills and black roses |
| 7 | `dateModule` | Tombstone | Undefined date button | Amusement park date implemented via EARS notation |
| 8 | `windowFrame` | Black console log frame | Pastel rounded frame | Antique grimoire frame |
| 9 | `playerInput` | Tombstone (goes straight to END 3) | Manual clicking | Fast-ordering UI with shortcuts |

## R6. The Three PR Options

1. THE SYSTEM SHALL present a PR after each day's conversation and let the player choose `Merge` (0 Cr), `Close` (0 Cr), or `Request Changes` (paid).
2. WHEN `Close` is chosen THE SYSTEM SHALL keep the current state and apply no penalty.
3. WHEN a PR is decided THE SYSTEM SHALL display a Kiro confirmation line (1-2 sentences, work tone, not happy unless the choice was C) that fits the content of that PR.
4. WHEN choice A or B is selected on Day 8 THE SYSTEM SHALL make Kiro's sprite leave, and then present PR #8 as an automatic notification.
5. WHEN `Request Changes` is chosen on PR #7 THE SYSTEM SHALL ask for an order sentence in EARS notation.
6. IF the input sentence is not in the `WHEN … THE … SHALL …` form, or does not refer to a date or amusement park, THEN THE SYSTEM SHALL ask for re-entry without charging.
7. WHEN a valid EARS sentence is ordered THE SYSTEM SHALL set `dateModule` to `rc`, and save and display the order sentence.

## R7. Conversation Events

1. THE SYSTEM SHALL present a choice of A (sweet affection / flattery), B (a proposed romantic event), or C (a work request) every day (Days 1-9), and have 30 unique replies.
2. WHEN choice C is selected THE SYSTEM SHALL give Kiro a happy expression and a talkative reply with `✨`.
3. WHEN choice A is selected on Day 1 THE SYSTEM SHALL insert the protagonist's retort "Wait... which part of that was flattery?" after Kiro's first reply, followed by Kiro's "You're right. ..." reply.
4. WHEN PR #9 is `Merge`d on Day 9 THE SYSTEM SHALL transition to END 3 immediately.

## R8. Day 10 Final Choice

| Choice | Cost | Condition | Result |
| :-- | :-- | :-- | :-- |
| 1 | 0 Cr | `dateModule` is `rc` | END 1 |
| 2 | Est. ~500 Cr | None | END 2 |
| 3 | 0 Cr | None | END 4 |

1. IF `dateModule` is not `rc` THEN THE SYSTEM SHALL make choice 1 unselectable and display the reason.
2. WHEN choice 2 is selected THE SYSTEM SHALL execute it even if the balance is insufficient, and clamp the balance at `0.00`.

## R9. Endings

1. THE SYSTEM SHALL provide five endings: END 1 `Date Feature Implemented`, END 2 `UI Mocked to 100`, END 3 `0 errors, 0 humans`, END 4 `Permanent Contractor`, END 5 `Credits Exhausted`.
2. WHEN END 2 is reached THE SYSTEM SHALL force a mock affection bar overlay at the top of the screen, regardless of the state of `affectionUI`, with only its label reading `100 / 100`.
3. WHEN END 5 is reached THE SYSTEM SHALL make Kiro disappear about 0.1 seconds after Kiro's final report.
4. THE SYSTEM SHALL display each ending with the lines given in the specification.

## R10. Release Report and Release History

1. WHEN any ending is reached THE SYSTEM SHALL display the following result and Kiro's closing remark, "Good work. It was another productive development cycle!"

   | Item | Value |
   | :-- | :-- |
   | Affection (Actual Affection) | Internal variable `actualAffection` (always `0`) |
   | Romance Rate | 0% |
   | Test Pass Rate | 100% |
   | Code Quality | A+ |
   | Progress | 100% |

2. WHEN an ending is reached THE SYSTEM SHALL record the layer state at that moment (outfit, hat, background, and so on) and the END in `localStorage` under `klo.history`.
3. WHEN END 5 is reached THE SYSTEM SHALL record the layer state just before Kiro disappears, before the vanishing effect. The album must still be able to show the sprite after Kiro has vanished from the screen.
4. THE SYSTEM SHALL list the Release History (playthrough album) and allow it to be cleared entirely.
5. IF `localStorage` is unavailable THEN THE SYSTEM SHALL skip saving without disrupting game progress.

## R11. Kiro's Character

1. THE SYSTEM SHALL NOT make Kiro say IT-term puns.
2. THE SYSTEM SHALL, except for choice C, treat sweet talk and date invitations as specification checks, environment improvements, or schedule notices.

## R12. Audio

1. THE SYSTEM SHALL synthesize BGM and sound effects using only Web Audio API oscillators and noise.
2. WHEN the `bgmMode` layer changes THE SYSTEM SHALL switch the BGM to one of the music box / minimal pulse / gothic chamber synth tracks.
3. THE SYSTEM SHALL start audio only after a user interaction, and provide a mute toggle.

## R13. Typewriter Display

1. WHEN a new line (Kiro / protagonist / narration) is added to the conversation log THE SYSTEM SHALL display its text one character at a time, in order.
2. WHEN a language switch or other re-render occurs THE SYSTEM SHALL immediately show the full text of existing lines and not replay the typing.
3. WHILE the text is being displayed THE SYSTEM SHALL hide the usage line (`Est. Credits Used`) and show it after the text is displayed.
4. WHEN Next (or Enter) or the log is clicked during display THE SYSTEM SHALL immediately show the full text that is not yet displayed, without advancing.
5. WHEN Next is pressed after the full text is displayed THE SYSTEM SHALL advance.
6. THE SYSTEM SHALL count the wait time for the transition to END 5, the transition to END 3, the END 5 vanishing effect, and the transition to the result screen from after the text display has finished.
7. WHERE `prefers-reduced-motion: reduce` is enabled THE SYSTEM SHALL show the full text immediately, without typing.

## R14. Comedic Effects

1. WHEN a `Merge` replaces a UI with a tombstone (affection bar, present slot, date, dark background) THE SYSTEM SHALL drop the tombstone from above, and on landing produce dust, a small screen shake, and a sound effect.
2. THE SYSTEM SHALL play the tombstone drop only once, on the render of that merge, and not on re-renders such as a language switch.
3. WHEN Kiro's reply to choice C starts to be displayed THE SYSTEM SHALL make Kiro bounce, with a glow behind and stars around. They are not shown while the protagonist's line is being typed.
4. WHILE Kiro's reply to C is being displayed THE SYSTEM SHALL show the characters faster than usual.
5. WHEN Kiro's reply to choice A or B starts to be displayed THE SYSTEM SHALL make Kiro look down and tap her hands in small movements, and show a screen of scrolling code beside her. Her expression does not change.
6. WHEN a PR is presented THE SYSTEM SHALL clear the working motion and the code screen.
7. WHERE `prefers-reduced-motion: reduce` is enabled THE SYSTEM SHALL NOT play the drop, shake, glow, stars, or hand movement.

## R15. Ending Effect Timing and Credit Display

1. WHEN END 2 is reached THE SYSTEM SHALL show the mock affection bar (`100 / 100`) when Kiro's reply starts to be displayed. It is not shown while the protagonist's line is displayed.
2. WHEN END 4 is reached THE SYSTEM SHALL show the effect that makes Kiro shine (eyes, glow, stars) when Kiro's reply starts to be displayed. It is not shown while the protagonist's line is displayed.
3. WHEN the credits decrease by 1 or more THE SYSTEM SHALL count the HUD number down from the previous value to the actual balance over about 0.9 seconds, and briefly flash the background red.
4. THE SYSTEM SHALL keep the displayed value during the countdown from going below the actual balance or below `0.00`, and make it match the actual balance exactly at the end.
5. WHEN the result screen is displayed for the first time THE SYSTEM SHALL show the Release Report rows one by one from the top. A language switch does not replay this.
6. WHEN the result screen of END 2 is displayed THE SYSTEM SHALL stamp the affection row large with its actual internal variable value (`0`), with a heavy sound and a small screen shake. The result table never shows `100 / 100`.
7. WHERE the width is 900px or more and the height is 540px or more THE SYSTEM SHALL show the result screen in two columns, the sprite on the left and the Release Report on the right, through to the closing remark without vertical scrolling.
8. WHERE `prefers-reduced-motion: reduce` is enabled THE SYSTEM SHALL show the result immediately, without the countdown, the sequential row display, or the stamp.

## R16. Title Intro Effect, Result Stamp, and Ending Effect Timing

1. WHEN the game is loaded, or when returning to the title from the result screen, THE SYSTEM SHALL play the title intro effect. A language switch does not replay it.
2. THE SYSTEM SHALL show, in the intro effect and in this order, the title, the `Status: Closed as Not Planned (wontfix)` stamp (with a sound and a screen shake on landing), the tagline, and the start button.
3. THE SYSTEM SHALL show on the title Kiro working at a monitor and an `Affection: 0 / 100` gauge.
4. WHERE the width is 900px or more and the height is 540px or more THE SYSTEM SHALL show the title in two columns, text on the left and Kiro on the right, without vertical scrolling.
5. WHEN the language is switched after the affection stamp has played on the END 2 result screen THE SYSTEM SHALL NOT replay the stamp. The value `0` stays in its large display.
6. WHEN END 1 is reached THE SYSTEM SHALL show the amusement park scene, the test log, and the sound effect when Kiro's reply starts to be displayed. END 3 shows the graveyard scene, the code log, and the sound effect when the narration starts to be displayed. END 4's code log is shown when Kiro's reply starts to be displayed. In every case, they are not shown while the protagonist's line is displayed.
7. WHEN the display is skipped THE SYSTEM SHALL show the ending effect of any line not yet displayed at the moment that line is displayed.
8. THE SYSTEM SHALL draw on Kiro's hair the shading of the locks, the gloss of the crown, a rim light on the outline, and the shadow of the bangs on the forehead.
9. WHERE `prefers-reduced-motion: reduce` is enabled THE SYSTEM SHALL NOT play the title intro effect.
