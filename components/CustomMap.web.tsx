import React from 'react';
import { Text, View } from 'react-native';

export default function CustomMap({ latitude, longitude, plate }: any) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Modo Web</Text>
      <Text style={{ color: '#aaa' }}>Veículo: {plate}</Text>
      <Text style={{ color: '#aaa' }}>Lat: {latitude} / Lng: {longitude}</Text>
      <Text style={{ color: '#555', marginTop: 10 }}>O mapa real requer ambiente nativo.</Text>
    </View>
  );
}