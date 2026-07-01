import React, { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, LogOut, Mail, User } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  clearCustomerSession,
  getCustomerSession,
  signInCustomer,
} from "../../utils/customerAccount";
import "./page.css";

export default function AccountPage() {
  const [session, setSession] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getCustomerSession()
      .then((customer) => {
        if (isMounted) {
          setSession(customer);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const nextSession = await signInCustomer(form.email, form.password);
      setSession(nextSession);
      setMessage("Welcome back.");
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await clearCustomerSession();
    setSession(null);
    setMessage("Signed out.");
  };

  return (
    <main className="account-page">
      <Navbar />
      <section className="account-shell">
        <div className="account-grid">
          <div className="account-copy">
            <p className="account-kicker">Private Account</p>
            <h1>Client Portal</h1>
            <p>
              Keep commission details, fitting updates, payment records, and
              atelier communication in one quiet place.
            </p>
          </div>

          {session ? (
            <article className="account-card">
              <div>
                <p className="account-kicker">Signed In</p>
                <h2>
                  {session.firstName} {session.lastName}
                </h2>
              </div>
              <p>{session.email}</p>
              {message ? <div className="account-status">{message}</div> : null}

              <div className="account-mini-list">
                <div className="account-mini-row">
                  <strong>Commission</strong>
                  <span>No active commission yet</span>
                </div>
                <div className="account-mini-row">
                  <strong>Fitting Notes</strong>
                  <span>Awaiting atelier update</span>
                </div>
                <div className="account-mini-row">
                  <strong>Payments</strong>
                  <span>Awaiting atelier invoice</span>
                </div>
              </div>

              <div className="account-actions">
                <a className="account-link-button" href="/products">
                  <span>Explore Designs</span>
                  <ArrowRight size={15} />
                </a>
                <button
                  className="account-link-button is-secondary"
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </article>
          ) : (
            <article className="account-card">
              <div>
                <p className="account-kicker">Access</p>
                <h2>Sign In</h2>
              </div>
              <form className="account-form" onSubmit={handleSubmit}>
                <label>
                  Email Address
                  <span className="relative">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                      autoComplete="email"
                      required
                    />
                  </span>
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm({ ...form, password: event.target.value })
                    }
                    autoComplete="current-password"
                    required
                  />
                </label>
                {error ? <div className="account-status is-error">{error}</div> : null}
                {message ? <div className="account-status">{message}</div> : null}
                <button className="account-button" disabled={isSubmitting} type="submit">
                  <LockKeyhole size={15} />
                  <span>{isSubmitting ? "Checking" : "Sign In"}</span>
                </button>
              </form>

              <div className="account-divider" />

              <div className="account-actions">
                <a className="account-link-button is-secondary" href="/account/create">
                  <User size={15} />
                  <span>Create Account</span>
                </a>
                <a
                  className="account-link-button is-secondary"
                  href="/account/reset-password"
                >
                  <Mail size={15} />
                  <span>Reset Password</span>
                </a>
              </div>
            </article>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
