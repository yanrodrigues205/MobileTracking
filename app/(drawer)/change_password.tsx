import { useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// Importação correta para evitar o Warning
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// Movido para fora do componente principal para não perder o foco ao digitar
const InputField = ({ label, value, onChange, placeholder, isDark, colors, secureTextEntry, onToggleShow, showIcon }: any) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.tabIconDefault }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={onChange}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggleShow}>
          {showIcon ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
        </TouchableOpacity>
      </View>
    </View>
);

export default function ChangePasswordScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: '#e2e8f0' };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    switch (score) {
      case 1: return { score: 25, label: 'Fraca', color: '#ef4444' };
      case 2: return { score: 50, label: 'Média', color: '#f59e0b' };
      case 3: return { score: 75, label: 'Boa', color: '#10b981' };
      case 4: return { score: 100, label: 'Forte', color: '#0ea5e9' };
      default: return { score: 0, label: '', color: '#e2e8f0' };
    }
  }, [newPassword]);

  const canSubmit = 
    currentPassword.length > 0 && 
    newPassword.length >= 6 && 
    newPassword === confirmPassword;

  const handleSave = async () => {
    if (!user?.token) {
      Alert.alert("Erro", "Sessão expirada. Por favor, faça login novamente.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://satfleet.satcompany.app/api/mobile/v3/users/password_reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Session token="${user.token}"`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword
        })
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Sua senha foi alterada com sucesso!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert("Erro", errorData.message || "Senha atual incorreta ou dados inválidos.");
      }
    } catch (error) {
      Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <TouchableOpacity 
        onPress={() => router.back()} 
        style={[styles.backButtonFloating, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}
      >
        <ChevronLeft color={isDark ? '#fff' : '#000'} size={30} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.headerSection, { marginTop: 60 }]}>
            <View style={styles.iconCircle}>
                <Lock color="#9d3cfa" size={32} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Alterar Senha</Text>
            <Text style={styles.subtitle}>Mantenha sua conta segura com uma senha forte.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <InputField 
            label="Senha Atual" 
            value={currentPassword} 
            onChange={setCurrentPassword} 
            placeholder="Digite sua senha atual"
            isDark={isDark}
            colors={colors}
            secureTextEntry={!showPass.current}
            showIcon={showPass.current}
            onToggleShow={() => setShowPass({ ...showPass, current: !showPass.current })}
          />

          <View style={[styles.divider, { marginVertical: 10 }]} />

          <InputField 
            label="Nova Senha" 
            value={newPassword} 
            onChange={setNewPassword} 
            placeholder="Digite a nova senha"
            isDark={isDark}
            colors={colors}
            secureTextEntry={!showPass.new}
            showIcon={showPass.new}
            onToggleShow={() => setShowPass({ ...showPass, new: !showPass.new })}
          />

          <View style={styles.strengthWrapper}>
            <View style={styles.strengthBarBackground}>
              <View style={[styles.strengthBarFill, { width: `${passwordStrength.score}%`, backgroundColor: passwordStrength.color }]} />
            </View>
            <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
          </View>

          <InputField 
            label="Confirmar Nova Senha" 
            value={confirmPassword} 
            onChange={setConfirmPassword} 
            placeholder="Repita a nova senha"
            isDark={isDark}
            colors={colors}
            secureTextEntry={!showPass.confirm}
            showIcon={showPass.confirm}
            onToggleShow={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
          />

          {newPassword !== confirmPassword && confirmPassword.length > 0 && (
            <Text style={styles.errorText}>As senhas não coincidem</Text>
          )}
        </View>

        <TouchableOpacity 
          disabled={!canSubmit || loading}
          onPress={handleSave}
          style={[
            styles.submitButton, 
            { backgroundColor: (canSubmit && !loading) ? '#9d3cfa' : '#cbd5e1' }
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <ShieldCheck color="#fff" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Atualizar Senha</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButtonFloating: {
    position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 8, borderRadius: 12, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  scrollContent: { padding: 20 },
  headerSection: { alignItems: 'center', marginBottom: 30 },
  iconCircle: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#f3e8ff', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 5, paddingHorizontal: 20 },
  card: { borderRadius: 16, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 50 },
  input: { flex: 1, fontSize: 16 },
  divider: { height: 1, backgroundColor: '#e2e8f0', opacity: 0.5 },
  strengthWrapper: { marginBottom: 20, marginTop: -8 },
  strengthBarBackground: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  strengthBarFill: { height: '100%', borderRadius: 3 },
  strengthLabel: { fontSize: 12, fontWeight: 'bold', textAlign: 'right', marginTop: 4 },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: -10, marginBottom: 10, fontWeight: '500' },
  submitButton: { height: 55, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 3 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});