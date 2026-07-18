import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  HiChevronDown, 
  HiChevronLeft, 
  HiChevronRight, 
  HiStar, 
  HiCheckCircle, 
  HiLocationMarker, 
  HiPhone, 
  HiMail,
  HiX,
  HiMenu
} from 'react-icons/hi';

const IMAGES = {
  heroBg: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000",
  diningTable: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000",
  maharajaSuite: "https://images.unsplash.com/photo-1505232458627-539c9f281a1d?auto=format&fit=crop&q=80&w=800",
  shahiVivah: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=800",
  receptionCourtyard: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800",
  gallery1: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600",
  gallery2: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=600",
  gallery3: "https://images.unsplash.com/photo-1507504038482-76210f6ec33d?auto=format&fit=crop&q=80&w=600",
};

const API_BOOKINGS_URL = 'http://localhost:5000/api/bookings';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(13); // Default preset date matching image_c66bf2.jpg
  const [bookedDates, setBookedDates] = useState([3, 8, 12, 19, 24]); // Hardcoded baseline fallback
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Client Form, 2: Invoice Verification, 3: Success Screen
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '500',
    packageSelected: 'The Shahi Vivah'
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const [bookingId, setBookingId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [depositAmount, setDepositAmount] = useState(150000);
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      question: "What is the maximum guest capacity?",
      answer: "Rajyog Mangal Karyalay comfortably accommodates up to 3000 guests for seating banquets and reception events, with spacious movement corridors."
    },
    {
      question: "Do you offer in-house catering?",
      answer: "Yes, our team of world-class gourmet chefs specialize in premium traditional Maharashtrian cuisine, North Indian banquets, and customized international live counters."
    },
    {
      question: "Is there parking for our guests?",
      answer: "We provide secure, on-site valet parking service for over 250 luxury vehicles with direct entry pathways into the main courtyards."
    }
  ];

  useEffect(() => {
    fetchBookedDates();
  }, []);

  const fetchBookedDates = async () => {
    setCalendarLoading(true);
    try {
      const response = await axios.get(`${API_BOOKINGS_URL}/booked-dates`);
      if (response.data && response.data.success) {
        setBookedDates(response.data.bookedDates);
      }
    } catch (error) {
      console.warn("Using baseline fallback calendar bookings:", error.message);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    let errors = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.email.match(/^\S+@\S+$/)) errors.email = "Please enter a valid email address";
    if (!formData.phone.match(/^\d{10}$/)) errors.phone = "Enter a valid 10-digit phone number";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BOOKINGS_URL}/reserve`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        eventDate: selectedDate,
        guests: Number(formData.guests),
        packageSelected: formData.packageSelected
      });

      if (response.data && response.data.success) {
        setBookingId(response.data.bookingId);
        setTransactionId(response.data.transactionId);
        setDepositAmount(response.data.depositAmount || 150000);
        setBookingStep(2); // Move to Invoice Verification
      }
    } catch (error) {
      const serverMsg = error.response?.data?.message || 'Server reservation failed. Please try again.';
      setApiError(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSimulation = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const response = await axios.post(`${API_BOOKINGS_URL}/verify`, {
        bookingId,
        transactionId
      });

      if (response.data && response.data.success) {
        setBookingStep(3); // Go to Success Screen
        fetchBookedDates(); // Reload dates immediately to lock calendar
      }
    } catch (error) {
      const serverMsg = error.response?.data?.message || 'Payment simulation failed. Please try again.';
      setApiError(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetBookingForm = () => {
    setIsBookingModalOpen(false);
    setBookingStep(1);
    setApiError('');
    setFormData({ name: '', email: '', phone: '', guests: '500', packageSelected: 'The Shahi Vivah' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative">
      
      {/* ================= FIXED LUXURY HEADER NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#C5A880]/20 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-24 flex items-center justify-between">
          <div 
            className="flex flex-col cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="font-serif text-2xl tracking-luxury text-[#111111] font-medium">
              Rajyog Wedding Hall
            </span>
            <span className="text-[9px] tracking-ultra text-[#836822] font-sans uppercase -mt-1 font-semibold">
              The Essence of Modern Raj
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-10 text-xs font-sans tracking-luxury uppercase font-semibold text-[#555555]">
            <a href="#about" className="hover:text-[#836822] transition-colors">About</a>
            <a href="#experiences" className="hover:text-[#836822] transition-colors">Experiences</a>
            <a href="#gallery" className="hover:text-[#836822] transition-colors">Gallery</a>
            <a href="#reviews" className="hover:text-[#836822] transition-colors">Reviews</a>
            <a href="#contact" className="hover:text-[#836822] transition-colors">Contact</a>
          </div>

          <div className="hidden md:block">
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-[#836822] hover:bg-[#5C4716] text-white px-8 py-3 text-xs font-sans tracking-luxury uppercase transition-all duration-300 font-semibold"
            >
              Reserve
            </button>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="md:hidden text-[#111111]"
            aria-label="Open Menu"
          >
            <HiMenu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex justify-end">
          <div className="w-80 bg-white h-full p-8 flex flex-col space-y-8 shadow-2xl relative">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-[#111111]"
            >
              <HiX size={28} />
            </button>
            <div className="pt-8 flex flex-col space-y-6 text-sm font-sans tracking-luxury uppercase font-semibold text-[#111111]">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#836822]">About</a>
              <a href="#experiences" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#836822]">Experiences</a>
              <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#836822]">Gallery</a>
              <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#836822]">Reviews</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#836822]">Contact</a>
              <button 
                onClick={() => { setMobileMenuOpen(false); setIsBookingModalOpen(true); }}
                className="bg-[#836822] text-white w-full py-3.5 text-xs tracking-luxury font-semibold uppercase mt-4"
              >
                Reserve Space
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HERO BANNER SECTION (Ref: image_c66bf2.jpg) ================= */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={IMAGES.heroBg} 
            alt="Rajyog Royal Interior Backdrop" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 text-white px-4">
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-wide leading-tight">
            Where Royal Dreams Find <br className="hidden sm:inline"/> Their Home
          </h1>
          <p className="text-sm sm:text-base font-sans tracking-wide text-gray-200/90 font-light max-w-2xl mx-auto leading-relaxed">
            Experience the pinnacle of Indian luxury and heritage in Pune, the premier destination for grand celebrations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full sm:w-auto bg-[#836822] hover:bg-[#5C4716] text-white px-10 py-4 text-xs font-sans tracking-luxury uppercase transition-all duration-300 font-semibold"
            >
              Reserve Space
            </button>
            <a 
              href="#dates"
              className="w-full sm:w-auto border border-white hover:bg-white hover:text-[#111111] text-white px-10 py-4 text-xs font-sans tracking-luxury uppercase transition-all duration-300 font-semibold"
            >
              Check Availability
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/75 animate-bounce">
          <span className="text-[10px] tracking-ultra font-sans uppercase block mb-1">Scroll</span>
          <HiChevronDown size={20} className="mx-auto" />
        </div>
      </section>

      {/* ================= FLOATING COUNTER STATS BANNER ================= */}
      <section className="relative z-20 max-w-5xl mx-auto px-6 -mt-12">
        <div className="bg-white/95 backdrop-blur-md shadow-xl border border-[#C5A880]/20 py-8 px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="border-r border-[#C5A880]/20 last:border-0 px-2">
            <h3 className="font-serif text-3xl text-[#836822] font-semibold">3000+</h3>
            <p className="text-[9px] tracking-widest text-[#555555] font-sans uppercase mt-1">Guest Capacity</p>
          </div>
          <div className="md:border-r border-[#C5A880]/20 last:border-0 px-2">
            <h3 className="font-serif text-3xl text-[#836822] font-semibold">25+</h3>
            <p className="text-[9px] tracking-widest text-[#555555] font-sans uppercase mt-1">Years of Tradition</p>
          </div>
          <div className="border-r border-[#C5A880]/20 last:border-0 px-2">
            <h3 className="font-serif text-3xl text-[#836822] font-semibold">5000+</h3>
            <p className="text-[9px] tracking-widest text-[#555555] font-sans uppercase mt-1">Happy Couples</p>
          </div>
          <div className="px-2">
            <h3 className="font-serif text-3xl text-[#836822] font-semibold">2500+</h3>
            <p className="text-[9px] tracking-widest text-[#555555] font-sans uppercase mt-1">Luxury Events</p>
          </div>
        </div>
      </section>

      {/* ================= INHERITANCE / THE ESSENCE OF MODERN RAJ ================= */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-6 lg:px-12 text-center">
        <span className="text-[11px] tracking-ultra text-[#836822] font-semibold font-sans uppercase block mb-3">Inheritance & Tradition</span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-medium mb-12">The Essence of Modern Raj</h2>
        
        <div className="flex justify-center items-center space-x-2 mb-16">
          <div className="w-12 h-[1px] bg-[#C5A880]/40"></div>
          <div className="w-2 h-2 rotate-45 border border-[#836822] bg-[#836822]"></div>
          <div className="w-12 h-[1px] bg-[#C5A880]/40"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-[#F5F1E9] rounded-full flex items-center justify-center mx-auto border border-[#C5A880]/20">
              <span className="font-serif text-lg text-[#836822] font-bold">I</span>
            </div>
            <h3 className="font-serif text-xl text-[#111111] font-medium">Royal Heritage Architecture</h3>
            <p className="text-xs text-[#555555] leading-relaxed font-light max-w-xs mx-auto">
              A seamless blend of classical Indian aesthetics and contemporary, minimal design, creating unparalleled structural majesty.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-14 h-14 bg-[#F5F1E9] rounded-full flex items-center justify-center mx-auto border border-[#C5A880]/20">
              <span className="font-serif text-lg text-[#836822] font-bold">II</span>
            </div>
            <h3 className="font-serif text-xl text-[#111111] font-medium">World-Class Hospitality</h3>
            <p className="text-xs text-[#555555] leading-relaxed font-light max-w-xs mx-auto">
              Our professional team guarantees refined, elegant guest management, ensuring every detail of your event is handled with prestige.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-14 h-14 bg-[#F5F1E9] rounded-full flex items-center justify-center mx-auto border border-[#C5A880]/20">
              <span className="font-serif text-lg text-[#836822] font-bold">III</span>
            </div>
            <h3 className="font-serif text-xl text-[#111111] font-medium">Exquisite Gourmet Cuisine</h3>
            <p className="text-xs text-[#555555] leading-relaxed font-light max-w-xs mx-auto">
              Master chefs curate customized banquet menus featuring authentic traditional recipes reimagined to delight world palates.
            </p>
          </div>
        </div>
      </section>

      {/* ================= UNCOMPROMISING LUXURY PREVIEW ================= */}
      <section className="py-20 bg-[#F2ECE1] border-y border-[#C5A880]/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-[11px] tracking-ultra text-[#836822] font-semibold font-sans uppercase block">Attention to Detail</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-medium leading-tight">Uncompromising Luxury</h2>
            <p className="text-sm text-[#555555] font-light leading-relaxed">
              From custom-commissioned gold cutlery to artisanal floral installations, every single element at Rajyog is a testament to refined taste and impeccable service.
            </p>

            <ul className="space-y-4 pt-4 text-xs tracking-wide text-[#111111] font-medium">
              <li className="flex items-center space-x-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#836822]"></span>
                <span>Bespoke Table Settings with Gold Accents</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#836822]"></span>
                <span>Symphonic Lighting & Sound Systems</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#836822]"></span>
                <span>Hand-Picked Floral Arrangements by Master Florists</span>
              </li>
            </ul>
          </div>

          <div className="relative group">
            <div className="absolute -inset-2 border border-[#C5A880]/40 transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
            <img 
              src={IMAGES.diningTable} 
              alt="Premium Wedding Dining Experience" 
              className="w-full h-[450px] object-cover relative z-10 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* ================= CURATED EXPERIENCES (PACKAGES) ================= */}
      <section id="experiences" className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-[11px] tracking-ultra text-[#836822] font-semibold font-sans uppercase block">Curated Experiences</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-medium">Signature Banquets & Suites</h2>
          <p className="text-xs text-[#555555] font-light leading-relaxed">
            Choose from our beautifully configured spaces and arrangements custom tailored to reflect your exact vision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Package 1 */}
          <div className="bg-white border border-[#C5A880]/20 hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full">
            <div className="h-64 overflow-hidden relative">
              <img 
                src={IMAGES.maharajaSuite} 
                alt="The Maharaja Suite" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/25"></div>
              <span className="absolute top-4 left-4 bg-white/90 text-[10px] tracking-widest font-sans uppercase px-3 py-1 text-[#836822] font-semibold">Bridal Retreat</span>
            </div>
            <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-serif text-xl text-[#111111] font-medium">The Maharaja Suite</h3>
                <p className="text-xs text-[#555555] leading-relaxed font-light">
                  Our premier luxurious dressing suite featuring classical detailing, private luxury bathrooms, and styling stations for the bridal group.
                </p>
              </div>
              <button 
                onClick={() => {
                  setFormData({ ...formData, packageSelected: 'The Maharaja Suite' });
                  setIsBookingModalOpen(true);
                }}
                className="w-full border border-[#C5A880] hover:border-[#836822] text-[#836822] text-[11px] tracking-luxury uppercase py-3 transition-colors font-semibold"
              >
                View Package Details
              </button>
            </div>
          </div>

          {/* Package 2 */}
          <div className="bg-white border border-[#C5A880]/20 hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full">
            <div className="h-64 overflow-hidden relative">
              <img 
                src={IMAGES.shahiVivah} 
                alt="The Shahi Vivah Hall" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/25"></div>
              <span className="absolute top-4 left-4 bg-white/90 text-[10px] tracking-widest font-sans uppercase px-3 py-1 text-[#836822] font-semibold">Main Arena</span>
            </div>
            <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-serif text-xl text-[#111111] font-medium">The Shahi Vivah</h3>
                <p className="text-xs text-[#555555] leading-relaxed font-light">
                  A grand historic ceremonial mandap hall engineered to deliver mesmerizing floral arrangements and customized ceremonial stages.
                </p>
              </div>
              <button 
                onClick={() => {
                  setFormData({ ...formData, packageSelected: 'The Shahi Vivah' });
                  setIsBookingModalOpen(true);
                }}
                className="w-full border border-[#C5A880] hover:border-[#836822] text-[#836822] text-[11px] tracking-luxury uppercase py-3 transition-colors font-semibold"
              >
                View Package Details
              </button>
            </div>
          </div>

          {/* Package 3 */}
          <div className="bg-white border border-[#C5A880]/20 hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full">
            <div className="h-64 overflow-hidden relative">
              <img 
                src={IMAGES.receptionCourtyard} 
                alt="The Great Reception Courtyard" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/25"></div>
              <span className="absolute top-4 left-4 bg-white/90 text-[10px] tracking-widest font-sans uppercase px-3 py-1 text-[#836822] font-semibold">Festive Garden</span>
            </div>
            <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-serif text-xl text-[#111111] font-medium">The Great Reception</h3>
                <p className="text-xs text-[#555555] leading-relaxed font-light">
                  An elegant open-air courtyard garden layout surrounded by traditional Rajasthani stone structures and atmospheric custom lighting.
                </p>
              </div>
              <button 
                onClick={() => {
                  setFormData({ ...formData, packageSelected: 'The Great Reception' });
                  setIsBookingModalOpen(true);
                }}
                className="w-full border border-[#C5A880] hover:border-[#836822] text-[#836822] text-[11px] tracking-luxury uppercase py-3 transition-colors font-semibold"
              >
                View Package Details
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GALLERY SECTION ================= */}
      <section id="gallery" className="py-20 bg-white border-t border-[#C5A880]/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
            <div>
              <span className="text-[11px] tracking-ultra text-[#836822] font-semibold font-sans uppercase block mb-2">Gallery</span>
              <h2 className="font-serif text-3xl text-[#111111] font-medium">A Glimpse Into Historic Celebrations</h2>
            </div>
            <a href="#gallery" className="text-xs text-[#836822] tracking-luxury uppercase font-semibold border-b border-[#836822] pb-1 hover:text-[#5C4716] mt-4 sm:mt-0">
              Portfolio Gallery &rarr;
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-96 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img src={IMAGES.gallery1} alt="Traditional Mandap Ceremony Details" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="h-96 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img src={IMAGES.gallery2} alt="Gourmet Food Layout Presentation" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="h-96 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img src={IMAGES.gallery3} alt="Palace Courtyard Night Lights" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIAL QUOTE ================= */}
      <section id="reviews" className="py-24 bg-[#FAF6F0] border-t border-[#C5A880]/15 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <span className="font-serif text-5xl text-[#C5A880]/50 leading-none select-none block">“</span>
          
          <div className="flex justify-center space-x-1 text-[#836822]">
            <HiStar size={20} /><HiStar size={20} /><HiStar size={20} /><HiStar size={20} /><HiStar size={20} />
          </div>

          <p className="font-serif text-lg sm:text-2xl text-[#111111] font-medium italic leading-relaxed">
            "Rajyog didn't just host our wedding; they crafted a masterpiece. The attention to detail in the Modern Raj aesthetic was exactly what we dreamed of - royal yet perfectly modern."
          </p>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-[#C5A880]/20 rounded-full flex items-center justify-center border border-[#836822] font-serif font-semibold text-[#836822] text-sm">
              AR
            </div>
            <h4 className="text-xs font-sans tracking-luxury uppercase font-bold text-[#111111] mt-2">Ananya & Rohan</h4>
            <p className="text-[9px] text-[#836822] tracking-wider font-semibold uppercase">March 2026 Event</p>
          </div>
        </div>
      </section>

      {/* ================= FAQs & CALENDAR WIDGET SECTION ================= */}
      <section id="dates" className="py-24 max-w-7xl mx-auto px-6 lg:px-12 border-t border-[#C5A880]/25">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* FAQ Accordion */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <span className="text-[11px] tracking-ultra text-[#836822] font-semibold font-sans uppercase block mb-2">Have Questions?</span>
              <h2 className="font-serif text-3xl text-[#111111] font-medium">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-[#C5A880]/30 pb-4">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex justify-between items-center text-left py-2 font-serif text-base text-[#111111] font-medium hover:text-[#836822] transition-colors focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <HiChevronDown 
                      size={20} 
                      className={`text-[#836822] transform transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${activeFaq === idx ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <p className="text-xs text-[#555555] font-light leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Calendar Widget (November 2026 Layout) */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-[#C5A880]/30 p-8 shadow-lg space-y-6">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-[#111111] font-medium">Check Preferred Dates</h3>
                <p className="text-xs text-[#555555] font-light leading-relaxed">
                  Enter your target wedding event date and see seasonal availability and current bookings.
                </p>
              </div>

              <div className="flex justify-between items-center border border-[#C5A880]/20 p-3 bg-[#FAF8F5]">
                <span className="text-xs font-sans tracking-luxury uppercase text-[#111111] font-semibold">November 2026</span>
                <div className="flex items-center space-x-2 text-[#111111]">
                  <button className="p-1 hover:text-[#836822]"><HiChevronLeft size={20} /></button>
                  <button className="p-1 hover:text-[#836822]"><HiChevronRight size={20} /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center text-[10px] text-[#555555] tracking-widest font-semibold uppercase border-b border-[#C5A880]/20 pb-2">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>

              <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-medium font-sans relative">
                {calendarLoading && (
                  <div className="absolute inset-0 bg-white/55 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <div className="w-5 h-5 border-2 border-[#836822] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {Array.from({ length: 30 }, (_, index) => {
                  const day = index + 1;
                  const isBooked = bookedDates.includes(day);
                  const isSelected = selectedDate === day;

                  return (
                    <button
                      key={day}
                      onClick={() => !isBooked && setSelectedDate(day)}
                      disabled={isBooked}
                      className={`relative w-8 h-8 mx-auto flex items-center justify-center transition-all ${
                        isBooked 
                          ? 'text-red-400 bg-red-50/50 cursor-not-allowed line-through' 
                          : isSelected 
                          ? 'bg-[#836822] text-white rounded-full font-bold' 
                          : 'hover:bg-[#C5A880]/10 text-[#111111] rounded-full'
                      }`}
                    >
                      {day}
                      {isSelected && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-start space-x-6 text-[10px] tracking-wider text-[#555555] font-medium pt-2">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-[#836822] rounded-full"></span>
                  <span>Available / Selected</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                  <span>Booked</span>
                </span>
              </div>

              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-[#836822] hover:bg-[#5C4716] text-white text-xs font-sans tracking-luxury font-semibold uppercase py-4 transition-all duration-300"
              >
                Request Preferred Dates
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="contact" className="bg-[#F2EFE9] text-[#111111] pt-20 pb-8 border-t border-[#C5A880]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-4">
            <h3 className="font-serif text-xl tracking-luxury font-medium">Rajyog Wedding Hall</h3>
            <p className="text-xs text-[#555555] leading-relaxed max-w-xs font-light">
              Crafting eternal memories through royal heritage architectural details and modern elegance.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-sans font-semibold tracking-luxury uppercase text-[#836822] mb-4">Space</h4>
            <ul className="space-y-2 text-xs text-[#555555] font-light">
              <li><a href="#experiences" className="hover:underline">The Maharaja Suite</a></li>
              <li><a href="#experiences" className="hover:underline">The Shahi Vivah Hall</a></li>
              <li><a href="#experiences" className="hover:underline">The Great Reception Courtyard</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-sans font-semibold tracking-luxury uppercase text-[#836822] mb-4">Planning</h4>
            <ul className="space-y-2 text-xs text-[#555555] font-light">
              <li><a href="#experiences" className="hover:underline">Wedding Packages</a></li>
              <li><a href="#experiences" className="hover:underline">Catering Menus</a></li>
              <li><Link to="/admin-login" className="hover:underline text-left text-[#836822] font-semibold">Manager Portal</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-sans font-semibold tracking-luxury uppercase text-[#836822] mb-4">Contact</h4>
            <div className="flex items-start space-x-2 text-xs text-[#555555] font-light">
              <HiLocationMarker className="text-[#836822] flex-shrink-0 mt-0.5" size={16} />
              <span>112, Royal Heritage Road, City Center, Pune, 411001</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#555555] font-light">
              <HiPhone className="text-[#836822] flex-shrink-0" size={16} />
              <span className="font-semibold text-[#111111]">+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#555555] font-light">
              <HiMail className="text-[#836822] flex-shrink-0" size={16} />
              <span>info@rajyogwedding.com</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 border-t border-[#C5A880]/20 flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#555555]/70 tracking-wider">
          <p>© {new Date().getFullYear()} Rajyog Wedding Hall. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* ================= INTERACTIVE RESERVATION MODAL DIALOG ================= */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-8 relative shadow-2xl border border-[#C5A880]/30">
            
            <button 
              onClick={resetBookingForm}
              className="absolute top-4 right-4 text-[#111111] hover:text-[#836822] transition-colors"
            >
              <HiX size={24} />
            </button>

            {apiError && (
              <div className="mb-4 bg-red-50 text-red-600 text-xs px-4 py-2.5 border-l-4 border-red-500 font-medium">
                {apiError}
              </div>
            )}

            {/* STEP 1: Main Client Form */}
            {bookingStep === 1 && (
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl text-charcoal-dark font-medium">Reserve Your Celebration</h3>
                  <p className="text-xs text-charcoal-light font-light font-sans">
                    Selected Date: <strong className="text-[#836822]">November {selectedDate}, 2026</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-sans tracking-luxury font-semibold uppercase text-[#111111] mb-1">Full Name</label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-[#C5A880]/40 p-2.5 text-xs focus:border-[#836822] focus:outline-none bg-[#FAF8F5]"
                      placeholder="e.g. Ramesh Kumar"
                    />
                    {formErrors.name && <p className="text-red-500 text-[10px] mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans tracking-luxury font-semibold uppercase text-[#111111] mb-1">Email Address</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-[#C5A880]/40 p-2.5 text-xs focus:border-[#836822] focus:outline-none bg-[#FAF8F5]"
                      placeholder="ramesh@gmail.com"
                    />
                    {formErrors.email && <p className="text-red-500 text-[10px] mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans tracking-luxury font-semibold uppercase text-[#111111] mb-1">Phone Number</label>
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-[#C5A880]/40 p-2.5 text-xs focus:border-[#836822] focus:outline-none bg-[#FAF8F5]"
                      placeholder="9876543210"
                    />
                    {formErrors.phone && <p className="text-red-500 text-[10px] mt-1">{formErrors.phone}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-sans tracking-luxury font-semibold uppercase text-[#111111] mb-1">Guests Capacity</label>
                      <select 
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        className="w-full border border-[#C5A880]/40 p-2.5 text-xs focus:border-[#836822] focus:outline-none bg-[#FAF8F5]"
                      >
                        <option value="500">Up to 500 Guests</option>
                        <option value="1500">Up to 1500 Guests</option>
                        <option value="3000">Up to 3000 Guests</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-sans tracking-luxury font-semibold uppercase text-[#111111] mb-1">Event Package</label>
                      <select 
                        value={formData.packageSelected}
                        onChange={(e) => setFormData({ ...formData, packageSelected: e.target.value })}
                        className="w-full border border-[#C5A880]/40 p-2.5 text-xs focus:border-[#836822] focus:outline-none bg-[#FAF8F5]"
                      >
                        <option value="The Maharaja Suite">The Maharaja Suite</option>
                        <option value="The Shahi Vivah">The Shahi Vivah</option>
                        <option value="The Great Reception">The Great Reception</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#836822] hover:bg-[#5C4716] text-white text-xs font-sans tracking-luxury font-semibold uppercase py-3.5 transition-all duration-300 flex justify-center items-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Proceed to Confirm"
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Invoice Quote Summary & Simulated Payment Processing */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl text-[#111111] font-medium">Verify Booking Invoice</h3>
                  <p className="text-xs text-[#555555] font-light font-mono">Invoice reference: #{transactionId}</p>
                </div>

                <div className="bg-[#FAF8F5] p-4 border border-[#C5A880]/20 rounded space-y-3 text-xs text-[#111111] font-sans">
                  <div className="flex justify-between">
                    <span className="text-[#555555] font-normal">Client Name:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555] font-normal">Email:</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555] font-normal">Contact:</span>
                    <span className="font-medium">+91 {formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555] font-normal">Event Date:</span>
                    <span className="font-medium text-[#836822] font-semibold">November {selectedDate}, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555] font-normal">Suite Selection:</span>
                    <span className="font-medium text-[#836822] font-semibold">{formData.packageSelected}</span>
                  </div>
                  <div className="border-t border-[#C5A880]/30 pt-3 flex justify-between font-bold text-sm">
                    <span>Estimated Deposit:</span>
                    <span className="text-[#836822]">₹{depositAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex space-x-3 font-sans">
                  <button 
                    onClick={() => { setBookingStep(1); setApiError(''); }}
                    className="w-1/3 border border-[#C5A880] hover:border-[#836822] text-[#111111] text-xs font-semibold tracking-luxury uppercase py-3"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handlePaymentSimulation}
                    disabled={isLoading}
                    className="w-2/3 bg-[#836822] hover:bg-[#5C4716] text-white text-xs font-semibold tracking-luxury uppercase py-3 flex justify-center items-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Confirm & Pay with Razorpay"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Complete Success Screen */}
            {bookingStep === 3 && (
              <div className="text-center space-y-6 py-4">
                <div className="flex justify-center text-emerald-500">
                  <HiCheckCircle size={64} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-[#111111] font-medium">Reservation Verified!</h3>
                  <p className="text-xs text-[#555555] font-light max-w-sm mx-auto font-sans leading-relaxed">
                    Your request for <strong className="text-[#111111]">November {selectedDate}, 2026</strong> has been received and saved into our database. Our luxury relationships officer will call you at <span className="font-semibold text-[#836822]">+91 {formData.phone}</span> to finalize your configurations.
                  </p>
                </div>

                <div className="bg-emerald-50 text-emerald-800 text-xs py-2 px-4 inline-block font-semibold rounded-full font-mono">
                  Receipt Verified: {transactionId}
                </div>

                <button 
                  onClick={resetBookingForm}
                  className="w-full bg-[#836822] hover:bg-[#5C4716] text-white text-xs font-sans tracking-luxury font-semibold uppercase py-3.5 transition-all duration-300"
                >
                  Return to Home
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}