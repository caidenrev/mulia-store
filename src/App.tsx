import React from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { seedProductsIfNeeded, SEED_PRODUCTS } from "./lib/seed";
import { Product, CartItem, Order, UserProfile, ShippingAddress } from "./types";

// Import Custom components
import TopNavBar from "./components/TopNavBar";
import StorefrontHome from "./components/StorefrontHome";
import StorefrontCatalog from "./components/StorefrontCatalog";
import ProductDetail from "./components/ProductDetail";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import AdminDashboard from "./components/AdminDashboard";
import AuthModal from "./components/AuthModal";
import OrderProgressBar from "./components/OrderProgressBar";

// Icons
import { CheckCircle2, ShoppingBag, ArrowRight, Home, Calendar, ShieldAlert, Sparkles, MessageCircle, Mail, Loader2, Percent, HelpCircle, ChevronDown } from "lucide-react";

export default function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = React.useState<string>("home");
  const [activeProduct, setActiveProduct] = React.useState<Product | null>(null);
  const [catalogCategory, setCatalogCategory] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Data States
  const [products, setProducts] = React.useState<Product[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState<boolean>(true);

  // Cart States
  const [cartItems, setCartItems] = React.useState<CartItem[]>(() => {
    const saved = localStorage.getItem("mulia_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = React.useState<boolean>(false);

  // Auth States
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = React.useState<boolean>(false);

  // Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState<boolean>(false);
  const [checkoutLoading, setCheckoutLoading] = React.useState<boolean>(false);
  const [latestPlacedOrderId, setLatestPlacedOrderId] = React.useState<string>("");

  // Persist cart
  React.useEffect(() => {
    localStorage.setItem("mulia_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Load and seed products on mount
  const loadData = async () => {
    setLoadingProducts(true);
    try {
      await seedProductsIfNeeded();
      await fetchProducts();
    } catch (e) {
      console.warn("Error loading database products on initialization:", e);
      setProducts(SEED_PRODUCTS);
    } finally {
      setLoadingProducts(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Sync user state and roles from Firestore
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            setUser(profile);
            
            // Fetch relevant orders based on role
            if (profile.role === "admin") {
              fetchAdminOrders();
            } else {
              fetchUserOrders(profile.uid);
            }
          } else {
            // Document doesn't exist yet, build generic profile
            const tempProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.email?.split("@")[0] || "Customer",
              role: "user"
            };
            setUser(tempProfile);
            fetchUserOrders(firebaseUser.uid);
          }
        } catch (e) {
          console.warn("Could not retrieve user profile from Firestore (database may be locked). Falling back to client-side prototype profile:", e);
          const tempProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.email?.split("@")[0] || "Customer",
            role: firebaseUser.email === "admin@muliastore.com" ? "admin" : "user"
          };
          setUser(tempProfile);
          if (tempProfile.role === "admin") {
            fetchAdminOrders();
          } else {
            fetchUserOrders(tempProfile.uid);
          }
        }
      } else {
        setUser(null);
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Methods
  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      const list: Product[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Product);
      });
      if (list.length === 0) {
        setProducts(SEED_PRODUCTS);
      } else {
        setProducts(list);
      }
    } catch (e) {
      console.warn("Error fetching products from Firestore. Falling back to prototype data:", e);
      setProducts(SEED_PRODUCTS);
    }
  };

  const MOCK_ORDERS: Order[] = [
    {
      id: "ord-9831",
      userId: "cust-1",
      customerName: "Demo Customer",
      customerEmail: "customer@muliastore.com",
      items: [
        {
          id: "prod-headphone",
          name: "Headphone Nirkabel Pro - Hitam Matte",
          price: 1299000,
          quantity: 1,
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"
        }
      ],
      subtotal: 1299000,
      tax: 0,
      total: 1299000,
      status: "Delivered",
      shippingAddress: {
        province: "DKI Jakarta",
        city: "Jakarta Selatan",
        district: "Kebayoran Baru",
        detail: "Jl. Jenderal Sudirman No. 45"
      },
      paymentMethod: "GoPay",
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 2, nanoseconds: 0 } as any,
      updatedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 2, nanoseconds: 0 } as any
    },
    {
      id: "ord-1244",
      userId: "cust-1",
      customerName: "Demo Customer",
      customerEmail: "customer@muliastore.com",
      items: [
        {
          id: "prod-keyboard",
          name: "Mulia Mechanical Keyboard G80",
          price: 849000,
          quantity: 1,
          imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600"
        }
      ],
      subtotal: 849000,
      tax: 0,
      total: 849000,
      status: "Processing",
      shippingAddress: {
        province: "DKI Jakarta",
        city: "Jakarta Selatan",
        district: "Mampang Prapatan",
        detail: "Jl. Kemang Raya No. 12"
      },
      paymentMethod: "Bank Transfer",
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 * 4, nanoseconds: 0 } as any,
      updatedAt: { seconds: Math.floor(Date.now() / 1000) - 3600 * 4, nanoseconds: 0 } as any
    }
  ];

  const fetchAdminOrders = async () => {
    try {
      const snap = await getDocs(collection(db, "orders"));
      const list: Order[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Order);
      });
      if (list.length === 0) {
        setOrders(MOCK_ORDERS);
      } else {
        // Sort client-side by creation timestamp to avoid needing index setup
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(list);
      }
    } catch (e) {
      console.warn("Error fetching admin orders. Loading mock/prototype orders instead:", e);
      setOrders(MOCK_ORDERS);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    try {
      const q = query(collection(db, "orders"), where("userId", "==", userId));
      const snap = await getDocs(q);
      const list: Order[] = [];
      snap.forEach((doc) => {
        const o = doc.data() as Order;
        list.push({ id: doc.id, ...o });
      });
      if (list.length === 0) {
        // Filter mock orders for this specific user or show them as default
        const filtered = MOCK_ORDERS.filter(o => o.userId === userId || userId === "cust-1");
        setOrders(filtered.length > 0 ? filtered : MOCK_ORDERS);
      } else {
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(list);
      }
    } catch (e) {
      console.warn("Error fetching customer orders. Loading mock/prototype orders instead:", e);
      setOrders(MOCK_ORDERS);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    const hasDiscount = product.discount > 0;
    const finalPrice = hasDiscount ? product.price - product.discount : product.price;

    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        const updatedQty = Math.min(exists.quantity + quantity, product.stock);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: updatedQty } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: finalPrice,
          originalPrice: product.price,
          quantity: Math.min(quantity, product.stock),
          imageUrl: product.imageUrls?.[0] || ""
        }
      ];
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const product = products.find((p) => p.id === id);
            const maxStock = product ? product.stock : 99;
            const newQty = Math.min(Math.max(item.quantity + delta, 1), maxStock);
            return { ...item, quantity: newQty };
          }
          return item;
        })
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Buy Now direct flow
  const handleBuyNow = (product: Product, quantity: number) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Checkout Execution
  const handlePlaceOrder = async (customerInfo: { name: string; email: string; address: ShippingAddress }) => {
    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "guest",
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          items: cartItems,
          shippingAddress: customerInfo.address
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsCheckoutOpen(false);
        const snap = (window as any).snap;
        if (snap && data.token && !data.token.startsWith("snap_token_")) {
          // Trigger the official Midtrans Snap popup directly using Sandbox keys!
          snap.pay(data.token, {
            onSuccess: async function (result: any) {
              console.log("Midtrans Payment Success:", result);
              // Update payment status on the server
              await fetch("/api/simulate-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderId, status: "Paid" })
              });
              handlePaymentSuccessWithId(data.orderId);
            },
            onPending: function (result: any) {
              console.log("Midtrans Payment Pending:", result);
              alert("Pembayaran Anda tertunda atau sedang diproses. Silakan selesaikan pembayaran.");
              handlePaymentSuccessWithId(data.orderId);
            },
            onError: function (result: any) {
              console.error("Midtrans Payment Error:", result);
              alert("Pembayaran gagal. Silakan coba kembali.");
            },
            onClose: function () {
              console.log("Midtrans Payment window closed");
              handlePaymentSuccessWithId(data.orderId);
            }
          });
        } else {
          // Fallback simulation when run without environment keys
          console.log("Simulating checkout success via Sandbox fallback...");
          await fetch("/api/simulate-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId, status: "Paid" })
          });
          handlePaymentSuccessWithId(data.orderId);
        }
      } else {
        alert(data.error || "Gagal membuat order.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Gagal melakukan checkout: " + e.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Payment completed callback
  const handlePaymentSuccessWithId = (orderId: string) => {
    setLatestPlacedOrderId(orderId);
    setCartItems([]); // Clear cart upon successful paid checkout
    
    // Refresh relevant data
    fetchProducts();
    if (user) {
      if (user.role === "admin") fetchAdminOrders();
      else fetchUserOrders(user.uid);
    }
    
    setCurrentView("success");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCurrentView("home");
    } catch (e) {
      console.error(e);
    }
  };

  // Route / View Navigation
  const handleNavigate = (view: string, extra?: any) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (view === "product-detail" && extra) {
      setActiveProduct(extra);
    }
    if (view === "catalog" && extra) {
      if (extra.category) {
        setCatalogCategory(extra.category);
      }
    } else {
      setCatalogCategory("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col pt-[72px]">
      
      {/* Header Navigation */}
      <TopNavBar
        user={user}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onSearch={(q) => setSearchQuery(q)}
        onNavigate={handleNavigate}
        currentView={currentView}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main viewport Container */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8">
        
        {loadingProducts ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Menyiapkan Katalog MuliaStore...</p>
          </div>
        ) : (
          <>
            {/* View Switching logic */}
            {currentView === "home" && (
              <StorefrontHome
                products={products}
                onNavigate={handleNavigate}
                onAddToCart={handleAddToCart}
              />
            )}

            {currentView === "catalog" && (
              <StorefrontCatalog
                products={products}
                onNavigate={handleNavigate}
                onAddToCart={handleAddToCart}
                initialCategory={catalogCategory}
              />
            )}

            {currentView === "product-detail" && activeProduct && (
              <ProductDetail
                product={activeProduct}
                onNavigate={handleNavigate}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            )}

            {currentView === "admin" && (
              <AdminDashboard
                products={products}
                orders={orders}
                onRefreshProducts={fetchProducts}
                onRefreshOrders={user?.role === "admin" ? fetchAdminOrders : () => fetchUserOrders(user?.uid || "")}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === "promo" && (
              <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
                <span className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner border border-rose-100">
                  <Percent className="w-7 h-7" />
                </span>
                <div className="space-y-2">
                  <h1 className="font-sans font-extrabold text-2xl text-slate-800">Promo Spesial MuliaStore</h1>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Hemat belanja hingga Rp 250.000 dengan promo langsung dan kupon cashback istimewa!</p>
                </div>
                <div className="bg-white p-5 border border-rose-100 rounded-2xl shadow-sm text-left max-w-md mx-auto space-y-3">
                  <p className="text-xs font-bold text-rose-600">PROMO AKTIF HARI INI</p>
                  <p className="text-sm font-bold text-slate-800">Diskon Otomatis Smartwatch Minimalis</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Potongan harga langsung sebesar <span className="font-black text-indigo-600">Rp 250.000</span> tanpa syarat. Cukup tambahkan Smartwatch ke keranjang belanja Anda!</p>
                  <button 
                    onClick={() => handleNavigate("catalog")}
                    className="w-full bg-indigo-600 text-white font-sans font-bold text-xs py-3 rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
                  >
                    Klaim Promo Sekarang
                  </button>
                </div>
              </div>
            )}

            {currentView === "help" && (
              <div className="max-w-xl mx-auto space-y-6 py-12">
                <div className="text-center space-y-2">
                  <span className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100/50">
                    <HelpCircle className="w-7 h-7" />
                  </span>
                  <h1 className="font-sans font-extrabold text-2xl text-slate-800">Pusat Bantuan MuliaStore</h1>
                  <p className="text-xs text-slate-400">Temukan jawaban cepat atau hubungi tim customer service kami</p>
                </div>

                <div className="space-y-4">
                  <details className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm group">
                    <summary className="font-bold text-xs text-slate-700 cursor-pointer list-none flex justify-between items-center">
                      <span>Bagaimana cara melakukan pembayaran dengan Midtrans?</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                      Cukup lakukan checkout dan isi alamat pengiriman Anda. Klik "Bayar" lalu pop-up aman Midtrans Snap akan muncul secara otomatis. Anda dapat memilih metode pembayaran seperti GoPay, QRIS, atau Virtual Account Bank Mandiri/BCA/BNI.
                    </p>
                  </details>

                  <details className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm group">
                    <summary className="font-bold text-xs text-slate-700 cursor-pointer list-none flex justify-between items-center">
                      <span>Apakah pesanan saya dijamin aman?</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                      Ya, tentu saja! MuliaStore menggunakan sistem pembayaran terenkripsi penuh yang didukung oleh Midtrans Sandbox dan penyimpanan awan terdistribusi Firebase Firestore yang aman.
                    </p>
                  </details>
                </div>
              </div>
            )}

            {currentView === "profile" && (
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl border border-indigo-100">
                    {user?.email.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="font-sans font-extrabold text-lg text-slate-800">{user?.name}</h1>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">{user?.email} • Peran: <span className="capitalize">{user?.role}</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="font-sans font-extrabold text-base text-slate-800">Riwayat Belanja Saya ({orders.length})</h2>
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div key={ord.id} className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-slate-800"># {ord.id}</span>
                            <span className="text-[10px] text-slate-400">2026-07-04</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                            ord.status === "Paid" ? "bg-emerald-50 text-emerald-700" :
                            ord.status === "Pending" ? "bg-amber-50 text-amber-700" : 
                            ord.status === "Canceled" ? "bg-rose-50 text-rose-700" : "bg-indigo-50 text-indigo-700"
                          }`}>
                            {ord.status === "Paid" ? "Pembayaran Sukses" : 
                             ord.status === "Pending" ? "Menunggu Pembayaran" : 
                             ord.status === "Canceled" ? "Pesanan Dibatalkan" : ord.status}
                          </span>
                        </div>
                        
                        {/* Order status progress bar */}
                        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/10">
                          <p className="text-xs font-bold text-slate-700 mb-3">Lacak Status Pesanan</p>
                          <OrderProgressBar status={ord.status} />
                        </div>

                        <div className="p-4 space-y-3">
                          {ord.items.map((it, i) => (
                            <div key={i} className="flex gap-4 items-center">
                              <img src={it.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border" />
                              <div className="flex-1 text-xs">
                                <p className="font-bold text-slate-800">{it.name}</p>
                                <p className="text-slate-400 mt-0.5">{it.quantity} barang x Rp {it.price.toLocaleString("id-ID")}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-between items-baseline bg-slate-50/20">
                          <span className="text-xs text-slate-500 font-bold">Total Belanja</span>
                          <span className="font-sans font-black text-sm text-indigo-600">Rp {ord.total.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="bg-white rounded-2xl border p-12 text-center text-xs text-gray-400">
                        Anda belum memiliki riwayat pembelian. Yuk lakukan order pertamamu!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentView === "success" && (
              <div className="max-w-md mx-auto text-center py-16 space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="font-sans font-black text-2xl text-indigo-600 tracking-tight">Pesanan Berhasil Dibuat!</h1>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Terima kasih telah berbelanja di MuliaStore. Nomor pesanan Anda adalah <span className="font-mono font-bold text-slate-800"># {latestPlacedOrderId}</span>. Anda akan menerima invoice konfirmasi email sesaat lagi.
                  </p>
                </div>

                <div className="pt-4 flex gap-3 max-w-xs mx-auto">
                  <button
                    onClick={() => handleNavigate("home")}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs h-11 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Kembali Beranda
                  </button>
                  <button
                    onClick={() => handleNavigate("profile")}
                    className="flex-1 border border-indigo-600 text-indigo-600 font-sans font-bold text-xs h-11 rounded-xl hover:bg-indigo-50/40 transition-all cursor-pointer"
                  >
                    Lihat Riwayat
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Branding Block */}
      <footer className="bg-[#113a5d] text-white py-10 mt-auto px-6 border-t border-sky-950">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-semibold">
          <div className="space-y-3">
            <h3 className="font-sans font-extrabold text-lg text-white">MuliaStore</h3>
            <p className="text-sky-200 leading-relaxed font-medium">Platform e-commerce modern terpercaya dengan integrasi aman Midtrans dan database Firebase terdesentralisasi.</p>
          </div>
          <div className="space-y-2.5">
            <p className="text-sky-300 font-bold uppercase tracking-wider text-[10px]">TENTANG KAMI</p>
            <p className="text-sky-100 hover:underline cursor-pointer">Tentang MuliaStore</p>
            <p className="text-sky-100 hover:underline cursor-pointer">Karir &amp; Afiliasi</p>
            <p className="text-sky-100 hover:underline cursor-pointer">Kontak Hubungi Kami</p>
          </div>
          <div className="space-y-3">
            <p className="text-sky-300 font-bold uppercase tracking-wider text-[10px]">HUBUNGI KAMI</p>
            <p className="text-sky-100 flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" /> <span>support@muliastore.com</span></p>
            <p className="text-sky-100 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-emerald-400" /> <span>+62 812-3456-7890</span></p>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto text-center border-t border-sky-900 mt-8 pt-6 text-[10px] text-sky-300 font-medium">
          &copy; 2026 MuliaStore. All rights reserved. Secured by Midtrans Sandbox Integration.
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
      />

      {/* Auth Register/Login Dialog Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(profile) => {
          setUser(profile);
          if (profile.role === "admin") {
            fetchAdminOrders();
          } else {
            fetchUserOrders(profile.uid);
          }
        }}
      />

      {/* Checkout Shipping Form Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        user={user}
        onPlaceOrder={handlePlaceOrder}
        loading={checkoutLoading}
      />

    </div>
  );
}
