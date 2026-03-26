import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import RegisterSystem from './components/RegisterSystem';
import './App.css';

function AppContent() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState(user ? 'dashboard' : 'login');

  useEffect(() => {
    if (user && page !== 'dashboard' && page !== 'register') {
      setPage('dashboard');
    }
    if (!user) {
      setPage('login');
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return (
      <>
        {page === 'login' && (
          <Login
            onLoginSuccess={() => setPage('dashboard')}
            onSwitchToSignUp={() => setPage('signup')}
          />
        )}
        {page === 'signup' && (
          <SignUp
            onRegisterSuccess={() => setPage('dashboard')}
            onSwitchToLogin={() => setPage('login')}
          />
        )}
      </>
    );
  }

  return (
    <>
      {page === 'dashboard' && (
        <Dashboard
          onLogout={() => { logout(); setPage('login'); }}
          onGoToRegister={() => setPage('register')}
        />
      )}
      {page === 'register' && (
        <RegisterSystem onBack={() => setPage('dashboard')} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
