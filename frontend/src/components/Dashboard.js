import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = ({ onLogout, onGoToRegister }) => {
  const { user } = useAuth();
  const [systems, setSystems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('systems');

  const authHeader = { Authorization: `Bearer ${user.token}` };

  const fetchSystems = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5001/api/systems', { headers: authHeader });
      if (res.ok) setSystems(await res.json());
    } catch (err) {
      console.error('Systems fetch алдаа:', err);
    }
  }, [user.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5001/api/users', { headers: authHeader });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error('Users fetch алдаа:', err);
    }
  }, [user.token]); // eslint-disable-line react-hooks/exhaustive-deps

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
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(s.id)}
                      >
                        Устгах
                      </button>
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
    </div>
  );
};

export default Dashboard;
