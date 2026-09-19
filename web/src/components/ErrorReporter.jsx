import { useEffect } from "react";
import { reportAppError } from "../utils/errorReporting";

export default function ErrorReporter() {
  useEffect(() => {
    const handleError = (event) => {
      if (event.error || event.message) {
        reportAppError(event.error || event.message, {
          source: "frontend",
          context: "Window error",
        });
        return;
      }

      const target = event.target;
      const resource = target?.src || target?.href;
      if (resource) {
        reportAppError("A page resource failed to load", {
          source: "resource",
          severity: "warning",
          context: String(resource).slice(0, 300),
        });
      }
    };

    const handleRejection = (event) => {
      reportAppError(event.reason || "Unhandled promise rejection", {
        source: "frontend",
        context: "Unhandled promise rejection",
      });
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
