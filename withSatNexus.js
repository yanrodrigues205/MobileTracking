const { withAndroidManifest, withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withSatNexus(config) {
  // 1. Injeta as permissões e o serviço no AndroidManifest do app principal
  config = withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults.manifest;
    let mainApplication = androidManifest.application[0];

    // Adiciona as permissões necessárias para o background
    if (!androidManifest['uses-permission']) androidManifest['uses-permission'] = [];
    
    const permissions = [
      { 'android:name': 'android.permission.BLUETOOTH_SCAN' },
      { 'android:name': 'android.permission.BLUETOOTH_CONNECT' },
      { 'android:name': 'android.permission.FOREGROUND_SERVICE' },
      { 'android:name': 'android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE' },
      { 'android:name': 'android.permission.POST_NOTIFICATIONS' }
    ];

    permissions.forEach(perm => {
      if (!androidManifest['uses-permission'].some(p => p['$']['android:name'] === perm['android:name'])) {
        androidManifest['uses-permission'].push({ $: perm });
      }
    });

    // Declara o serviço do seu SDK KMP
    if (!mainApplication.service) mainApplication.service = [];
    
    const serviceDeclaration = {
      $: {
        'android:name': 'br.com.satcompany.satnexus.BleBackgroundService',
        'android:foregroundServiceType': 'connectedDevice',
        'android:enabled': 'true',
        'android:exported': 'false'
      }
    };

    if (!mainApplication.service.some(s => s['$']['android:name'] === serviceDeclaration.$['android:name'])) {
      mainApplication.service.push(serviceDeclaration);
    }

    return config;
  });

  // 2. Aponta o arquivo .aar para o Gradle do projeto Expo
  config = withProjectBuildGradle(config, async (config) => {
    // Adiciona o repositório flatDir apontando para a nossa pasta local
    if (!config.modResults.contents.includes('flatDir')) {
      config.modResults.contents = config.modResults.contents.replace(
        /allprojects\s*\{\s*repositories\s*\{/,
        `allprojects {
    repositories {
        flatDir {
            dirs "$rootDir/../native-modules/sat-nexus/android"
        }
`
      );
    }
    return config;
  });

  return config;
};
