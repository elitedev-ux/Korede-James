import React from "react";
import { motion } from "motion/react";
import { Heart, ArrowRight } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import SectionTitle from "../../components/SectionTitle";
import useStore from "../../store/useStore";

export default function WishlistPage() {
  const { wishlist } = useStore();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-40 pb-32 px-6 max-w-7xl mx-auto">
        <SectionTitle title="The Wishlist" subtitle="Your Desired Artifacts" />

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <Heart size={48} className="text-gray-100 mb-8" strokeWidth={1} />
            <h3 className="text-xl font-serif tracking-widest uppercase mb-4">
              No artifacts saved
            </h3>
            <p className="text-gray-400 text-xs tracking-widest mb-12 uppercase">
              Explore our portfolio and save your favorite pieces here.
            </p>
            <a
              href="/products"
              className="bg-black text-white px-12 py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all"
            >
              Discover Portfolio
            </a>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
