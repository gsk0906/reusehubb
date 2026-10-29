import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAdminUsers, fetchAdminUserById, fetchAdminLoginActivity } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatPrice } from '../utils/format';
import ItemImage from '../components/ItemImage';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'logins'

  // Users state
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Login activity state
  const [loginLogs, setLoginLogs] = useState([]);
  const [loginPage, setLoginPage] = useState(1);
  const [loginTotalPages, setLoginTotalPages] = useState(1);
  const [loadingLogins, setLoadingLogins] = useState(false);

  // User details modal state
  const [selectedUser, setSelectedUser] = useState(null);

  // Load Users
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchAdminUsers({
        page: userPage,
        limit: 10,
        search: userSearch,
      });
      setUsers(data?.users || []);
      setUserTotalPages(data?.pagination?.totalPages || 1);
      setUserTotal(data?.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [userPage, userSearch]);

  // Load Login Logs
  const loadLoginLogs = useCallback(async () => {
    setLoadingLogins(true);
    try {
      const data = await fetchAdminLoginActivity({
        page: loginPage,
        limit: 15,
      });
      setLoginLogs(data?.logs || []);
      setLoginTotalPages(data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load login logs:', err);
    } finally {
      setLoadingLogins(false);
    }
  }, [loginPage]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadLoginLogs();
    }
  }, [activeTab, loadUsers, loadLoginLogs]);

  // View specific user details modal
  const handleInspectUser = async (userId) => {
    try {
      const data = await fetchAdminUserById(userId);
      setSelectedUser(data);
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to fetch user details');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="dashboard-page" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
        <h2>Admin Access Restricted</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          You must be signed in with an Administrator account to view this panel.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              🛡️ System Administration
            </div>
            <h1 className="dashboard-title">Platform Governance & Audit</h1>
            <p className="dashboard-subtitle">
              Monitor registered campus users, listings compliance, and real-time login activity logs.
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="profile-stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div className="stat-num">{userTotal}</div>
            <div className="stat-label">Registered Accounts</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🔒</span>
            <div className="stat-num">Active</div>
            <div className="stat-label">Security & Audit Logs</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏷️</span>
            <div className="stat-num">MySQL</div>
            <div className="stat-label">Connection Pool</div>
          </div>
          <div className="stat-card highlight">
            <span className="stat-icon">👑</span>
            <div className="stat-num">{user.name}</div>
            <div className="stat-label">Admin Identity</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="tab-buttons-bar" role="tablist">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Directory
            <span className="tab-counter">{userTotal}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'logins' ? 'active' : ''}`}
            onClick={() => setActiveTab('logins')}
          >
            🔐 Recent Login Activity
          </button>
        </div>

        {/* TAB 1: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div>
            {/* Search filter */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search user by name, email, department, or phone..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                style={{ flex: 1, minWidth: '280px', padding: '0.65rem 1rem' }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={loadUsers}
              >
                🔄 Refresh
              </button>
            </div>

            {loadingUsers ? (
              <LoadingSpinner text="Querying MySQL user registry..." />
            ) : users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p>No user records matching your query.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>ID</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Student / User</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Department & Hostel</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Contact</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Listings</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Last Login</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>#{u.id}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>{u.department}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{u.phone || '—'}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: u.role === 'admin' ? '#fee2e2' : '#f0fdf4',
                            color: u.role === 'admin' ? '#b91c1c' : '#15803d',
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                          {u.totalListings} items
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN') : 'Never'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleInspectUser(u.id)}
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Page {userPage} of {userTotalPages} ({userTotal} total users)
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={userPage >= userTotalPages}
                      onClick={() => setUserPage((p) => p + 1)}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOGIN ACTIVITY */}
        {activeTab === 'logins' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={loadLoginLogs}
              >
                🔄 Refresh Logs
              </button>
            </div>

            {loadingLogins ? (
              <LoadingSpinner text="Fetching security audit logs..." />
            ) : loginLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p>No login events logged yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Timestamp</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Student / User</th>
                      <th style={{ padding: '0.85rem 1rem' }}>IP Address</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Device & Client Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
                          {new Date(log.loginTime).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700 }}>{log.userName}</div>
                          <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>{log.userEmail}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--primary-dark)', fontWeight: 600 }}>
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.userAgent}>
                          {log.userAgent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Page {loginPage} of {loginTotalPages}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={loginPage <= 1}
                      onClick={() => setLoginPage((p) => Math.max(1, p - 1))}
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={loginPage >= loginTotalPages}
                      onClick={() => setLoginPage((p) => p + 1)}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: User Inspection Details */}
        {selectedUser && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              zIndex: 1000,
            }}
            onClick={() => setSelectedUser(null)}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                boxShadow: 'var(--shadow-lg)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedUser.user.name}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {selectedUser.user.email} • 📍 {selectedUser.user.department}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedUser(null)}
                >
                  ✕ Close
                </button>
              </div>

              {/* Listings by this user */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                📦 Marketplace Listings ({selectedUser.items.length})
              </h3>
              {selectedUser.items.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No items listed yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {selectedUser.items.map((it) => (
                    <div
                      key={it.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-main)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                          <ItemImage src={it.imageUrl} alt={it.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{it.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{it.category} • {it.condition}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                        {formatPrice(it.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Login history */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                🕒 Login History Logs
              </h3>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                {selectedUser.loginHistory.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recorded login logs.</p>
                ) : (
                  selectedUser.loginHistory.map((l) => (
                    <div key={l.id} style={{ fontSize: '0.8rem', padding: '0.35rem 0', borderBottom: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{new Date(l.loginTime).toLocaleString('en-IN')}</span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{l.ipAddress}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
