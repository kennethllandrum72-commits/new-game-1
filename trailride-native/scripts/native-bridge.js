import { Geolocation } from '@capacitor/geolocation';

// Expose the imported Capacitor plugin to the static TrailRide web UI.
window.TrailRideNative = window.TrailRideNative || {};
window.TrailRideNative.Geolocation = Geolocation;

// Diagnostic helper used by Near Me. This reports the native Capacitor
// permission state before GPS is started so TestFlight failures are actionable.
window.TrailRideNative.getLocationDiagnostic = async () => {
  const out = {
    platform: window.Capacitor?.getPlatform?.() || 'unknown',
    native: !!window.Capacitor?.isNativePlatform?.(),
    bridge: true,
    location: 'unknown',
    coarseLocation: 'unknown',
    error: null
  };

  try {
    if (!Geolocation?.checkPermissions) {
      out.error = 'checkPermissions unavailable';
      return out;
    }
    const permissions = await Geolocation.checkPermissions();
    out.location = permissions?.location || 'unknown';
    out.coarseLocation = permissions?.coarseLocation || 'unknown';
  } catch (error) {
    out.error = String(error?.message || error || 'unknown diagnostic error');
  }

  return out;
};

window.dispatchEvent(new Event('trailride:native-ready'));
