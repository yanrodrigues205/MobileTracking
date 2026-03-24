import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Clock,
  Gauge,
  History,
  Info,
  Key,
  MapPin,
  Navigation,
  Radio,
  Search,
  X,
  Zap
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../constants/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function VehiclesScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchVehicles = useCallback(async (pageNumber: number, isRefresh = false, plateFilter = '') => {
    if (!hasMore && !isRefresh && !plateFilter) return;

    try {
      let url = `${process.env.EXPO_PUBLIC_API_URL}api/mobile/${process.env.EXPO_PUBLIC_API_VERSION}/vehicles?`;
      if (plateFilter) {
        url += `plate=${plateFilter}`;
      } else {
        url += `page=${pageNumber}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Session token="${user?.token}"`,
        },
      });

      const data = await response.json();
      const newVehicles = data.vehicles || [];

      if (plateFilter) {
        setVehicles(newVehicles);
        setHasMore(false);
      } else {
        if (newVehicles.length === 0) {
          setHasMore(false);
        } else {
          setVehicles(prev => isRefresh ? newVehicles : [...prev, ...newVehicles]);
          setPage(pageNumber + 1);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os veículos.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [user?.token, hasMore]);

  useEffect(() => {
    fetchVehicles(0, true);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim() === '') return;
    setLoading(true);
    setIsSearching(true);
    fetchVehicles(0, true, searchQuery.trim());
  };


  

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setHasMore(true);
    setLoading(true);
    fetchVehicles(0, true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (isSearching) {
      fetchVehicles(0, true, searchQuery);
    } else {
      setHasMore(true);
      fetchVehicles(0, true);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !isSearching) {
      setLoadingMore(true);
      fetchVehicles(page);
    }
  };

  const renderItem = ({ item }: any) => {
    const isIgnitionOn = item.last_state?.ignition;
    const isOnline = item.last_state?.gprs_active;

    const handlePressDetail = () => {
      router.push({
        pathname: '/vehicle_detail',
        params: { vehicle: JSON.stringify(item) } 
      });
    };

    const handlePressLogs = () => {
      const now = new Date();
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    
      const formatDate = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      };
      router.push({
        pathname: '/vehicle_positions',
        params: { 
          vehicleId: item.id,
          plate: item.registration_plate,
          start: formatDate(threeHoursAgo),
          end: formatDate(now)
        }
      });
    };

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.plateBadge, { backgroundColor: isDark ? '#2d3748' : '#f8fafc' }]}>
            <View style={[styles.statusDot, { backgroundColor: isIgnitionOn ? '#2ecc71' : '#f1c40f' }]} />
            <Text style={[styles.plateText, { color: colors.text }]}>{item.registration_plate}</Text>
          </View>
          
          <View style={styles.headerIcons}>
            <Key size={16} color={isIgnitionOn ? '#2ecc71' : '#94a3b8'} style={styles.iconMargin} />
            <Radio size={16} color={isOnline ? colors.tint : '#e74c3c'} style={styles.iconMargin} />
            
            <View style={styles.timeBadge}>
              <Clock size={12} color={colors.tabIconDefault} style={{ marginRight: 4 }} />
              <View style={styles.dateTimeColumn}>
                <Text style={[styles.timeText, { color: colors.tabIconDefault }]}>
                  {item.last_state?.timestamp?.split(' ')[0].split('-').join('/')} {/* Pega a Data */}
                </Text>
                <Text style={[styles.timeText, { color: colors.tabIconDefault, fontWeight: 'bold' }]}>
                  {item.last_state?.timestamp?.split(' ')[1]} {/* Pega o Horário */}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.vehicleName, { color: colors.text }]} numberOfLines={1}>
          {item.description || "Sem descrição"}
        </Text>

        <View style={[styles.infoGrid, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
          <View style={styles.infoBox}>
            <Gauge size={18} color={colors.tint} />
            <Text style={[styles.infoValue, { color: colors.text }]}>{item.last_state?.speed || 0}</Text>
            <Text style={styles.infoLabel}>km/h</Text>
          </View>
          <View style={[styles.infoBox, styles.borderLateral]}>
            <Navigation size={18} color={colors.tint} />
            <Text style={[styles.infoValue, { color: colors.text }]}>{item.last_state?.odometer || 0}</Text>
            <Text style={styles.infoLabel}>km</Text>
          </View>
          <View style={styles.infoBox}>
            <Zap size={18} color={colors.tint} />
            <Text style={[styles.infoValue, { color: colors.text }]}>{item.last_state?.hourmeter || 0}</Text>
            <Text style={styles.infoLabel}>horas</Text>
          </View>
        </View>

        <View style={styles.addressBox}>
          <MapPin size={16} color={colors.tabIconDefault} />
          <Text style={[styles.addressText, { color: colors.tabIconDefault }]} numberOfLines={2}>
            {item.last_state?.full_address || 'Localização não disponível'}
          </Text>
        </View>

        <View style={[styles.footer, { borderTopColor: isDark ? '#334155' : '#e2e8f0' }]}>
          <TouchableOpacity style={styles.subActionButton} onPress={handlePressLogs}>
            <History size={22} color={colors.tint} />
            <Text style={[styles.subActionText, { color: colors.tint }]}>Posições</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.mainActionButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push({
              pathname: '/map_detail',
              params: { 
                latitude: item.last_state?.latitude, 
                longitude: item.last_state?.longitude,
                plate: item.registration_plate 
              }
            } as any)}
          >
            <MapPin size={20} color="#fff" />
            <Text style={styles.mainActionText}>Ver no Mapa</Text>
          </TouchableOpacity>
         <TouchableOpacity onPress={handlePressDetail} style={styles.subActionButton}  activeOpacity={0.7}>
            <Info size={22} color={colors.tint} />
            <Text style={[styles.subActionText, { color: colors.tint }]}>Detalhes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
        <Search size={20} color={colors.tabIconDefault} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Filtrar por placa..."
          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="characters"
          onSubmitEditing={handleSearch}
        />
        {isSearching ? (
          <TouchableOpacity onPress={clearSearch}>
            <X size={20} color={colors.tint} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSearch}>
            <ChevronRight size={20} color={colors.tint} />
          </TouchableOpacity>
        )}
      </View>

      {loading && page === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 20 }} color={colors.tint} /> : null}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.tabIconDefault }]}>Nenhum veículo encontrado.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 100, fontSize: 16 },
  searchBar: {
    flexDirection: 'row',
    margin: 16,
    paddingHorizontal: 16,
    height: 55,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '500' },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  plateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  plateText: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconMargin: { marginRight: 10 },
  timeBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 2 
  },
  dateTimeColumn: {
    flexDirection: 'column', // Empilha os itens verticalmente
    alignItems: 'flex-start',
  },
  timeText: { 
    fontSize: 10, 
    lineHeight: 12,
  },
  vehicleName: { fontSize: 15, fontWeight: '600', marginBottom: 16, opacity: 0.8 },
  infoGrid: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  infoBox: { flex: 1, alignItems: 'center' },
  borderLateral: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)' },
  infoValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  infoLabel: { fontSize: 10, fontWeight: '500', color: '#94a3b8', textTransform: 'uppercase' },
  addressBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 20 },
  addressText: { fontSize: 12, flex: 1, lineHeight: 18 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  subActionButton: { alignItems: 'center', gap: 4 },
  subActionText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  mainActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
    elevation: 2,
  },
  mainActionText: { color: '#fff', fontWeight: '700', fontSize: 14 }
});