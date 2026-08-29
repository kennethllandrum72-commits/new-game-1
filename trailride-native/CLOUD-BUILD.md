# TrailRide phone-only cloud build

TrailRide now has two cloud build paths.

## 1. GitHub Actions build check

From the GitHub app or github.com on iPhone:

1. Open `kennethllandrum72-commits/new-game-1`.
2. Open **Actions**.
3. Choose **TrailRide iOS Cloud Build**.
4. Tap **Run workflow**.
5. When it finishes, open the run and download the `TrailRide-iOS-Project` artifact if needed.

This verifies the native iOS project compiles in the cloud without Apple signing.

## 2. Codemagic TestFlight build

The repository root includes `codemagic.yaml`.

1. Sign in to Codemagic from your iPhone browser.
2. Add the GitHub repository `kennethllandrum72-commits/new-game-1`.
3. Choose **Codemagic YAML** configuration.
4. In Codemagic, add an App Store Connect integration named exactly:
   `TrailRide App Store Connect`
5. Connect the Apple Developer/App Store Connect account that will own TrailRide.
6. Confirm the TrailRide bundle identifier in Apple Developer is:
   `com.trailride.nearme`
7. Start workflow **TrailRide iOS TestFlight**.

The workflow will create/fetch App Store signing files, build the IPA, and submit it to TestFlight.

## Apple account requirements

A paid Apple Developer Program membership is required for App Store/TestFlight distribution. App Store Connect must also contain an app record for TrailRide using bundle ID `com.trailride.nearme` before the first successful TestFlight upload.

Do not commit Apple private keys, passwords, certificates, or provisioning profiles to this repository. Keep signing credentials only in Apple/Codemagic secure integrations.
