import React, { useState } from 'react';
import Navbar from './components/Navbar';
import {} from 'react-icons/hi';

export default function Navbar({ setIsBookingModalOpen }) {
  // Encapsulating mobile drawer state inside the navbar component
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ================= HEADER NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gold-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-24 flex items-center justify-between">
          <div 
            className="flex flex-col cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="font-serif text-2xl tracking-luxury text-charcoal-dark font-medium">
              Rajyog Wedding Hall
            </span>
            <span className="text-[9px] tracking-ultra text-gold-deep font-sans uppercase -mt-1 font-semibold">
              The Essence of Modern Raj
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-10 text-xs font-sans tracking-luxury uppercase font-semibold text-charcoal-light">
            <a href="#about" className="hover:text-gold-deep transition-colors">About</a>
            <a href="#experiences" className="hover:text-gold-deep transition-colors">Experiences</a>
            <a href="#gallery" className="hover:text-gold-deep transition-colors">Gallery</a>
            <a href="#reviews" className="hover:text-gold-deep transition-colors">Reviews</a>
            <a href="#contact" className="hover:text-gold-deep transition-colors">Contact</a>
          </div>

          <div className="hidden md:block">
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-gold-deep hover:bg-gold-dark text-white px-8 py-3 text-xs font-sans tracking-luxury uppercase transition-all duration-300 font-semibold"
            >
              Reserve
            </button>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="md:hidden text-charcoal-dark"
            aria-label="Open Menu"
          >
            <HiMenu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu Layer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex justify-end">
          <div className="w-80 bg-white h-full p-8 flex flex-col space-y-8 shadow-2xl relative animate-fadeIn">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-charcoal-dark"
            >
              <HiX size={28} />
            </button>
            <div className="pt-8 flex flex-col space-y-6 text-sm font-sans tracking-luxury uppercase font-semibold text-charcoal-dark">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold-deep">About</a>
              <a href="#experiences" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold-deep">Experiences</a>
              <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold-deep">Gallery</a>
              <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold-deep">Reviews</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold-deep">Contact</a>
              <button 
                onClick={() => { setMobileMenuOpen(false); setIsBookingModalOpen(true); }}
                className="bg-gold-deep text-white w-full py-3.5 text-xs tracking-luxury font-semibold uppercase mt-4"
              >
                Reserve Space
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}