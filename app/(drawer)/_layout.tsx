import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { Bell, CircleParking, Cog, KeyRound, LayoutDashboard, LogOut, Moon, Sun, Truck, User } from 'lucide-react-native';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../../constants/ThemeContext';
import { useAuth } from '../../context/AuthContext';

function CustomDrawerContent(props: any) {
  const { isDark, toggleTheme, colors } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.userSection, { borderBottomColor: colors.tabIconDefault }]}>
        <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
          <User color={colors.tint} size={40} />
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
            {user?.name || 'Não identificado'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.tabIconDefault }]} numberOfLines={1}>
            {user?.email || 'E-mail não possui'}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, marginTop: 10 }}>
        <DrawerItemList {...props} />
        <View style={[styles.divider, { backgroundColor: colors.tabIconDefault, opacity: 0.2 }]} />
        <View style={styles.themeContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isDark ? <Moon color={colors.tint} size={20} /> : <Sun color={colors.tint} size={20} />}
            <Text style={[styles.themeLabel, { color: colors.text }]}>Modo Escuro</Text>
          </View>
          <Switch 
            value={isDark} 
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: colors.tint }}
            thumbColor={isDark ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.tabIconDefault, borderTopWidth: 0.2 }]}>
        <DrawerItem
          label="Sair"
          labelStyle={{ color: '#ef4444' }}
          icon={({ size }) => <LogOut color="#ef4444" size={size} />}
          onPress={signOut}
        />
        <Text style={styles.versionText}>Versão 2.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { colors, isDark } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? '#1e293b' : '#9d3cfa' },
          headerTintColor: '#fff',
          drawerActiveTintColor: colors.tint,
          drawerInactiveTintColor: isDark ? '#94a3b8' : '#64748b',
          drawerStyle: { backgroundColor: colors.background, width: 300 }
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Início',
            headerTitle: 'Início',
            headerTitleAlign: 'center', 
            drawerIcon: ({ color }) => <LayoutDashboard color={color} size={20} />,
          }}
        />
        <Drawer.Screen
          name="vehicles"
          options={{
            drawerLabel: 'Veículos',
            headerTitle: 'Veículos',
            headerTitleAlign: 'center',
            drawerIcon: ({ color }) => <Truck color={color} size={20} />,
          }}
        />

        <Drawer.Screen
          name="parking"
          options={{
            drawerLabel: 'Estacionamento',
            headerTitle: 'Estacionamento Seguro',
            headerTitleAlign: 'center',
            drawerIcon: ({ color }) => <CircleParking color={color} size={20} />,
          }}
        />

        <Drawer.Screen
          name="change_password"
          options={{
            drawerLabel: 'Alterar Senha',
            headerTitle: 'Alterar Senha',
            headerTitleAlign: 'center',
            drawerIcon: ({ size }) => <KeyRound color={colors.tabIconDefault} size={size} />,
          }}
        />

        <Drawer.Screen
          name="notifications"
          options={{
            drawerLabel: 'Notificações',
            headerTitle: 'Notificações',
            headerTitleAlign: 'center',
            drawerIcon: ({ color }) => <Bell color={color} size={20} />,
          }}
        />

        <Drawer.Screen
          name="edit_notifications"
          options={{
            drawerLabel: 'Editar',
            headerTitle: 'Editar Notificações',
            headerTitleAlign: 'center',
            drawerItemStyle: { 
              marginLeft: 30,
              borderRadius: 30,
              height: 55,
            },
            drawerLabelStyle: {
              fontSize: 13,
            },
            drawerIcon: ({ color }) => <Cog color={color} size={18} />,
          }}
        />

        <Drawer.Screen
          name="map_detail"
          options={{
            drawerLabel: 'Localização',
            headerTitle: 'Localização',
            drawerItemStyle: { display: 'none' },
          }}
        />

        <Drawer.Screen
          name="vehicle_detail"
          options={{
            drawerLabel: 'Detalhes do Veículo',
            headerTitle: 'Detalhes do Veículo',
            drawerItemStyle: { display: 'none' },
          }}
        />
        
        <Drawer.Screen
          name="vehicle_positions"
          options={{
            drawerLabel: 'Posicionamentos',
            headerTitle: 'Posicionamentos',
            drawerItemStyle: { display: 'none' },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  userSection: { padding: 20, borderBottomWidth: 0.5, flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  userInfo: { marginLeft: 15, flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userEmail: { fontSize: 12 },
  divider: { height: 1, marginVertical: 10 },
  themeContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  themeLabel: { marginLeft: 10, fontWeight: '500' },
  footer: { paddingBottom: 20 },
  versionText: { textAlign: 'center', fontSize: 10, color: '#999', marginTop: 5 },
});