import { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle, Menu, X,
  Filter, ChevronLeft, ChevronRight,
  User, LogOut, History, Home,
  LayoutDashboard, Shield, Trash2
} from 'lucide-react';

type SlotStatus = 'available' | 'booked' | 'blocked';
type UserRole = 'guest' | 'user' | 'admin';

interface TimeSlot {
  time: string;
  status: SlotStatus;
  price: number;
}

const CountdownTimer = ({ deadline }: { deadline: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(deadline).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("Waktu Habis");
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return <span className="text-red-600 font-bold ml-2">{timeLeft}</span>;
};

export default function CourtBookingSystem() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'booking' | 'dashboard' | 'admin'>('landing');
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true); 
  
  const [dbCourts, setDbCourts] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [adminBookings, setAdminBookings] = useState<any[]>([]);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedCourt, selectedDate]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedCourt) return;
      const dateStr = selectedDate.toISOString().split('T')[0];
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/bookings/availability/?field=${selectedCourt}&date=${dateStr}`);
        if (response.ok) {
          const data = await response.json();
          
          const bookedHours: string[] = [];
          data.forEach((booking: any) => {
            if (booking.status === 'CANCELLED' || booking.status === 'PAYMENT_REJECTED') {
              return; 
            }

            const startHour = parseInt(booking.start_time.split(':')[0]);
            const endHour = parseInt(booking.end_time.split(':')[0]);
            
            for (let h = startHour; h < endHour; h++) {
              bookedHours.push(`${h.toString().padStart(2, '0')}:00`);
            }
          });
          
          setBookedSlots(bookedHours);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchBookings();
  }, [selectedCourt, selectedDate]);

  useEffect(() => {
    const fetchLapangan = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/fields/');
        if (response.ok) {
          const data = await response.json();
          setDbCourts(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchLapangan();
  }, []);

  useEffect(() => {
    if (currentPage === 'dashboard') {
      const fetchMyBookings = async () => {
        try {
          const token = localStorage.getItem('token_akses');
          if (!token) return;

          const response = await fetch('http://127.0.0.1:8000/api/bookings/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setMyBookings(data);
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchMyBookings();
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'admin' && userRole === 'admin') {
      const fetchAdminBookings = async () => {
        try {
          const token = localStorage.getItem('token_akses');
          if (!token) return;

          const response = await fetch('http://127.0.0.1:8000/api/bookings/admin/all/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setAdminBookings(data);
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchAdminBookings();
    }
  }, [currentPage, userRole]);

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
          setCurrentPage('admin'); 
        } else {
          setUserRole('user');
          setCurrentPage('dashboard');
        }
        setIsLoginModalOpen(false);
      } else {
        alert('Login Gagal: Periksa email dan password Anda');
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi ke server Backend.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      alert('Pendaftaran Gagal: Password minimal 8 karakter serta wajib mengandung kombinasi huruf kapital dan angka.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/bookings/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        alert('Registrasi Berhasil! Silakan login dengan akun baru Anda.');
        setIsLoginMode(true); 
        setPassword(''); 
      } else {
        const data = await response.json();
        alert('Registrasi Gagal: ' + JSON.stringify(data));
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi ke server Backend.');
    }
  };

  const handleBookingSubmit = async () => {
    if (selectedSlots.length === 0) {
      alert("Pilih minimal 1 jam jadwal yang tersedia terlebih dahulu!");
      return;
    }
    
    const sortedSlots = [...selectedSlots].sort();
    const startTime = sortedSlots[0] + ":00";
    
    const lastSlotHour = parseInt(sortedSlots[sortedSlots.length - 1].split(':')[0]);
    const endTime = `${(lastSlotHour + 1).toString().padStart(2, '0')}:00:00`;

    const bookingData = {
      field: selectedCourt,
      booking_date: selectedDate.toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime,
      participants_count: 1,
      notes: "Pemesanan dari Web React"
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token_akses')}`
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Booking Berhasil! Silakan cek dashboard.");
        setCurrentPage('dashboard');
        setSelectedSlots([]);
      } else if (result.code === 'token_not_valid') {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem('token_akses');
        setUserRole('guest');
        setEmail('');
        setCurrentPage('landing');
        setIsLoginModalOpen(true);
      } else {
        alert("Gagal: " + JSON.stringify(result));
      }
    } catch (err) {
      alert("Tidak bisa terhubung ke server backend.");
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat ini secara permanen?")) return;

    try {
      const token = localStorage.getItem('token_akses');
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok || response.status === 204) {
        setMyBookings(prev => prev.filter(b => b.id !== bookingId));
      } else {
        alert("Gagal menghapus riwayat dari server.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, bookingId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('payment_proof', file); 

    try {
      const token = localStorage.getItem('token_akses');
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/upload-proof/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert("Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin.");
        setMyBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'WAITING_CONFIRMATION' } : b));
      } else {
        const errorData = await response.json();
        alert("Gagal mengunggah bukti: " + JSON.stringify(errorData));
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat mengunggah.");
    }
  };

  const handleAdminStatusUpdate = async (bookingId: number, newStatus: string) => {
    if (!window.confirm(`Konfirmasi perubahan status pesanan menjadi ${newStatus}?`)) return;

    try {
      const token = localStorage.getItem('token_akses');
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/admin/${bookingId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setAdminBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      } else {
        const errorData = await response.json();
        alert("Gagal memperbarui status: " + JSON.stringify(errorData));
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

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
      <div className="relative h-[700px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#22c55e] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#22c55e] rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-4 border-white/20 rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <div className="mb-6 px-6 py-2 bg-[#22c55e]/20 border border-[#22c55e]/50 rounded-full text-[#22c55e] text-sm inline-block backdrop-blur-sm">
            Book in 60 seconds or less
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
                <div className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-semibold mb-3">Pilih Lapangan</label>
                    <div className="grid grid-cols-2 gap-3">
                      {dbCourts.map(court => {
                        const isSelected = String(selectedCourt) === String(court.id);
                        const imageUrl = court.image 
                          ? (court.image.startsWith('http') ? court.image : `http://127.0.0.1:8000${court.image.startsWith('/media/') ? '' : '/media/'}${court.image}`) 
                          : '';

                        return (
                          <button
                            key={court.id}
                            onClick={() => {
                              setSelectedCourt(court.id);
                              setSelectedSlots([]); 
                            }}
                            className={`relative overflow-hidden rounded-xl border-2 text-left transition-all duration-200 group ${
                              isSelected 
                                ? 'border-[#22c55e] ring-4 ring-[#22c55e]/20 shadow-md scale-[1.02]' 
                                : 'border-transparent hover:border-gray-300 hover:shadow-sm grayscale-[30%]'
                            }`}
                          >
                            <img 
                              src={imageUrl} 
                              alt={court.name} 
                              className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className={`absolute inset-x-0 bottom-0 p-2 text-xs font-bold text-center transition-colors ${
                              isSelected ? 'bg-[#22c55e] text-white' : 'bg-black/70 text-white group-hover:bg-black/80'
                            }`}>
                              {court.name}
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-white rounded-full">
                                <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Tanggal</label>
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
                  <h4 className="text-sm mb-3 font-semibold">Keterangan Status:</h4>
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
        <h2 className="mb-8 text-2xl font-bold text-[#0f172a]">Dashboard Pengguna</h2>
        
        {myBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-3"></div>
            <p className="text-gray-500 font-medium">Belum ada riwayat booking.</p>
            <button 
              onClick={() => setCurrentPage('booking')}
              className="mt-4 text-[#22c55e] font-bold hover:underline"
            >
              Mulai Pesan Lapangan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBookings.map((booking, index) => {
              const courtName = dbCourts.find(c => String(c.id) === String(booking.field))?.name || `Lapangan ID: ${booking.field}`;

              return (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4 border-b pb-4">
                      <div>
                        <h3 className="font-bold text-lg text-[#0f172a]">{courtName}</h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" /> {booking.booking_date}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        booking.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        booking.status === 'WAITING_CONFIRMATION' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        booking.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm text-gray-600 mb-6">
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Waktu:</span>
                        <span className="font-semibold text-[#0f172a]">{booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span>Total Biaya:</span>
                        <span className="font-bold text-[#22c55e]">Rp {Number(booking.total_price).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {booking.status === 'PENDING' && (
                      <div className="mt-2">
                        {booking.payment_deadline && (
                          <div className="bg-red-50 p-2 rounded text-xs text-center mb-2 border border-red-100">
                            Selesaikan pembayaran dalam: <CountdownTimer deadline={booking.payment_deadline} />
                          </div>
                        )}
                        <label className="w-full py-2.5 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] transition font-semibold text-sm shadow-md flex justify-center items-center gap-2 cursor-pointer">
                          Upload Bukti Pembayaran
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, booking.id)}
                          />
                        </label>
                      </div>
                    )}

                    {booking.status === 'CANCELLED' && (
                      <button 
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="w-full mt-2 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold text-sm flex justify-center items-center gap-2 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" /> Hapus Riwayat
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#0f172a]" />
            Dashboard Administrator
          </h2>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-semibold text-gray-700">
              Total Pesanan: <span className="text-blue-600">{adminBookings.length}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-semibold text-gray-700">
              Menunggu Konfirmasi: <span className="text-yellow-600">{adminBookings.filter(b => b.status === 'WAITING_CONFIRMATION').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-bold">ID / Tanggal</th>
                  <th className="px-6 py-4 font-bold">Lapangan</th>
                  <th className="px-6 py-4 font-bold">Waktu</th>
                  <th className="px-6 py-4 font-bold">Total Biaya</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Bukti Bayar</th>
                  <th className="px-6 py-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminBookings.map((booking) => {
                  const courtName = dbCourts.find(c => String(c.id) === String(booking.field))?.name || `Lapangan ID: ${booking.field}`;
                  const proofUrl = booking.payment_proof ? (booking.payment_proof.startsWith('http') ? booking.payment_proof : `http://127.0.0.1:8000${booking.payment_proof}`) : null;

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0f172a]">#{booking.id}</div>
                        <div className="text-xs text-gray-500">{booking.booking_date}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#0f172a]">{courtName}</td>
                      <td className="px-6 py-4">
                        {booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#22c55e]">
                        Rp {Number(booking.total_price).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${
                          booking.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          booking.status === 'WAITING_CONFIRMATION' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          booking.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {proofUrl ? (
                          <button 
                            onClick={() => setPreviewImage(proofUrl)}
                            className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm"
                          >
                            Bukti Bayar
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {booking.status === 'WAITING_CONFIRMATION' && (
                            <>
                              <button 
                                onClick={() => handleAdminStatusUpdate(booking.id, 'CONFIRMED')}
                                className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-xs font-bold transition-colors"
                              >
                                Terima
                              </button>
                              <button 
                                onClick={() => handleAdminStatusUpdate(booking.id, 'PAYMENT_REJECTED')}
                                className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-xs font-bold transition-colors"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                            <button 
                              onClick={() => handleAdminStatusUpdate(booking.id, 'CANCELLED')}
                              className="border border-red-200 text-red-600 px-3 py-1.5 rounded hover:bg-red-50 text-xs font-bold transition-colors"
                            >
                              Batalkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {adminBookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                      Belum ada data pesanan dalam sistem.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-[#0f172a]">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('landing')}>
              <div className="w-12 h-12 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl flex items-center justify-center text-2xl shadow-lg"></div>
              <div>
                <div className="text-xl font-bold text-[#0f172a]">Sport Center</div>
                <div className="text-xs font-semibold text-[#22c55e]">Solo</div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => setCurrentPage('landing')} className="flex items-center gap-2 text-[#0f172a] hover:text-[#22c55e] transition font-medium"><Home className="w-4 h-4" /> Beranda</button>
              
              {userRole !== 'admin' && (
                <button onClick={() => setCurrentPage('booking')} className="flex items-center gap-2 text-[#0f172a] hover:text-[#22c55e] transition font-medium"><Calendar className="w-4 h-4" /> Booking</button>
              )}

              {userRole === 'user' && (
                <button onClick={() => setCurrentPage('dashboard')} className="flex items-center gap-2 text-[#0f172a] hover:text-[#22c55e] transition font-medium"><History className="w-4 h-4" /> Dashboard</button>
              )}
              
              {userRole === 'admin' && (
                <button onClick={() => setCurrentPage('admin')} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition font-medium"><LayoutDashboard className="w-4 h-4" /> Dashboard Admin</button>
              )}

              {userRole === 'guest' ? (
                <>
                  <div className="w-px h-8 bg-gray-200 mx-2"></div>
                  <button onClick={() => setIsLoginModalOpen(true)} className="px-8 py-2.5 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] transition-all shadow-lg font-medium">Login</button>
                </>
              ) : (
                <>
                  <div className="relative group">
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {email ? email.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="text-left hidden md:block">
                        <div className="text-sm font-bold text-[#0f172a] leading-tight">
                          {userRole === 'admin' ? 'Administrator' : 'Pengguna'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {email || 'Terautentikasi'}
                        </div>
                      </div>
                    </button>

                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                      <div className="p-4 border-b border-gray-100">
                        <div className="text-sm text-gray-500">Masuk sebagai:</div>
                        <div className="text-sm font-bold text-[#0f172a] truncate">{email || 'User'}</div>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            localStorage.removeItem('token_akses');
                            setUserRole('guest');
                            setEmail('');
                            setCurrentPage('landing');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors font-medium mt-1"
                        >
                          <LogOut className="w-4 h-4" /> Keluar Akun
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button className="md:hidden text-[#0f172a]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-2 bg-white">
              <button onClick={() => { setCurrentPage('landing'); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3"><Home className="w-5 h-5 text-gray-500" /> Beranda</button>
              
              {userRole !== 'admin' && (
                <button onClick={() => { setCurrentPage('booking'); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-500" /> Booking</button>
              )}
              
              {userRole === 'admin' && (
                <button onClick={() => { setCurrentPage('admin'); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center gap-3 font-medium"><LayoutDashboard className="w-5 h-5" /> Dashboard Admin</button>
              )}

              {userRole === 'guest' ? (
                <button onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full mt-4 px-4 py-3 bg-[#0f172a] text-white rounded-lg font-medium shadow-lg">Login</button>
              ) : (
                <button onClick={() => { localStorage.removeItem('token_akses'); setUserRole('guest'); setEmail(''); setCurrentPage('landing'); setIsMobileMenuOpen(false); }} className="w-full mt-4 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium border border-red-200 flex justify-center items-center gap-2"><LogOut className="w-5 h-5" /> Keluar</button>
              )}
            </div>
          )}
        </div>
      </nav>

      {currentPage === 'landing' && renderLandingPage()}
      {currentPage === 'booking' && renderBookingPage()}
      {currentPage === 'dashboard' && renderDashboard()}
      {currentPage === 'admin' && renderAdminDashboard()}

      <footer className="bg-[#0f172a] text-white py-8 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-sm text-gray-400">© 2026 Sport Center Solo. All rights reserved.</div>
        </div>
      </footer>

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
            <button 
              onClick={() => {
                setIsLoginModalOpen(false);
                setTimeout(() => setIsLoginMode(true), 300); 
              }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div key={isLoginMode ? 'login' : 'register'} className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-[#0f172a]">
                  {isLoginMode ? 'Masuk ke Akun' : 'Buat Akun Baru'}
                </h2>
              </div>
              
              <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-5">
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
                
                <button type="submit" className="w-full py-4 bg-[#22c55e] text-white rounded-xl hover:bg-[#16a34a] active:scale-[0.98] transition-all font-bold text-lg shadow-lg mt-6">
                  {isLoginMode ? 'Login Sekarang' : 'Daftar Sekarang'}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
              {isLoginMode ? "Belum punya akun? " : "Sudah punya akun? "}
              <button 
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-[#22c55e] font-bold hover:underline transition-colors focus:outline-none"
              >
                {isLoginMode ? 'Daftar di sini' : 'Login di sini'}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-2xl w-full">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-white/10 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Bukti Pembayaran" 
              className="w-full h-auto rounded-xl shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}