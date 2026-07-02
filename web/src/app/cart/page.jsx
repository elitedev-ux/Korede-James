import React from "react";
import { motion } from "motion/react";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import useStore from "../../store/useStore";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const subtotal = cart.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1),
    0,
  );
  const shipping = subtotal > 0 ? 75 : 0;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-40 pb-32 px-6 max-w-7xl mx-auto">
        <SectionTitle title="Commission Brief" subtitle="Your Selection" />

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Commission Items */}
            <div className="lg:col-span-2 space-y-12">
              {cart.map((item, i) => (
                <motion.div
                  key={`${item.id}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col sm:flex-row gap-8 pb-12 border-b border-gray-100 last:border-0"
                >
                  <div className="w-full sm:w-40 aspect-[3/4] bg-gray-50 overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-sm uppercase tracking-widest font-bold mb-1">
                          {item.name}
                        </h3>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">
                          {item.category}
                        </p>
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-gray-400">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-4 mb-auto text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-300">Size:</span>
                        <span className="text-black">{item.size}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-300">Color:</span>
                        <span className="text-black">{item.color}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                      <div className="flex items-center border border-gray-100">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.size,
                              item.color,
                              item.quantity - 1,
                            )
                          }
                          className="p-3 hover:text-amber-600 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.size,
                              item.color,
                              item.quantity + 1,
                            )
                          }
                          className="p-3 hover:text-amber-600 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(item.id, item.size, item.color)
                        }
                        className="text-gray-300 hover:text-red-500 transition-colors flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Commission Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#fafafa] p-10 border border-gray-100 sticky top-40">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 pb-4 border-b border-gray-200">
                  Commission Summary
                </h3>
                <div className="space-y-6 mb-10">
                  <div className="flex justify-between text-xs tracking-widest">
                    <span className="text-gray-400 uppercase">Subtotal</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs tracking-widest">
                    <span className="text-gray-400 uppercase">Transit</span>
                    <span className="font-bold">{formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-xs tracking-widest">
                    <span className="text-gray-400 uppercase">
                      Payment
                    </span>
                    <span className="font-bold">Due at checkout</span>
                  </div>
                  <div className="pt-6 border-t border-gray-200 flex justify-between items-end">
                    <span className="text-xs uppercase tracking-widest font-bold">
                      Total
                    </span>
                    <span className="text-2xl font-serif">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <a
                  href="/checkout"
                  className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all flex items-center justify-center space-x-4 group"
                >
                  <span>Review Commission</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </a>

                <p className="mt-8 text-center text-[8px] uppercase tracking-widest text-gray-400 leading-loose">
                  Payment is captured with your commission request and reviewed
                  by the atelier desk.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <ShoppingBag
              size={48}
              className="text-gray-100 mb-8"
              strokeWidth={1}
            />
            <h3 className="text-xl font-serif tracking-widest uppercase mb-4">
              No commission started
            </h3>
            <p className="text-gray-400 text-xs tracking-widest mb-12 uppercase">
              Discover our latest artifacts and begin a private commission.
            </p>
            <a
              href="/products"
              className="bg-black text-white px-12 py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all"
            >
              Explore Designs
            </a>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function formatCurrency(value) {
  return `\u00a3${Number(value || 0).toLocaleString()}`;
}
