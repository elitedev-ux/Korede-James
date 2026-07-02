import React, { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, LogOut, Mail, User } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  clearCustomerSession,
  getCustomerCommissions,
  getCustomerSession,
  signInCustomer,
} from "../../utils/customerAccount";
import "./page.css";

export default function AccountPage() {
  const [session, setSession] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [commissionsLoading, setCommissionsLoading] = useState(false);
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

  useEffect(() => {
    let isMounted = true;

    if (!session) {
      setCommissions([]);
      return () => {
        isMounted = false;
      };
    }

    setCommissionsLoading(true);
    getCustomerCommissions()
      .then((items) => {
        if (isMounted) {
          setCommissions(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCommissions([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setCommissionsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

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
                {commissionsLoading ? (
                  <div className="account-mini-row">
                    <strong>Commissions</strong>
                    <span>Loading recent numbers</span>
                  </div>
                ) : commissions.length ? (
                  commissions.slice(0, 4).map((commission) => (
                    <a
                      className="account-mini-row account-mini-row--link"
                      href={`/track?commission=${encodeURIComponent(
                        commission.displayId
                      )}`}
                      key={commission.id}
                    >
                      <strong>{commission.displayId}</strong>
                      <span>{commission.status || commission.stage}</span>
                    </a>
                  ))
                ) : (
                  <div className="account-mini-row">
                    <strong>Commission</strong>
                    <span>No active commission yet</span>
                  </div>
                )}
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
                  <span className="account-password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(event) =>
                        setForm({ ...form, password: event.target.value })
                      }
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </span>
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
