import React from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1"
          >
            <span className="text-[10px] uppercase tracking-[0.6em] text-amber-700 font-bold mb-4 block">
              ERROR 404
            </span>
            <h1 className="text-4xl md:text-6xl font-serif tracking-widest uppercase font-light mb-8">
              Out of Silhouette
            </h1>
            <p className="text-gray-500 font-light leading-relaxed tracking-wide mb-12 max-w-sm">
              The artifact you are seeking appears to have moved or does not
              exist in our current anthology.
            </p>
            <a
              href="/"
              className="inline-flex items-center space-x-6 bg-black text-white px-12 py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-2 transition-transform"
              />
              <span>Return Home</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="order-1 md:order-2 aspect-[3/4] bg-gray-50 overflow-hidden relative"
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200"
              className="w-full h-full object-cover grayscale opacity-80"
              alt="404 Fashion"
            />
            <div className="absolute inset-0 bg-white/10" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
