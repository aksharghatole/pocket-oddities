#!/usr/bin/env bash
# Smoke-test an actual Android emulator without requiring a human to install the APK.
set -euo pipefail
PACKAGE="$(node -p "require('./capacitor.config.json').appId")"
ACTIVITY="$PACKAGE/.MainActivity"
APK="android/app/build/outputs/apk/debug/app-debug.apk"
mkdir -p test-results/android
adb install -r "$APK"
adb shell pm list packages | grep -F "package:$PACKAGE" >/dev/null
adb logcat -c
echo "Launching native Android app..."
adb shell am start -W -n "$ACTIVITY" | tee test-results/android/launch.txt
sleep 8
pid="$(adb shell pidof "$PACKAGE" | tr -d '\r')"
if [[ -z "$pid" ]]; then
  echo "Pocket Oddities process did not survive startup."
  adb logcat -d -v time > test-results/android/logcat.txt
  exit 1
fi
printf 'Android package: %s, running PID: %s\n' "$PACKAGE" "$pid" | tee test-results/android/process.txt
adb exec-out screencap -p > test-results/android/launcher.png
# Send a swipe and capture the result. Playwright covers individual game launches.
adb shell input swipe 175 650 175 250 350
sleep 1
adb exec-out screencap -p > test-results/android/after-touch.png
# Verify bundled game assets still start without connectivity.
adb shell svc wifi disable || true
adb shell svc data disable || true
adb shell am force-stop "$PACKAGE"
adb shell am start -W -n "$ACTIVITY" | tee test-results/android/offline-launch.txt
sleep 5
pid="$(adb shell pidof "$PACKAGE" | tr -d '\r')"
test -n "$pid" || { echo "Offline app startup failed.";exit 1; }
adb exec-out screencap -p > test-results/android/offline.png
adb logcat -d -v time > test-results/android/logcat.txt
if grep -E -A 18 'FATAL EXCEPTION' test-results/android/logcat.txt | grep -q -F "$PACKAGE"; then
  echo "Detected native app crash in logcat." >&2
  exit 1
fi
echo "PASS: native app installed, launched, received a swipe, and relaunched offline."
