import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onLoginSuccess, onSwitchToSignUp }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Нэвтрэхэд алдаа гарлаа');
        return;
      }
      login(data.token, data.email);
      onLoginSuccess();
    } catch {
      setError('Сервертэй холбогдох үед алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>⚙ MySystem</h1>
          <p>Системийн удирдлагын платформ</p>
        </div>

        <h2>Нэвтрэх</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>И-мэйл</label>
            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Нууц үг</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </form>

        <div className="auth-footer">
          Бүртгэлгүй бол{' '}
          <button type="button" onClick={onSwitchToSignUp}>
            Бүртгүүлэх
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
