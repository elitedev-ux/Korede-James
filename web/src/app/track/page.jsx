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
      status: "Order Received",
      date: "May 12, 2026",
      time: "10:30 AM",
      completed: true,
    },
    {
      status: "Under Review",
      date: "May 12, 2026",
      time: "02:15 PM",
      completed: true,
    },
    {
      status: "In Production",
      date: "May 13, 2026",
      time: "09:00 AM",
      completed: true,
    },
    {
      status: "Quality Check",
      date: "May 20, 2026",
      time: "11:45 AM",
      completed: true,
    },
    {
      status: "Ready for Delivery",
      date: "May 24, 2026",
      time: "04:00 PM",
      completed: true,
    },
    {
      status: "Shipped",
      date: "May 25, 2026",
      time: "08:30 AM",
      completed: false,
    },
    { status: "Delivered", date: "TBD", time: "TBD", completed: false },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-40 pb-32 px-6 max-w-3xl mx-auto">
        <SectionTitle title="Track Your Order" subtitle="Delivery Status" />

        <div className="bg-[#fafafa] p-10 md:p-16 border border-gray-100 shadow-sm mb-16">
          <form onSubmit={handleTrack} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Order Number
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
                {isSearching ? "Accessing Archives..." : "Track Artifact"}
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
                    Order #LA-2026-4812
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Expected Delivery: May 28, 2026
                  </p>
                </div>
                <div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold">
                  In Transit
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
                        <h4
                          className={`text-xs uppercase tracking-widest font-bold ${step.completed ? "text-black" : "text-gray-300"}`}
                        >
                          {step.status}
                        </h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                          Location: Paris Distribution Hub
                        </p>
                      </div>
                      <div className="text-right flex items-center space-x-3 text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span className="text-[8px] uppercase tracking-widest">
                            {step.date}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span className="text-[8px] uppercase tracking-widest">
                            {step.time}
                          </span>
                        </div>
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
