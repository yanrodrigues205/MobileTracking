import { useRouter } from 'expo-router';
import { Bell, CircleParking, Truck } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../constants/ThemeContext';

const { height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function Dashboard() {
  const { colors } = useTheme();
  const router = useRouter();

  const handlePress = (title: string) => {
    if (title === 'Veículos') {
      router.push('/vehicles' as any); 
    }else if(title === "Notificações"){
      router.push('/notifications' as any); 
    }else if(title === "Estacionamento"){
      router.push('/parking' as any); 
    }
  };

  const cards = [
    { title: 'Veículos', icon: <Truck color={colors.tint} size={60} /> },
    { title: 'Notificações', icon: <Bell color={colors.tint} size={60} /> },
    { title: 'Estacionamento', icon: <CircleParking color={colors.tint} size={60} /> },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.grid}>
        {cards.map((item, index) => (
          <AnimatedTouchableOpacity 
            key={index} 
            onPress={() => handlePress(item.title)}
            style={[styles.card, { backgroundColor: colors.card }]}
            entering={FadeInDown.delay(index * 200).duration(600).springify()}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.background, opacity: 0.9 }]}>
              {item.icon}
            </View>
            <Text style={[styles.cardTitle, { color: colors.tint }]}>{item.title}</Text>
          </AnimatedTouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 },
  card: {
    width: '44%',
    height: height * 0.22, 
    margin: '3%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  iconContainer: { padding: 12, borderRadius: 20, marginBottom: 5 },
  cardTitle: { fontSize: 14, marginTop: 10, fontWeight: '600', textAlign: 'center' },
});