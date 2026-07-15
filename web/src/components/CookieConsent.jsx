import { useEffect, useState } from "react";
import "./CookieConsent.css";

const CONSENT_KEY = "kj_cookie_consent";
const CONSENT_VERSION = "v1";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const storedConsent = getStoredConsent();

    if (!storedConsent) {
      const timer = window.setTimeout(() => setIsVisible(true), 900);
      return () => window.clearTimeout(timer);
    }

    applyConsentCookie(storedConsent);
  }, []);

  const handleChoice = (choice) => {
    const value = `${CONSENT_VERSION}:${choice}`;

    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {}

    applyConsentCookie(value);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section
      className="cookie-consent"
      aria-label="Cookie notice"
      role="dialog"
      aria-modal="false"
    >
      <div className="cookie-consent__panel">
        <p className="cookie-consent__text">
          KOREDE JAMES uses cookies, including third-party cookies, for
          functional purposes, statistical analysis, to measure and improve site
          performance, personalize your experience, and provide you with
          relevant atelier content. You can accept cookies by selecting
          "Accept All Cookies" or reject non-essential cookies by selecting
          "Refuse All". For more information, please refer to our Terms and
          Conditions and Privacy Policy.
        </p>

        <a className="cookie-consent__link" href="/privacy-policy">
          View our partners
        </a>

        <div className="cookie-consent__actions">
          <button
            className="cookie-consent__button"
            type="button"
            onClick={() => handleChoice("accepted")}
          >
            Accept All Cookies
          </button>
          <button
            className="cookie-consent__button cookie-consent__button--secondary"
            type="button"
            onClick={() => handleChoice("refused")}
          >
            Refuse All
          </button>
        </div>
      </div>
    </section>
  );
}

function getStoredConsent() {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value?.startsWith(`${CONSENT_VERSION}:`) ? value : "";
  } catch {
    return "";
  }
}

function applyConsentCookie(value) {
  const maxAge = 60 * 60 * 24 * 180;
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(
    value,
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
