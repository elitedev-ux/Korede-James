import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Heart, Menu, X, Plus, Minus, Trash2 } from "lucide-react";
import useStore from "../store/useStore";
import "./Navbar.css";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const shouldLock = isCartOpen || isWishlistOpen || isMobileMenuOpen;

    if (!shouldLock) {
      return;
    }

    const scrollY = window.scrollY;
    const previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
    };

    document.documentElement.classList.add("app-scroll-locked");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.documentElement.classList.remove("app-scroll-locked");
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.left = previousBodyStyles.left;
      document.body.style.right = previousBodyStyles.right;
      document.body.style.width = previousBodyStyles.width;
      window.scrollTo(0, scrollY);
    };
  }, [isCartOpen, isWishlistOpen, isMobileMenuOpen]);

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: "Portfolio", href: "/collections" },
    { name: "Shop", href: "/products" },
    { name: "Commission", href: "/commission" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const openCart = () => {
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };
  const openWishlist = () => {
    setIsCartOpen(false);
    setIsWishlistOpen(true);
  };

  return (
    <>
      <nav
        className={`site-navbar fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? "bg-white/90 backdrop-blur-md py-4 shadow-sm" : "bg-transparent py-6"}`}
      >
        <div className="site-navbar__inner w-full px-8 lg:px-16 flex justify-between items-center">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-black"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Desktop Nav Links (Left) */}
          <div className="hidden lg:flex space-x-8">
            {navLinks.slice(0, 3).map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-[0.2em] font-medium hover:text-amber-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Brand Logo */}
          <a
            href="/"
            className="site-navbar__brand absolute left-1/2 -translate-x-1/2 text-2xl font-serif tracking-[0.3em] font-light uppercase"
          >
            Korede James
          </a>

          {/* Right: nav links + icons */}
          <div className="site-navbar__actions flex items-center space-x-6">
            <div className="hidden lg:flex space-x-8 mr-8">
              {navLinks.slice(3).map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-xs uppercase tracking-[0.2em] font-medium hover:text-amber-600 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Wishlist Icon */}
            <button
              onClick={openWishlist}
              className="relative hover:text-amber-600 transition-colors"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="relative hover:text-amber-600 transition-colors"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── CART DRAWER ─────────────────────────────────────── */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 z-[70]"
              onClick={() => setIsCartOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[80] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-7 border-b border-gray-100">
                <div>
                  <h2 className="text-sm uppercase tracking-[0.3em] font-semibold">
                    Shopping Bag
                  </h2>
                  <p className="text-[10px] text-gray-400 tracking-widest mt-1 uppercase">
                    {cartCount} item{cartCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="hover:text-amber-600 transition-colors"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <ShoppingBag
                      size={48}
                      strokeWidth={1}
                      className="text-gray-200 mb-6"
                    />
                    <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">
                      Your bag is empty
                    </p>
                    <p className="text-[11px] text-gray-300 tracking-wide mb-8">
                      Discover our curated collection
                    </p>
                    <a
                      href="/products"
                      onClick={() => setIsCartOpen(false)}
                      className="bg-black text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-amber-800 transition-colors"
                    >
                      Shop Now
                    </a>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color}`}
                      className="flex gap-5"
                    >
                      <a
                        href={`/products/${item.id}`}
                        onClick={() => setIsCartOpen(false)}
                        className="shrink-0 w-24 h-28 bg-gray-100 overflow-hidden"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </a>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="text-xs uppercase tracking-widest font-semibold leading-tight">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                            {item.size} · {item.color}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          {/* Quantity */}
                          <div className="flex items-center border border-gray-200">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.size,
                                  item.color,
                                  item.quantity - 1,
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center text-xs font-medium">
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
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              £{(item.price * item.quantity).toLocaleString()}
                            </span>
                            <button
                              onClick={() =>
                                removeFromCart(item.id, item.size, item.color)
                              }
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="px-8 py-7 border-t border-gray-100 space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                      Subtotal
                    </span>
                    <span className="text-lg font-serif">
                      £{cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                    Shipping & duties calculated at checkout
                  </p>
                  <button className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-colors">
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full border border-gray-200 py-4 text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── WISHLIST DRAWER ──────────────────────────────────── */}
      <AnimatePresence>
        {isWishlistOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 z-[70]"
              onClick={() => setIsWishlistOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[80] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-7 border-b border-gray-100">
                <div>
                  <h2 className="text-sm uppercase tracking-[0.3em] font-semibold">
                    Wishlist
                  </h2>
                  <p className="text-[10px] text-gray-400 tracking-widest mt-1 uppercase">
                    {wishlist.length} saved piece
                    {wishlist.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="hover:text-amber-600 transition-colors"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                {wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <Heart
                      size={48}
                      strokeWidth={1}
                      className="text-gray-200 mb-6"
                    />
                    <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">
                      No saved pieces
                    </p>
                    <p className="text-[11px] text-gray-300 tracking-wide mb-8">
                      Save your favourite items here
                    </p>
                    <a
                      href="/products"
                      onClick={() => setIsWishlistOpen(false)}
                      className="bg-black text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-amber-800 transition-colors"
                    >
                      Explore Collection
                    </a>
                  </div>
                ) : (
                  wishlist.map((item) => (
                    <div key={item.id} className="flex gap-5">
                      <a
                        href={`/products/${item.id}`}
                        onClick={() => setIsWishlistOpen(false)}
                        className="shrink-0 w-24 h-28 bg-gray-100 overflow-hidden"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </a>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="text-xs uppercase tracking-widest font-semibold leading-tight">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                            {item.category}
                          </p>
                          <p className="text-sm font-medium mt-2">
                            £{item.price?.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              addToCart(
                                item,
                                item.sizes?.[0] || "S",
                                item.colors?.[0] || "Default",
                              );
                            }}
                            className="flex-1 bg-black text-white py-2.5 text-[9px] uppercase tracking-[0.3em] font-semibold hover:bg-amber-800 transition-colors"
                          >
                            Move to Bag
                          </button>
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="w-9 h-9 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-200 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {wishlist.length > 0 && (
                <div className="px-8 py-7 border-t border-gray-100 space-y-4">
                  <button
                    onClick={() => setIsWishlistOpen(false)}
                    className="w-full border border-gray-200 py-4 text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-gray-50 transition-colors"
                  >
                    Continue Browsing
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE MENU ─────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col p-10"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-serif tracking-[0.2em] font-light uppercase">
                Korede James
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col space-y-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-2xl font-light uppercase tracking-[0.1em] border-b border-gray-100 pb-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="mt-auto pt-10 border-t border-gray-100 flex space-x-6 text-gray-500">
              <a href="#" className="text-sm">
                Instagram
              </a>
              <a href="#" className="text-sm">
                Pinterest
              </a>
              <a href="#" className="text-sm">
                Vogue
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
