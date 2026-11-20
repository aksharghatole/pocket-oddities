# Pocket Oddities — a growing mobile mini-game arcade

A dependency-free, original HTML5 arcade built for mobile portrait screens. All **22 mini-games** are playable with tap, drag, or on-screen buttons. Includes a responsive game library with a UTC-stable Game of the Day, a Surprise Me shortcut, completed and unfinished shelves, scores saved locally, independent sound and optional vibration toggles, offline PWA caching, and a Capacitor starter configuration for Android/iOS packaging. GitHub Actions deploys the project to GitHub Pages once Pages is enabled under Settings → Pages → Build and deployment → Source: GitHub Actions.

**Important:** This is a working **MVP**, not twenty polished commercial games or finished App Store / Play Store binaries. It needs playtesting, screenshots, store assets, privacy policy and native signing before release.


## Live arcade and Android test app

**Play online:** https://aksharghatole.github.io/pocket-oddities/

**Android debug APK:** Open **Actions → Build Android test app → Run workflow**. After a successful build, download the `pocket-oddities-android-debug-apk` artifact; the APK inside is for testing only, not Play Store release.

**Install from the browser:** Open the live arcade on your phone. Use the **Install** control when offered, or your browser's **Add to Home Screen** option. The web app can work offline after it has loaded and cached its resources.

**iOS Simulator build:** Open **Actions → Build iOS simulator test app** and download the successful `pocket-oddities-ios-simulator-app` artifact. This is an unsigned simulator build, not an iPhone release.

**Keep growing the library:** See [Adding Games](docs/ADDING-GAMES.md), the [Living Roadmap](docs/ROADMAP.md), and [Android/iOS release guidance](docs/ANDROID-IOS.md). New games go in separate `game-packs/*.js` files and register themselves with the arcade; the game count and search update automatically. Existing game progress uses local storage and is not synced across devices.

## Speedruns and personal bests

The **Speedruns** shelf sorts games by each player’s fastest successful clear and displays unplayed games after recorded clears. Personal bests are stored on the device and can be replayed or improved; they are not submitted to a global leaderboard.

## Player progress: Oddity Score and Daily Rush

The Cabinet now shows your **Oddity Score**, level, a per-game **Oddity Passport**, unique game wins, medals, hidden threads, completed Daily Rushes, fastest Daily Rush, and best win streak. Score comes from one-time progress milestones: unique wins, earned medals, completed story threads, and one Rush clear per UTC date. Daily Oddity Rush now uses five games when available, starts with a short countdown, advances automatically between clears, and saves the best run’s individual splits locally. Replaying a game or challenge does not farm points. Profile data and records remain on this device, with a download/export and merge-only restore backup; global rankings and cross-device sync are not connected yet.

## The Oddity Cabinet: achievements and hidden connections

Play the same arcade, but now victories matter across games. Tap **◈ Cabinet** to see medals, total progress, and five hidden story threads:

- **The Night Circuit:** Shadow Thief · The Last Light Switch · Invisible Maze
- **A Borrowed Galaxy:** Don't Wake the Planet · Pocket Black Hole · Unfinished Universe
- **The Lost Frequency:** You Are the Notification · One Finger Orchestra · Echo Tiles
- **The Unlikely Clock:** The Clock Is Hungry · Gravity Is Shy · The Button Has Feelings

The Cabinet only reveals **riddle clues** for missing fragments. Winning all three connected games uncovers a secret relic and unlocks a **cosmetic theme** that can be equipped or reset. Achievements and rewards are stored entirely on the player's device. Existing beaten games count toward the threads automatically; older scores are not reset.

For maintainers: medal definitions, connected-game clues, and theme unlocks are in `achievements.js`. Keep original game titles and win tracking stable so players retain the cross-game progression.

## Play it immediately

1. Open `index.html` in a desktop browser (some PWA features need an HTTP server).
2. For browsers on your phone and installable PWA behavior, serve this folder on a reachable HTTPS site such as **GitHub Pages**.
3. Local server: `python3 -m http.server 4173` then visit `http://localhost:4173` on your computer.

## Publish for free with GitHub Pages

1. Create a new GitHub repository (for example `pocket-oddities`).
2. Upload everything from this folder (keeping `index.html` at the repository root).
3. In **Settings → Pages**, choose **GitHub Actions** as the build and deployment source. The included `.github/workflows/pages.yml` runs on pushes to `main`.
4. Open the resulting HTTPS URL. The arcade works offline after its first successful load, and can be added to a mobile home screen.

## Android and iOS store packaging

The included `package.json`, `tools/build-web.mjs`, `www/`, and `capacitor.config.json` are a scaffold for [Capacitor](https://capacitorjs.com/). Set a **unique app ID** in `capacitor.config.json` before publishing.

```bash
npm install
npm run build:web      # copies the web app to www/
npx cap add android    # requires Android Studio + Android SDK
npx cap add ios        # requires macOS + Xcode
npx cap sync
npx cap open android   # build a signed AAB in Android Studio
npx cap open ios       # build and sign through Xcode
```

The configuration points to `www/`, a production web-assets copy generated by `npm run build:web`. Run `npm run build:web && npx cap sync` whenever you edit the game code. You can also use `npm run native:sync`.

Release prep: use the included SVG icon as a starting point; add 192px and 512px PNG app icons and platform-specific assets; test touch interactions and safe areas on real devices; choose app IDs; review store policies (including rules for apps that mainly wrap websites); prepare a privacy policy and age rating; enroll in Google Play Console and Apple Developer Program; sign and submit releases. A web game is not guaranteed App Store approval merely because it is wrapped.

## The original 20 games (plus expansions)

1. The Button Has Feelings — keep its emotional meter balanced for 25 seconds.
2. You Are the Notification — dodge a moving finger scanner while delivering alerts.
3. The Game Is Lying — ten deceptive trick puzzles.
4. One Room, 100 Rules — obey five shifting positioning challenges.
5. Shadow Thief — navigate a dark tile grid and shift light phases.
6. Don't Wake the Planet — tap asteroids without maxing the noise meter.
7. Tiny Apocalypse Manager — balance survival resources for eight days.
8. Reverse Hide and Seek — find three blinking mimics.
9. The Floor Remembers — memorize and retrace three floor paths.
10. One Finger Orchestra — time ten note taps to a shrinking ring.
11. Pocket Black Hole — collect blue stars, avoid red antimatter.
12. Wrong Answers Only — purposely choose incorrect trivia answers.
13. The Last Light Switch — traverse two dark mazes with timed flashes.
14. Gravity Is Shy — hold to rise and release to fall through eight gates.
15. Tiny Traffic God — pause traffic to prevent intersection collisions.
16. The Clock Is Hungry — collect green time snacks to rescue the clock.
17. Unfinished Universe — restore three mirrored constellations.
18. The Other Cursor — catch orbs while your delayed echo chases you.
19. Invisible Maze — escape two mazes by memorizing briefly shown walls.
20. One Minute Villain — reach 100 chaos within eight turns while avoiding the detectives.
21. Echo Tiles — memorize patterns and tap four colored tiles in order.

## How to customize

- The GitHub Pages workflow checks the JavaScript and publishes the generated `www/` web app.
- `games.js` has the shared game engine, metadata (`info` array), and the original 20 implementations, each added using `define({...})`.
- `game-packs/*.js` contains new mini-games; register with `window.PocketOddities.register()` and add a deferred script tag in `index.html`.
- `styles.css` controls the arcade visuals; `index.html` contains the app shell.
- To change titles, game descriptions, emojis, or categories, edit `info`.
- To tune difficulty, edit each game's `init()`, `update()`, `tap()` and `action()` handlers.
- High scores and completed-game flags are stored **only on the local device**, using localStorage.
- Everything runs without a backend, external libraries or API keys.

## Privacy and licensing

No analytics, accounts, ads, or backend. Player scores/preferences are saved on the user's device. The code, visuals and sounds in this project are newly authored for this project. No third-party fonts, audio tracks or image assets are bundled.

You can use, edit, and distribute the provided project as your own; check platform and other legal requirements before publishing.