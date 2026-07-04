import React from "react";
import { X, MapPin, ClipboardList, Wallet, Truck, CreditCard } from "lucide-react";
import { CartItem, ShippingAddress, UserProfile } from "../types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  user: UserProfile | null;
  onPlaceOrder: (customerInfo: { name: string; email: string; address: ShippingAddress }) => void;
  loading: boolean;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  user,
  onPlaceOrder,
  loading
}: CheckoutModalProps) {
  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [phone, setPhone] = React.useState("");
  const [province, setProvince] = React.useState("DKI Jakarta");
  const [city, setCity] = React.useState("Jakarta Selatan");
  const [district, setDistrict] = React.useState("Kebayoran Baru");
  const [detail, setDetail] = React.useState("");

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.11); // 11% PPN
  const shippingFee = subtotal > 500000 ? 0 : 25000;
  const adminFee = 2500;
  const total = subtotal + tax + shippingFee + adminFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail.trim()) return;

    onPlaceOrder({
      name,
      email,
      address: {
        province,
        city,
        district,
        detail: `${detail} (Telp: ${phone})`
      }
    });
  };

  const provinces = ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Bali", "Banten", "Sumatera Utara"];
  const cities: { [key: string]: string[] } = {
    "DKI Jakarta": ["Jakarta Selatan", "Jakarta Pusat", "Jakarta Barat", "Jakarta Utara", "Jakarta Timur"],
    "Jawa Barat": ["Bandung", "Bogor", "Depok", "Bekasi", "Tangerang Selatan"],
    "Jawa Tengah": ["Semarang", "Surakarta", "Yogyakarta"],
    "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo"],
    "Bali": ["Denpasar", "Badung", "Gianyar"],
    "Banten": ["Tangerang", "Serang", "Cilegon"],
    "Sumatera Utara": ["Medan", "Deli Serdang", "Binjai"]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden relative border border-slate-100 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left: Checkout Shipping Form */}
        <div className="flex-1 p-6 overflow-y-auto border-r border-slate-100 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-indigo-600">
              <MapPin className="w-5 h-5" />
              <h2 className="font-sans font-extrabold text-base text-slate-800">Informasi Pengiriman</h2>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full md:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Nama Penerima</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Email Konfirmasi</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">No. Telepon / WA</label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Provinsi</label>
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setCity(cities[e.target.value]?.[0] || "");
                  }}
                  className="w-full h-11 px-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                >
                  {provinces.map((prov, i) => (
                    <option key={i} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Kota / Kabupaten</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                >
                  {(cities[province] || []).map((ct, i) => (
                    <option key={i} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Kecamatan</label>
                <input
                  type="text"
                  required
                  placeholder="Kecamatan"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Alamat Lengkap</label>
              <textarea
                required
                rows={3}
                placeholder="Nama jalan, Nomor rumah, RT/RW, kelurahan..."
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="w-full p-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-sans font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>{loading ? "Menyiapkan Pembayaran..." : "Lanjut ke Pembayaran"}</span>
            </button>
          </form>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="w-full md:w-80 bg-slate-50 p-6 flex flex-col justify-between overflow-y-auto max-h-[40vh] md:max-h-full">
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                <span>Ringkasan Order</span>
              </div>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hidden md:block">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of checkout items */}
            <div className="space-y-3 max-h-36 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs">
                  <span className="text-slate-600 font-medium truncate max-w-[160px]">
                    {item.name} <span className="font-bold text-slate-400">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-slate-800">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>PPN (11%)</span>
                <span>Rp {tax.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Biaya Kirim</span>
                <span>{shippingFee === 0 ? <span className="text-emerald-600 font-bold">Gratis</span> : `Rp ${shippingFee.toLocaleString("id-ID")}`}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Biaya Admin</span>
                <span>Rp {adminFee.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-xs font-bold text-slate-700">Total Pembayaran</span>
              <span className="font-sans font-black text-xl text-indigo-600">Rp {total.toLocaleString("id-ID")}</span>
            </div>
            
            <div className="flex items-center gap-2 p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
              <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="text-[10px] text-indigo-700 font-semibold">Pengiriman Instant Terproteksi Asuransi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
