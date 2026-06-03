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
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 2000 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-40 pb-32 px-6 max-w-7xl mx-auto">
        <SectionTitle title="Shopping Bag" subtitle="Your Selection" />

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Cart Items */}
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
                      <p className="text-lg font-serif font-light">
                        ${item.price.toLocaleString()}
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

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#fafafa] p-10 border border-gray-100 sticky top-40">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 pb-4 border-b border-gray-200">
                  Order Summary
                </h3>
                <div className="space-y-6 mb-10">
                  <div className="flex justify-between text-xs tracking-widest">
                    <span className="text-gray-400 uppercase">Subtotal</span>
                    <span className="font-bold">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs tracking-widest">
                    <span className="text-gray-400 uppercase">Shipping</span>
                    <span className="font-bold">
                      {shipping === 0 ? "Complimentary" : `$${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs tracking-widest">
                    <span className="text-gray-400 uppercase">
                      Estimated Tax
                    </span>
                    <span className="font-bold">$0.00</span>
                  </div>
                  <div className="pt-6 border-t border-gray-200 flex justify-between items-end">
                    <span className="text-xs uppercase tracking-widest font-bold">
                      Total
                    </span>
                    <span className="text-2xl font-serif">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all flex items-center justify-center space-x-4 group">
                  <span>Proceed to Checkout</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </button>

                <p className="mt-8 text-center text-[8px] uppercase tracking-widest text-gray-400 leading-loose">
                  Complimentary worldwide shipping on orders over $2,000. Duties
                  and taxes calculated at checkout.
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
              Your bag is empty
            </h3>
            <p className="text-gray-400 text-xs tracking-widest mb-12 uppercase">
              Discover our latest artifacts and add them to your collection.
            </p>
            <a
              href="/products"
              className="bg-black text-white px-12 py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all"
            >
              Continue Shopping
            </a>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
