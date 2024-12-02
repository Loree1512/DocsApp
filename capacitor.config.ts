import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'proyecto.docsApp.duoc',
  appName: 'DocsApp',
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
