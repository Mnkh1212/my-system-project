import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = ({ onLogout, onGoToRegister }) => {
  const { user } = useAuth();
  const [systems, setSystems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('systems');
  const [editSystem, setEditSystem] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const authHeader = { Authorization: `Bearer ${user.token}` };

  const fetchSystems = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5001/api/systems', { headers: authHeader });
      if (res.ok) setSystems(await res.json());
    } catch (err) {
      console.error('Systems fetch алдаа:', err);
    }
  }, [user.token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5001/api/users', { headers: authHeader });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error('Users fetch алдаа:', err);
    }
  }, [user.token]); 

  useEffect(() => {
    Promise.all([fetchSystems(), fetchUsers()]).finally(() => setLoading(false));
  }, [fetchSystems, fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Энэ системийг устгах уу?')) return;
    try {
      const res = await fetch(`http://localhost:5001/api/systems/${id}`, {
        method: 'DELETE',
        headers: authHeader,
      });
      if (res.ok) setSystems((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Delete алдаа:', err);
    }
  };

  const openEdit = (s) => {
    setEditError(null);
    setEditSystem({
      id: s.id,
      systemName: s.system_name,
      type: s.type,
      rating: s.rating || '',
      description: s.description || '',
      developer: s.developer || '',
      duration: s.duration ? s.duration.slice(0, 10) : '',
      isActive: s.is_active,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditSystem((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/systems/${editSystem.id}`, {
        method: 'PUT',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editSystem,
          rating: Number(editSystem.rating) || 0,
          duration: editSystem.duration || null,
          relatedSystems: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Засварлахад алдаа гарлаа');
        return;
      }
      setSystems((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      setEditSystem(null);
    } catch {
      setEditError('Сервертэй холбогдох үед алдаа гарлаа');
    } finally {
      setEditLoading(false);
    }
  };

  const activeSystems = systems.filter((s) => s.is_active).length;

  const renderStars = (rating) => {
    const r = Math.min(Math.max(Number(rating) || 0, 0), 10);
    const filled = Math.round(r / 2);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  };

  return (
    <div className="app-layout">
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-brand">⚙ MySystem</span>
        <div className="navbar-right">
          <span className="navbar-email">{user.email}</span>
          <button className="navbar-btn" onClick={onGoToRegister}>+ Систем нэмэх</button>
          <button className="navbar-btn" onClick={onLogout}>Гарах</button>
        </div>
      </nav>

      <div className="main-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">🖥</div>
            <div className="stat-info">
              <h3>{systems.length}</h3>
              <p>Нийт систем</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{activeSystems}</h3>
              <p>Идэвхтэй систем</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">👥</div>
            <div className="stat-info">
              <h3>{users.length}</h3>
              <p>Бүртгэлтэй хэрэглэгч</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            className={`btn ${activeTab === 'systems' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto' }}
            onClick={() => setActiveTab('systems')}
          >
            Миний системүүд
          </button>
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto' }}
            onClick={() => setActiveTab('users')}
          >
            Хэрэглэгчид
          </button>
        </div>

        {loading ? (
          <div className="loading">Уншиж байна...</div>
        ) : activeTab === 'systems' ? (
          <>
            <div className="section-header">
              <h2>Миний системүүд</h2>
              <button className="btn btn-primary" style={{ width: 'auto' }} onClick={onGoToRegister}>
                + Шинэ систем
              </button>
            </div>

            {systems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🖥</div>
                <h3>Систем бүртгэгдээгүй байна</h3>
                <p>Дээрх товчлуур дарж шинэ систем нэмнэ үү</p>
              </div>
            ) : (
              <div className="systems-grid">
                {systems.map((s) => (
                  <div key={s.id} className="system-card">
                    <div className="system-card-header">
                      <span className="system-card-title">{s.system_name}</span>
                      <span className={`badge ${s.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {s.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                      </span>
                    </div>

                    <div className="system-card-meta">
                      <span className="badge badge-type">{s.type}</span>
                    </div>

                    {s.description && (
                      <p className="system-card-desc">{s.description}</p>
                    )}

                    <div className="system-card-footer">
                      <div>
                        <div className="rating-stars">{renderStars(s.rating)}</div>
                        {s.developer && (
                          <div className="system-card-developer">👨‍💻 {s.developer}</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>
                          Засах
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                          Устгах
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="users-section">
            <h2>Бүртгэлтэй хэрэглэгчид</h2>
            {users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>Хэрэглэгч олдсонгүй</h3>
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>И-мэйл</th>
                    <th>Бүртгэсэн огноо</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td>{i + 1}</td>
                      <td>{u.email}</td>
                      <td>{new Date(u.created_at).toLocaleDateString('mn-MN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editSystem && (
        <div className="modal-overlay" onClick={() => setEditSystem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Систем засварлах</h2>
              <button className="modal-close" onClick={() => setEditSystem(null)}>✕</button>
            </div>

            {editError && <div className="error-msg">{editError}</div>}

            <form onSubmit={handleEditSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Системийн нэр *</label>
                  <input
                    type="text"
                    name="systemName"
                    value={editSystem.systemName}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Төрөл</label>
                  <select name="type" value={editSystem.type} onChange={handleEditChange}>
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
                    value={editSystem.developer}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label>Үнэлгээ (0 — 10)</label>
                  <input
                    type="number"
                    name="rating"
                    value={editSystem.rating}
                    onChange={handleEditChange}
                    min="0"
                    max="10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Тайлбар</label>
                <textarea
                  name="description"
                  value={editSystem.description}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Хугацаа</label>
                <input
                  type="date"
                  name="duration"
                  value={editSystem.duration}
                  onChange={handleEditChange}
                />
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="editIsActive"
                  name="isActive"
                  checked={editSystem.isActive}
                  onChange={handleEditChange}
                />
                <label htmlFor="editIsActive">Систем идэвхтэй байна</label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditSystem(null)}>
                  Цуцлах
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Хадгалж байна...' : '✓ Хадгалах'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
