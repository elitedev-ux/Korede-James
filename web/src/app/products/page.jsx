import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, ChevronDown, SlidersHorizontal } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import SectionTitle from "../../components/SectionTitle";
import { products } from "../../data/fashion-data";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    "All",
    "Evening Wear",
    "Outerwear",
    "Lounge",
    "Suits",
    "Casual",
  ];

  const filteredProducts = useMemo(() => {
    let result = products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())),
    );

    if (sort === "Price: Low to High") result.sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") result.sort((a, b) => b.price - a.price);

    return result;
  }, [category, search, sort]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-40 pb-20 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="The Collection"
            subtitle="Shop All"
            align="left"
          />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 mt-12">
            {/* Search Bar */}
            <div className="relative w-full md:w-96 group">
              <Search
                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="SEARCH PIECES..."
                className="w-full pl-8 pr-4 py-2 border-b border-gray-200 focus:outline-none focus:border-black text-[10px] uppercase tracking-widest"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-8 w-full md:w-auto">
              <div className="relative group flex items-center space-x-2 cursor-pointer">
                <span className="text-[10px] uppercase tracking-widest font-semibold">
                  Sort By: {sort}
                </span>
                <ChevronDown size={14} />
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 shadow-xl p-4 w-48 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20">
                  {["Newest", "Price: Low to High", "Price: High to Low"].map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => setSort(s)}
                        className="block w-full text-left text-[10px] uppercase tracking-widest py-2 hover:text-amber-600"
                      >
                        {s}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-semibold"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Bar */}
      <div className="sticky top-[72px] bg-white/80 backdrop-blur-md z-30 border-b border-gray-50 py-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 flex space-x-8 whitespace-nowrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-all ${category === cat ? "text-black border-b border-black pb-1" : "text-gray-400 hover:text-black"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto min-h-[600px]">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40">
            <Search size={40} className="text-gray-200 mb-6" />
            <p className="text-gray-400 text-xs uppercase tracking-widest">
              No pieces found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-6 text-[10px] uppercase tracking-widest underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination Mock */}
        <div className="mt-32 flex justify-center items-center space-x-4">
          <span className="w-10 h-px bg-black" />
          <div className="flex space-x-4 text-[10px] font-bold tracking-widest">
            <span className="text-black cursor-pointer">01</span>
            <span className="text-gray-300 cursor-pointer hover:text-black">
              02
            </span>
            <span className="text-gray-300 cursor-pointer hover:text-black">
              03
            </span>
          </div>
          <span className="w-10 h-px bg-gray-200" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
