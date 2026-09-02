import { Geolocation } from '@capacitor/geolocation';

window.TrailRideNative = window.TrailRideNative || {};
window.TrailRideNative.Geolocation = Geolocation;

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
    const permissions = await Geolocation.checkPermissions();
    out.location = permissions?.location || 'unknown';
    out.coarseLocation = permissions?.coarseLocation || 'unknown';
  } catch (error) {
    out.error = [out.error, `geolocation: ${String(error?.message || error)}`].filter(Boolean).join(' • ');
  }
  return out;
};

window.dispatchEvent(new Event('trailride:native-ready'));
