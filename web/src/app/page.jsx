import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import { collections, testimonials } from "../data/fashion-data";
import "./page.css";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [showHeroContent, setShowHeroContent] = useState(false);

  useEffect(() => {
    if (showHeroContent) return;

    const fallbackTimer = window.setTimeout(() => {
      setShowHeroContent(true);
    }, 2200);

    return () => window.clearTimeout(fallbackTimer);
  }, [showHeroContent]);

  const galleryImages = [
    "https://images.unsplash.com/photo-1539109132314-3477524c8952?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1594932224010-7494f61f7e02?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1596755094514-f87034a2612d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200",
  ];

  return (
    <main className="home-page min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="home-hero relative h-screen w-full overflow-hidden bg-black">
        {/* Video background, autoplays once without looping */}
        <video
          autoPlay
          muted
          playsInline
          onEnded={() => setShowHeroContent(true)}
          onError={() => setShowHeroContent(true)}
          onStalled={() => setShowHeroContent(true)}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://raw.createusercontent.com/9eb4acf4-b754-4755-b977-7faaac7380b6/"
            type="video/mp4"
          />
        </video>

        {/* Always-on cinematic dark overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Overlay content, revealed after a short intro delay */}
        <AnimatePresence>
          {showHeroContent && (
            <motion.div
              key="hero-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="home-hero__content relative h-full flex flex-col items-center justify-center text-center px-6"
            >
              <motion.p
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.9 }}
                className="home-hero__eyebrow text-white text-xs uppercase tracking-[0.6em] mb-6 font-medium"
              >
                Spring Summer 2026
              </motion.p>

              <motion.h1
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.9 }}
                className="home-hero__title text-white text-5xl md:text-8xl font-serif tracking-[0.2em] font-light uppercase mb-12"
              >
                The Ethereal <br /> Dialogue
              </motion.h1>

              <motion.div
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.9 }}
                className="home-hero__actions flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8"
              >
                <a
                  href="/products"
                  className="home-hero__button home-hero__button--primary bg-white text-black px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-black hover:text-white transition-all duration-300"
                >
                  Explore Collection
                </a>
                <a
                  href="/commission"
                  className="home-hero__button home-hero__button--secondary bg-transparent border border-white text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-white hover:text-black transition-all duration-300"
                >
                  Commission Design
                </a>
              </motion.div>

              {/* Scroll indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white flex flex-col items-center"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-[8px] uppercase tracking-[0.4em] mb-2">
                    Scroll
                  </span>
                  <div className="w-px h-12 bg-white/30" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Editorial Gallery — full width, images only */}
      <section className="home-editorial w-full bg-white">
        {/* Slim header bar */}
        <div className="home-editorial__bar flex items-center justify-between px-8 lg:px-16 py-10">
          <span className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-medium">
            The Edit — SS 2026
          </span>
          <div className="home-editorial__rule flex-1 h-px bg-gray-100 mx-10" />
          <a
            href="/products"
            className="text-[9px] uppercase tracking-[0.4em] font-semibold flex items-center gap-2 hover:text-amber-600 transition-colors group"
          >
            View All
            <ArrowRight
              size={12}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
        </div>

        {/* Row 1 — three portrait images, middle one taller */}
        <div className="home-editorial__row home-editorial__row--feature flex gap-[3px] w-full">
          <motion.div
            className="home-editorial__tile home-editorial__tile--narrow overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0 }}
          >
            <img
              src={galleryImages[0]}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
          <motion.div
            className="home-editorial__tile home-editorial__tile--center overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            <img
              src={galleryImages[3]}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
          <motion.div
            className="home-editorial__tile home-editorial__tile--narrow overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <img
              src={galleryImages[1]}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
        </div>

        {/* Row 2 — landscape wide + two stacked portraits */}
        <div className="home-editorial__row home-editorial__row--split flex gap-[3px] w-full mt-[3px]">
          <motion.div
            className="home-editorial__tile home-editorial__tile--wide overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            <img
              src={galleryImages[6]}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
          <div className="home-editorial__stack flex flex-col gap-[3px]">
            <motion.div
              className="home-editorial__tile home-editorial__tile--stacked flex-1 overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              <img
                src={galleryImages[2]}
                alt=""
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
            <motion.div
              className="home-editorial__tile home-editorial__tile--stacked flex-1 overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3 }}
            >
              <img
                src={galleryImages[4]}
                alt=""
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          </div>
        </div>

        {/* Row 3 — single full-width cinematic strip */}
        <motion.div
          className="home-editorial__strip w-full overflow-hidden group cursor-pointer mt-[3px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.1 }}
        >
          <img
            src={galleryImages[5]}
            alt=""
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        </motion.div>
      </section>

      {/* Brand Story / Preview */}
      <section className="home-story py-32 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=1200"
              alt="Brand Heritage"
              className="home-story__image w-full object-cover"
            />
            <div className="home-story__quote absolute -bottom-10 -right-10 bg-white p-12 hidden md:block shadow-sm">
              <h4 className="text-xl font-serif mb-4 italic">
                "True luxury is silence."
              </h4>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                — Korede-james Founder
              </p>
            </div>
          </motion.div>
          <div>
            <SectionTitle
              title="Our Philosophy"
              subtitle="Heritage & Innovation"
              align="left"
            />
            <p className="text-gray-600 font-light leading-relaxed mb-8">
              Founded in the heart of Lagos, Korede-james embodies the delicate
              balance between timeless tradition and contemporary vision. Each
              piece is crafted with meticulous attention to detail, using only
              the finest organic materials sourced from family-run mills.
            </p>
            <p className="text-gray-600 font-light leading-relaxed mb-12">
              We believe in conscious luxury—creating garments that are not just
              worn, but cherished for generations.
            </p>
            <a
              href="/about"
              className="inline-flex items-center space-x-4 text-[10px] uppercase tracking-[0.4em] font-semibold border-b border-black pb-2 hover:text-amber-600 hover:border-amber-600 transition-all group"
            >
              <span>Learn Our Story</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Collections Portfolio */}
      <section className="home-portfolio py-32 px-6">
        <SectionTitle title="The Portfolio" subtitle="Through the years" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {collections.map((collection, index) => (
            <motion.a
              href={`/collections/${collection.id}`}
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="home-portfolio__card relative group overflow-hidden"
            >
              <img
                src={collection.coverImage}
                alt={collection.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                <span className="text-[10px] text-white/70 uppercase tracking-[0.4em] mb-4">
                  {collection.year}
                </span>
                <h3 className="text-2xl text-white font-serif tracking-[0.2em] uppercase mb-6">
                  {collection.title}
                </h3>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2 text-[10px] text-white uppercase tracking-widest border border-white/30 px-6 py-3">
                  <span>View Collection</span>
                  <ChevronRight size={14} />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="home-testimonials py-32 bg-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <SectionTitle title="Voices of Elegance" subtitle="Testimonials" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {testimonials.map((t) => (
              <div key={t.id} className="flex flex-col items-center">
                <p className="text-gray-600 font-light italic mb-8 leading-relaxed">
                  "{t.text}"
                </p>
                <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold">
                  {t.name}
                </h5>
                <span className="text-[9px] uppercase tracking-widest text-amber-600 mt-1">
                  {t.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="home-newsletter py-32 border-t border-gray-100 px-6 bg-[#fafafa]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif tracking-[0.2em] uppercase mb-6">
            Join the Inner Circle
          </h2>
          <p className="text-sm text-gray-500 font-light mb-12 tracking-wide">
            Subscribe to receive early access to new collections,
            behind-the-scenes insights, and exclusive invitations.
          </p>
          <form className="home-newsletter__form flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              className="flex-1 bg-white border border-gray-200 px-6 py-4 text-[10px] tracking-[0.2em] focus:outline-none focus:border-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="bg-black text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-amber-800 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
