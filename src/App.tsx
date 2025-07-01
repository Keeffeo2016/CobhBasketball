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
  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      <div className="w-full flex justify-end p-4">
        {!user && !showLogin && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => setShowLogin(true)}
          >
            Admin Login
          </button>
        )}
        {user && (
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg ml-2"
            onClick={() => {
              setShowLogin(false);
              import('firebase/auth').then(({ signOut }) => signOut(auth));
            }}
          >
            Logout
          </button>
        )}
      </div>
      {user ? (
        <Dashboard />
      ) : showLogin ? (
        <AuthForm hideRegister onClose={() => setShowLogin(false)} />
      ) : (
        <Dashboard />
      )}
    </>
  );
}

export default function WrappedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}