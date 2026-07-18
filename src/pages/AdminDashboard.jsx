import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HiOutlineCalendar, 
  HiOutlineCash, 
  HiOutlineUserCircle, 
  HiOutlineCheck, 
  HiOutlineTrash, 
  HiLogout, 
  HiRefresh,
  HiX,
  HiOutlineExclamation
} from 'react-icons/hi';

const API_BOOKINGS_URL = 'http://localhost:5000/api/bookings';
const API_AUTH_URL = 'http://localhost:5000/api/auth';

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  const [adminProfile, setAdminProfile] = useState(null);
  const [adminBookingsList, setAdminBookingsList] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, bookingId: null, clientName: '' });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    if (adminToken) {
      fetchAdminProfile();
    }
  }, [adminToken]);

  const fetchAdminProfile = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const response = await axios.get(`${API_AUTH_URL}/profile`, config);
      if (response.data && response.data.success) {
        setAdminProfile(response.data.user);
        fetchAdminBookings();
      }
    } catch (error) {
      handleAdminLogout();
    }
  };

  const fetchAdminBookings = async () => {
    setDashboardLoading(true);
    setIsSyncing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const response = await axios.get(`${API_BOOKINGS_URL}/admin-all`, config).catch(() => {
        // Safe backend fallback handler: request active booked items
        return axios.get(`${API_BOOKINGS_URL}/booked-dates`);
      });

      if (response.data && response.data.success) {
        // Map database list to dashboard view rows
        const bookings = response.data.bookings || [];
        setAdminBookingsList(bookings);
      }
    } catch (error) {
      showToast('Could not fetch latest ledger updates. Please verify API endpoints.', 'error');
    } finally {
      setDashboardLoading(false);
      setIsSyncing(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleApprovePayment = async (bookingId, transactionId) => {
    try {
      const response = await axios.post(`${API_BOOKINGS_URL}/verify`, {
        bookingId,
        transactionId
      });

      if (response.data && response.data.success) {
        showToast('Payment verified successfully! Date locked on the public calendar.', 'success');
        fetchAdminBookings();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Verification update failed.';
      showToast(errorMsg, 'error');
    }
  };

  const triggerDeleteConfirmation = (bookingId, clientName) => {
    setDeleteConfirmation({ show: true, bookingId, clientName });
  };

  const handleConfirmCancelBooking = async () => {
    const { bookingId } = deleteConfirmation;
    if (!bookingId) return;

    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      await axios.delete(`${API_BOOKINGS_URL}/${bookingId}`, config);
      
      showToast('Wedding reservation successfully canceled and removed from the ledger.', 'success');
      setDeleteConfirmation({ show: false, bookingId: null, clientName: '' });
      fetchAdminBookings();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to cancel the reservation.';
      showToast(errorMsg, 'error');
      setDeleteConfirmation({ show: false, bookingId: null, clientName: '' });
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken('');
    setAdminProfile(null);
    setAdminBookingsList([]);
    window.location.href = '/'; // Simple redirect to landing layout
  };

  const confirmedRevenue = adminBookingsList
    .filter(b => b.paymentStatus === 'Completed')
    .reduce((sum, b) => sum + (b.depositAmount || 150000), 0);

  const pendingCount = adminBookingsList.filter(b => b.paymentStatus === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111] font-sans flex flex-col justify-between relative selection:bg-[#836822] selection:text-white">
      
      {/* ================= TOAST NOTIFICATION BANNER ================= */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center space-x-3 px-5 py-4 shadow-2xl border transition-all duration-300 animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-500/30 text-emerald-800' 
            : 'bg-rose-50 border-rose-500/30 text-rose-800'
        }`}>
          <div className="w-2 h-2 rounded-full animate-ping bg-current"></div>
          <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* ================= ADMIN NAVIGATION HEADER ================= */}
      <nav className="bg-white border-b border-[#C5A880]/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-serif text-xl tracking-luxury text-[#111111] font-medium uppercase">
              Rajyog Suite
            </span>
            <span className="text-[8px] tracking-ultra text-[#836822] font-semibold uppercase -mt-0.5">
              Administrative Control Console
            </span>
          </div>

          <div className="flex items-center space-x-6">
            {adminProfile && (
              <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold tracking-wide text-[#555555]">
                <HiOutlineUserCircle size={18} className="text-[#836822]" />
                <span>Hello, {adminProfile.username}</span>
                <span className="bg-[#FAF8F5] border border-[#C5A880]/20 text-[8px] px-2 py-0.5 uppercase tracking-widest text-[#836822] font-bold rounded">
                  {adminProfile.role}
                </span>
              </div>
            )}
            <button 
              onClick={handleAdminLogout}
              className="flex items-center space-x-1.5 border border-[#C5A880]/30 hover:border-[#836822] hover:text-[#836822] text-[#555555] px-4 py-2 text-[10px] tracking-widest font-bold uppercase transition-all"
            >
              <HiLogout size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ================= CORE CONSOLE CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex-grow w-full space-y-10">
        
        {/* Portal Greeting Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A880]/20 pb-6">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-wide text-[#111111]">Manager Dashboard</h1>
            <p className="text-xs text-[#555555] font-light mt-1">Real-time scheduling metrics and reservation approvals.</p>
          </div>
          <button 
            onClick={fetchAdminBookings}
            disabled={isSyncing}
            className="self-start sm:self-center flex items-center space-x-2 bg-[#836822] hover:bg-[#5C4716] text-white px-5 py-3 text-[10px] tracking-widest font-bold uppercase transition-all duration-300 disabled:opacity-50"
          >
            <HiRefresh className={`transform ${isSyncing ? 'animate-spin' : ''}`} size={14} />
            <span>Sync Ledger</span>
          </button>
        </div>

        {/* ================= ANALYTICS METRIC PANEL ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Reservations */}
          <div className="bg-white border border-[#C5A880]/20 p-6 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#836822] border border-[#C5A880]/15">
              <HiOutlineCalendar size={22} />
            </div>
            <div>
              <h3 className="text-[10px] tracking-luxury text-[#555555] font-semibold uppercase">Scheduled Weddings</h3>
              <p className="text-3xl font-serif text-[#111111] mt-1 font-semibold">{adminBookingsList.length}</p>
            </div>
          </div>

          {/* Card 2: Confirmed Revenues */}
          <div className="bg-white border border-[#C5A880]/20 p-6 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <HiOutlineCash size={22} />
            </div>
            <div>
              <h3 className="text-[10px] tracking-luxury text-[#555555] font-semibold uppercase">Confirmed Deposits</h3>
              <p className="text-3xl font-serif text-[#111111] mt-1 font-semibold">₹{confirmedRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Card 3: Pending Decisions */}
          <div className="bg-white border border-[#C5A880]/20 p-6 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <HiOutlineUserCircle size={22} />
            </div>
            <div>
              <h3 className="text-[10px] tracking-luxury text-[#555555] font-semibold uppercase">Pending Decisions</h3>
              <p className="text-3xl font-serif text-[#111111] mt-1 font-semibold">{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* ================= OPERATIONAL LEDGER INDEX TABLE ================= */}
        <div className="bg-white border border-[#C5A880]/20 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#C5A880]/20 flex justify-between items-center bg-[#FAF8F5]">
            <h2 className="font-serif text-lg font-medium text-[#111111] tracking-wide">Wedding Ledger Register</h2>
            <span className="text-[9px] tracking-widest text-[#836822] font-semibold uppercase">
              Live Database
            </span>
          </div>

          {dashboardLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#836822] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-[#555555] font-light tracking-wide">Retrieving ledger index records...</p>
            </div>
          ) : adminBookingsList.length === 0 ? (
            <div className="text-center py-20 bg-white space-y-2">
              <p className="text-sm text-[#555555] font-light">No client reservations currently stored inside MongoDB Atlas.</p>
              <p className="text-[10px] text-[#836822] font-semibold uppercase tracking-wider">Awaiting guest checkout completions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#C5A880]/20 text-[9px] uppercase font-bold text-[#555555] tracking-wider">
                    <th className="px-6 py-4">Client Detail</th>
                    <th className="px-6 py-4">Phone Contact</th>
                    <th className="px-6 py-4">Wedding Date</th>
                    <th className="px-6 py-4">Selected Package</th>
                    <th className="px-6 py-4">Guest Volume</th>
                    <th className="px-6 py-4">Payment Status</th>
                    <th className="px-6 py-4 text-right">Ledger Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5A880]/10 font-sans text-[#111111]">
                  {adminBookingsList.map((item) => (
                    <tr key={item._id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                      <td className="px-6 py-4 font-semibold">
                        {item.name}
                        <br />
                        <span className="text-[10px] font-normal text-[#555555] font-mono">{item.email}</span>
                      </td>
                      <td className="px-6 py-4 font-light text-[#555555] font-mono">+91 {item.phone}</td>
                      <td className="px-6 py-4 font-bold text-[#836822]">Nov {item.eventDate}, 2026</td>
                      <td className="px-6 py-4 font-light">{item.packageSelected}</td>
                      <td className="px-6 py-4 font-light">{item.guests} Expected</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[8px] uppercase font-bold tracking-wider ${
                          item.paymentStatus === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                        }`}>
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {item.paymentStatus === 'Pending' && (
                          <button 
                            title="Approve booking receipt"
                            onClick={() => handleApprovePayment(item._id, item.transactionId)}
                            className="p-2 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-600 rounded transition-all inline-block active:scale-95"
                          >
                            <HiOutlineCheck size={14} />
                          </button>
                        )}
                        <button 
                          title="Cancel Event Reservation"
                          onClick={() => triggerDeleteConfirmation(item._id, item.name)}
                          className="p-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-500 rounded transition-all inline-block active:scale-95"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ================= CUSTOM CONFIRMATION DIALOG MODAL ================= */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-8 shadow-2xl border border-[#C5A880]/30 relative animate-fadeIn">
            
            <button 
              onClick={() => setDeleteConfirmation({ show: false, bookingId: null, clientName: '' })}
              className="absolute top-4 right-4 text-[#111111] hover:text-[#836822] transition-colors"
            >
              <HiX size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <HiOutlineExclamation size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl text-[#111111] font-medium">Cancel Reservation?</h3>
                <p className="text-xs text-[#555555] font-light leading-relaxed">
                  Are you sure you want to cancel the wedding booking for <strong className="font-semibold text-[#111111]">{deleteConfirmation.clientName}</strong>? This action is permanent and will instantly release the date back onto the public calendar.
                </p>
              </div>

              <div className="flex space-x-3 w-full pt-2">
                <button 
                  onClick={() => setDeleteConfirmation({ show: false, bookingId: null, clientName: '' })}
                  className="w-1/2 border border-[#C5A880]/40 hover:border-[#836822] text-[#111111] text-[10px] tracking-luxury uppercase py-3.5 transition-colors font-semibold"
                >
                  Keep Booking
                </button>
                <button 
                  onClick={handleConfirmCancelBooking}
                  className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] tracking-luxury uppercase py-3.5 transition-all font-semibold shadow-md active:scale-95"
                >
                  Yes, Cancel Event
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MANAGEMENT FOOTER ================= */}
      <footer className="bg-white border-t border-[#C5A880]/10 py-5 text-center text-[10px] text-[#555555]/70 tracking-widest uppercase">
        Rajyog Management Suite Console &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}