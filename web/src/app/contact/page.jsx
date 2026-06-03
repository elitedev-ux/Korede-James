import React from "react";
import { motion } from "motion/react";
import { Phone, Mail, MapPin, Instagram, Twitter, Send } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-40 pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div>
            <SectionTitle
              title="Get in Touch"
              subtitle="Global Concierge"
              align="left"
            />
            <p className="text-gray-500 font-light leading-relaxed tracking-wide mb-12 max-w-md">
              Whether you have a question about our collections, require
              assistance with an order, or wish to schedule a private fitting,
              our dedicated concierge team is here to assist you.
            </p>

            <div className="space-y-10">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-[#fafafa] flex items-center justify-center shrink-0 border border-gray-100">
                  <Phone size={20} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">
                    Speak with us
                  </h4>
                  <p className="text-xs text-gray-500 font-light">
                    +33 1 23 45 67 89
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                    Mon - Fri, 9AM - 6PM CET
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-[#fafafa] flex items-center justify-center shrink-0 border border-gray-100">
                  <Mail size={20} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">
                    General Inquiries
                  </h4>
                  <p className="text-xs text-gray-500 font-light">
                    concierge@korede-james.com
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                    Response within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-[#fafafa] flex items-center justify-center shrink-0 border border-gray-100">
                  <MapPin size={20} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">
                    Our Atelier
                  </h4>
                  <p className="text-xs text-gray-500 font-light">
                    12 Avenue Montaigne, 75008 Paris, France
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                    By Appointment Only
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-20 pt-20 border-t border-gray-100">
              <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-8">
                Follow Our Story
              </h4>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold hover:text-amber-600 transition-colors"
                >
                  <Instagram size={16} />
                  <span>Instagram</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold hover:text-amber-600 transition-colors"
                >
                  <Twitter size={16} />
                  <span>Twitter</span>
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#fafafa] p-10 md:p-16 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-serif tracking-widest uppercase mb-10">
              Send a Message
            </h3>
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 px-6 py-4 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full bg-white border border-gray-200 px-6 py-4 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                  Subject
                </label>
                <select className="w-full bg-white border border-gray-200 px-6 py-4 text-sm focus:outline-none focus:border-black">
                  <option>Order Assistance</option>
                  <option>Fitting Appointment</option>
                  <option>Press & Media</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                  Message
                </label>
                <textarea
                  rows="6"
                  className="w-full bg-white border border-gray-200 px-6 py-4 text-sm focus:outline-none focus:border-black resize-none"
                  placeholder="How can we assist you today?"
                ></textarea>
              </div>
              <button className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all flex items-center justify-center space-x-4">
                <span>Submit Inquiry</span>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[400px] bg-gray-100 overflow-hidden relative group">
        <div className="absolute inset-0 grayscale opacity-50 group-hover:opacity-80 transition-opacity">
          <img
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-6 shadow-xl text-center">
            <MapPin
              className="text-black mx-auto mb-4"
              size={32}
              strokeWidth={1}
            />
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold">
              Korede-james Flagship
            </h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">
              Lagos, NG
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
