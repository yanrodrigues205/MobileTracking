import { Save } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../constants/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const LABEL_MAP: Record<string, string> = {
  maintenance: "Manutenção",
  voltage: "Voltagem/Bateria",
  speed_violation: "Violação de Velocidade",
  panic: "Pânico",
  geofence_violation: "Violação de Cerca",
  movement: "Movimentação Indevida",
  insurance: "Seguro",
  ipva: "IPVA",
  licensing: "Licenciamento",
  undue_activation: "Ativação Indevida",
  miscommunication_limit_exceeded: "Limite de Falha de Comunicação",
  geofence_permanence_violation: "Permanência em Cerca",
  embedded_speed_exceeded: "Velocidade Excedida (Embarcado)",
  driver_license_expired: "CNH Vencida",
  activation_timeout_exceeded: "Tempo de Ativação Excedido",
  infraction_creation: "Nova Infração",
  infraction_progress: "Andamento de Infração",
  debit_creation: "Novo Débito",
  debit_expiration: "Vencimento de Débito",
  debit_paymend: "Pagamento de Débito",
  vehicle_park_safely: "Estacionamento Seguro",
  processed_report: "Relatório Processado",
  crash: "Colisão/Acidente",
  sensor_status: "Status de Sensores",
  rpm: "Giro do Motor (RPM)"
};

export default function EditNotificationsScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = 'https://satfleet.satcompany.app/api/mobile/v3/push_notification_settings';

  const fetchSettings = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Session token="${user?.token}"`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as configurações.");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Session token="${user?.token}"`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Configurações atualizadas com sucesso!");
      } else {
        throw new Error();
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleSwitch = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>
          Selecione os alertas que deseja receber via Push:
        </Text>
        
        {Object.entries(settings).map(([key, value]) => (
          <View key={key} style={[styles.settingRow, { borderBottomColor: isDark ? '#334155' : '#f1f5f9' }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {LABEL_MAP[key] || key}
            </Text>
            <Switch
              value={value}
              onValueChange={() => toggleSwitch(key)}
              trackColor={{ false: '#767577', true: colors.tint }}
              thumbColor={value ? '#fff' : '#f4f3f4'}
            />
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.tint }]} 
          onPress={saveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save color="#fff" size={20} />
              <Text style={styles.saveButtonText}>SALVAR CONFIGURAÇÕES</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 14, marginBottom: 20, fontWeight: '600' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingLabel: { fontSize: 15, flex: 1, paddingRight: 10 },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc'
  },
  saveButton: {
    flexDirection: 'row',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});