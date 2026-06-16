import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export default function ProductCard({ product, index = 0 }) {
  const isReversed = index % 2 === 1;
  const artifactNumber = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="group grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-16"
    >
      <motion.a
        href={`/products/${product.id}`}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={`relative block lg:col-span-8 overflow-hidden bg-[#f7f5f1] ${
          isReversed ? "lg:order-2" : ""
        }`}
      >
        <div className="absolute inset-0 border border-black/5 z-20 pointer-events-none" />
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent z-20" />
        <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent z-20" />
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.38), transparent 42%)",
          }}
        />
        <div className="relative aspect-[5/4] md:aspect-[16/10] overflow-hidden">
          <motion.img
            src={product.image}
            alt="Commission artifact"
            className="h-full w-full object-cover grayscale-[18%] transition-[filter] duration-700 group-hover:grayscale-0"
            whileHover={{ scale: 1.035 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute left-6 right-6 bottom-6 z-30 flex items-center justify-between gap-5 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <span className="bg-white/92 px-5 py-3 text-[10px] uppercase tracking-[0.32em] font-semibold">
            Enter Portal
          </span>
          <span className="h-11 w-11 bg-white/92 flex items-center justify-center">
            <ArrowUpRight size={15} />
          </span>
        </div>
      </motion.a>

      <div
        className={`lg:col-span-4 ${isReversed ? "lg:order-1 lg:text-right" : ""}`}
      >
        <motion.div
          initial={{ opacity: 0, x: isReversed ? -24 : 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, delay: 0.15 }}
          className="relative"
        >
          <p className="text-[10px] uppercase tracking-[0.55em] text-gray-300 mb-8">
            Artifact {artifactNumber}
          </p>
          <div
            className={`h-px w-24 bg-black mb-8 ${
              isReversed ? "lg:ml-auto" : ""
            }`}
          />
          <p className="text-sm md:text-base font-serif leading-loose text-gray-500">
            A foundational form held in reserve. Its name, measurements, and
            construction notes are revealed inside the commission portal.
          </p>
          <a
            href={`/products/${product.id}`}
            className="inline-flex items-center gap-4 mt-10 text-[10px] uppercase tracking-[0.35em] font-semibold border-b border-black pb-2 hover:text-amber-700 hover:border-amber-700 transition-colors"
          >
            Begin
            <ArrowUpRight size={13} />
          </a>
        </motion.div>
      </div>
    </motion.article>
  );
}
