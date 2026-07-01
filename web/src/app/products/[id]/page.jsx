import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { products } from "../../../data/fashion-data";
import useStore from "../../../store/useStore";

const paletteSwatches = {
  White: "#f8f6f0",
  Red: "#9f1239",
  Black: "#111111",
  Ivory: "#f4ead8",
};

export default function ProductDetailsPage({ params }) {
  const { id } = params;
  const product = products.find((p) => p.id === id);
  const addToCart = useStore((state) => state.addToCart);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState("M");
  const [tailoringNotes, setTailoringNotes] = useState("");
  const [archivalNotes, setArchivalNotes] = useState("");

  if (!product) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-40 text-center uppercase tracking-widest">
          Artifact not found
        </div>
      </main>
    );
  }

  const handleSubmit = () => {
    addToCart(
      {
        ...product,
        tailoringNotes,
        archivalNotes,
      },
      selectedSize,
      selectedColor,
    );
    window.location.href = "/checkout";
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-28 px-6 max-w-7xl mx-auto">
        <a
          href="/products"
          className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-widest mb-16 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Gallery</span>
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] gap-20 items-start">
          <aside className="lg:sticky lg:top-28">
            <div className="bg-[#f8f8f6] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
          </aside>

          <section>
            <div className="mb-14">
              <p className="text-[10px] uppercase tracking-[0.45em] text-amber-700 font-semibold mb-5">
                {product.archetype}
              </p>
              <h1 className="text-3xl md:text-5xl font-serif uppercase tracking-[0.22em] font-light mb-7">
                {product.silhouette}
              </h1>
              <p className="text-sm text-gray-500 font-light leading-loose tracking-wide max-w-2xl">
                {product.description}
              </p>
            </div>

            <div className="space-y-14">
              <PortalStep number="01" title="Selected Artifact">
                <div className="flex items-center justify-between gap-8 border-y border-gray-100 py-6">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
                    Foundational form
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold text-right">
                    {product.name}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-8 border-b border-gray-100 py-6">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
                    Registered value
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold text-right">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              </PortalStep>

              <PortalStep number="02" title="The Palette">
                <div className="flex flex-wrap gap-4">
                  {[...new Set([...product.colors, "Black", "Ivory"])].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-3 border px-4 py-3 transition-colors ${
                        selectedColor === color
                          ? "border-black"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className="h-5 w-5 rounded-full border border-gray-200"
                        style={{
                          backgroundColor: paletteSwatches[color] || "#e5e5e5",
                        }}
                      />
                      <span className="text-[10px] uppercase tracking-[0.2em]">
                        {color}
                      </span>
                    </button>
                  ))}
                </div>
              </PortalStep>

              <PortalStep number="03" title="Proportions">
                <div className="space-y-8">
                  <div className="flex flex-wrap gap-4">
                    {["S", "M", "L"].map((size) => (
                      <label
                        key={size}
                        className={`flex items-center gap-3 border px-5 py-3 cursor-pointer transition-colors ${
                          selectedSize === size
                            ? "border-black"
                            : "border-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSize === size}
                          onChange={() => setSelectedSize(size)}
                          className="sr-only"
                        />
                        <span className="text-[10px] uppercase tracking-[0.3em]">
                          {size}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] font-semibold mb-4">
                      Tailoring Proportions
                    </label>
                    <textarea
                      rows="5"
                      value={tailoringNotes}
                      onChange={(event) => setTailoringNotes(event.target.value)}
                      className="w-full border border-gray-100 bg-[#fafafa] px-5 py-4 text-sm font-light focus:outline-none focus:border-black transition-colors resize-none"
                      placeholder="Add measurements, fit preferences, sleeve length, hem notes, or other proportional details."
                    />
                  </div>
                </div>
              </PortalStep>

              <PortalStep number="04" title="Archival Notes">
                <textarea
                  rows="6"
                  value={archivalNotes}
                  onChange={(event) => setArchivalNotes(event.target.value)}
                  className="w-full border border-gray-100 bg-[#fafafa] px-5 py-4 text-sm font-light focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="Share any symbolic, cultural, personal, or occasion-specific information our workshop should preserve."
                />
              </PortalStep>
            </div>

            <div className="mt-16">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-colors flex items-center justify-center gap-4"
              >
                <span>Submit Commission</span>
                <ArrowRight size={15} />
              </button>
              <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-gray-400 leading-loose">
                Upon submitting, our workshop requires 1-4 weeks to select
                materials, hand-cut, and construct your artifact. You can track
                the progress of your commission.
              </p>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function PortalStep({ number, title, children }) {
  return (
    <section>
      <div className="flex items-baseline gap-5 mb-7">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-300">
          {number}
        </span>
        <h2 className="text-sm font-serif uppercase tracking-[0.3em] font-light">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function formatCurrency(value) {
  return `\u00a3${Number(value || 0).toLocaleString()}`;
}
