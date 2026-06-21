import { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle, Menu, X,
  Filter, ChevronLeft, ChevronRight,
  User, LogOut, History, Home,
  LayoutDashboard, Shield
} from 'lucide-react';
import { createBooking } from '../../api/bookingService'; // Hanya mengimpor yang dipakai agar tidak error

type CourtType = 'badminton' | 'voli' | 'futsal' | 'mini-soccer' | 'basket';
type BookingStatus = 'PENDING' | 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED' | 'PAYMENT_REJECTED';
type SlotStatus = 'available' | 'booked' | 'blocked';
type UserRole = 'guest' | 'user' | 'admin';

interface TimeSlot {
  time: string;
  status: SlotStatus;
  price: number;
}

export default function CourtBookingSystem() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'booking' | 'dashboard' | 'admin'>('landing');
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- STATE API & BOOKING ---
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dbCourts, setDbCourts] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // 1. Bersihkan pilihan jam jika user ganti lapangan/tanggal
  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedCourt, selectedDate]);

  // 2. RADAR: Tarik ketersediaan jadwal dari Django API
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedCourt) return;
      const dateStr = selectedDate.toISOString().split('T')[0];
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/bookings/?field=${selectedCourt}&date=${dateStr}`);
        if (response.ok) {
          const data = await response.json();
          setBookedSlots(data.map((b: any) => b.time));
        }
      } catch (error) {
        console.error("Gagal menarik data booking:", error);
      }
    };
    fetchBookings();
  }, [selectedCourt, selectedDate]);

  // 3. FETCH: Ambil daftar lapangan
  useEffect(() => {
    const fetchLapangan = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/fields/');
        if (response.ok) {
          const data = await response.json();
          setDbCourts(data);
        }
      } catch (error) {
        console.error("Gagal menarik data lapangan:", error);
      }
    };
    fetchLapangan();
  }, []);

  const toggleSlot = (time: string) => {
    setSelectedSlots(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time) 
        : [...prev, time] 
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token_akses', data.access);
        if (email.includes('admin')) {
          setUserRole('admin');
          setCurrentPage('landing'); 
        } else {
          setUserRole('user');
          setCurrentPage('dashboard');
        }
        setIsLoginModalOpen(false);
        alert('Login Berhasil!');
      } else {
        alert('Login Gagal: ' + (data.detail || 'Periksa email dan password Anda'));
      }
    } catch (error) {
      console.error("Eror koneksi API:", error);
      alert('Terjadi kesalahan koneksi ke server Backend.');
    }
  };

  // 🔥 FUNGSI PEMESANAN AKTIF (POST KE DJANGO) 🔥
  const handleBookingSubmit = async () => {
    if (selectedSlots.length === 0) {
      alert("Pilih minimal 1 jam jadwal yang tersedia terlebih dahulu!");
      return;
    }
    
    const bookingData = {
      field_id: selectedCourt,
      date: selectedDate.toISOString().split('T')[0],
      time_start: selectedSlots[0]
    };

    try {
      const result = await createBooking(bookingData);
      if (result.message || result.id) {
        alert("Booking Berhasil! Silakan cek dashboard.");
        setCurrentPage('dashboard');
        setSelectedSlots([]); // Reset setelah berhasil
      } else {
        alert("Gagal: " + (result.error || "Terjadi kesalahan sistem"));
      }
    } catch (err) {
      alert("Tidak bisa terhubung ke server backend.");
    }
  };

  // 4. GENERATE JADWAL AKURAT (Berdasarkan Database)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 6; hour <= 22; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const status: SlotStatus = bookedSlots.includes(timeString) ? 'booked' : 'available';
      slots.push({
        time: timeString,
        status: status,
        price: 50000
      });
    }
    return slots;
  };

  const renderLandingPage = () => (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[700px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#22c55e] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#22c55e] rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-4 border-white/20 rounded-full"></div>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-32 left-[15%] text-6xl opacity-20 animate-pulse-slow">⚽</div>
          <div className="absolute top-48 right-[20%] text-5xl opacity-15 animate-pulse-slow delay-100">🏸</div>
          <div className="absolute bottom-40 left-[25%] text-5xl opacity-15 animate-pulse-slow delay-200">🏀</div>
          <div className="absolute top-1/3 right-[10%] text-4xl opacity-10 animate-pulse-slow delay-300">🏐</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <div className="mb-6 px-6 py-2 bg-[#22c55e]/20 border border-[#22c55e]/50 rounded-full text-[#22c55e] text-sm inline-block backdrop-blur-sm">
            ⚡ Book in 60 seconds or less
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl mb-6 text-white tracking-tight">
            Book Your Court
            <span className="block text-[#22c55e]">Instantly</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl leading-relaxed">
            Pesan lapangan olahraga favorit Anda dengan mudah. Real-time availability, instant confirmation.
          </p>
          <button
            onClick={() => setCurrentPage('booking')}
            className="group px-12 py-5 bg-[#22c55e] text-white text-xl rounded-xl hover:bg-[#16a34a] transition-all transform hover:scale-105 shadow-2xl shadow-[#22c55e]/30 flex items-center gap-3"
          >
            Cek Jadwal
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-[#0f172a]">Kenapa Pilih Sport Center Solo?</h2>
            <p className="text-gray-600 text-lg">Pengalaman booking lapangan yang sempurna</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-xl mb-6 flex items-center justify-center shadow-lg shadow-[#22c55e]/30">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-3 text-[#0f172a]">Real-time Availability</h3>
              <p className="text-gray-600 leading-relaxed">Lihat ketersediaan lapangan secara langsung. Update otomatis setiap detik.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-xl mb-6 flex items-center justify-center shadow-lg shadow-[#22c55e]/30">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-3 text-[#0f172a]">Instant Confirmation</h3>
              <p className="text-gray-600 leading-relaxed">Konfirmasi booking langsung ke email dan WhatsApp Anda dalam hitungan detik.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-xl mb-6 flex items-center justify-center shadow-lg shadow-[#22c55e]/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-3 text-[#0f172a]">Secure Payment</h3>
              <p className="text-gray-600 leading-relaxed">Pembayaran aman dengan enkripsi tingkat bank dan proteksi transaksi.</p>
            </div>
          </div>
        </div>
      </div>

      {/* All Courts Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-[#0f172a]">Semua Lapangan Tersedia</h2>
            <p className="text-gray-600 text-lg">Pilihan lapangan berkualitas untuk berbagai olahraga</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {dbCourts.map((court) => (
              <div
                key={court.id}
                onClick={() => {
                  setSelectedCourt(court.id);
                  setCurrentPage('booking');
                }}
                className="group bg-white rounded-xl border-2 border-gray-200 p-6 text-center cursor-pointer hover:border-[#22c55e] hover:shadow-xl transition-all transform hover:-translate-y-2"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏟️</div>
                <h4 className="mb-2 text-[#0f172a]">{court.name}</h4>
                <p className="text-sm text-gray-500">Rp {Number(court.price_weekday).toLocaleString('id-ID')}/jam</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="mb-6">Siap untuk Bermain?</h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Bergabunglah dengan ribuan pengguna yang sudah mempercayai kami untuk booking lapangan olahraga
          </p>
          <button
            onClick={() => setCurrentPage('booking')}
            className="px-12 py-5 bg-[#22c55e] text-white text-xl rounded-xl hover:bg-[#16a34a] transition-all transform hover:scale-105 shadow-2xl shadow-[#22c55e]/30"
          >
            Mulai Booking Sekarang
          </button>
        </div>
      </div>
    </div>
  );

  const renderBookingPage = () => {
    const timeSlots = generateTimeSlots();

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft className="w-5 h-5" /> Kembali
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
                <h3 className="mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" /> Filter Pencarian
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Jenis Lapangan</label>
                    <select
                      value={selectedCourt || ''}
                      onChange={(e) => setSelectedCourt(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#22c55e] outline-none"
                    >
                      <option value="">Pilih Lapangan</option>
                      {dbCourts.map(court => (
                        <option key={court.id} value={court.id}>{court.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Tanggal</label>
                    <input
                      type="date"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#22c55e] outline-none"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm mb-3">Keterangan Status:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded"></div>
                      <span>Tersedia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-50 border-2 border-red-500 rounded"></div>
                      <span>Terpesan / Penuh</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 border-2 border-blue-700 rounded"></div>
                      <span>Dipilih</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-[#0f172a]">Jadwal Ketersediaan</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlots.includes(slot.time);
                    const courtPrice = selectedCourt ? dbCourts.find(c => String(c.id) === String(selectedCourt))?.price_weekday : slot.price;

                    return (
                      <button
                        key={slot.time}
                        disabled={slot.status !== 'available'}
                        onClick={() => toggleSlot(slot.time)}
                        className={`p-4 rounded-lg border-2 transition ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-700 text-white shadow-lg transform scale-105' 
                            : slot.status === 'available'
                            ? 'bg-green-50 border-green-500 hover:bg-green-100 cursor-pointer text-[#0f172a]'
                            : slot.status === 'booked'
                            ? 'bg-red-50 border-red-500 cursor-not-allowed opacity-60 text-red-900'
                            : 'bg-gray-100 border-gray-500 cursor-not-allowed opacity-60 text-gray-500'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-sm mb-1 font-bold ${isSelected ? 'text-white' : ''}`}>{slot.time}</div>
                          <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                            {slot.status === 'available' && `Rp ${Number(courtPrice) / 1000}k`}
                            {slot.status === 'booked' && 'Penuh'}
                            {slot.status === 'blocked' && 'Tutup'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h4 className="mb-4 text-[#0f172a] font-bold">Detail Pemesanan</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lapangan:</span>
                      <span className="font-semibold text-[#0f172a]">{selectedCourt ? dbCourts.find(c => String(c.id) === String(selectedCourt))?.name : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span className="font-semibold text-[#0f172a]">{selectedDate.toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durasi:</span>
                      <span className="font-semibold text-[#0f172a]">{selectedSlots.length} jam</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-3">
                      <span className="font-bold text-[#0f172a]">Total:</span>
                      <span className="text-lg font-bold text-blue-600">
                        Rp {(() => {
                          const price = selectedCourt ? dbCourts.find(c => String(c.id) === String(selectedCourt))?.price_weekday : 0;
                          return (selectedSlots.length * Number(price)).toLocaleString('id-ID');
                        })()}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={handleBookingSubmit}
                    className={`w-full mt-6 px-6 py-3 rounded-lg transition font-bold ${
                      selectedSlots.length > 0 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Lanjutkan Pemesanan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="mb-8 font-bold text-[#0f172a]">Dashboard Pengguna</h2>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600">Selamat datang! Booking Anda yang berhasil akan muncul di halaman ini.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-[#0f172a]">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('landing')}>
              <div className="w-12 h-12 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl flex items-center justify-center text-2xl shadow-lg">🏟️</div>
              <div>
                <div className="text-xl font-bold text-[#0f172a]">Sport Center</div>
                <div className="text-xs font-semibold text-[#22c55e]">Solo</div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => setCurrentPage('landing')} className="flex items-center gap-2 text-[#0f172a] hover:text-[#22c55e] transition font-medium"><Home className="w-4 h-4" /> Beranda</button>
              <button onClick={() => setCurrentPage('booking')} className="flex items-center gap-2 text-[#0f172a] hover:text-[#22c55e] transition font-medium"><Calendar className="w-4 h-4" /> Booking</button>

              {userRole === 'user' && (
                <button onClick={() => setCurrentPage('dashboard')} className="flex items-center gap-2 text-[#0f172a] hover:text-[#22c55e] transition font-medium"><History className="w-4 h-4" /> Dashboard</button>
              )}
              
              {userRole === 'admin' && (
                <button onClick={() => window.open('http://127.0.0.1:8000/admin/', '_blank')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-bold"><LayoutDashboard className="w-4 h-4" /> Admin Panel Django</button>
              )}

              {userRole === 'guest' ? (
                <>
                  <div className="w-px h-8 bg-gray-200 mx-2"></div>
                  <button onClick={() => setIsLoginModalOpen(true)} className="px-8 py-2.5 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] transition-all shadow-lg font-medium">Login</button>
                </>
              ) : (
                <>
                  <button className="flex items-center gap-2 text-[#0f172a] hover:text-[#22c55e] transition font-medium"><User className="w-4 h-4" /> Profil</button>
                  <button onClick={() => { localStorage.removeItem('token_akses'); setUserRole('guest'); setCurrentPage('landing'); }} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-2 font-medium border border-red-200"><LogOut className="w-4 h-4" /> Keluar</button>
                </>
              )}
            </div>

            <button className="md:hidden text-[#0f172a]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu Content */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-2 bg-white">
              <button onClick={() => { setCurrentPage('landing'); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3"><Home className="w-5 h-5 text-gray-500" /> Beranda</button>
              <button onClick={() => { setCurrentPage('booking'); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-500" /> Booking</button>
              
              {userRole === 'admin' && (
                <button onClick={() => { window.open('http://127.0.0.1:8000/admin/', '_blank'); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-600 rounded-lg flex items-center gap-3 font-bold"><LayoutDashboard className="w-5 h-5" /> Admin Panel Django</button>
              )}

              {userRole === 'guest' ? (
                <button onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full mt-4 px-4 py-3 bg-[#0f172a] text-white rounded-lg font-medium shadow-lg">Login</button>
              ) : (
                <button onClick={() => { localStorage.removeItem('token_akses'); setUserRole('guest'); setCurrentPage('landing'); setIsMobileMenuOpen(false); }} className="w-full mt-4 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium border border-red-200 flex justify-center items-center gap-2"><LogOut className="w-5 h-5" /> Keluar</button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Page Content Rendering */}
      {currentPage === 'landing' && renderLandingPage()}
      {currentPage === 'booking' && renderBookingPage()}
      {currentPage === 'dashboard' && renderDashboard()}

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white py-8 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-sm text-gray-400">© 2026 Sport Center Solo. All rights reserved.</div>
        </div>
      </footer>

      {/* 🔥 MODAL LOGIN 🔥 */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"><X className="w-5 h-5" /></button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-4">🏟️</div>
              <h2 className="text-2xl font-bold text-[#0f172a]">Masuk ke Akun</h2>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#22c55e] outline-none transition-all" placeholder="admin@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Shield className="h-5 w-5 text-gray-400" /></div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#22c55e] outline-none transition-all" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-[#22c55e] text-white rounded-xl hover:bg-[#16a34a] active:scale-[0.98] transition-all font-bold text-lg shadow-lg mt-6">Login Sekarang</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}