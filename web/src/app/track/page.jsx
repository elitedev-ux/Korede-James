import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Package,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    setIsSearching(true);
    // Mock search delay
    setTimeout(() => {
      setIsSearching(false);
      setShowResult(true);
    }, 1500);
  };

  const steps = [
    {
      phase: "Phase 01",
      status: "Commission Logged",
      text: "Your directives, measurements, and palette selections have been archived. The atelier is preparing the foundational design forms.",
      completed: true,
    },
    {
      phase: "Phase 02",
      status: "Material Selection & Curation",
      text: "Our artisans are sourcing and inspecting the exact textiles or premium leathers for you.",
      completed: true,
    },
    {
      phase: "Phase 03",
      status: "The Cutting & Hand-Assembly",
      text: "The raw canvas and leather are being individually hand-cut and pieced together. The artifact is taking physical form in the workshop.",
      completed: true,
    },
    {
      phase: "Phase 04",
      status: "Archival Inspection & Numbering",
      text: "Korede James and the head couturiers review the final construction against your custom measurements. The piece is assigned its official archive serial number.",
      completed: false,
    },
    {
      phase: "Phase 05",
      status: "Transit to Custodian",
      text: "The finished artifact has left the atelier in its protective casing. It is currently en route to its permanent home.",
      completed: false,
    },
  ];

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
                placeholder="LA-2026-XXXX"
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
          </form>
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-gray-100 gap-4">
                <div>
                  <h3 className="text-xl font-serif tracking-widest uppercase mb-2">
                    Commission #KJ-2026-4812
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Estimated atelier timeline: 1 - 4 weeks
                  </p>
                </div>
                <div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold">
                  In Workshop
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-8 space-y-12">
                <div className="absolute top-0 bottom-0 left-[11px] w-px bg-gray-100" />
                {steps.map((step, i) => (
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
