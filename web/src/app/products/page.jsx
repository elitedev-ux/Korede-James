import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { products } from "../../data/fashion-data";

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const visibleProducts = useMemo(() => {
    if (activeCategory === "All") {
      return products;
    }

    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="px-5 sm:px-6 pt-32 md:pt-40 pb-14 md:pb-20 border-b border-black/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="max-w-7xl mx-auto"
        >
          <p className="text-[10px] uppercase tracking-[0.5em] text-amber-700 font-semibold mb-7">
            Commission
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.48fr] gap-10 lg:gap-20 items-end">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif uppercase tracking-[0.16em] font-light leading-[1.08]">
              Commission Gallery
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-light leading-loose tracking-wide max-w-xl">
              Made-to-order forms from the atelier, arranged as a clear product
              gallery for browsing, saving, and beginning a custom commission.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="px-5 sm:px-6 py-12 md:py-16 border-b border-black/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-black/10 border border-black/10">
            {categories.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveCategory(label)}
                className={`px-4 py-4 text-[10px] uppercase tracking-[0.24em] font-semibold transition-colors ${
                  activeCategory === label
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-[#f7f7f5]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-6 py-14 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.42em] text-gray-400 mb-5">
                Available Forms
              </p>
              <h2 className="text-2xl md:text-4xl font-serif uppercase tracking-[0.18em] font-light">
                Select A Piece
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-x-5 sm:gap-y-16 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
