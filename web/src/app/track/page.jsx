import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import { trackAdminCommission } from "../../utils/adminWorkspace";
import { getCustomerSession } from "../../utils/customerAccount";

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("commission") || "";
  });
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackError, setTrackError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getCustomerSession()
      .then((customer) => {
        if (isMounted && customer?.email) {
          setEmail((current) => current || customer.email);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTrackError("");
    setTrackingResult(null);

    setTimeout(() => {
      trackAdminCommission({ commissionId: orderId, email })
        .then((result) => {
          if (!result) {
            setTrackError(
              "No matching commission found. Check the commission number and email used for the request."
            );
            return;
          }

          setTrackingResult({
            ...result,
            steps: buildTrackingSteps(result.request),
          });
        })
        .catch(() => {
          setTrackError(
            "No matching commission found. Check the commission number and email used for the request."
          );
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-40 pb-32 px-6 max-w-3xl mx-auto">
        <SectionTitle title="Track Commission" subtitle="Atelier Status" />

        <div className="bg-[#fafafa] p-10 md:p-16 border border-gray-100 shadow-sm mb-16">
          <form onSubmit={handleTrack} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Commission Number
              </label>
              <input
                required
                type="text"
                placeholder="KJ-123456 or REQ-123456"
                className="w-full bg-white border border-gray-200 px-6 py-4 text-sm focus:outline-none focus:border-black transition-colors"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Associated Email
              </label>
              <input
                required
                type="email"
                className="w-full bg-white border border-gray-200 px-6 py-4 text-sm focus:outline-none focus:border-black transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all flex items-center justify-center space-x-4"
            >
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Clock size={16} />
                </motion.div>
              ) : (
                <Search size={16} />
              )}
              <span>
                {isSearching ? "Accessing Archives..." : "Track Commission"}
              </span>
            </button>
            {trackError ? (
              <div className="border border-red-100 bg-red-50 text-red-800 px-5 py-4 text-xs font-light leading-relaxed flex items-start gap-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{trackError}</span>
              </div>
            ) : null}
          </form>
        </div>

        <AnimatePresence>
          {trackingResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-gray-100 gap-4">
                <div>
                  <h3 className="text-xl font-serif tracking-widest uppercase mb-2">
                    Commission #{trackingResult.displayId}
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    {trackingResult.request.artifact} / Updated{" "}
                    {trackingResult.request.updated || "recently"}
                  </p>
                </div>
                <div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold">
                  {trackingResult.request.status}
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-8 space-y-12">
                <div className="absolute top-0 bottom-0 left-[11px] w-px bg-gray-100" />
                {trackingResult.steps.map((step, i) => (
                  <div key={i} className="relative">
                    <div
                      className={`absolute -left-[28px] top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${step.completed ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}
                    >
                      {step.completed && <CheckCircle2 size={12} />}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div>
                        <p
                          className={`text-[10px] uppercase tracking-[0.35em] mb-3 ${step.completed ? "text-amber-700" : "text-gray-300"}`}
                        >
                          {step.phase}
                        </p>
                        <h4
                          className={`text-xs uppercase tracking-widest font-bold mb-3 ${step.completed ? "text-black" : "text-gray-300"}`}
                        >
                          {step.status}
                        </h4>
                        <p className="text-xs text-gray-500 font-light leading-loose max-w-xl">
                          {step.text}
                        </p>
                        {step.active ? (
                          <p className="mt-3 text-[9px] uppercase tracking-[0.28em] text-amber-700 font-semibold">
                            Current atelier stage
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right flex items-center space-x-2 text-gray-400">
                        <Calendar size={12} />
                        <span className="text-[8px] uppercase tracking-widest">
                          Atelier Record
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-[#fafafa] border border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Package
                    className="text-amber-600"
                    size={24}
                    strokeWidth={1}
                  />
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold">
                      Need Assistance?
                    </h4>
                    <p className="text-[8px] uppercase tracking-widest text-gray-400 mt-1">
                      Contact our concierge for priority support.
                    </p>
                  </div>
                </div>
                <a
                  href="/contact"
                  className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1 hover:text-amber-600 hover:border-amber-600 transition-all"
                >
                  Support
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Footer />
    </main>
  );
}

const trackingStages = [
  {
    key: "Inquiry received",
    status: "Inquiry Received",
    text: "Your commission request has entered the atelier desk. The team is reviewing the project details and contact information.",
  },
  {
    key: "Quoted",
    status: "Quote Prepared",
    text: "The atelier is preparing or has sent scope, pricing, and timeline details for review.",
  },
  {
    key: "Accepted / deposit paid",
    status: "Accepted",
    text: "The commission has been accepted and is ready for production planning.",
  },
  {
    key: "Consultation",
    status: "Consultation",
    text: "The team is refining silhouettes, measurements, and design decisions with the client.",
  },
  {
    key: "Toile & Fittings",
    status: "Toile & Fittings",
    text: "Studio work is underway. Toile, fitting notes, and construction adjustments are being logged.",
  },
  {
    key: "Revisions requested",
    status: "Revisions Requested",
    text: "Requested revisions are being reviewed and folded into the commission process.",
  },
  {
    key: "Completed / delivered",
    status: "Completed / Delivered",
    text: "Final atelier review is complete and the commission is ready, delivered, or archived.",
  },
];

function buildTrackingSteps(request) {
  const currentStage = normalizeStage(request.stage || request.status);
  const currentStatus = normalizeStage(request.status);
  const currentIndex = Math.max(
    trackingStages.findIndex((step) => step.key === currentStage),
    trackingStages.findIndex((step) => step.key === currentStatus),
    0
  );

  return trackingStages.map((step, index) => ({
    phase: `Phase ${String(index + 1).padStart(2, "0")}`,
    status: step.status,
    text: step.text,
    completed: index <= currentIndex,
    active: index === currentIndex,
  }));
}

function normalizeStage(value = "") {
  const stage = String(value)
    .replace(/^In progress\s*-\s*/i, "")
    .replace(/&/g, "and")
    .trim()
    .toLowerCase();

  if (stage.includes("archived") || stage.includes("completed") || stage.includes("delivered")) {
    return "Completed / delivered";
  }

  if (stage.includes("revision")) {
    return "Revisions requested";
  }

  if (stage.includes("toile") || stage.includes("fitting")) {
    return "Toile & Fittings";
  }

  if (stage.includes("consultation")) {
    return "Consultation";
  }

  if (stage.includes("accepted") || stage.includes("deposit")) {
    return "Accepted / deposit paid";
  }

  if (stage.includes("quoted")) {
    return "Quoted";
  }

  return "Inquiry received";
}
