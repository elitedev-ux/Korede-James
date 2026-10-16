import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function NewsletterConfirmPage() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("ready");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  async function confirmSubscription() {
    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to confirm subscription.");
      setStatus("confirmed");
      setMessage(data.message || "Your subscription is confirmed.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to confirm subscription.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] text-black">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-32 text-center">
        <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-amber-800">Inner Circle</p>
        <h1 className="font-serif text-4xl">Confirm your subscription</h1>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-gray-600">
          Confirm that you want to receive occasional collection notes, atelier updates, and private invitations.
        </p>
        {message ? <p className="mt-8 text-sm" role="status">{message}</p> : null}
        {status !== "confirmed" ? (
          <button
            type="button"
            onClick={confirmSubscription}
            disabled={!token || status === "submitting"}
            className="mt-10 bg-black px-10 py-4 text-[10px] uppercase tracking-[0.3em] text-white disabled:opacity-40"
          >
            {status === "submitting" ? "Confirming…" : "Confirm subscription"}
          </button>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
