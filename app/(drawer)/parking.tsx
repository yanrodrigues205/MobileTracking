import { CircleParking, Clock, MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../constants/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function ParkingScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}api/mobile/v3/vehicles`, {
          headers: { 
            'Authorization': `Session token="${user?.token}"`,
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        const parked = (data.vehicles || []).filter((v: any) => !v.last_state?.ignition);
        setVehicles(parked);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchParking();
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderBottomColor: isDark ? '#334155' : '#e2e8f0' }]}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.plate, { color: colors.text }]}>{item.registration_plate}</Text>
          <Text style={[styles.description, { color: colors.tabIconDefault }]}>{item.description || 'Veículo'}</Text>
        </View>
        <View style={styles.status}>
          <Clock size={14} color={colors.tint} />
          <Text style={[styles.time, { color: colors.tint }]}>
            {item.last_state?.timestamp?.split(' ')[1] || '--:--'}
          </Text>
        </View>
      </View>

      <View style={styles.addressRow}>
        <MapPin size={14} color={colors.tabIconDefault} />
        <Text style={[styles.address, { color: colors.tabIconDefault }]} numberOfLines={1}>
          {item.last_state?.full_address || 'Endereço não disponível'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <CircleParking size={24} color={colors.tint} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Veículos Parados</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={colors.tint} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhum veículo estacionado.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    gap: 10 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  card: {
    padding: 16,
    borderBottomWidth: 1,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  info: { flex: 1 },
  plate: { fontSize: 17, fontWeight: 'bold' },
  description: { fontSize: 13, marginTop: 2 },
  status: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5,
    backgroundColor: 'rgba(157, 60, 250, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  time: { fontSize: 12, fontWeight: '600' },
  addressRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5, 
    marginTop: 10 
  },
  address: { fontSize: 12, flex: 1 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});