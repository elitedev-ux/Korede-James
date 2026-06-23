import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import { collections } from "../data/fashion-data";
import "./page.css";

const heroVideo = "/assets/Hero%201.mp4?v=2";
const editorialVideo = "/assets/hero2.mp4?v=2";

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
    "/assets/freedom/freedom-gallery-01.jpg",
    "/assets/freedom/freedom-gallery-02.jpg",
    "/assets/freedom/freedom-gallery-replace1.jpeg",
    "/assets/freedom/freedom-gallery-04.jpg",
    "/assets/freedom/freedom-gallery-05.jpg",
    "/assets/freedom/freedom-gallery-06.jpg",
    "/assets/freedom/freedom-gallery-07.jpg",
  ];

  const editorialTiles = [
    {
      src: "/assets/freedom/freedom-preview-rectangular.jpg",
      tileClass: "home-editorial__tile--hero",
      imageClass: "home-editorial__image--preview",
    },
    {
      src: galleryImages[2],
      tileClass: "home-editorial__tile--portrait",
      imageClass: "home-editorial__image--red-horizontal",
    },
    {
      src: galleryImages[4],
      tileClass: "home-editorial__tile--portrait",
      imageClass: "home-editorial__image--jacket-close",
    },
    {
      src: "/assets/freedom/freedom-detail-01.jpg",
      tileClass: "home-editorial__tile--portrait",
      imageClass: "home-editorial__image--archive",
    },
    {
      src: galleryImages[3],
      tileClass: "home-editorial__tile--portrait",
      imageClass: "home-editorial__image--negative",
    },
    {
      src: galleryImages[1],
      tileClass: "home-editorial__tile--full",
      imageClass: "home-editorial__image--portrait",
    },
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
          className="home-hero__video absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
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
                Modern Heritage
              </motion.p>

              <motion.h1
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.9 }}
                className="home-hero__title text-white text-5xl md:text-8xl font-serif tracking-[0.2em] font-light uppercase mb-12"
              >
                Korede James
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
                  Explore Freedom
                </a>
                <a
                  href="/commission"
                  className="home-hero__button home-hero__button--secondary bg-transparent border border-white text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-white hover:text-black transition-all duration-300"
                >
                  Custom Design
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
            The Edit - Freedom
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
        <div className="home-editorial__grid">
          {editorialTiles.map((tile, index) => (
            <motion.div
              key={`${tile.src}-${index}`}
              className={`home-editorial__tile ${tile.tileClass} overflow-hidden group cursor-pointer`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: Math.min(index * 0.08, 0.3) }}
            >
              <img
                src={tile.src}
                alt=""
                className={`home-editorial__image ${tile.imageClass} transition-transform duration-700 group-hover:scale-105`}
              />
            </motion.div>
          ))}
        </div>

        <div className="home-editorial__row home-editorial__row--feature flex gap-[3px] w-full">
          <motion.div
            className="home-editorial__tile home-editorial__tile--narrow overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0 }}
          >
            <img
              src="/assets/freedom/freedom-detail-01.jpg"
              alt=""
              className="home-editorial__image home-editorial__image--archive transition-transform duration-700 group-hover:scale-105"
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
              className="home-editorial__image home-editorial__image--jacket transition-transform duration-700 group-hover:scale-105"
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
              className="home-editorial__image home-editorial__image--portrait transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
        </div>

        {/* Row 2 — landscape wide + two stacked portraits */}
        <div className="home-editorial__row home-editorial__row--split flex gap-[3px] w-full mt-[3px]">
          <motion.div
            className="home-editorial__tile home-editorial__tile--wide home-editorial__tile--freedom-frame overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            <img
              src="/assets/freedom/freedom-preview-rectangular.jpg"
              alt=""
              className="home-editorial__image home-editorial__image--preview"
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
                className="home-editorial__image home-editorial__image--red-horizontal transition-transform duration-700 group-hover:scale-105"
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
                className="home-editorial__image home-editorial__image--jacket-close transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          </div>
        </div>

        {/* Row 3 — single full-width cinematic strip */}
      </section>

      {/* Editorial Video + Look */}
      <section className="home-editorial-pair w-full bg-white">
        <div className="home-editorial-pair__panel home-editorial-pair__panel--video">
          <video
            className="home-editorial-pair__media"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={editorialVideo} type="video/mp4" />
          </video>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="home-editorial-pair__panel home-editorial-pair__panel--image"
        >
          <img
            src="/assets/freedom/freedom-cover.jpg"
            alt="Freedom collection"
            className="home-editorial-pair__media home-editorial-pair__image"
          />
          <div className="home-story__quote home-editorial-pair__quote absolute bg-white p-12 hidden md:block shadow-sm">
            <h4 className="text-xl font-serif mb-4 italic">
              "Freedom is carried, not inherited untouched."
            </h4>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">
              - Korede James
            </p>
          </div>
        </motion.div>
      </section>

      {/* Brand Story / Preview */}
      <section className="home-story py-32 bg-[#fafafa]">
        <div className="home-story__content max-w-3xl mx-auto px-6 text-center">
          <div>
            <SectionTitle
              title="Freedom"
              subtitle="The 2025 Collection"
            />
            <p className="text-gray-600 font-light leading-relaxed mb-8">
              Freedom is a meditation on Nigeria's independence in 1960, a
              return to a moment that promised the birth of a nation.
            </p>
            <p className="text-gray-600 font-light leading-relaxed mb-12">
              Through traditional Yoruba silhouettes and sartorial language, the
              collection asks what it means to carry the past while imagining the
              future.
            </p>
            <a
              href="/collections/freedom"
              className="inline-flex items-center space-x-4 text-[10px] uppercase tracking-[0.4em] font-semibold border-b border-black pb-2 hover:text-amber-600 hover:border-amber-600 transition-all group"
            >
              <span>View Collection</span>
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
        <SectionTitle title="The Collection" subtitle="Freedom" />
        <div className="grid grid-cols-1 max-w-4xl mx-auto">
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
