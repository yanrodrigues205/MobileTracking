import { BellOff } from 'lucide-react-native';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../constants/ThemeContext';

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();

  const notifications : any = []; 

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {notifications.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            <BellOff size={40} color={colors.tabIconDefault} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Nenhuma notificação</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
            Você será avisado quando algo acontecer com seus veículos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }: any) => (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={{ color: colors.text }}>{item.message}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: { padding: 16, marginBottom: 1, borderBottomWidth: 0.5 }
});