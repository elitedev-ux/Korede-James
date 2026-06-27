import React, { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Mail } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import {
  requestCustomerPasswordReset,
  resetCustomerPassword,
} from "../../../utils/customerAccount";
import "../page.css";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    token: "",
    password: "",
    confirmPassword: "",
  });
  const [devResetUrl, setDevResetUrl] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      setPasswordForm((current) => ({ ...current, token }));
    }
  }, []);

  const handleRequest = async (event) => {
    event.preventDefault();
    setError("");
    setDevResetUrl("");
    setIsSubmitting(true);

    try {
      const result = await requestCustomerPasswordReset(email);
      setDevResetUrl(result.devResetUrl || "");
      setRequestSent(true);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setError("");
    setPasswordUpdated(false);

    if (passwordForm.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetCustomerPassword(passwordForm.token, passwordForm.password);
      setPasswordUpdated(true);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="account-page">
      <Navbar />
      <section className="account-shell">
        <div className="account-grid">
          <div className="account-copy">
            <p className="account-kicker">Account Recovery</p>
            <h1>Reset Password</h1>
            <p>
              Request a recovery email, then set a new password for your private
              client account.
            </p>
          </div>

          <article className="account-card">
            <div>
              <p className="account-kicker">Recovery</p>
              <h2>Password Access</h2>
            </div>

            <form className="account-form" onSubmit={handleRequest}>
              <label>
                Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <button className="account-button" disabled={isSubmitting} type="submit">
                <Mail size={15} />
                <span>{isSubmitting ? "Sending" : "Request Email"}</span>
              </button>
            </form>

            {requestSent ? (
              <div className="account-status">
                If an account exists for that email, a reset message will be sent
                when email delivery is connected.
                {devResetUrl ? (
                  <>
                    <br />
                    <a className="account-inline-link" href={devResetUrl}>
                      Open local reset link
                    </a>
                  </>
                ) : null}
              </div>
            ) : null}

            <div className="account-divider" />

            <form className="account-form" onSubmit={handlePasswordReset}>
              <label>
                Reset Token
                <input
                  value={passwordForm.token}
                  onChange={(event) =>
                    setPasswordForm({ ...passwordForm, token: event.target.value })
                  }
                  autoComplete="one-time-code"
                  required
                />
              </label>
              <label>
                New Password
                <input
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      password: event.target.value,
                    })
                  }
                  autoComplete="new-password"
                  required
                />
              </label>
              <label>
                Confirm New Password
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: event.target.value,
                    })
                  }
                  autoComplete="new-password"
                  required
                />
              </label>
              {error ? <div className="account-status is-error">{error}</div> : null}
              {passwordUpdated ? (
                <div className="account-status">
                  <CheckCircle2 size={15} /> Password updated. You can sign in now.
                </div>
              ) : null}
              <button className="account-button" disabled={isSubmitting} type="submit">
                <KeyRound size={15} />
                <span>{isSubmitting ? "Updating" : "Set New Password"}</span>
              </button>
            </form>

            <p className="account-footnote">
              Return to{" "}
              <a className="account-inline-link" href="/account">
                sign in
              </a>
              .
            </p>
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
