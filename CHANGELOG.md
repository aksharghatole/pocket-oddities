# Changelog

## 1.2.1 — First Android gameplay polish pass
- **Shadow Thief:** clearer highlighted safe moves and dangerous spotlights, visible visited tiles, shift-light cooldown, longer round and improved touch feedback.
- **Tiny Traffic God:** proper lane-stop controls, manual car hold/release, recoverable crashes, clearer road and crossing HUD, and improved round pacing.
- **Invisible Maze:** guaranteed solvable paths through both randomly decorated stages, footprints, wall-hit feedback, fairer peek cooldown and better maze readability.
- Added automated Android-screen tests verifying a safe shadow shift, traffic lane braking, both complete maze routes, and wall-hit loss conditions.



## 1.2.0 — The Oddity Cabinet (in review)
- Introduced twelve persistent cross-game achievements, including progress, replay, and win-streak medals.
- Added four connected secret story threads, riddles, collectible relics, and user-selectable cosmetic arcade themes.
- Retroactively recognizes completed games from existing on-device saved wins without resetting records.
- Added nonintrusive success toasts, game-card connection markers, an Android-friendly gallery, and paused game timers while viewing the Cabinet.
- Reworked Echo Tiles into an animated memory-sequence challenge with clearer retry feedback.
- Added Android-sized regression tests for trophies, hidden connections, theme persistence and legacy data.


## 1.1.0 — Growing arcade foundation
- Introduced a separate game-pack registration mechanism so the original 20 can stay intact.
- Added Echo Tiles as game #21.
- Added library search and automatically updated game totals.
- Improved the service worker so newly published game packs can be loaded and cached offline.
- Added mobile browser installation support, raster PWA icons, and a repeatable unsigned iOS Simulator build.
- Added automated library validation, GitHub Pages checks and a manually triggerable Android debug APK workflow.
- Added contribution, development and mobile publishing documentation.

## 1.0.0 — First playable arcade
- Released 20 original HTML5 mini-game MVPs.
- Added mobile-responsive launcher, sound, local high scores, offline service worker and Capacitor scaffolding.
