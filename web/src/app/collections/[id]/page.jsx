import React from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
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
  const galleryLayout = [
    {
      src: "/assets/freedom/edit-window-red-legs-upright.jpg",
      className: "col-span-2 aspect-[4682/3344]",
      imageClassName: "object-[center_center]",
    },
    {
      src: "/assets/freedom/IMG_4143.jpeg",
      className: "aspect-[4/5]",
      imageClassName: "object-top",
    },
    {
      src: "/assets/freedom/edit-green-portrait.jpg",
      className: "aspect-[4/5]",
      imageClassName: "object-[center_36%]",
    },
    {
      src: "/assets/freedom/edit-room-bw.jpg",
      className: "col-span-2 aspect-[16/9]",
      imageClassName: "object-center",
    },
    {
      src: "/assets/freedom/edit-negative-window.jpg",
      className: "aspect-[4/5]",
      imageClassName: "object-[center_52%]",
    },
    {
      src: "/assets/freedom/edit-foliage-bw.jpg",
      className: "aspect-[4/5]",
      imageClassName: "object-[center_42%]",
    },
    {
      src: "/assets/freedom/edit-red-seated-upright.jpg",
      className: "col-span-2 aspect-[4572/3039]",
      imageClassName: "object-[center_center]",
    },
    {
      src: "/assets/freedom/IMG_3694.jpeg",
      className: "aspect-[2/3]",
      imageClassName: "object-center",
    },
    {
      src: "/assets/freedom/IMG_4139.jpeg",
      className: "aspect-[2/3]",
      imageClassName: "object-center",
    },
    {
      src: "/assets/freedom/IMG_3688.jpeg",
      className: "aspect-[2/3]",
      imageClassName: "object-center",
    },
    {
      src: "/assets/freedom/IMG_3384.jpeg",
      className: "aspect-[2/3]",
      imageClassName: "object-center",
    },
  ];

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
          <div className="collection-collage grid grid-cols-2 gap-0 md:gap-[3px]">
            {galleryLayout.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`collection-collage__frame ${item.className} overflow-hidden bg-[#f8f8f6]`}
              >
                <motion.img
                  src={item.src}
                  alt=""
                  className={`w-full h-full object-cover ${item.imageClassName}`}
                  initial={{ scale: 1.04 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products from Collection */}
      <section className="py-32 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Pieces from the Collection"
            align="left"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8">
            {collectionProducts.length > 0 ? (
              collectionProducts.map((p) => (
                <WearableCard key={p.id} product={p} />
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

function WearableCard({ product }) {
  return (
    <a
      href={`/products/${product.id}`}
      aria-label={`Open portal for ${product.name}`}
      className="group block"
    >
      <div className="aspect-[4/5] overflow-hidden bg-white">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
    </a>
  );
}
