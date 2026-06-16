import React from "react";
import { Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#fafafa] pt-20 pb-10 border-t border-gray-100">
      <div className="w-full px-8 lg:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div>
          <h3 className="text-xl font-serif tracking-[0.2em] mb-6">
            KOREDE-JAMES
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed font-light">
            Crafting timeless elegance through sustainable luxury and artisanal
            craftsmanship. Each design is a dialogue between heritage, culture,
            and art.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold mb-6">
            Explore
          </h4>
          <ul className="space-y-4">
            <li>
              <a
                href="/collections"
                className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Portfolio
              </a>
            </li>
            <li>
              <a
                href="/products"
                className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Commission
              </a>
            </li>
            <li>
              <a
                href="/commission"
                className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Custom Design
              </a>
            </li>
            <li>
              <a
                href="/track"
                className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Track Commission
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold mb-6">
            Assistance
          </h4>
          <ul className="space-y-4">
            <li>
              <a
                href="/about"
                className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Our Story
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Contact Us
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Shipping & Returns
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Size Guide
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold mb-6">
            Connect
          </h4>
          <div className="flex space-x-4 mb-6">
            <a
              href="#"
              className="p-2 bg-white rounded-full border border-gray-100 hover:border-amber-600 transition-all"
            >
              <Instagram size={18} strokeWidth={1.5} />
            </a>
            <a
              href="#"
              className="p-2 bg-white rounded-full border border-gray-100 hover:border-amber-600 transition-all"
            >
              <Twitter size={18} strokeWidth={1.5} />
            </a>
            <a
              href="#"
              className="p-2 bg-white rounded-full border border-gray-100 hover:border-amber-600 transition-all"
            >
              <Mail size={18} strokeWidth={1.5} />
            </a>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <MapPin size={16} strokeWidth={1.5} />
              <span>Lagos, Nigeria</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <Phone size={16} strokeWidth={1.5} />
              <span>By appointment only</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-8 lg:px-16 pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-gray-400 font-medium">
        <p>© 2026 Korede-james. All rights reserved.</p>
        <div className="flex space-x-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-black">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-black">
            Terms of Service
          </a>
          <a href="#" className="hover:text-black">
            Accessibility
          </a>
        </div>
      </div>
    </footer>
  );
}
