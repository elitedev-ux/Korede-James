import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export default function ProductCard({ product, index = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <motion.a
        href={`/products/${product.id}`}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative block overflow-hidden bg-white border border-black/10"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-white">
          <motion.img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700"
            whileHover={{ scale: 1.025 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        {product.archetype && (
          <div className="absolute left-4 top-4 hidden bg-white px-3 py-2 text-[9px] uppercase tracking-[0.26em] font-semibold text-black/70 md:block">
            {product.archetype}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 z-10 hidden translate-y-full bg-white/95 px-5 py-4 transition-transform duration-500 group-hover:translate-y-0 md:block">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] uppercase tracking-[0.28em] font-semibold">
              View Piece
            </span>
            <ArrowUpRight size={15} />
          </div>
        </div>
      </motion.a>
    </motion.article>
  );
}
