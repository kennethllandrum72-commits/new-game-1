import { Geolocation } from '@capacitor/geolocation';

// Expose the imported Capacitor plugin to the static TrailRide web UI.
// Capacitor plugins installed through npm are not guaranteed to exist at
// window.Capacitor.Plugins, so native-near-me.js uses this explicit bridge.
window.TrailRideNative = window.TrailRideNative || {};
window.TrailRideNative.Geolocation = Geolocation;
window.dispatchEvent(new Event('trailride:native-ready'));
