import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  ZoomIn
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);

  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000);
  
    try {
      // Usando a URL da sua API conforme solicitado
      const response = await fetch(`https://satfleet.satcompany.app/api/mobile/v3/sessions/sign_in`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Connection': 'close',
        },
        body: JSON.stringify({
          username: email.trim(),
          password: password,
          auth_group: "application"
        }),
        signal: controller.signal,
      });
  
      clearTimeout(id);
      const data = await response.json().catch(() => ({}));
  
      if (response.status === 200 && data.token) {
        const userData = {
          id: String(data.id),
          name: data.name ? data.name.trim() : 'Motorista',
          email: data.email || 'E-mail não cadastrado.',
          token: data.token
        };
        // Salva no contexto global de autenticação
        await signIn(userData);
      } else {
        Alert.alert('Falha', data.message || 'Credenciais inválidas. Verifique usuário e senha.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        Alert.alert('Alerta do Sistema', 'Tempo limite excedido. Tente novamente.');
      } else {
        Alert.alert('Alerta do Sistema', 'Sem conexão com a internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. FUNDO: GIF com opacidade controlada */}
      <Image
        source={{ uri: 'https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUya2UwbjNsZXRlYThvajR6MnE4bzVxOWVzZHBlZzZsZnQzeGYwZGR4YyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l5JbspfwZ0yjHjlJ0K/source.gif' }}
        style={styles.backgroundGif}
        onLoad={() => setBgLoaded(true)}
      />
      
      {/* 2. OVERLAY: Gradiente para garantir legibilidade sobre o GIF */}
      <LinearGradient 
        colors={['rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.9)']} 
        style={StyleSheet.absoluteFill} 
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SÓ APRESENTA O CONTEÚDO APÓS O FUNDO CARREGAR */}
          {bgLoaded ? (
            <View style={styles.centralBlock}>

              {/* LOGO: Efeito Zoom In */}
              <Animated.View 
                entering={ZoomIn.duration(800).springify()}
                style={styles.iconContainer}
              >
                <Image 
                  source={require('../../assets/images/icon.png')} 
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </Animated.View>

              <View style={styles.form}>
                
                {/* INPUT USUÁRIO: Entra pela Esquerda */}
                <Animated.View 
                  entering={FadeInLeft.delay(200).duration(700)}
                  style={styles.inputContainer}
                >
                  <UserIcon color="#9d3cfa" size={20} style={styles.leftIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="E-mail ou Usuário"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </Animated.View>

                {/* INPUT SENHA: Entra pela Direita */}
                <Animated.View 
                  entering={FadeInRight.delay(400).duration(700)}
                  style={styles.inputContainer}
                >
                  <Lock color="#9d3cfa" size={20} style={styles.leftIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.rightIcon}
                  >
                    {showPassword ? (
                      <EyeOff color="#fff" size={20} />
                    ) : (
                      <Eye color="#fff" size={20} />
                    )}
                  </TouchableOpacity>
                </Animated.View>

                {/* ESQUECI SENHA: Fade In suave */}
                <Animated.View 
                  entering={FadeIn.delay(600).duration(1000)}
                  style={styles.forgotPasswordContainer}
                >
                  <TouchableOpacity onPress={() => {/* Navegação futura */}}>
                    <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
                  </TouchableOpacity>
                </Animated.View>

                {/* BOTÃO ENTRAR: Sobe com efeito mola */}
                <Animated.View 
                  entering={FadeInDown.delay(800).duration(800).springify()}
                >
                  <TouchableOpacity 
                    style={[styles.button, loading && { opacity: 0.7 }]} 
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <LinearGradient colors={['#9d3cfa', '#7c22d6']} style={styles.buttonGradient}>
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Entrar</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

              </View>
            </View>
          ) : (
            // Loader enquanto o GIF não carrega
            <View style={styles.loaderContainer}>
               <ActivityIndicator size="large" color="#9d3cfa" />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a' 
  },
  backgroundGif: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
    opacity: 0.6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: height
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 30,
    paddingVertical: 50 
  },
  centralBlock: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    height: 120, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  iconImage: {
    width: 180,
    height: 120,
  },
  form: { 
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.85)', 
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(157, 60, 250, 0.3)', 
    height: 60,
    paddingHorizontal: 15,
  },
  leftIcon: { marginRight: 12 },
  rightIcon: { padding: 5 },
  input: { 
    flex: 1, 
    color: '#fff', 
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#9d3cfa',
    fontSize: 14,
    fontWeight: '600', 
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  button: { 
    borderRadius: 15, 
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#9d3cfa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonGradient: { 
    height: 60, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    letterSpacing: 1
  }
});