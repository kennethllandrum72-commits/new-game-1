import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trailride.nearme',
  appName: 'TrailRide',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample'
    }
  }
};

export default config;
