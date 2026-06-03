import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Heart,
  ShoppingBag,
  ArrowLeft,
  Ruler,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ProductCard from "../../../components/ProductCard";
import SectionTitle from "../../../components/SectionTitle";
import { products } from "../../../data/fashion-data";
import useStore from "../../../store/useStore";

export default function ProductDetailsPage({ params }) {
  const { id } = params;
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImage, setActiveImage] = useState(product?.image);

  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const isWishlisted = wishlist.find((item) => item.id === product?.id);

  if (!product) {
    return (
      <div className="pt-40 text-center uppercase tracking-widest">
        Piece not found
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <a
          href="/products"
          className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-widest mb-12 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Collection</span>
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-gray-50">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[product.image, ...Array(3).fill(product.image)].map(
                (img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square overflow-hidden bg-gray-50 border-2 transition-all ${activeImage === img ? "border-black" : "border-transparent"}`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-10">
              <p className="text-[10px] uppercase tracking-[0.4em] text-amber-700 mb-2 font-semibold">
                {product.category}
              </p>
              <h1 className="text-4xl font-serif tracking-widest uppercase font-light mb-4">
                {product.name}
              </h1>
              <p className="text-2xl font-light font-serif">
                ${product.price.toLocaleString()}
              </p>
            </div>

            <p className="text-gray-500 font-light leading-relaxed mb-10 tracking-wide">
              {product.description}
            </p>

            {/* Selection */}
            <div className="space-y-8 mb-12">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase tracking-widest font-semibold">
                    Select Size
                  </span>
                  <button className="text-[8px] uppercase tracking-widest flex items-center space-x-1 underline opacity-60">
                    <Ruler size={12} />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 text-[10px] tracking-widest border transition-all ${selectedSize === size ? "bg-black text-white border-black" : "border-gray-200 hover:border-black"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold block mb-4">
                  Color: {selectedColor || "Choose a color"}
                </span>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${selectedColor === color ? "border-black" : "border-transparent"}`}
                    >
                      <div
                        className="w-full h-full rounded-full bg-gray-200"
                        title={color}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-4 mb-12">
              <button
                onClick={() => {
                  if (!selectedSize) {
                    alert("Please select a size");
                    return;
                  }
                  addToCart(product, selectedSize, selectedColor);
                }}
                className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-amber-800 transition-colors flex items-center justify-center space-x-3"
              >
                <ShoppingBag size={16} />
                <span>Add to Bag</span>
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={() => toggleWishlist(product)}
                  className="flex-1 border border-gray-200 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold hover:border-black transition-colors flex items-center justify-center space-x-2"
                >
                  <Heart
                    size={16}
                    className={isWishlisted ? "fill-red-500 text-red-500" : ""}
                  />
                  <span>{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
                </button>
                <a
                  href="/commission"
                  className="flex-1 bg-[#fafafa] border border-gray-100 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold text-center hover:bg-white hover:border-amber-600 transition-all"
                >
                  Commission Similar
                </a>
              </div>
            </div>

            {/* Collapsible Info (Mock) */}
            <div className="border-t border-gray-100 space-y-6 pt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold mb-3">
                    Fabric & Origin
                  </h4>
                  <p className="text-xs text-gray-500 font-light leading-loose">
                    {product.fabric}. Sourced from certified heritage mills.
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold mb-3">
                    Care Instructions
                  </h4>
                  <p className="text-xs text-gray-500 font-light leading-loose">
                    {product.care}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-8 pt-6">
                <div className="flex items-center space-x-2 text-[8px] uppercase tracking-widest text-gray-400">
                  <ShieldCheck size={14} strokeWidth={1.5} />
                  <span>Authenticity Guaranteed</span>
                </div>
                <div className="flex items-center space-x-2 text-[8px] uppercase tracking-widest text-gray-400">
                  <RefreshCw size={14} strokeWidth={1.5} />
                  <span>Ethically Produced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-32 px-6 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Complete the Look"
            subtitle="Recommended"
            align="left"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
