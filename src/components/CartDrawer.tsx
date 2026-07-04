import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { CartItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <h2 className="font-sans font-bold text-lg text-slate-800">Keranjang Belanja</h2>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans font-bold text-slate-700 mb-1">Keranjang Kosong</h3>
                  <p className="text-xs text-slate-400 max-w-[200px]">Yuk, jelajahi katalog produk kami dan temukan barang impianmu!</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Product Metadata */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-sans text-xs font-semibold text-slate-800 line-clamp-1">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-indigo-600">Rp {item.price.toLocaleString("id-ID")}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-[10px] text-slate-400 line-through">Rp {item.originalPrice.toLocaleString("id-ID")}</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 bg-white rounded-lg px-1 py-0.5">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove button */}
                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="font-sans font-bold text-lg text-indigo-600">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <p className="text-[10px] text-slate-400">Total belum termasuk PPN 11% (akan dihitung pada saat checkout).</p>
                
                <button
                  onClick={onCheckout}
                  className="w-full bg-indigo-600 text-white font-sans font-bold text-sm py-3.5 rounded-xl hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Checkout Sekarang</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
