# Adding games to Pocket Oddities

The first 20 mini-games live in `games.js`. New games belong in separate JavaScript files under `game-packs/`, using the stable `window.PocketOddities.register(metadata, factory)` extension point.

## A safe 7-step addition

1. Make a new `game-packs/your-game.js` file (copy the pattern in `game-packs/echo-tiles.js`).
2. Register metadata in this order: `[title, category, emoji, description, instructions]`. Category is one of `reflex`, `puzzle`, `strategy`, or `weird`. Give each game a unique title.
3. The second argument is a function receiving the `api` object and returning a mini-game implementation with **`init()`** and **`draw()`**. Optional hooks: `tap(x,y)`, `move(x,y)`, `down(x,y)`, `up()`, `update(dt)`, `action(name)`, `timeout()`. `dt` is seconds.
4. Add `<script src="./game-packs/your-game.js" defer></script>` after `games.js` in `index.html`. Add the pack to `PRECACHE` in `sw.js`, bump the cache version, and update the static fallback counts in `index.html`.
5. Run `npm test && npm run build:web`. (Requires Node 22; building the web bundle does not require installed dependencies.)
6. Test on a small touchscreen as well as desktop, including full game win/failure, back/home/restart, offline behavior, sound, and score persistence.
7. Commit to `main` (GitHub Pages updates automatically) or use a pull request to review first.

The number shown in the app updates itself. Do **not** change or reorder the existing 20 definitions just to add a game: score history uses their indices. For a major refactor, migrate saved scores explicitly.

## Extension API

`api.state`: mutable state for the active game, already initialized with `score`, `elapsed`, `level`, `ended` and `t`.

`api.colors`: curated palette. `api.helpers`: `clamp`, `rnd`, `irnd`, `dist`, `choose`, `shuffle`.

`api.art`: canvas drawing helpers `base`, `R` (filled rect), `O` (circle), `S` (stroke circle), `L` (line), `T` (text), `wrap` (wrapped text), `panel`, `meter`.

`api.controls([['Button label', 'action-name', true]])`: create on-screen buttons; `api.addScore(n=1)`, `api.finish(won, message)`, `api.beep(frequency)`.

Canvas is 360 x 450 game units. All touch coordinates are mapped to this fixed canvas regardless of device pixel dimensions. An external pack is local bundled code, *not* an app store remote-code loading mechanism. No external script URLs, embedded APIs, or network access are required.

## Refining an existing game

- For original games, edit the matching numbered `define({...})` in `games.js`.
- For expansion games, edit the corresponding file in `game-packs/`.
- Keep game title and order stable to preserve local best scores.
- Use an issue for each change, with a clear expected behavior and actual behavior.
- Never claim a game is fully tested until gameplay has been checked on devices.

## Source files

- `index.html` — launcher UI and explicit game pack script tags
- `styles.css` — touch-friendly layout, responsive styles
- `games.js` — base arcade engine and first 20 mini-games
- `game-packs/*.js` — subsequent games, isolated from the original 20
- `tools/check-library.mjs` — checks game packs and core dependencies
- `tools/build-web.mjs` — builds `www/` for Pages and Capacitor
- `sw.js` — offline cache and fresh-update fetch
- `capacitor.config.json` — native app ID/name, update before store launch

## Cross-game achievements and secret threads

The shared lifecycle emits `oddities:game-start`, `oddities:game-finish`, and `oddities:catalog-render` events. New games receive medal and visited-game tracking automatically. To include a new game in a story thread, edit the `threads` table in `achievements.js`. Reference the *exact* game name, so the discovery can be reconciled from the existing `oddities-wins` collection. If you rename or reorder existing games, provide a migration first; game-title and index stability currently preserve saves.

Run the browser tests (`npm run test:games`) to confirm medals, legacy migration, thread discovery, theme selection, and pause behavior. Cross-game rewards should stay optional and cosmetic; never block access to existing games behind a new achievement.
