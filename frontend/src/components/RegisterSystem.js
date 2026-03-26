import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RegisterSystem = ({ onBack }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    systemName: '',
    type: 'Карт',
    rating: '',
    description: '',
    developer: '',
    duration: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5001/api/systems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...formData,
          rating: Number(formData.rating) || 0,
          duration: formData.duration || null,
          relatedSystems: [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Систем бүртгэхэд алдаа гарлаа');
        return;
      }

      setSuccess(true);
      setFormData({
        systemName: '',
        type: 'Карт',
        rating: '',
        description: '',
        developer: '',
        duration: '',
        isActive: true,
      });
    } catch {
      setError('Сервертэй холбогдох үед алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <nav className="navbar">
        <span className="navbar-brand">⚙ MySystem</span>
        <div className="navbar-right">
          <span className="navbar-email">{user.email}</span>
          <button className="navbar-btn" onClick={onBack}>← Буцах</button>
        </div>
      </nav>

      <div className="main-content">
        <div className="page-card">
          <div className="page-card-header">
            <span style={{ fontSize: 28 }}>🖥</span>
            <div>
              <h2>Шинэ систем бүртгэх</h2>
              <p style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>
                Системийн мэдээллийг оруулна уу
              </p>
            </div>
          </div>

          {success && (
            <div className="success-msg">
              ✅ Систем амжилттай бүртгэгдлээ!
            </div>
          )}
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Системийн нэр *</label>
                <input
                  type="text"
                  name="systemName"
                  value={formData.systemName}
                  onChange={handleChange}
                  placeholder="Системийн нэрийг оруулна уу"
                  required
                />
              </div>

              <div className="form-group">
                <label>Төрөл</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="Карт">Карт</option>
                  <option value="Интернет банк">Интернет банк</option>
                  <option value="Мобайл апп">Мобайл апп</option>
                  <option value="API">API</option>
                  <option value="Бусад">Бусад</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Хөгжүүлэгч</label>
                <input
                  type="text"
                  name="developer"
                  value={formData.developer}
                  onChange={handleChange}
                  placeholder="Хөгжүүлэгчийн нэр"
                />
              </div>

              <div className="form-group">
                <label>Үнэлгээ (0 — 10)</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="10"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Тайлбар</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Системийн тухай тайлбар бичнэ үү..."
              />
            </div>

            <div className="form-group">
              <label>Хугацаа</label>
              <input
                type="date"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <label htmlFor="isActive">Систем идэвхтэй байна</label>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                Цуцлах
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Бүртгэж байна...' : '✓ Систем бүртгэх'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterSystem;
