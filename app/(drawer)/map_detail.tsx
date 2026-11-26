import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Layers } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomMap from '../../components/CustomMap';
import { useTheme } from '../../constants/ThemeContext';

export default function MapDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [mapType, setMapType] = useState<'satellite' | 'standard'>('satellite');

  const lat = parseFloat(params.latitude as string);
  const lng = parseFloat(params.longitude as string);

  const toggleMapType = () => {
    setMapType(prev => (prev === 'satellite' ? 'standard' : 'satellite'));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!isNaN(lat) && !isNaN(lng) && (
        <CustomMap 
          latitude={lat} 
          longitude={lng} 
          plate={params.plate as string} 
          mapType={mapType} 
        />
      )}

      <TouchableOpacity 
        style={[styles.backButton, { backgroundColor: colors.card }]} 
        onPress={() => router.push('/vehicles' as any)}
      >
        <ChevronLeft size={24} color={colors.tint} />
        <Text style={[styles.buttonText, { color: colors.text }]}>Voltar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.layerButton, { backgroundColor: colors.card }]} 
        onPress={toggleMapType}
      >
        <Layers size={24} color={colors.tint} />
        <Text style={[styles.buttonText, { color: colors.text }]}>
          {mapType === 'satellite' ? 'Mapa' : 'Satélite'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 60 : 40, 
    left: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 25, 
    elevation: 5,
    zIndex: 10
  },
  layerButton: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 60 : 40, 
    right: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 25, 
    elevation: 5,
    zIndex: 10
  },
  buttonText: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
});