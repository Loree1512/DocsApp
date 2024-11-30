import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'docsApp',
  webDir: 'www',
  "plugins": {
  "Geolocation": {
    "permissions": {
      "android": ["ACCESS_FINE_LOCATION"],
      "ios": ["NSLocationWhenInUseUsageDescription"]
    }
  }
}
};


export default config;
