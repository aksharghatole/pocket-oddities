# Pocket Oddities — living roadmap

This is a growing arcade, one app containing many original mini-games. Each new game or substantial refinement should have an issue, a small scope, and hands-on gameplay testing.

## v1.1 — scalable library and Android testing
- [x] Original 20 mini-games in a single library
- [x] Online deployment through GitHub Pages
- [x] Dynamic game count and search by name or category
- [x] Extension-game API and Echo Tiles (game #21)
- [x] Offline-first installation
- [x] Android debug APK build workflow — first successful artifact confirmed
- [x] Development and QA guidance
- [x] iOS simulator build workflow — first successful artifact confirmed
- [x] PWA install affordance and generated raster icons

## v1.2 — usability and polish
- [ ] Playtest the full game catalog end-to-end on small Android and iPhone screens
- [x] Stop timer progression while browsing the achievement Cabinet
- [x] First gameplay pass: Shadow Thief light readability and cooldown; Tiny Traffic God lane pause/resume, crossing logic and collision lives; Invisible Maze guaranteed routes, breadcrumbs, and improved peek feedback
- [x] Shadow Thief uses high-contrast sun/star tile states, a clearer legend, and a pixel-level contrast regression test
- [x] The Other Cursor labels the player and delayed echo and clarifies its recent movement trail
- [ ] Finish playtesting individual win/lose paths, difficulty and touch targets across all remaining games
- [x] Favorites, recent games and continue playing
- [x] Completed and unfinished game shelves tied to saved progress
- [x] UTC-stable Game of the Day and Surprise Me discovery shortcut
- [x] Per-game fastest successful clear records and Speedruns shelf
- [x] Optional vibration feedback and separate persisted sound/vibration controls
- [x] Local progress export and merge-only import
- [x] Optional on-device player name and avatar, carried in progress backups
- [x] In-app reduced-motion control plus system reduced-motion support
- [x] Screen-reader announcements for game instructions and round outcomes
- [x] Brief, distinct win and loss vibration cues with off-by-default preference
- [x] The Game Is Lying explains its false-statement mechanic and tests all ten counterexamples
- [x] Targeted win/fail/restart coverage for Pocket Elevator, Orbit Locksmith, Lantern Logic, Cloud Shepherd, Ink Tide, Potion Scale, Ghost Gallery, and Fossil Field
- [ ] Original icon, splash screen and store screenshots for both OSes
- [ ] Native Android internal-testing release and iOS TestFlight release

## v1.3 — replayability and retention
- [x] Daily rotating challenges from existing games
- [x] Five-game Daily Rush with countdown, automatic advance, and saved splits
- [x] Persistent medals, collection milestones and earned badges
- [x] Local Oddity Score, player levels, and Daily Rush records
- [x] Oddity Passport stamps for every cleared game
- [x] Common-to-Legendary and Secret medal rarity labels with a full-collection milestone
- [x] Six hidden interconnected game threads with collectible cosmetic relics
- [x] Echo Tiles sequence-preview and mobile gameplay polish
- [x] Echo Tiles offers Calm, Classic, and Rapid pacing with optional haptic preview cues
- [x] Expansion packs #21–33: Echo Tiles, Moon Mail Sorter, Circuit Garden, Fossil Forecast, Ghost Gallery, Fossil Field, Orbit Locksmith, Pocket Elevator, Lantern Logic, Cloud Shepherd, Ink Tide, Potion Scale, and Star Cartographer
- [x] Later expansion packs are listed in the [game catalog](../README.md#game-catalog)
- [x] Fossil Forecast’s three fixed nonograms and sixth hidden relic thread
- [x] Star Cartographer connects three numbered-star constellations with full win and retry coverage
- [ ] More game packs; prioritize quality over sheer count
- [ ] Per-game tuning profiles and difficulty settings
- [ ] In-app feedback and game popularity signals, privacy-conscious

## v2 — store-ready arcade
- [ ] Signed Android AAB, permanently defined package ID and Play Console submission
- [ ] Signed iOS archive, permanently defined bundle ID and App Store submission
- [ ] Privacy policy and age-rating review
- [ ] Performance test, crash handling and offline regression tests
- [ ] Optional sync/profiles only if clearly useful and privacy requirements are addressed

## Ideas to refine next
- Tiny Traffic God: broaden intersections and safer collision logic

## Definition of done for each game
- Opens on web and native test device
- Understandable instructions in under 10 seconds
- Complete success and failure paths
- Retry and exit never trap the player
- Controls fit a narrow mobile display
- No uncaught errors or broken offline assets
- Score saved correctly (when applicable)
