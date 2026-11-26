import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Truck } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../constants/ThemeContext';

export default function VehicleDetailScreen() {
  const { colors, isDark } = useTheme();
  const { vehicle } = useLocalSearchParams();
  const router = useRouter();
  
  const data = useMemo(() => {
    try {
      return typeof vehicle === 'string' ? JSON.parse(vehicle) : null;
    } catch (e) {
      return null;
    }
  }, [vehicle]);

  if (!data) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Dados do veículo não carregados.</Text>
      </View>
    );
  }

  const state = data.last_state;

  const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>{label}:</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value || ''}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <TouchableOpacity 
        onPress={() => router.push('/vehicles' as any)} 
        style={[styles.backButtonFloating, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}
      >
        <ChevronLeft color={isDark ? '#fff' : '#000'} size={30} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.mainCard, { backgroundColor: colors.card, marginTop: 60 }]}>
          <View style={styles.plateRow}>
            <View style={styles.iconCircle}>
                <Truck color="#eab308" size={30} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <Text style={[styles.plateText, { color: colors.text }]}>{data.registration_plate}</Text>
                <Text style={[styles.ownerText, { color: colors.text }]}> {data.client_name}</Text>
              </View>
              <Text style={styles.subDetailText}>Oper/Cli: <Text style={styles.boldText}>{data.operator_name}</Text></Text>
              <Text style={styles.subDetailText}>Renavam: {data.renavam}</Text>
              <Text style={styles.subDetailText}>Chassi: <Text style={styles.boldText}>{data.chassi_number}</Text></Text>
              <Text style={styles.subDetailText}>Modelo: <Text style={styles.boldText}>{data.brand} {data.model} {data.model_year} / {data.manufacturing_year}</Text></Text>
              <Text style={styles.subDetailText}>Motorista: {data.drivers_names || 'Não informado'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ÚLTIMA POSIÇÃO</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.locationDate, { color: colors.text, marginBottom: 15 }]}>
            Data: <Text style={{fontWeight: 'bold'}}>{state?.timestamp}</Text>
          </Text>
          
          <View style={styles.telemetryGrid}>
            <View style={{ flex: 1.2 }}>
                <Text style={[styles.telText, { color: colors.text }]}>Hodômetro: <Text style={styles.boldText}>{state?.odometer} km</Text></Text>
                <Text style={[styles.telText, { color: colors.text }]}>Horímetro: <Text style={styles.boldText}>{state?.hourmeter} h</Text></Text>
                <Text style={[styles.telText, { color: colors.text }]}>Velocidade: <Text style={styles.boldText}>{state?.speed} km/h</Text></Text>
                <Text style={[styles.telText, { color: colors.text }]}>Temperatura: <Text style={styles.boldText}>{state?.temperature_sensor} °C</Text></Text>
            </View>

            <View style={{ flex: 1 }}>
                {state?.actuators?.map((act: any, idx: number) => (
                    <View key={idx} style={styles.sensorItem}>
                        <View style={[styles.sensorDot, { backgroundColor: act.status ? '#2ecc71' : 'transparent' }]} />
                        <Text style={[styles.sensorLabel, { color: colors.text }]}>{act.name.toLowerCase()}</Text>
                    </View>
                ))}
                <View style={styles.sensorItem}><View style={styles.sensorDot} /><Text style={[styles.sensorLabel, { color: colors.text }]}>cerca</Text></View>
            </View>
          </View>

          <View style={[styles.divider, { marginVertical: 15 }]} />
          
          <Text style={[styles.fullAddress, { color: colors.text }]}>
            {state?.full_address}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>LICENCIAMENTO</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
           <InfoRow label="Ano" value={data.licensing_year} />
           <InfoRow label="expiração" value={data.licensing_year_expiration_date} />
           <InfoRow label="IPVA" value={data.licensing_ipva_expiration_date} />
        </View>

        <Text style={styles.sectionTitle}>SEGURO</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
           <InfoRow label="Seguradora" value={data.insurance_company} />
           <InfoRow label="Contrato" value={data.insurance_contract_number} />
           <InfoRow label="Validade" value={data.insurance_expiration_date} />
           <InfoRow label="Telefone" value={data.insurance_phone_number} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButtonFloating: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scrollContent: { padding: 16 },
  mainCard: { borderRadius: 12, padding: 15, marginBottom: 20, elevation: 2 },
  plateRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconCircle: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  plateText: { fontSize: 22, fontWeight: '900' },
  ownerText: { fontSize: 14, flexShrink: 1 },
  subDetailText: { fontSize: 13, color: '#64748b', marginTop: 2 },
  boldText: { fontWeight: 'bold', color: '#1e293b' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#9d3cfa', textAlign: 'center', marginBottom: 12, marginTop: 5 },
  card: { borderRadius: 12, padding: 16, marginBottom: 20, elevation: 1 },
  locationDate: { fontSize: 14 },
  telemetryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  telText: { fontSize: 13, marginBottom: 6 },
  sensorItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  sensorDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#94a3b8', marginRight: 8 },
  sensorLabel: { fontSize: 12 },
  divider: { height: 1, backgroundColor: '#e2e8f0' },
  fullAddress: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', lineHeight: 20 },
  infoRow: { flexDirection: 'row', paddingVertical: 6 },
  infoLabel: { fontSize: 14, width: 100 },
  infoValue: { fontSize: 14, fontWeight: 'bold', flex: 1 }
});