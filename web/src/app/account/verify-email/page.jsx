import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import "../page.css";

export default function VerifyEmailPage() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("ready");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  async function verifyEmail() {
    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/customer-auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to verify email.");
      setStatus("confirmed");
      setMessage(data.message || "Email verified. You can sign in now.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to verify email.");
    }
  }

  return (
    <main className="account-page">
      <Navbar />
      <section className="account-shell">
        <article className="account-card" style={{ maxWidth: 620, margin: "0 auto" }}>
          <div>
            <p className="account-kicker">Account Security</p>
            <h1>Verify Your Email</h1>
            <p>Confirm that this email address belongs to you before signing in.</p>
          </div>
          {message ? <div className={`account-status${status === "error" ? " is-error" : ""}`} role="status">{message}</div> : null}
          {status === "confirmed" ? (
            <a className="account-button" href="/account">Continue to Sign In</a>
          ) : (
            <button className="account-button" type="button" onClick={verifyEmail} disabled={!token || status === "submitting"}>
              {status === "submitting" ? "Verifying" : "Verify Email"}
            </button>
          )}
        </article>
      </section>
      <Footer />
    </main>
  );
}
