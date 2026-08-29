# TrailRide Native iOS

This folder contains the Capacitor-based native iPhone wrapper for TrailRide.

## App identity
- App name: TrailRide
- Bundle ID: com.trailride.nearme
- Web source: ../trailride
- Native web bundle: ./www

## First iOS setup
Run these commands from `trailride-native` on a Mac with Node.js and Xcode installed:

```bash
npm install
npm run ios:add
npm run ios:open
```

After the first iOS project exists, future TrailRide web updates can be copied into the native project with:

```bash
npm run ios:sync
npm run ios:open
```

## Xcode / TestFlight checklist
1. Open the generated iOS project in Xcode.
2. Select the TrailRide app target.
3. Set the Apple Developer Team under Signing & Capabilities.
4. Keep the bundle identifier `com.trailride.nearme` unless App Store Connect requires a different unique identifier.
5. Add Location When In Use usage text if Xcode does not generate it automatically.
6. Confirm the app icon, display name, version and build number.
7. Test GPS, sharing, reminders, Favorites, Planned Rides and Ridden history on a real iPhone.
8. Archive the app in Xcode and upload the archive to App Store Connect.
9. Add the uploaded build to TestFlight before App Store review.

## Native plugins prepared
- Geolocation
- Share sheet
- Local notifications
- Preferences
- Browser/App lifecycle support

The live GitHub Pages version remains separate and continues to work while the native iOS project is developed.
