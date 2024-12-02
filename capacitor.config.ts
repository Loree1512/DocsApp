import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'proyecto.docsApp.005',
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
