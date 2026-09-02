import { registerPlugin } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const TrailRideLocation = registerPlugin('TrailRideLocation');

window.TrailRideNative = window.TrailRideNative || {};
window.TrailRideNative.Geolocation = Geolocation;
window.TrailRideNative.Location = TrailRideLocation;

window.TrailRideNative.getLocationDiagnostic = async () => {
  const out = {
    platform: window.Capacitor?.getPlatform?.() || 'unknown',
    native: !!window.Capacitor?.isNativePlatform?.(),
    bridge: true,
    customPlugin: false,
    nativeStatus: 'unknown',
    servicesEnabled: null,
    location: 'unknown',
    coarseLocation: 'unknown',
    error: null
  };

  try {
    const s = await TrailRideLocation.getStatus();
    out.customPlugin = true;
    out.nativeStatus = s?.status || 'unknown';
    out.servicesEnabled = s?.servicesEnabled ?? null;
  } catch (error) {
    out.error = `custom: ${String(error?.message || error)}`;
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
