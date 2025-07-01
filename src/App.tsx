import React, { useState, useEffect, createContext, useContext } from 'react';
import { Dashboard } from './components/Dashboard';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface AuthContextType {
  user: any;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType>({ user: null, logout: () => {} });
export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);
  const logout = () => signOut(auth);
  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
};

import AuthForm from './components/AuthForm';

function App() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <AuthForm />;
}

export default function WrappedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}