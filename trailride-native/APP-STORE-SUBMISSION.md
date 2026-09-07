# TrailRide Near Me — App Store Submission Package

Prepared September 7, 2026

## App Information

**App name:** TrailRide Near Me

**Subtitle (30 characters maximum):**  
Trail weather, scores & GPS

**Primary category:** Health & Fitness

**Secondary category:** Navigation

**Age rating:** 4+

**Copyright:** © 2026 Kenneth Landrum

**Privacy Policy URL:**  
https://kennethllandrum72-commits.github.io/new-game-1/trailride/privacy.html

**Support URL:**  
https://kennethllandrum72-commits.github.io/new-game-1/trailride/support.html

## Promotional Text

Find nearby trails, check Ride Scores and recent rainfall, choose the best hour to ride, plan trips, navigate, record GPS rides, and sync completed workouts.

## App Store Description

Plan better rides with TrailRide Near Me.

Find nearby mountain-bike, cycling, walking, running, and hiking trails, then compare the conditions that matter before you go. TrailRide combines local weather, recent rainfall, trail-surface estimates, air quality, difficulty, distance, and hourly Ride Scores in one place.

TRAIL DISCOVERY
• Find trails near your current location
• Search by trail, city, area, or state
• Filter by distance, difficulty, activity, drive time, and e-bike class
• View trail maps, directions, official status links, and local weather

SMART RIDE PLANNING
• See a simple 1–10 Ride Score
• Compare hourly scores and the best three-hour riding window
• Review recent rainfall and drying estimates
• Check temperature, rain chance, humidity, air quality, and heat warnings
• Plan trips for future dates
• Save favorites, planned rides, and completed activities

GPS RIDE TRACKING
• Record time, distance, current speed, average speed, and maximum speed
• Follow your route on the map
• Track elevation gain and elevation loss
• Pause, resume, finish, and save rides
• Review ride history and progress statistics
• Export recorded routes as GPX files

APPLE FEATURES
• Open turn-by-turn directions in Apple Maps
• Use spoken navigation
• Optionally save completed workouts and route data to Apple Health
• Share trail information and set ride reminders

Trail conditions can change quickly. Ride Scores, weather guidance, rainfall totals, drying estimates, air quality, and health-related settings are informational planning tools only. Always check official trail notices and current on-site conditions before riding. TrailRide does not provide medical advice or guarantee that a trail is open or safe.

Location and Apple Health permissions are optional and controlled through iOS Settings. TrailRide does not require an account and does not use advertising trackers.

## Keywords

mountain bike,trails,cycling,weather,GPS,ride tracker,e-bike,hiking,trail conditions,GPX

## Screenshot Set

Capture these from the latest TestFlight build on an iPhone in portrait orientation. For an iPhone 16 Pro Max, use the original 1320 × 2868 screenshots without resizing. Hide private home locations and use a public trail area.

1. **Find Great Trails Near You**
   - Screen: Home/Near Me with the weather card and first trail results visible.
   - Show: Near Me, Ride Score, weather, and ranked trails.

2. **Know Before You Ride**
   - Screen: Full-screen Trail Details for a public trail.
   - Show: Recent rainfall, surface estimate, trail score, difficulty, and action buttons.

3. **Pick the Best Time**
   - Screen: Hourly Trail Score section.
   - Show: Best three-hour window and several color-coded hourly scores.

4. **Track Every Mile**
   - Screen: GPS tracking screen during a safe test ride or walk.
   - Show: Map, elapsed time, distance, speed, elevation gain, and Finish & Save.

5. **Plan, Save, and Sync**
   - Screen: My Activities/Recorded view with at least one saved ride.
   - Show: Ride history, totals, GPX export, and Apple Health sync control.

Do not show a location-permission alert, loading message, empty test data, a private address, or personally sensitive health information in App Store screenshots.

## App Privacy Answers

These answers are based on the current TrailRide code and must be updated if analytics, advertising, accounts, a developer-operated server, or a different third-party SDK is added.

**Does this app collect data?**  
Yes — select Precise Location conservatively because coordinates are sent to external weather, trail-search, mapping, and navigation services to provide requested results.

### Precise Location

- Purpose: App Functionality
- Linked to the user: No
- Used for tracking: No

### Health & Fitness

Do not mark Health & Fitness as collected if workout and route data remains on the device and is written only to Apple Health at the rider’s request. HealthKit permission descriptions and the HealthKit entitlement are still required.

### Other current data

- Contact information: Not collected
- User content: Not collected by TrailRide
- Identifiers: Not collected
- Purchases: Not collected
- Usage data: Not collected
- Diagnostics: Not collected by TrailRide
- Tracking: No
- Advertising: No
- App Tracking Transparency prompt: Not required for the current app

Local ride history, preferences, saved trails, and planned rides stay on the device. User-directed GPX export or sharing is not developer collection.

Before submission, review the privacy practices of every included third-party SDK and service against the current App Store Connect questionnaire.

## App Review Notes

TrailRide Near Me is an outdoor trail-planning and GPS activity-recording app. No account or login is required.

REVIEW STEPS
1. Launch the app and tap Near Me.
2. Allow location access While Using the App.
3. Choose a trail and tap Trail Details to open its full-screen page.
4. Review the recent-rainfall estimate and hourly Trail Scores.
5. Tap Start Ride to open GPS tracking. A short outdoor test is required for live movement data.
6. Tap Finish & Save to place the activity in My Activities → Recorded.
7. Apple Health sync is optional. If tested, approve the requested workout and route permissions.

PERMISSIONS
• Location is used when the reviewer requests nearby trails, navigation, or GPS ride tracking.
• Near Me uses navigator.geolocation.
• The app does not include @capacitor-community/background-geolocation.
• Apple Health access is used only to save a completed workout and its route when the user enables sync.

SAFETY AND DATA
• Ride Score, weather, rainfall, drying, air-quality, and health guidance are informational planning aids.
• No account, advertising, or cross-app tracking is used.
• Ride history and preferences are stored locally on the device.
• External weather, trail-search, mapping, and navigation services receive the location or area necessary to return a requested result.

If live trail or weather data is temporarily unavailable, the app shows saved planning trails and directs the reviewer to verify official trail status.

## Final Submission Checklist

- Build the final release through the TrailRide iOS TestFlight workflow.
- Confirm the build number is higher than the previous TestFlight build.
- Test Near Me after deleting and reinstalling the app.
- Test Trail Details, hourly score, rainfall, GPS saving, GPX export, navigation, reminders, and Apple Health.
- Confirm the Privacy Policy and Support URLs open publicly.
- Upload the five portrait screenshots.
- Complete App Privacy using the answers above.
- Complete the age-rating questionnaire.
- Add the description, subtitle, keywords, copyright, and review notes.
- Select the correct build in App Store Connect.
- Resolve every App Store Connect warning before submitting for review.
