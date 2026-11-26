import { NativeModules, Platform } from 'react-native';

// O React Native mapeia módulos nativos pelo nome da classe ou registros customizados
const { BleScannerModule } = NativeModules;

export const SatNexusBle = {
  startBackgroundScan: (serviceUuid: string) => {
    if (Platform.OS === 'android') {
      BleScannerModule?.startBackgroundScan(serviceUuid);
    } else {
      console.warn('iOS ainda não implementado nativamente');
    }
  },
  
  stopBackgroundScan: () => {
    if (Platform.OS === 'android') {
      BleScannerModule?.stopBackgroundScan();
    }
  }
};
