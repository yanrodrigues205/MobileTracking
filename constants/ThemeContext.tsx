import React, { createContext, useContext, useState } from 'react';
import { Colors } from './Colors';

const ThemeContext = createContext({
  isDark: true,
  colors: Colors.dark,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true); // Começa no escuro conforme seu login

  const toggleTheme = () => setIsDark(!isDark);
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);