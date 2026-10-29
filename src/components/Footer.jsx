import React from 'react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <span className="leaf-icon">🌱</span>
              <span className="footer-title">ReUseHub</span>
            </div>
            <p className="footer-tagline">
              Empowering campus sustainability. Buy, sell, and exchange pre-loved academic
              supplies, instruments, and hostel essentials within our verified student community.
            </p>
            <div className="eco-pill">
              ♻️ Zero Waste Campus Initiative
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Quick Marketplace</h4>
            <ul className="footer-links">
              <li><Link to="/?category=Textbooks">Textbooks & Notes</Link></li>
              <li><Link to="/?category=Calculators">Scientific Calculators</Link></li>
              <li><Link to="/?category=Lab%20Equipment">Lab Equipment & Coats</Link></li>
              <li><Link to="/?category=Drawing%20Instruments">Drawing Instruments</Link></li>
              <li><Link to="/?category=Hostel%20Essentials">Hostel Essentials</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Student Account</h4>
            <ul className="footer-links">
              <li><Link to="/sell">List an Item for Sale</Link></li>
              <li><Link to="/my-listings">Manage My Listings</Link></li>
              <li><Link to="/requests">Purchase Requests</Link></li>
              <li><Link to="/profile">Campus Profile</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Safety & Guidelines</h4>
            <ul className="footer-tips">
              <li>🤝 Meet in public campus spots (library, student center, hostel gates).</li>
              <li>🔍 Verify items physically before payment handover.</li>
              <li>⚡ Keep our campus clean, circular, and friendly!</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {CURRENT_YEAR} ReUseHub Campus Marketplace. Built for student sustainability.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
