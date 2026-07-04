import React from "react";
import { Filter, Star, ShoppingCart, Percent, Heart, Search, ChevronDown } from "lucide-react";
import { Product } from "../types";
import { motion } from "motion/react";

interface StorefrontCatalogProps {
  products: Product[];
  onNavigate: (view: string, extra?: any) => void;
  onAddToCart: (product: Product) => void;
  initialCategory?: string;
}

export default function StorefrontCatalog({
  products,
  onNavigate,
  onAddToCart,
  initialCategory = ""
}: StorefrontCatalogProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategory);
  const [priceMin, setPriceMin] = React.useState<string>("");
  const [priceMax, setPriceMax] = React.useState<string>("");
  const [minRating, setMinRating] = React.useState<number>(0);
  const [sortBy, setSortBy] = React.useState<string>("Terbaru");
  const [localSearch, setLocalSearch] = React.useState<string>("");

  // Update selectedCategory if initialCategory changes
  React.useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const categories = ["Semua Kategori", "Elektronik", "Fashion", "Kecantikan", "Rumah"];

  // Filter products based on selected parameters
  const filteredProducts = React.useMemo(() => {
    return products
      .filter((prod) => {
        // Category check
        if (selectedCategory && selectedCategory !== "Semua Kategori" && prod.category !== selectedCategory) {
          return false;
        }

        // Search check
        if (localSearch && !prod.name.toLowerCase().includes(localSearch.toLowerCase()) && !prod.sku.toLowerCase().includes(localSearch.toLowerCase())) {
          return false;
        }

        // Price check
        const hasDiscount = prod.discount > 0;
        const finalPrice = hasDiscount ? prod.price - prod.discount : prod.price;

        if (priceMin && finalPrice < parseInt(priceMin)) {
          return false;
        }
        if (priceMax && finalPrice > parseInt(priceMax)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discount > 0 ? a.price - a.discount : a.price;
        const priceB = b.discount > 0 ? b.price - b.discount : b.price;

        if (sortBy === "Termurah") {
          return priceA - priceB;
        }
        if (sortBy === "Termahal") {
          return priceB - priceA;
        }
        // "Terbaru"
        return 0; // default order in mock data
      });
  }, [products, selectedCategory, priceMin, priceMax, sortBy, localSearch]);

  const resetFilters = () => {
    setSelectedCategory("Semua Kategori");
    setPriceMin("");
    setPriceMax("");
    setMinRating(0);
    setSortBy("Terbaru");
    setLocalSearch("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-16">
      {/* Sidebar Filter - md:col-span-3 */}
      <aside className="md:col-span-3 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h2 className="font-sans font-bold text-base text-slate-800">Filter Produk</h2>
            </div>
            <button 
              onClick={resetFilters} 
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Search Input on Filter Sidebar for convenience */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cari</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Nama atau SKU..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
              />
            </div>
          </div>

          {/* Kategori Checkboxes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori</h3>
            <div className="space-y-2.5">
              {categories.map((cat, idx) => (
                <label key={idx} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat || (cat === "Semua Kategori" && !selectedCategory)}
                    onChange={() => setSelectedCategory(cat === "Semua Kategori" ? "" : cat)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="font-sans text-xs text-slate-600 group-hover:text-indigo-600 transition-colors">
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rentang Harga */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Harga (IDR)</h3>
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 bg-slate-50 border-none rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
              <span className="text-slate-400">-</span>
              <div className="relative w-full">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 bg-slate-50 border-none rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</h3>
            <div className="space-y-2">
              <button
                onClick={() => setMinRating(0)}
                className={`w-full flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-lg text-left transition-colors ${
                  minRating === 0 ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>Semua Rating</span>
              </button>
              <button
                onClick={() => setMinRating(4.5)}
                className={`w-full flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-lg text-left transition-colors ${
                  minRating === 4.5 ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 text-slate-200" />
                </div>
                <span>4.5 &amp; ke atas</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid Area - md:col-span-9 */}
      <section className="md:col-span-9 space-y-6">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
          <div>
            <h1 className="font-sans font-bold text-lg text-slate-800">Eksplor Produk</h1>
            <p className="text-xs text-slate-400 mt-0.5">Menampilkan {filteredProducts.length} produk pilihan</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-500 whitespace-nowrap">Urutkan:</span>
            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border-none rounded-xl px-4 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer outline-none transition-all"
              >
                <option value="Terbaru">Terbaru</option>
                <option value="Termurah">Harga: Terendah ke Tertinggi</option>
                <option value="Termahal">Harga: Tertinggi ke Terendah</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-sans font-bold text-slate-800 mb-1">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Tidak ada produk yang cocok dengan parameter filter Anda. Coba reset filter atau gunakan kata kunci pencarian lain.
            </p>
            <button 
              onClick={resetFilters}
              className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const hasDiscount = prod.discount > 0;
              const finalPrice = hasDiscount ? prod.price - prod.discount : prod.price;

              return (
                <motion.div
                  key={prod.id}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all relative flex flex-col group cursor-pointer"
                >
                  {/* Image area */}
                  <div 
                    onClick={() => onNavigate("product-detail", prod)}
                    className="aspect-[4/3] bg-slate-50 relative overflow-hidden"
                  >
                    <img 
                      src={prod.imageUrls?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop"} 
                      alt={prod.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white font-sans font-extrabold text-[9px] px-2 py-0.5 rounded shadow-sm">
                        Sale
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
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {prod.category}
                    </span>
                    <h3 
                      onClick={() => onNavigate("product-detail", prod)}
                      className="font-sans font-bold text-xs md:text-sm text-slate-800 line-clamp-2 hover:text-indigo-600 transition-colors flex-1"
                    >
                      {prod.name}
                    </h3>

                    {/* Rating or Sales Count */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-700">4.8</span>
                      <span className="text-gray-300">|</span>
                      <span>{prod.salesCount || Math.floor(Math.random() * 100) + 10} terjual</span>
                    </div>

                    {/* Price Block & Action Button */}
                    <div className="flex items-end justify-between mt-4">
                      <div>
                        {hasDiscount && (
                          <p className="text-[9px] text-slate-400 line-through">
                            Rp {prod.price.toLocaleString("id-ID")}
                          </p>
                        )}
                        <p className="font-sans font-extrabold text-sm md:text-base text-indigo-600">
                          Rp {finalPrice.toLocaleString("id-ID")}
                        </p>
                      </div>

                      {prod.stock > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(prod);
                          }}
                          className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
