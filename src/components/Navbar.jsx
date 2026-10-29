import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('You have logged out successfully.');
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <span className="brand-icon" aria-hidden="true">🌱</span>
          <div className="brand-text">
            <span className="brand-title">ReUseHub</span>
            <span className="brand-subtitle">Campus Marketplace</span>
          </div>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        {/* Main Nav Links */}
        <nav className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Explore
            </NavLink>

            <NavLink
              to="/sell"
              className={({ isActive }) => `nav-link sell-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="plus-icon">+</span> Sell Item
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/my-listings"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  My Listings
                </NavLink>

                <NavLink
                  to="/requests"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  Requests
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  Profile
                </NavLink>

                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => `nav-link admin-nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                    style={{ color: '#b91c1c', fontWeight: 700 }}
                  >
                    🛡️ Admin
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Auth Actions */}
          <div className="nav-auth">
            {isAuthenticated ? (
              <div className="user-profile-menu">
                <Link to="/profile" className="user-badge" onClick={closeMobileMenu}>
                  <div className="user-avatar" aria-hidden="true">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user?.name || 'Student'}</span>
                    <span className="user-dept">
                      {user?.department || user?.hostel || 'Campus Member'}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline btn-logout"
                  title="Sign out of your account"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className="btn btn-ghost"
                  onClick={closeMobileMenu}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={closeMobileMenu}
                >
                  Join Campus Hub
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
