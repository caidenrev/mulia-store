import React from "react";
import { ShoppingCart, Bell, User, Search, Settings, ShieldAlert, LogOut } from "lucide-react";
import { UserProfile } from "../types";

interface TopNavBarProps {
  user: UserProfile | null;
  cartCount: number;
  onOpenCart: () => void;
  onSearch: (query: string) => void;
  onNavigate: (view: string, extra?: any) => void;
  currentView: string;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function TopNavBar({
  user,
  cartCount,
  onOpenCart,
  onSearch,
  onNavigate,
  currentView,
  onLogout,
  onOpenAuth
}: TopNavBarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    onNavigate("catalog");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-white border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center px-6 max-w-[1280px] mx-auto h-full">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => onNavigate("home")} 
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Mulia<span className="text-indigo-600">Store</span></span>
          </button>
          
          {/* Main Nav Items */}
          <nav className="hidden md:flex gap-6">
            <button 
              onClick={() => { onSearch(""); onNavigate("catalog"); }}
              className={`font-sans font-semibold text-sm transition-colors duration-150 ${
                currentView === "catalog" ? "text-indigo-600 border-b-2 border-indigo-600 pb-1" : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Katalog
            </button>
            <button 
              onClick={() => onNavigate("promo")}
              className={`font-sans font-semibold text-sm transition-colors duration-150 ${
                currentView === "promo" ? "text-indigo-600 border-b-2 border-indigo-600 pb-1" : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Promo
            </button>
            <button 
              onClick={() => onNavigate("help")}
              className={`font-sans font-semibold text-sm transition-colors duration-150 ${
                currentView === "help" ? "text-indigo-600 border-b-2 border-indigo-600 pb-1" : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Bantuan
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-6 hidden md:block relative">
          <input
            type="text"
            placeholder="Cari produk favoritmu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-full border-none bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 transition-all outline-none"
          />
          <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          {/* Admin Panel Quick Access */}
          {user?.role === "admin" && (
            <button
              onClick={() => onNavigate("admin")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full hover:bg-indigo-100 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* Cart Trigger */}
          <button 
            onClick={onOpenCart}
            className="relative p-2 text-slate-600 hover:text-indigo-600 hover:scale-105 transition-transform"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 text-slate-600 hover:text-indigo-600 hover:scale-105 transition-transform hidden md:block">
            <Bell className="w-6 h-6" />
          </button>

          {/* User Menu / Auth */}
          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
              </div>
              <div className="relative group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 flex items-center justify-center overflow-hidden hover:border-indigo-600 transition-colors">
                  {user.email.substring(0, 2).toUpperCase()}
                </div>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-lg shadow-lg py-1 hidden group-hover:block z-50">
                  <button 
                    onClick={() => onNavigate("profile")}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profil Saya</span>
                  </button>
                  {user.role === "admin" && (
                    <button 
                      onClick={() => onNavigate("admin")}
                      className="w-full text-left px-4 py-2 text-xs text-indigo-600 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin Settings</span>
                    </button>
                  )}
                  <hr className="my-1 border-slate-100" />
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="bg-indigo-600 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 transition-all"
            >
              Masuk / Daftar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
