import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  Instagram,
  Headphones,
  MapPin,
  Globe,
  User,
} from "lucide-react";
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
    { name: "Commission", href: "/products" },
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

  const mobileMenuVariants = {
    closed: { opacity: 0 },
    open: {
      opacity: 1,
      transition: {
        duration: 0.22,
        ease: "easeOut",
        staggerChildren: 0.055,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.18, ease: "easeIn" },
    },
  };

  const mobileMenuItemVariants = {
    closed: { opacity: 0, y: 12, filter: "blur(4px)" },
    open: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const mobileMenuListVariants = {
    closed: {},
    open: {
      transition: {
        staggerChildren: 0.065,
        delayChildren: 0.04,
      },
    },
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
            aria-label="Open menu"
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
            <a
              href="/account"
              aria-label="Account"
              className="relative hover:text-amber-600 transition-colors"
            >
              <User size={20} strokeWidth={1.5} />
            </a>

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
                    Commission Brief
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
                      No commission started
                    </p>
                    <p className="text-[11px] text-gray-300 tracking-wide mb-8">
                      Discover our curated collection
                    </p>
                    <a
                      href="/products"
                      onClick={() => setIsCartOpen(false)}
                      className="bg-black text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-amber-800 transition-colors"
                    >
                      Explore Designs
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
                    Final pricing confirmed by the atelier
                  </p>
                  <a
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full bg-black text-white py-5 text-center text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-colors"
                  >
                    Review Commission
                  </a>
                  <button
                    onClick={() => setIsCartOpen(false)}
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
                            Initiate Commission
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
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className="fixed inset-0 bg-white z-[90] flex flex-col text-black"
          >
            <motion.div
              variants={mobileMenuItemVariants}
              className="grid grid-cols-[4rem_minmax(0,1fr)_4rem] items-center px-5 py-5 border-b border-black/10"
            >
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-400">
                Menu
              </span>
              <a
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="justify-self-center text-sm font-serif tracking-[0.32em] font-light uppercase"
              >
                Korede James
              </a>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="justify-self-end h-10 w-10 flex items-center justify-center"
              >
                <X size={21} strokeWidth={1.5} />
              </button>
            </motion.div>

            <motion.nav
              variants={mobileMenuItemVariants}
              className="flex-1 px-5 py-8"
              aria-label="Mobile menu"
            >
              <motion.div
                variants={mobileMenuListVariants}
                className="border-y border-black/10"
              >
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    variants={mobileMenuItemVariants}
                    href={link.href}
                    whileTap={{ x: 6 }}
                    className="group flex min-h-16 items-center justify-between border-b border-black/10 py-4 last:border-b-0"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-[10px] uppercase tracking-[0.28em] text-gray-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-right text-[17px] font-medium uppercase tracking-[0.22em] transition-transform duration-300 group-hover:translate-x-1">
                      {link.name}
                    </span>
                  </motion.a>
                ))}
              </motion.div>
            </motion.nav>

            <motion.div
              variants={mobileMenuItemVariants}
              className="border-t border-black/10 px-5 py-5"
            >
              <div className="mb-5 grid grid-cols-3 gap-px bg-black/10">
                <a
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 bg-white px-2 py-4 text-center text-[9px] uppercase tracking-[0.12em] font-semibold transition-colors hover:bg-gray-50"
                >
                  <User size={13} strokeWidth={1.6} />
                  <span>Account</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openWishlist();
                  }}
                  className="flex items-center justify-center gap-1.5 bg-white px-2 py-4 text-center text-[9px] uppercase tracking-[0.12em] font-semibold transition-colors hover:bg-gray-50"
                >
                  <Heart size={13} strokeWidth={1.6} />
                  <span>
                    Wishlist{" "}
                    {wishlist.length > 0 ? `(${wishlist.length})` : ""}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openCart();
                  }}
                  className="flex items-center justify-center gap-1.5 bg-white px-2 py-4 text-center text-[9px] uppercase tracking-[0.12em] font-semibold transition-colors hover:bg-gray-50"
                >
                  <ShoppingBag size={13} strokeWidth={1.6} />
                  <span>Bag {cartCount > 0 ? `(${cartCount})` : ""}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                <a
                  href="#"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Instagram size={13} strokeWidth={1.5} />
                  Instagram
                </a>
                <a
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Headphones size={13} strokeWidth={1.5} />
                  Support Care
                </a>
                <span className="flex items-center gap-2">
                  <MapPin size={13} strokeWidth={1.5} />
                  Nigeria
                </span>
                <span className="flex items-center gap-2">
                  <Globe size={13} strokeWidth={1.5} />
                  English
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
