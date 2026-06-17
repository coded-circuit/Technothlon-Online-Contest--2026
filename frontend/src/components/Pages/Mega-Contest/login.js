import React from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const MegaContestLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="mega-contest-login-page">
      <main className="mega-login-shell">
        <section className="mega-login-intro">
          <p className="mega-login-kicker">Mega Contest Portal</p>
          <h1>Mega Contest Entry</h1>
          <p>
            This page is separate from the regular Contest login. Use it for Mega Contest
            registrations, notices, or a future custom login flow.
          </p>
        </section>

        <section className="mega-login-card" aria-label="Mega Contest entry form">
          <h2>Mega Contest Login</h2>
          <form>
            <label htmlFor="mega-name">Name</label>
            <input id="mega-name" type="text" placeholder="Enter your name" />

            <label htmlFor="mega-phone">Phone Number</label>
            <input id="mega-phone" type="tel" placeholder="Enter phone number" />

            <label htmlFor="mega-code">Mega Contest Code</label>
            <input id="mega-code" type="text" placeholder="Enter contest code" />

            <button type="button">Continue</button>
          </form>

          <button type="button" className="mega-login-back" onClick={() => navigate('/mega-contest')}>
            Back to Mega Contest
          </button>
        </section>
      </main>
    </div>
  );
};

export default MegaContestLogin;
