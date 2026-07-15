import React, { useState } from "react";
import { CheckCircle2, Eye, EyeOff, UserPlus } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { createCustomerAccount } from "../../../utils/customerAccount";
import "../page.css";

export default function CreateAccountPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCustomerAccount(form);
      setCreated(true);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePassword = (field) => {
    setVisiblePasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  return (
    <main className="account-page">
      <Navbar />
      <section className="account-shell">
        <div className="account-grid">
          <div className="account-copy">
            <p className="account-kicker">New Client</p>
            <h1>Client Account</h1>
            <p>
              Open a private account before starting a commission, saving pieces,
              or continuing a fitting conversation.
            </p>
          </div>

          <article className="account-card">
            {created ? (
              <>
                <CheckCircle2 size={42} strokeWidth={1.3} />
                <div>
                  <p className="account-kicker">Account Ready</p>
                  <h2>Welcome</h2>
                </div>
                <p>
                  Your client account has been created. Email verification will be
                  connected when Resend is added.
                </p>
                <div className="account-actions">
                  <a className="account-link-button" href="/account">
                    Continue to Account
                  </a>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="account-kicker">Register</p>
                  <h2>Client Details</h2>
                </div>
                <form className="account-form" onSubmit={handleSubmit}>
                  <div className="account-field-grid">
                    <label>
                      First Name
                      <input
                        value={form.firstName}
                        onChange={(event) => updateForm("firstName", event.target.value)}
                        autoComplete="given-name"
                        required
                      />
                    </label>
                    <label>
                      Last Name
                      <input
                        value={form.lastName}
                        onChange={(event) => updateForm("lastName", event.target.value)}
                        autoComplete="family-name"
                        required
                      />
                    </label>
                  </div>
                  <label>
                    Email Address
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => updateForm("email", event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label>
                    Password
                    <span className="account-password-field">
                      <input
                        type={visiblePasswords.password ? "text" : "password"}
                        value={form.password}
                        onChange={(event) => updateForm("password", event.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        aria-label={
                          visiblePasswords.password ? "Hide password" : "Show password"
                        }
                        onClick={() => togglePassword("password")}
                      >
                        {visiblePasswords.password ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </span>
                  </label>
                  <label>
                    Confirm Password
                    <span className="account-password-field">
                      <input
                        type={visiblePasswords.confirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(event) =>
                          updateForm("confirmPassword", event.target.value)
                        }
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        aria-label={
                          visiblePasswords.confirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        onClick={() => togglePassword("confirmPassword")}
                      >
                        {visiblePasswords.confirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </span>
                  </label>
                  {error ? <div className="account-status is-error">{error}</div> : null}
                  <button className="account-button" disabled={isSubmitting} type="submit">
                    <UserPlus size={15} />
                    <span>{isSubmitting ? "Creating" : "Create Account"}</span>
                  </button>
                </form>
                <p className="account-footnote">
                  Already registered?{" "}
                  <a className="account-inline-link" href="/account">
                    Sign in
                  </a>
                  .
                </p>
              </>
            )}
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
