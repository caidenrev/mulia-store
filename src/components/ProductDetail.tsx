import React from "react";
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, Heart, Percent, Plus, Minus } from "lucide-react";
import { Product } from "../types";

interface ProductDetailProps {
  product: Product;
  onNavigate: (view: string, extra?: any) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export default function ProductDetail({
  product,
  onNavigate,
  onAddToCart,
  onBuyNow
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = React.useState<string>(product.imageUrls?.[0] || "");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [selectedColor, setSelectedColor] = React.useState<string>("Midnight Black");

  React.useEffect(() => {
    setSelectedImage(product.imageUrls?.[0] || "");
    setQuantity(1);
  }, [product]);

  const hasDiscount = product.discount > 0;
  const finalPrice = hasDiscount ? product.price - product.discount : product.price;

  const handleUpdateQuantity = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const colors = ["Midnight Black", "Cloud White", "Emerald Green"];

  return (
    <div className="space-y-8 pb-16">
      {/* Back button and breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => onNavigate("catalog")}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button onClick={() => onNavigate("home")} className="hover:text-indigo-600">Beranda</button>
          <span>/</span>
          <button onClick={() => onNavigate("catalog", { category: product.category })} className="hover:text-indigo-600">{product.category}</button>
          <span>/</span>
          <span className="text-indigo-600 font-bold truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Left Side: Product Gallery */}
        <section className="md:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative aspect-square w-full">
            <img 
              src={selectedImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop"} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white font-sans font-extrabold text-[10px] px-3 py-1 rounded-full shadow-sm">
                Promo {Math.round((product.discount / product.price) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          <div className="grid grid-cols-4 gap-4">
            {/* Show product images, fallback or mock variations */}
            {(product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [product.imageUrls?.[0]]).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 bg-white ${
                  selectedImage === img ? "border-indigo-600 shadow-sm" : "border-slate-200 hover:border-slate-400"
                } transition-all`}
              >
                <img src={img || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=150&auto=format&fit=crop"} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        {/* Right Side: Product Actions & Config */}
        <section className="md:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-5">
            <h1 className="font-sans font-extrabold text-xl md:text-3xl text-slate-800 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span>4.8 (124 Ulasan)</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-600 font-bold">Terjual {product.salesCount || 120}+</span>
            </div>

            {/* Price display */}
            <div className="mt-4 pt-2">
              <div className="flex items-baseline gap-3">
                <span className="font-sans font-black text-2xl md:text-3xl text-indigo-600">
                  Rp {finalPrice.toLocaleString("id-ID")}
                </span>
                {hasDiscount && (
                  <>
                    <span className="font-sans text-xs text-slate-400 line-through">
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                    <span className="bg-rose-50 text-rose-600 font-sans font-bold text-[10px] px-2.5 py-1 rounded-md">
                      Hemat Rp {product.discount.toLocaleString("id-ID")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-600 block">Warna: <span className="font-black text-slate-800">{selectedColor}</span></span>
            <div className="flex gap-3">
              {colors.map((col, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(col)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border ${
                    selectedColor === col 
                      ? "border-indigo-600 bg-indigo-50/30 text-indigo-600 font-bold" 
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  } transition-all`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Stock and Quantity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Atur Jumlah</span>
              <span>Stok: <span className="text-indigo-600">{product.stock} Tersedia</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 bg-white rounded-xl h-11 w-32 justify-between px-2">
                <button 
                  onClick={() => handleUpdateQuantity(-1)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-sans font-bold text-sm text-slate-800 w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => handleUpdateQuantity(1)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-slate-400">Maks. {product.stock} unit</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => onBuyNow(product, quantity)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-sm py-3.5 rounded-xl shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Beli Sekarang
            </button>
            <button
              onClick={() => onAddToCart(product, quantity)}
              className="w-full border border-indigo-600 text-indigo-600 font-sans font-bold text-sm py-3.5 rounded-xl hover:bg-indigo-50/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Tambah ke Keranjang</span>
            </button>
          </div>

          {/* Shipping & Guarantee Boxes */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-inner flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Bebas Ongkir se-Indonesia</p>
                <p className="text-[10px] text-slate-400">Dapatkan gratis ongkir khusus belanja minimal Rp 500.000</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Garansi Resmi 1 Tahun</p>
                <p className="text-[10px] text-slate-400">Jaminan uang kembali atau ganti unit baru jika cacat produksi.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Description & Specs Tabs/Sections */}
      <section className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-8 space-y-4">
          <h2 className="font-sans font-bold text-lg text-slate-800">Deskripsi Produk</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-4 whitespace-pre-line">
            {product.description}
          </div>
        </div>

        <div className="md:col-span-4 space-y-4">
          <h2 className="font-sans font-bold text-lg text-slate-800">Spesifikasi Detail</h2>
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 border-b border-slate-100 p-3 bg-slate-50 text-xs">
              <span className="font-bold text-slate-500">SKU</span>
              <span className="col-span-2 text-slate-800">{product.sku}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 p-3 text-xs">
              <span className="font-bold text-slate-500">Kategori</span>
              <span className="col-span-2 text-slate-800">{product.category}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 p-3 bg-slate-50 text-xs">
              <span className="font-bold text-slate-500">Stok Utama</span>
              <span className="col-span-2 text-slate-800">{product.stock} pcs</span>
            </div>
            <div className="grid grid-cols-3 p-3 text-xs">
              <span className="font-bold text-slate-500">Garansi</span>
              <span className="col-span-2 text-slate-800">12 Bulan Resmi</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
