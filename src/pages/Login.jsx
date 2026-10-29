import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after login, default to Home "/"
  const from = location.state?.from?.pathname || '/';

  // Credentials must NEVER be pre-filled
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    if (!formData.email.trim()) {
      newErrors.email = 'College email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid college email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
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
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      toast.success('Welcome back to ReUseHub!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.friendlyMessage || 'Invalid email or password. Please verify your credentials.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">🌱</div>
          <h1 className="auth-title">Welcome to ReUseHub</h1>
          <p className="auth-subtitle">Sign in with your campus credentials to access the marketplace</p>
        </div>

        {apiError && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email">College Email ID</label>
            <span id="email-hint" className="field-hint">e.g. aarav.sharma@college.edu.in</span>
            <input
              type="email"
              id="login-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. aarav.sharma@college.edu.in"
              required
              autoComplete="email"
              aria-describedby="email-hint"
              className={errors.email ? 'input-error' : ''}
              disabled={submitting}
            />
            {errors.email && <div className="error-text">❌ {errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className={errors.password ? 'input-error' : ''}
              disabled={submitting}
            />
            {errors.password && <div className="error-text">❌ {errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={submitting}
          >
            {submitting ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New student on campus?{' '}
            <Link to="/register" className="auth-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
