import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ProductCard from "../../../components/ProductCard";
import SectionTitle from "../../../components/SectionTitle";
import { collections, products } from "../../../data/fashion-data";

export default function CollectionDetailsPage({ params }) {
  const { id } = params;
  const collection = collections.find((c) => c.id === id);

  if (!collection) {
    return (
      <div className="pt-40 text-center uppercase tracking-widest">
        Collection not found
      </div>
    );
  }

  const collectionProducts = products
    .filter((p) => p.collection.includes(collection.year))
    .slice(0, 4);
  const otherCollections = collections.filter((c) => c.id !== collection.id);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2 }}
          src={collection.coverImage}
          alt={collection.title}
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 70%" }}
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-white/70 text-[10px] uppercase tracking-[0.6em] mb-4 font-medium"
          >
            {collection.year} Collection
          </motion.p>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white text-5xl md:text-7xl font-serif tracking-[0.2em] font-light uppercase"
          >
            {collection.title}
          </motion.h1>
        </div>
      </section>

      <section className="py-10 px-6 max-w-7xl mx-auto">
        <a
          href="/collections"
          className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-widest mb-5 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>All Collections</span>
        </a>

        <div className="mb-5 grid grid-cols-2 md:grid-cols-4 border-y border-gray-100">
          <MetaItem label="Launch Date" value="2025" />
          <MetaItem label="Chapter" value={collection.title} />
          <MetaItem label="Pieces" value={`${collectionProducts.length} Looks`} />
          <MetaItem label="Archive" value={collection.year} />
        </div>

        <div>
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            {collection.gallery.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative overflow-hidden bg-[#f8f8f6] shadow-[0_18px_60px_rgba(0,0,0,0.04)] ${i % 3 === 0 ? "md:col-span-2 aspect-[16/8]" : "aspect-[4/5]"}`}
              >
                <div className="absolute inset-0 border border-black/5 z-20 pointer-events-none" />
                <motion.img
                  src={img}
                  className="w-full h-full object-cover transition-[filter] duration-700 group-hover:grayscale-0"
                  initial={{ scale: 1.04 }}
                  whileInView={{ scale: 1 }}
                  whileHover={{ scale: 1.045 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute left-5 bottom-5 z-30 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  <span className="bg-white/90 px-4 py-2 text-[9px] uppercase tracking-[0.3em] font-semibold">
                    Frame {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products from Collection */}
      <section className="py-32 px-6 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Pieces of the Vision"
            subtitle="Selected Wearables"
            align="left"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {collectionProducts.length > 0 ? (
              collectionProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))
            ) : (
              <p className="text-gray-400 uppercase tracking-widest text-[10px]">
                Coming soon to the digital store.
              </p>
            )}
          </div>
        </div>
      </section>

      {otherCollections.length > 0 && (
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <SectionTitle title="Further Chapters" subtitle="Explore" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              {otherCollections.map((c) => (
                <a
                  href={`/collections/${c.id}`}
                  key={c.id}
                  className="group text-left"
                >
                  <div className="aspect-video overflow-hidden mb-6 bg-gray-100">
                    <img
                      src={c.coverImage}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-2">
                    {c.title}
                  </h4>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    {c.year}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="px-4 py-3 border-r border-gray-100 last:border-r-0">
      <p className="text-[8px] uppercase tracking-[0.32em] text-gray-400 mb-2">
        {label}
      </p>
      <p className="text-[10px] uppercase tracking-[0.22em] font-semibold">
        {value}
      </p>
    </div>
  );
}
