import React from "react";
import { motion } from "motion/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { products } from "../../data/fashion-data";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <Navbar />

      <section className="relative min-h-screen px-6 pt-32 pb-20 flex items-center overflow-hidden">
        <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-black/[0.035] hidden lg:block" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-7xl mx-auto w-full"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[0.78fr_1.22fr] gap-16 lg:gap-24 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.55em] text-amber-700 font-semibold mb-8">
                Commission
              </p>
              <h1 className="text-4xl md:text-6xl font-serif uppercase tracking-[0.24em] font-light leading-tight mb-10">
                Artifacts Made to Order
              </h1>
              <p className="text-sm md:text-base text-gray-500 font-light leading-loose tracking-wide max-w-xl">
                Every piece we create is made to order, handcrafted specifically
                for its future custodian. Select a foundational form below to
                begin tailoring your artifact.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.18 }}
              className="relative"
            >
              <div className="absolute -inset-5 border border-black/5" />
              <div className="absolute -left-8 top-8 bottom-8 w-px bg-black/10 hidden md:block" />
              <div className="relative overflow-hidden bg-[#f8f8f6] shadow-[0_40px_120px_rgba(0,0,0,0.08)]">
                <video
                  className="w-full aspect-[16/10] object-cover grayscale-[20%]"
                  src="/assets/hero2.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/15" />
              </div>
              <div className="mt-5 flex items-center justify-between text-[9px] uppercase tracking-[0.35em] text-gray-400">
                <span>Looping Study</span>
                <span>Lagos Archive</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="bg-white px-6 py-24 border-y border-black/5">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gray-400 mb-7">
            The Commission Room
          </p>
          <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-[0.28em] font-light">
            Enter The Archive
          </h2>
        </div>
      </section>

      <section className="px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-28">
            <div>
              <p className="text-[10px] uppercase tracking-[0.45em] text-amber-700 mb-6">
                Gallery
              </p>
              <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-[0.22em] font-light">
                Foundational Forms
              </h2>
            </div>
            <p className="max-w-sm text-xs uppercase tracking-[0.24em] leading-loose text-gray-400">
              Names and construction notes remain archived until you enter a
              form.
            </p>
          </div>

          <div className="space-y-32 md:space-y-44">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
