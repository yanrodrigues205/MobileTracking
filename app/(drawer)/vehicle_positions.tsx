import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';
import { Calendar, Filter, MapPin } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '../../constants/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function VehiclePositionsScreen() {
    const { vehicleId, plate } = useLocalSearchParams();
    const { colors } = useTheme();
    const { user } = useAuth();

    // Estados de Data (Objetos Date do JS para o Picker)
    const [startDate, setStartDate] = useState(new Date(Date.now() - 3 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());
    
    // Controles do Picker
    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
    const [mode, setMode] = useState<'date' | 'time'>('date');

    const [positions, setPositions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const formatToBR = (date: Date) => {
        return date.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const formatToApi = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        const d = pad(date.getDate());
        const m = pad(date.getMonth() + 1);
        const y = date.getFullYear();
        const h = pad(date.getHours());
        const min = pad(date.getMinutes());
        const s = pad(date.getSeconds());
        return `${d}-${m}-${y}+${h}:${min}:${s}`;
    };

    const fetchPositions = useCallback(async (pageNumber: number, isRefresh = false) => {
        try {
            const startStr = formatToApi(startDate);
            const endStr = formatToApi(endDate);
            
            const url = `${process.env.EXPO_PUBLIC_API_URL}api/mobile/${process.env.EXPO_PUBLIC_API_VERSION}/vehicles/${vehicleId}/states?start_timestamp=${startStr}&end_timestamp=${endStr}&page=${pageNumber}`;

            const response = await fetch(url, {
                headers: { 
                    'Authorization': `Session token="${user?.token}"`, 
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();
            const newPositions = data.vehicle_states || [];

            if (newPositions.length === 0) {
                setHasMore(false);
            } else {
                setPositions(prev => isRefresh ? newPositions : [...prev, ...newPositions]);
                setPage(pageNumber + 1);
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro ao carregar posições.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [vehicleId, startDate, endDate, user?.token]);

    useEffect(() => { fetchPositions(0, true); }, []);

    const onPickerChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowPicker(null);
            return;
        }

        const currentDate = selectedDate || (showPicker === 'start' ? startDate : endDate);
        
        if (Platform.OS === 'android' && mode === 'date') {
            setMode('time');
            if (showPicker === 'start') setStartDate(currentDate);
            else setEndDate(currentDate);
        } else {
            setShowPicker(null);
            setMode('date');
            if (showPicker === 'start') setStartDate(currentDate);
            else setEndDate(currentDate);
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={[styles.logCard, { backgroundColor: colors.card, borderLeftColor: item.ignition ? '#2ecc71' : '#f1c40f' }]}>
            <View style={styles.logHeader}>
                <Text style={[styles.logTime, { color: colors.text }]}>{item.timestamp}</Text>
                <View style={[styles.speedBadge, { backgroundColor: colors.tint }]}>
                    <Text style={styles.speedText}>{Math.round(item.speed)} km/h</Text>
                </View>
            </View>
            
            <View style={styles.addressRow}>
                <MapPin size={16} color={colors.tint} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.addressText, { color: colors.text }]}>{item.full_address}</Text>
                    <Text style={[styles.coordsText, { color: colors.tabIconDefault }]}>
                        Lat: {item.lat.toFixed(6)} | Long: {item.lng.toFixed(6)}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
            <View style={[styles.filterContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.title, { color: colors.text }]}>Filtro de Período</Text>
                
                <View style={styles.pickerRow}>
                    <TouchableOpacity 
                        style={[styles.dateBtn, { backgroundColor: colors.inputBg }]} 
                        onPress={() => { setShowPicker('start'); setMode('date'); }}
                    >
                        <Calendar size={14} color={colors.tabIconDefault} />
                        <Text style={{ color: colors.text, fontSize: 12 }}>{formatToBR(startDate)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.dateBtn, { backgroundColor: colors.inputBg }]} 
                        onPress={() => { setShowPicker('end'); setMode('date'); }}
                    >
                        <Calendar size={14} color={colors.tabIconDefault} />
                        <Text style={{ color: colors.text, fontSize: 12 }}>{formatToBR(endDate)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.tint }]} onPress={() => fetchPositions(0, true)}>
                        <Filter size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {showPicker && (
                <DateTimePicker
                    value={showPicker === 'start' ? startDate : endDate}
                    mode={mode}
                    is24Hour={true}
                    display="default"
                    onChange={onPickerChange}
                />
            )}

            {loading ? (
                <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={positions}
                    renderItem={renderItem}
                    keyExtractor={(_, index) => index.toString()}
                    onEndReached={() => { if (hasMore && !loadingMore) { setLoadingMore(true); fetchPositions(page); } }}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    filterContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    title: { fontSize: 14, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', opacity: 0.6 },
    pickerRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    dateBtn: { flex: 1, height: 45, borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 8 },
    filterBtn: { width: 45, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    logCard: { padding: 15, marginBottom: 12, borderRadius: 16, borderLeftWidth: 5, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
    logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    logTime: { fontWeight: '800', fontSize: 14 },
    speedBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    speedText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    addressRow: { flexDirection: 'row', gap: 10 },
    addressText: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
    coordsText: { fontSize: 10, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
});