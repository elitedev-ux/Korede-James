import React from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import useStore from "../store/useStore";

export default function ProductCard({ product }) {
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const isWishlisted = wishlist.find((item) => item.id === product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
        <a href={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </a>
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full transition-all hover:bg-white"
        >
          <Heart
            size={18}
            className={
              isWishlisted ? "fill-red-500 text-red-500" : "text-black"
            }
            strokeWidth={1.5}
          />
        </button>
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <a
          href={`/products/${product.id}`}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] bg-white/90 backdrop-blur-sm py-3 text-center text-[10px] uppercase tracking-[0.2em] font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
        >
          View Details
        </a>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs uppercase tracking-widest font-semibold mb-1 hover:text-amber-600 transition-colors">
            <a href={`/products/${product.id}`}>{product.name}</a>
          </h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            {product.category}
          </p>
        </div>
        <p className="text-sm font-light font-serif">
          ${product.price.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}
