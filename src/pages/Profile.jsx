import React, { useState, useEffect } from 'react';
import { fetchCurrentUser, updateCurrentUser, fetchMyItems, fetchSentRequests } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { updateUser } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Quick campus statistics
  const [stats, setStats] = useState({
    totalListings: 0,
    soldCount: 0,
    sentRequests: 0,
  });

  // Controlled form state initialized once fetched
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});

  // 1. INFINITE RE-RENDER LOOP FIX:
  // Fetch GET /api/users/me strictly once on mount with an empty dependency array [].
  // Never pass unstable references or call updateUser/setState in an effect that triggers itself.
  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      try {
        const userData = await fetchCurrentUser();
        const resolved = userData?.user || userData;

        if (!isMounted) return;

        if (resolved) {
          setProfile(resolved);
          // Initialize form state once from the fetched user data
          setFormData({
            name: resolved.name || '',
            email: resolved.email || '',
            department: resolved.department || resolved.hostel || '',
            phone: resolved.phone || '',
          });
        }

        // Fetch supporting user stats (non-blocking)
        try {
          const [myItemsData, sentReqData] = await Promise.allSettled([
            fetchMyItems(),
            fetchSentRequests(),
          ]);

          if (!isMounted) return;

          let itemsCount = 0;
          let sold = 0;
          if (myItemsData.status === 'fulfilled') {
            const list = Array.isArray(myItemsData.value)
              ? myItemsData.value
              : myItemsData.value?.items || [];
            itemsCount = list.length;
            sold = list.filter((i) => i.isSold || i.status === 'Sold').length;
          }

          let sentCount = 0;
          if (sentReqData.status === 'fulfilled') {
            const sent = Array.isArray(sentReqData.value)
              ? sentReqData.value
              : sentReqData.value?.requests || [];
            sentCount = sent.length;
          }

          setStats({
            totalListings: itemsCount,
            soldCount: sold,
            sentRequests: sentCount,
          });
        } catch {
          // Non-blocking stats catch
        }
      } catch (err) {
        if (isMounted) {
          const msg = err.friendlyMessage || 'Failed to fetch current profile.';
          toast.error(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, []); // Strictly empty dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department / Hostel is required for student exchanges.';
    }
    const cleanPhone = (formData.phone || '').trim();
    if (!cleanPhone) {
      newErrors.phone = 'Contact phone number is required.';
    } else if (!/^(\+91[-\s]?)?[6-9]\d{9}$/.test(cleanPhone.replace(/[\s\-()]/g, '')) && cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid Indian mobile number (e.g. +91 98765 43210).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        department: formData.department.trim(),
        hostel: formData.department.trim(),
        departmentOrHostel: formData.department.trim(),
        phone: formData.phone.trim(),
      };

      const res = await updateCurrentUser(payload);
      const updatedUser = res?.user || { ...profile, ...payload };

      setProfile(updatedUser);
      // Only notify AuthContext when user explicitly updates profile
      updateUser(updatedUser);
      toast.success('Your profile has been updated!');
      setIsEditing(false);
    } catch (err) {
      const msg = err.friendlyMessage || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        department: profile.department || profile.hostel || '',
        phone: profile.phone || '',
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  // 2. LAYOUT SHIFT FIX:
  // Instead of an early return with a tiny loader that jumps when content loads,
  // render structured skeleton containers matching the exact fixed min-heights.
  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          {/* Skeleton Hero Card */}
          <div className="profile-hero-card profile-skeleton-hero">
            <div className="skeleton-avatar" />
            <div className="skeleton-text-group">
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line skeleton-line-sub" />
            </div>
          </div>

          {/* Skeleton Stats Grid */}
          <div className="profile-stats-grid">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="stat-card">
                <div className="skeleton-line" style={{ width: '40px', margin: '0 auto 8px' }} />
                <div className="skeleton-line" style={{ width: '60px', margin: '0 auto' }} />
              </div>
            ))}
          </div>

          {/* Skeleton Form Card */}
          <div className="profile-form-card profile-skeleton-card">
            <LoadingSpinner text="Loading campus profile..." />
          </div>
        </div>
      </div>
    );
  }

  const initial = (profile?.name || 'S').charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Hero Header */}
        <div className="profile-hero-card">
          <div className="profile-avatar-giant">{initial}</div>
          <div className="profile-hero-info">
            <div className="profile-role-badge">Verified Campus Student</div>
            <h1 className="profile-display-name">{profile?.name || 'Campus Student'}</h1>
            <p className="profile-display-dept">
              📍 {profile?.department || profile?.hostel || 'Department not specified'}
            </p>
          </div>

          <div className="profile-hero-action">
            {!isEditing ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="profile-stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div className="stat-num">{stats.totalListings}</div>
            <div className="stat-label">Items Listed</div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🤝</span>
            <div className="stat-num">{stats.soldCount}</div>
            <div className="stat-label">Completed Handshakes</div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">📨</span>
            <div className="stat-num">{stats.sentRequests}</div>
            <div className="stat-label">Requests Sent</div>
          </div>

          <div className="stat-card highlight">
            <span className="stat-icon">🌱</span>
            <div className="stat-num">Level {Math.max(1, stats.soldCount + 1)}</div>
            <div className="stat-label">Eco Contributor</div>
          </div>
        </div>

        {/* Details Form Card */}
        <div className="profile-form-card">
          <div className="card-header-bar">
            <h2 className="card-title">
              {isEditing ? 'Update Contact & Academic Details' : 'Account Details'}
            </h2>
            <span className="card-note">
              {isEditing ? 'Keep your contact info accurate for buyers' : 'Visible to verified students'}
            </span>
          </div>

          {!isEditing ? (
            /* VIEW MODE */
            <div className="profile-details-view">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{profile?.name || 'Not provided'}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">College Email ID</span>
                <span className="detail-value">{profile?.email || 'Not provided'}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Department & Hostel</span>
                <span className="detail-value">
                  {profile?.department || profile?.hostel || 'Not specified'}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Contact Phone (+91)</span>
                <span className="detail-value">{profile?.phone || 'Not provided'}</span>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <form onSubmit={handleSaveProfile} className="profile-edit-form" noValidate>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="prof-name">Full Name</label>
                  <input
                    type="text"
                    id="prof-name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="e.g. Aarav Sharma"
                    required
                    className={errors.name ? 'input-error' : ''}
                    disabled={saving}
                  />
                  {errors.name && <div className="error-text">❌ {errors.name}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="prof-email">College Email ID</label>
                  <input
                    type="email"
                    id="prof-email"
                    name="email"
                    value={formData.email || ''}
                    disabled
                    title="Email is tied to your college account"
                    className="input-disabled"
                  />
                  <span className="field-hint">Email address cannot be changed</span>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="prof-dept">Department & Hostel</label>
                  <span id="prof-dept-hint" className="field-hint">e.g. CSE, Block A or Mechanical, Block B</span>
                  <input
                    type="text"
                    id="prof-dept"
                    name="department"
                    value={formData.department || ''}
                    onChange={handleChange}
                    placeholder="e.g. CSE, Block A"
                    required
                    aria-describedby="prof-dept-hint"
                    className={errors.department ? 'input-error' : ''}
                    disabled={saving}
                  />
                  {errors.department && <div className="error-text">❌ {errors.department}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="prof-phone">Contact Phone (+91)</label>
                  <span id="prof-phone-hint" className="field-hint">Shared with buyer when you accept their request</span>
                  <input
                    type="tel"
                    id="prof-phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    required
                    aria-describedby="prof-phone-hint"
                    className={errors.phone ? 'input-error' : ''}
                    disabled={saving}
                  />
                  {errors.phone && <div className="error-text">❌ {errors.phone}</div>}
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
