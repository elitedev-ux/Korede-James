import React from "react";
import { motion } from "motion/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";

export default function AboutPage() {
  const values = [
    {
      title: "Conscious Craft",
      text: "We prioritize natural, biodegradable fibers and ethical labor practices across our entire supply chain.",
    },
    {
      title: "Timelessness",
      text: "Our designs transcend trends, focusing on silhouettes that remain relevant across decades.",
    },
    {
      title: "Artisanal Soul",
      text: "Every detail is hand-finished by master tailors who have dedicated their lives to the craft.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <SectionTitle
              title="The Essence of Korede-james"
              subtitle="Our Story"
              align="left"
            />
            <p className="text-xl font-serif italic text-gray-700 leading-relaxed mb-8">
              "We believe that true beauty is found in the quiet confidence of a
              perfectly tailored seam."
            </p>
            <p className="text-gray-500 font-light leading-relaxed tracking-wide mb-6">
              Founded in 2012 by creative director Korede James, Korede-james
              emerged from a desire to return to the roots of high-fashion:
              exceptional materials, unhurried craftsmanship, and a deep respect
              for the wearer's individuality.
            </p>
            <p className="text-gray-500 font-light leading-relaxed tracking-wide">
              What started as a small atelier in the heart of Lagos has grown
              into an international beacon of minimalist luxury, yet our core
              philosophy remains unchanged. We don't just make clothes; we
              create armor for the modern soul.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="aspect-[4/5] bg-gray-100 overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=1200"
              className="w-full h-full object-cover"
              alt="The Atelier"
            />
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 bg-[#fafafa] px-6">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="A Decade of Vision" subtitle="The Journey" />
          <div className="relative mt-20">
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gray-200 hidden md:block" />
            <div className="space-y-24">
              {[
                {
                  year: "2012",
                  event: "First atelier opened in Paris, Marais district.",
                },
                {
                  year: "2015",
                  event:
                    'Inaugural collection "The Silent Dawn" debuted at PFW.',
                },
                {
                  year: "2019",
                  event: "Global expansion with first flagship in New York.",
                },
                {
                  year: "2024",
                  event: "Commitment to 100% sustainable materials achieved.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex flex-col md:flex-row items-center ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-10`}
                >
                  <div className="flex-1 text-center md:text-right">
                    {i % 2 === 0 && (
                      <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2">
                        {item.year}
                      </p>
                    )}
                    {i % 2 === 0 && (
                      <p className="text-sm text-gray-500 font-light max-w-xs ml-auto">
                        {item.event}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center z-10 font-serif text-xs font-bold">
                    {item.year.slice(2)}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    {i % 2 !== 0 && (
                      <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2">
                        {item.year}
                      </p>
                    )}
                    {i % 2 !== 0 && (
                      <p className="text-sm text-gray-500 font-light max-w-xs mr-auto">
                        {item.event}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="text-center"
            >
              <h3 className="text-xs uppercase tracking-[0.4em] font-bold mb-6">
                {v.title}
              </h3>
              <p className="text-gray-500 font-light text-sm leading-relaxed">
                {v.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team/Designer */}
      <section className="py-32 bg-white px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
          <div className="w-full md:w-1/3 aspect-[3/4] bg-gray-100 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=800"
              className="w-full h-full object-cover grayscale"
              alt="Elena Vance"
            />
          </div>
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-[0.6em] text-amber-700 font-bold mb-4 block">
              THE VISIONARY
            </span>
            <h2 className="text-4xl font-serif tracking-widest uppercase font-light mb-8">
              Elena Vance
            </h2>
            <p className="text-gray-600 font-light leading-relaxed mb-8 tracking-wide">
              "My goal was never to change the fashion world, but to provide a
              sanctuary from it. Clothes should be a reflection of your inner
              peace, not a performance of your outer status."
            </p>
            <div className="flex space-x-8">
              <div className="text-center">
                <p className="text-2xl font-serif">14</p>
                <p className="text-[8px] uppercase tracking-widest text-gray-400">
                  Collections
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-serif">32</p>
                <p className="text-[8px] uppercase tracking-widest text-gray-400">
                  Awards
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-serif">100%</p>
                <p className="text-[8px] uppercase tracking-widest text-gray-400">
                  Handmade
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
