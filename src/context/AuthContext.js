import React, { createContext, useContext, useState, useEffect } from 'react';

// Usuarios hardcodeados (sin backend)
const USERS = [
  { username: 'user', password: 'user', role: 'member', name: 'Miembro' },
  { username: 'oficial', password: 'oficial', role: 'officer', name: 'Oficial' },
  { username: 'admin', password: 'admin', role: 'admin', name: 'Administrador' },
  { username: 'FireAriel', password: 'FireAriel', role: 'admin', name: 'FireAriel', isOfficer: true },
  { username: 'KIRITONYU', password: 'KIRITONYU', role: 'admin', name: 'KIRITONYU', isOfficer: true },
  // Oficiales
  { username: 'fireariel', password: 'fireariel123', role: 'officer', name: 'fireariel' },
  { username: 'Mayor_defa', password: 'Mayor_defa123', role: 'officer', name: 'Mayor_defa' },
  { username: 'Kiritonyu', password: 'Kiritonyu123', role: 'officer', name: 'Kiritonyu' },
  { username: 'judejum12', password: 'judejum12123', role: 'officer', name: 'judejum12' },
  { username: '0_Whait_0', password: '0_Whait_0123', role: 'officer', name: '0_Whait_0' },
  { username: 'ANTONIOB', password: 'ANTONIOB123', role: 'officer', name: 'ANTONIOB' },
  { username: '_LastDrago_', password: '_LastDrago_123', role: 'officer', name: '_LastDrago_' },
  { username: 'CrossNeri', password: 'CrossNeri123', role: 'officer', name: 'CrossNeri' },
  { username: 'Katlyne', password: 'Katlyne123', role: 'officer', name: 'Katlyne' },
  { username: 'CORDERO', password: 'CORDERO123', role: 'officer', name: 'CORDERO' },
  { username: 'Sunstrider_Revenge', password: 'Sunstrider_Revenge123', role: 'officer', name: 'Sunstrider_Revenge' }
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario guardado al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('inwo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('inwo_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = (username, password) => {
    const foundUser = USERS.find(
      u => u.username.toLowerCase() === username.toLowerCase() && 
           u.password === password
    );

    if (foundUser) {
      const userData = {
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name
      };
      setUser(userData);
      localStorage.setItem('inwo_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }

    return { success: false, error: 'Usuario o contraseña incorrectos' };
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('inwo_user');
  };

  // Verificar roles
  const isAuthenticated = () => !!user;
  const isMember = () => user?.role === 'member' || user?.role === 'officer' || user?.role === 'admin';
  const isOfficer = () => user?.role === 'officer' || user?.role === 'admin';
  const isAdmin = () => user?.role === 'admin';

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
    isMember,
    isOfficer,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;

