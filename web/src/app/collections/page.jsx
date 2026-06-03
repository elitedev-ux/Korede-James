import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import { collections } from "../../data/fashion-data";

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="The Archives" subtitle="Annual Portfolio" />

          <div className="space-y-32">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 lg:gap-24 items-center`}
              >
                {/* Collection Image */}
                <div className="w-full lg:w-1/2 group overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={collection.coverImage}
                      alt={collection.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  </div>

                  {/* Mini Gallery Preview */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {collection.gallery.slice(0, 3).map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gray-100 overflow-hidden"
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Collection Details */}
                <div className="w-full lg:w-1/2">
                  <span className="text-[10px] uppercase tracking-[0.6em] text-amber-700 font-bold mb-4 block">
                    {collection.year} PORTFOLIO
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif tracking-widest uppercase font-light mb-8">
                    {collection.title}
                  </h2>
                  <p className="text-gray-500 font-light leading-relaxed mb-10 tracking-wide text-lg max-w-lg">
                    {collection.description}
                  </p>
                  <a
                    href={`/collections/${collection.id}`}
                    className="inline-flex items-center space-x-6 bg-black text-white px-12 py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all group"
                  >
                    <span>View Anthology</span>
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-2 transition-transform"
                    />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Callout */}
      <section className="py-40 bg-[#fafafa] px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <SectionTitle title="Timeless Vision" subtitle="Our Ethos" />
          <p className="text-gray-400 font-serif italic text-xl mb-12">
            "We do not create trends; we create artifacts of identity."
          </p>
          <div className="w-px h-24 bg-gray-200 mx-auto" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
