import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '', // Department / Hostel
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'College email ID is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid college email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department / Hostel is required for campus handovers.';
    }

    // Validate phone number format (supports +91 XXXXX XXXXX or 10-digit Indian numbers)
    const cleanPhone = formData.phone.trim();
    if (!cleanPhone) {
      newErrors.phone = 'Contact phone number is required.';
    } else if (!/^(\+91[-\s]?)?[6-9]\d{9}$/.test(cleanPhone.replace(/[\s\-()]/g, '')) && cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid Indian mobile number (e.g. +91 98765 43210).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        department: formData.department.trim(),
        hostel: formData.department.trim(),
        departmentOrHostel: formData.department.trim(),
        phone: formData.phone.trim(),
      };

      const result = await register(payload);

      toast.success('Registration successful! Welcome to ReUseHub.');

      if (result.token) {
        navigate('/', { replace: true });
      } else {
        toast.info('Please log in with your credentials.');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      const msg = err.friendlyMessage || 'Registration failed. Email might already be registered.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon-badge">🎓</div>
          <h1 className="auth-title">Join ReUseHub</h1>
          <p className="auth-subtitle">Trade used textbooks, drafters, and essentials with fellow students</p>
        </div>

        {apiError && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-grid-2">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="reg-name">Student Full Name</label>
              <input
                type="text"
                id="reg-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Aarav Sharma"
                required
                autoComplete="name"
                className={errors.name ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.name && <div className="error-text">❌ {errors.name}</div>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="reg-email">College Email ID</label>
              <input
                type="email"
                id="reg-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. aarav.sharma@college.edu.in"
                required
                autoComplete="email"
                className={errors.email ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.email && <div className="error-text">❌ {errors.email}</div>}
            </div>
          </div>

          <div className="form-grid-2">
            {/* Department / Hostel */}
            <div className="form-group">
              <label htmlFor="reg-dept">Department & Hostel</label>
              <span id="dept-hint" className="field-hint">e.g. CSE, Block A or Mechanical, Block B</span>
              <input
                type="text"
                id="reg-dept"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. CSE, Block A"
                required
                aria-describedby="dept-hint"
                className={errors.department ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.department && <div className="error-text">❌ {errors.department}</div>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="reg-phone">Contact Phone (+91)</label>
              <span id="phone-hint" className="field-hint">Used for buyer/seller pickup coordination</span>
              <input
                type="tel"
                id="reg-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                required
                autoComplete="tel"
                aria-describedby="phone-hint"
                className={errors.phone ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.phone && <div className="error-text">❌ {errors.phone}</div>}
            </div>
          </div>

          <div className="form-grid-2">
            {/* Password */}
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <span id="pass-hint" className="field-hint">Min 6 characters</span>
              <input
                type="password"
                id="reg-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                autoComplete="new-password"
                aria-describedby="pass-hint"
                className={errors.password ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.password && <div className="error-text">❌ {errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input
                type="password"
                id="reg-confirm"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                className={errors.confirmPassword ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.confirmPassword && <div className="error-text">❌ {errors.confirmPassword}</div>}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={submitting}
          >
            {submitting ? 'Creating Campus Account...' : 'Register Campus Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
