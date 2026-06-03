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
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-white/70 text-[10px] uppercase tracking-[0.6em] mb-4 font-medium"
          >
            {collection.year} Anthology
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

      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 items-start">
          <div className="lg:col-span-1 sticky top-40">
            <a
              href="/collections"
              className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-widest mb-12 hover:text-amber-600 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>All Collections</span>
            </a>
            <h2 className="text-2xl font-serif tracking-widest uppercase mb-6">
              The Concept
            </h2>
            <p className="text-gray-500 font-light leading-relaxed tracking-wide text-sm">
              {collection.description}
            </p>
            <div className="mt-12 space-y-4">
              <div className="flex justify-between border-b border-gray-100 py-4">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">
                  Launch Date
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  March 2026
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-4">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">
                  Pieces
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  24 Items
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-12">
            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {collection.gallery.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`aspect-[3/4] overflow-hidden bg-gray-50 ${i % 3 === 0 ? "md:col-span-2 aspect-video" : ""}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
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

      {/* Related Collections */}
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

      <Footer />
    </main>
  );
}
