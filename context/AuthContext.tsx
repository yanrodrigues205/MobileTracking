import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserData {
  id: string;
  name: string;
  email: string;
  token: string;
}

const AuthContext = createContext({
  user: null as UserData | null,
  loading: true, // Estado crucial para evitar redirects precoces
  signIn: async (data: UserData) => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega o usuário do disco ao abrir o app
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const authData = await AsyncStorage.getItem('@SAT_AUTH');
        if (authData) {
          setUser(JSON.parse(authData));
        }
      } catch (e) {
        console.error("Erro ao carregar cache", e);
      } finally {
        setLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const signIn = async (data: UserData) => {
    setUser(data);
    await AsyncStorage.setItem('@SAT_AUTH', JSON.stringify(data));
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@SAT_AUTH'); // Remove a sessão do disco
      setUser(null); // Atualiza o estado para nulo
      // O useEffect no app/_layout.tsx cuidará de te mandar para o login
    } catch (e) {
      console.error("Erro ao deslogar", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);