import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SignUp = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Нууц үг таарахгүй байна');
      return;
    }
    if (password.length < 6) {
      setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Бүртгэл хийхэд алдаа гарлаа');
        return;
      }
      login(data.token, data.email);
      onRegisterSuccess();
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

        <h2>Бүртгүүлэх</h2>

        <form onSubmit={handleSignUp}>
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
              placeholder="Хамгийн багадаа 6 тэмдэгт"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Нууц үг давтах</label>
            <input
              type="password"
              placeholder="Нууц үгийг дахин оруулна уу"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
          </button>
        </form>

        <div className="auth-footer">
          Бүртгэлтэй бол{' '}
          <button type="button" onClick={onSwitchToLogin}>
            Нэвтрэх
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
