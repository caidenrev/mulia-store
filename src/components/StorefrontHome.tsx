import React from "react";
import { Sparkles, ArrowRight, Star, ShoppingCart, Percent, Heart, ShieldCheck, ChevronRight, Laptop, Shirt, Home } from "lucide-react";
import { Product } from "../types";
import { motion } from "motion/react";

interface StorefrontHomeProps {
  products: Product[];
  onNavigate: (view: string, extra?: any) => void;
  onAddToCart: (product: Product) => void;
}

export default function StorefrontHome({ products, onNavigate, onAddToCart }: StorefrontHomeProps) {
  // Extract categories dynamically or hardcode the beautiful 4 categories
  const categories = [
    { name: "Elektronik", icon: <Laptop className="w-5 h-5" /> },
    { name: "Fashion", icon: <Shirt className="w-5 h-5" /> },
    { name: "Kecantikan", icon: <Sparkles className="w-5 h-5" /> },
    { name: "Rumah", icon: <Home className="w-5 h-5" /> }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="px-4 md:px-0">
        <div className="relative w-full min-h-[340px] md:min-h-[400px] rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-600 shadow-xl border border-slate-100/10 flex items-center p-6 md:p-12">
          {/* Banner Graphic Overlay */}
          <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
          
          <div className="relative z-10 max-w-xl space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-white/20 backdrop-blur-md rounded-full tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Koleksi Eksklusif Baru</span>
            </span>
            <h1 className="font-sans text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Gaya Modern,<br />Sentuhan Sleek
            </h1>
            <p className="font-sans text-sm md:text-base text-indigo-100/90 leading-relaxed max-w-md">
              Temukan gaya terbaru dan gadget terkini dengan penawaran spesial. Belanja cerdas dengan proteksi pembayaran penuh.
            </p>
            <button 
              onClick={() => onNavigate("catalog")}
              className="bg-white text-indigo-700 hover:bg-slate-50 font-sans font-bold text-sm px-6 py-3.5 rounded-full shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2 group w-max"
            >
              <span>Belanja Sekarang</span>
              <ArrowRight className="w-4 h-4 text-indigo-700 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:flex items-center justify-center opacity-10 pointer-events-none">
            <svg className="w-80 h-80 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Kategori Populer */}
      <section className="px-4 md:px-0 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-sans font-extrabold text-xl md:text-2xl text-slate-800 tracking-tight">Kategori Populer</h2>
            <p className="text-xs text-slate-400 mt-0.5">Pilih kategori favoritmu untuk mulai berbelanja</p>
          </div>
          <button 
            onClick={() => onNavigate("catalog")}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => onNavigate("catalog", { category: cat.name })}
              className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-600 hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="w-12 h-12 bg-slate-50 text-indigo-600 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
                <p className="text-[10px] text-slate-400">Jelajahi Produk</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recommended Products */}
      <section className="px-4 md:px-0 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-sans font-extrabold text-xl md:text-2xl text-slate-800 tracking-tight">Rekomendasi Spesial</h2>
            <p className="text-xs text-slate-400 mt-0.5">Koleksi terlaris dengan kualitas terbaik pilihan kurator kami</p>
          </div>
          <button 
            onClick={() => onNavigate("catalog")}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>Eksplor Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Products Grid with Framer Motion Staggered Effects */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((prod) => {
            const hasDiscount = prod.discount > 0;
            const finalPrice = hasDiscount ? prod.price - prod.discount : prod.price;

            return (
              <motion.div
                key={prod.id}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all relative flex flex-col group cursor-pointer"
              >
                {/* Image area */}
                <div 
                  onClick={() => onNavigate("product-detail", prod)}
                  className="aspect-square w-full bg-slate-50 relative overflow-hidden"
                >
                  <img 
                    src={prod.imageUrls?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop"} 
                    alt={prod.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-rose-500 text-white font-sans font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                      <Percent className="w-2.5 h-2.5" />
                      Sale
                    </span>
                  )}
                  {/* Stock Low Indicator */}
                  {prod.stock <= 5 && prod.stock > 0 && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white font-sans font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                      Sisa {prod.stock}
                    </span>
                  )}
                  {prod.stock === 0 && (
                    <span className="absolute inset-0 bg-slate-900/40 flex items-center justify-center font-sans font-bold text-sm text-white">
                      Habis Terjual
                    </span>
                  )}
                </div>

                {/* Info area */}
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {prod.category}
                  </span>
                  <h3 
                    onClick={() => onNavigate("product-detail", prod)}
                    className="font-sans font-bold text-sm text-slate-800 line-clamp-2 hover:text-indigo-600 transition-colors flex-1"
                  >
                    {prod.name}
                  </h3>

                  {/* Rating or Sales Count */}
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-700">4.8</span>
                    <span className="text-slate-300">|</span>
                    <span>{prod.salesCount || Math.floor(Math.random() * 100) + 20} terjual</span>
                  </div>

                  {/* Price Block & Action Button */}
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      {hasDiscount && (
                        <p className="text-[10px] text-slate-400 line-through">
                          Rp {prod.price.toLocaleString("id-ID")}
                        </p>
                      )}
                      <p className="font-sans font-extrabold text-base text-indigo-600">
                        Rp {finalPrice.toLocaleString("id-ID")}
                      </p>
                    </div>

                    {prod.stock > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(prod);
                        }}
                        className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* trust badges */}
      <section className="px-4 md:px-0 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
        <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm text-slate-800">100% Keamanan Transaksi</h4>
            <p className="text-xs text-slate-400 mt-0.5">Sistem pembayaran terenkripsi penuh yang didukung oleh Midtrans.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm text-slate-800">Jaminan Harga Terbaik</h4>
            <p className="text-xs text-slate-400 mt-0.5">Promo melimpah dengan potongan langsung tanpa syarat rumit.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm text-slate-800">Dukungan Pelanggan Prima</h4>
            <p className="text-xs text-slate-400 mt-0.5">Layanan bantuan responsif 24/7 siap melayani semua pertanyaan Anda.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
