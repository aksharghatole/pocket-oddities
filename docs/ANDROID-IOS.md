# Mobile app build and release guide

Pocket Oddities is currently an offline-first web arcade, and can also run inside Capacitor for Android and iOS. The source is shared; you do **not** have to rewrite every mini-game for native phones.

## Android — download a test APK

1. Open the repository's **Actions** tab.
2. Select **Build Android test app** in the left column.
3. Click **Run workflow** → `main`.
4. When the Android build succeeds, open the workflow run and download the `pocket-oddities-android-debug-apk` artifact.
5. Extract `app-debug.apk`, transfer it to an Android test device, and install it. Android might ask you to approve installations from that source.

This APK is **debug-signed** for personal testing only. It is not a Google Play release. If the build fails, inspect the first failing step in its logs. The workflow assembles a fresh native project on GitHub Actions from the same `www/` used for the live arcade.

To build locally, install Node 22, Java 21 and Android Studio/Android SDK. Run:

```sh
npm install
npm test
npm run build:web
npx cap add android
npx cap sync android
npx cap open android
```

For a Play Store release, choose a permanent unique package ID, generate brand icons and screenshots, configure versioning and a **secure, persistent signing keystore**, create a signed **Android App Bundle (.aab)**, perform device and Play internal testing, and complete Google Play Console requirements.

## iOS — use the same games

On macOS with Xcode installed:

```sh
npm install
npm run build:web
npx cap add ios
npx cap sync ios
npx cap open ios
```

Set a permanent unique iOS bundle identifier, create app icons and launch assets, test on devices, configure signing with your Apple Developer team, archive in Xcode, and submit through App Store Connect/TestFlight. Actual iOS builds require a macOS/Xcode environment; the Android GitHub Actions workflow does not create an IPA.

**Important:** Before any store release, change the placeholder `com.yourstudio.pocketoddities` in `capacitor.config.json` to a permanent app ID you control. Bundle identifiers should not change after initial store release.

## How updates work

- **Web/PWA:** pushes to `main` run the Pages workflow. New and fixed games appear on the HTTPS website. Offline assets refresh as they are fetched; previously cached content still works without internet.
- **Android/iOS:** run `npm run build:web` and `npx cap sync`, build new signed native versions, test them, and distribute through the stores. The installed app bundles the current games so it does not depend on the website.
- The current app saves high scores locally on each device, not in a cloud account. Uninstalling or clearing app storage may erase local progress.

Apple allows certain HTML5 mini-game collections under its guidelines but still reviews functionality, privacy, and submitted content. Plan polishing and genuine touch-native UX before submitting; no store approval is guaranteed. See <https://developer.apple.com/app-store/review/guidelines/>.
