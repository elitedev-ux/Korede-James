import React from "react";
import { motion } from "motion/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";

const founderImage = "/assets/about/korede-james-founder.png";
const visionImage = "/assets/freedom/freedom-gallery-04.jpg";

export default function AboutPage() {
  const values = [
    {
      title: "Living Inheritance",
      text: "History is treated as something carried in the body, not kept behind glass. Each piece returns to memory while asking what can still be imagined.",
    },
    {
      title: "Yoruba Silhouette",
      text: "The garments draw from traditional Yoruba sartorial language, translating familiar forms into a restrained modern wardrobe.",
    },
    {
      title: "Quiet Construction",
      text: "The work favors exact lines, considered volume, and a sense of dignity that does not need to announce itself loudly.",
    },
  ];

  const milestones = [
    {
      year: "1960",
      title: "The Promise",
      text: "Freedom begins with Nigeria's independence, returning to a national moment that promised the birth of a new future.",
    },
    {
      year: "Now",
      title: "The Distance",
      text: "Through a modern Nigerian lens, the work reflects on the gap between liberation as an event and freedom as a lived experience.",
    },
    {
      year: "2025",
      title: "The Collection",
      text: "Freedom is presented as one focused body of work, shaped by white garments, red accents, and living inheritance.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 pb-28 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="max-w-2xl"
          >
            <SectionTitle
              title="Korede James"
              subtitle="Founder & Creative Director"
              align="left"
            />
            <p className="text-gray-500 font-light leading-relaxed tracking-wide mb-6">
              Korede James approaches clothing as a canvas for holding memory.
              His work begins with Nigeria, exploring the intersection of
              heritage and its interpretation through modern silhouettes for the
              contemporary man and woman.
            </p>
            <p className="text-gray-500 font-light leading-relaxed tracking-wide">
              Through traditional Yoruba silhouettes and a modern Nigerian
              perspective, the work interrogates what it means to carry our
              heritage and culture with elegance in modern society.
            </p>
          </motion.div>

          <motion.figure
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="bg-[#f4f2ed] overflow-hidden"
          >
            <img
              src={founderImage}
              className="w-full aspect-[4/5] object-cover object-[center_35%]"
              alt="Korede James"
            />
            <figcaption className="flex items-center justify-between px-6 py-5 text-[9px] uppercase tracking-[0.35em] text-gray-400">
              <span>Korede James</span>
              <span>Lagos, Nigeria</span>
            </figcaption>
          </motion.figure>
        </div>
      </section>

      <section className="py-28 bg-[#fafafa] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white overflow-hidden"
            >
              <img
                src={visionImage}
                alt="Freedom collection vision"
                className="w-full aspect-[4/5] object-cover object-[center_42%]"
              />
            </motion.div>
            <div>
              <SectionTitle
                title="Our Vision"
                subtitle="The Vision"
                align="left"
              />
              <p className="text-gray-600 font-light leading-loose tracking-wide mb-6">
                To redefine modern luxury by transforming ancestral heritage
                into living history, clothing the contemporary individual in
                their own history and sovereignty.
              </p>
              <p className="text-gray-600 font-light leading-loose tracking-wide">
                We envision a future where fashion is an act of reclamation and
                artifacts serve as a continuous dialogue between craft, culture,
                and modern society.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {milestones.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="border-t border-gray-200 pt-8"
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-amber-700 font-bold mb-5">
                {item.year}
              </p>
              <h3 className="text-xl font-serif uppercase tracking-[0.18em] mb-5">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-32 bg-white px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="The Language" subtitle="Principles" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <h3 className="text-xs uppercase tracking-[0.4em] font-bold mb-6">
                  {value.title}
                </h3>
                <p className="text-gray-500 font-light text-sm leading-relaxed">
                  {value.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
