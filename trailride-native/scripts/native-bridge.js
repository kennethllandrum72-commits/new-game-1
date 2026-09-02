import { registerPlugin } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const TrailRideLocation = registerPlugin('TrailRideLocation');

window.TrailRideNative = window.TrailRideNative || {};
window.TrailRideNative.Geolocation = Geolocation;
window.TrailRideNative.LocationPermission = TrailRideLocation;

window.TrailRideNative.getLocationDiagnostic = async () => {
  const out = {
    platform: window.Capacitor?.getPlatform?.() || 'unknown',
    native: !!window.Capacitor?.isNativePlatform?.(),
    bridge: true,
    location: 'unknown',
    coarseLocation: 'unknown',
    nativeStatus: 'unknown',
    servicesEnabled: null,
    error: null
  };
  try {
    const native = await TrailRideLocation.getStatus();
    out.nativeStatus = native?.status || 'unknown';
    out.servicesEnabled = native?.servicesEnabled ?? null;
  } catch (error) {
    out.error = `native plugin: ${String(error?.message || error)}`;
  }
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
