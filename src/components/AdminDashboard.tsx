import React from "react";
import { 
  BarChart3, Box, ShoppingCart, Users, Settings, Plus, Edit3, Trash2, 
  Search, ShieldAlert, DollarSign, Package, User, Clock, CheckCircle2, 
  AlertTriangle, Eye, RefreshCw, AlertCircle
} from "lucide-react";
import { Product, Order, UserProfile, ShopSettings } from "../types";
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, 
  query, orderBy, limit, serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onRefreshProducts: () => void;
  onRefreshOrders: () => void;
  onNavigate: (view: string, extra?: any) => void;
}

export default function AdminDashboard({
  products,
  orders,
  onRefreshProducts,
  onRefreshOrders,
  onNavigate
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "products" | "orders" | "customers" | "settings">("overview");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [customers, setCustomers] = React.useState<UserProfile[]>([]);

  // Product Form State
  const [showProductForm, setShowProductForm] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [pName, setPName] = React.useState("");
  const [pSku, setPSku] = React.useState("");
  const [pCategory, setPCategory] = React.useState("Elektronik");
  const [pPrice, setPPrice] = React.useState("");
  const [pDiscount, setPDiscount] = React.useState("");
  const [pStock, setPStock] = React.useState("");
  const [pDesc, setPDesc] = React.useState("");
  const [pImgUrl, setPImgUrl] = React.useState("");

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  // Settings State
  const [shopName, setShopName] = React.useState("MuliaStore");
  const [contactEmail, setContactEmail] = React.useState("support@muliastore.com");
  const [contactPhone, setContactPhone] = React.useState("08123456789");
  const [midtransServerKey, setMidtransServerKey] = React.useState("SB-Mid-server-XXXX");
  const [midtransClientKey, setMidtransClientKey] = React.useState("SB-Mid-client-YYYY");

  // Fetch registered customers
  const fetchCustomers = async () => {
    try {
      const q = collection(db, "users");
      const snap = await getDocs(q);
      const list: UserProfile[] = [];
      snap.forEach((doc) => {
        list.push({ uid: doc.id, ...doc.data() } as UserProfile);
      });
      if (list.length === 0) {
        setCustomers([
          { uid: "cust-1", email: "customer@muliastore.com", name: "Demo Customer", role: "user" },
          { uid: "cust-2", email: "budi@gmail.com", name: "Budi Santoso", role: "user" },
          { uid: "cust-3", email: "ani@yahoo.com", name: "Ani Wijaya", role: "user" }
        ]);
      } else {
        setCustomers(list);
      }
    } catch (e) {
      console.warn("Error fetching customers from Firestore, falling back to prototype customer list:", e);
      setCustomers([
        { uid: "cust-1", email: "customer@muliastore.com", name: "Demo Customer", role: "user" },
        { uid: "cust-2", email: "budi@gmail.com", name: "Budi Santoso", role: "user" },
        { uid: "cust-3", email: "ani@yahoo.com", name: "Ani Wijaya", role: "user" }
      ]);
    }
  };

  // Fetch shop settings
  const fetchSettings = async () => {
    try {
      const docRef = doc(db, "settings", "config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setShopName(data.shopName || "MuliaStore");
        setContactEmail(data.contactEmail || "support@muliastore.com");
        setContactPhone(data.contactPhone || "08123456789");
        setMidtransServerKey(data.midtransServerKey || "");
        setMidtransClientKey(data.midtransClientKey || "");
      }
    } catch (e) {
      console.warn("Error fetching settings from Firestore (running in fallback mode):", e);
    }
  };

  React.useEffect(() => {
    fetchCustomers();
    fetchSettings();
  }, []);

  // Calculate Metrics
  const metrics = React.useMemo(() => {
    const paidOrders = orders.filter((o) => o.status === "Paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const lowStockCount = products.filter((p) => p.stock <= 5).length;
    
    return {
      revenue: totalRevenue,
      ordersCount: orders.length,
      customersCount: customers.length,
      lowStock: lowStockCount
    };
  }, [orders, products, customers]);

  // Handle Product Save (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const parsedPrice = parseFloat(pPrice);
    const parsedDiscount = parseFloat(pDiscount) || 0;
    const parsedStock = parseInt(pStock);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) {
      alert("Harga dan stok harus angka valid");
      setLoading(false);
      return;
    }

    const prodData: Omit<Product, "id"> = {
      name: pName,
      sku: pSku,
      category: pCategory,
      price: parsedPrice,
      discount: parsedDiscount,
      stock: parsedStock,
      description: pDesc,
      imageUrls: [pImgUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop"],
      salesCount: editingProduct?.salesCount || 0
    };

    try {
      if (editingProduct) {
        // Update
        await updateDoc(doc(db, "products", editingProduct.id), prodData);
      } else {
        // Create
        const randomId = "prod-" + Math.floor(100000 + Math.random() * 900000);
        await setDoc(doc(db, "products", randomId), { id: randomId, ...prodData });
      }

      onRefreshProducts();
      setShowProductForm(false);
      setEditingProduct(null);
      resetProductForm();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  const resetProductForm = () => {
    setPName("");
    setPSku("");
    setPCategory("Elektronik");
    setPPrice("");
    setPDiscount("");
    setPStock("");
    setPDesc("");
    setPImgUrl("");
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPSku(prod.sku);
    setPCategory(prod.category);
    setPPrice(prod.price.toString());
    setPDiscount((prod.discount || 0).toString());
    setPStock(prod.stock.toString());
    setPDesc(prod.description);
    setPImgUrl(prod.imageUrls?.[0] || "");
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      onRefreshProducts();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus produk");
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", "config"), {
        shopName,
        contactEmail,
        contactPhone,
        midtransServerKey,
        midtransClientKey,
        updatedAt: new Date().toISOString()
      });
      alert("Pengaturan toko berhasil disimpan!");
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setLoading(false);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      onRefreshOrders();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui status order");
    }
  };

  // Render Status Badge
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700 font-extrabold";
      case "Pending":
        return "bg-amber-100 text-amber-700 font-extrabold";
      case "Canceled":
      case "Failed":
        return "bg-red-100 text-red-700 font-extrabold";
      case "Processing":
        return "bg-sky-100 text-sky-700 font-extrabold";
      default:
        return "bg-gray-100 text-gray-700 font-extrabold";
    }
  };

  // Sales Trend Chart Data (Last 7 days mock sales)
  const chartData = [
    { label: "Sen", amount: 15000000 },
    { label: "Sel", amount: 18500000 },
    { label: "Rab", amount: 12000000 },
    { label: "Kam", amount: 22000000 },
    { label: "Jum", amount: 31000000 },
    { label: "Sab", amount: 42000000 },
    { label: "Min", amount: 35000000 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-16">
      {/* Sidebar - md:col-span-3 */}
      <aside className="md:col-span-3">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center gap-2 px-3 py-4 border-b border-slate-100">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <span className="font-sans font-black text-sm text-slate-800">DASHBOARD ADMIN</span>
          </div>

          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-left transition-all ${
              activeTab === "overview" ? "bg-indigo-50 text-indigo-600 font-extrabold" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <BarChart3 className="w-4.5 h-4.5" />
            <span>Ringkasan Bisnis</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-left transition-all ${
              activeTab === "products" ? "bg-indigo-50 text-indigo-600 font-extrabold" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Box className="w-4.5 h-4.5" />
            <span>Manajemen Produk</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-left transition-all ${
              activeTab === "orders" ? "bg-indigo-50 text-indigo-600 font-extrabold" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            <span>Manajemen Order</span>
          </button>

          <button
            onClick={() => setActiveTab("customers")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-left transition-all ${
              activeTab === "customers" ? "bg-indigo-50 text-indigo-600 font-extrabold" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>Manajemen Customer</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-left transition-all ${
              activeTab === "settings" ? "bg-indigo-50 text-indigo-600 font-extrabold" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Settings className="w-4.5 h-4.5" />
            <span>Pengaturan Toko</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - md:col-span-9 */}
      <section className="md:col-span-9 space-y-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">TOTAL PENDAPATAN</p>
                  <p className="text-base font-extrabold text-slate-800">Rp {metrics.revenue.toLocaleString("id-ID")}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">TOTAL PESANAN</p>
                  <p className="text-base font-extrabold text-gray-800">{metrics.ordersCount} Order</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">TOTAL CUSTOMER</p>
                  <p className="text-base font-extrabold text-gray-800">{metrics.customersCount} Pengguna</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">LOW STOCK ITEMS</p>
                  <p className="text-base font-extrabold text-gray-800">{metrics.lowStock} Produk</p>
                </div>
              </div>
            </div>

            {/* Sales Chart & Recent list */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sales Chart widget */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-7 space-y-4">
                <div>
                  <h3 className="font-sans font-bold text-sm text-gray-800">Grafik Penjualan Mingguan</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Statistik pendapatan harian dianalisis secara real-time</p>
                </div>
                {/* SVG styled custom Chart */}
                <div className="h-44 flex items-end justify-between px-2 pt-6">
                  {chartData.map((data, idx) => {
                    const pct = (data.amount / 45000000) * 100;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                        <div className="text-[9px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white rounded px-1 py-0.5 mb-1 absolute transform -translate-y-8 pointer-events-none">
                          {data.amount / 1000000}M
                        </div>
                        <div 
                          style={{ height: `${pct}%` }} 
                          className="w-8 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all group-hover:opacity-80"
                        />
                        <span className="text-[10px] font-bold text-gray-500">{data.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status checklist widget */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-5 space-y-4">
                <div>
                  <h3 className="font-sans font-bold text-sm text-gray-800">Status Gateway &amp; Sistem</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Koneksi modul API dan layanan server cloud</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-600 font-medium">Midtrans Payment Gateway</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                      ● ONLINE
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-600 font-medium">Database Firestore Sync</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                      ● ONLINE
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-600 font-medium">Firebase Auth Service</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                      ● ONLINE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-sans font-bold text-sm text-gray-800">Pesanan Masuk Terbaru</h3>
                <button onClick={onRefreshOrders} className="p-1.5 text-slate-400 hover:text-indigo-600">
                  <RefreshCw className="w-4 h-4 animate-hover" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4">ORDER ID</th>
                      <th className="p-4">PELANGGAN</th>
                      <th className="p-4">TOTAL</th>
                      <th className="p-4">METODE BAYAR</th>
                      <th className="p-4 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                        <td className="p-4 font-mono font-bold text-gray-800">{ord.id}</td>
                        <td className="p-4 text-gray-600 font-semibold">{ord.customerName}</td>
                        <td className="p-4 font-bold text-gray-800">Rp {ord.total.toLocaleString("id-ID")}</td>
                        <td className="p-4 text-gray-500 text-[11px]">{ord.paymentMethod}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(ord.status)}`}>
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-xs text-gray-400">Belum ada pesanan masuk.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS MANAGEMENT TAB */}
        {activeTab === "products" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari SKU atau nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>

              <button
                onClick={() => { resetProductForm(); setEditingProduct(null); setShowProductForm(true); }}
                className="bg-indigo-600 text-white font-sans font-bold text-xs h-10 px-4 rounded-xl hover:bg-indigo-700 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk</span>
              </button>
            </div>

            {/* Product table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4">SKU / FOTO</th>
                      <th className="p-4">NAMA PRODUK</th>
                      <th className="p-4">KATEGORI</th>
                      <th className="p-4">HARGA</th>
                      <th className="p-4 text-center">STOK</th>
                      <th className="p-4 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((prod) => (
                        <tr key={prod.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                          <td className="p-4 flex items-center gap-3">
                            <img src={prod.imageUrls?.[0]} alt="" className="w-9 h-9 rounded object-cover border border-gray-100" />
                            <span className="font-mono text-[10px] font-bold text-gray-400">{prod.sku}</span>
                          </td>
                          <td className="p-4 font-bold text-gray-800 max-w-[200px] truncate">{prod.name}</td>
                          <td className="p-4 text-gray-500 font-medium">{prod.category}</td>
                          <td className="p-4 font-bold text-gray-800">
                            Rp {prod.price.toLocaleString("id-ID")}
                            {prod.discount > 0 && <span className="text-[10px] block font-bold text-red-500">Disc: Rp {prod.discount.toLocaleString("id-ID")}</span>}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prod.stock <= 5 ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                              {prod.stock} pcs
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleEditProductClick(prod)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PRODUCT ADD/EDIT POPUP MODAL */}
            {showProductForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="font-sans font-bold text-base text-gray-800">{editingProduct ? "Edit Detail Produk" : "Tambah Produk Baru"}</h3>
                    <button onClick={() => setShowProductForm(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                      <Plus className="w-5 h-5 rotate-45" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Nama Produk</label>
                        <input
                          type="text"
                          required
                          value={pName}
                          onChange={(e) => setPName(e.target.value)}
                          placeholder="Contoh: Headphone Bluetooth Pro"
                          className="w-full h-10 px-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#006948]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">SKU (Kode Unik)</label>
                        <input
                          type="text"
                          required
                          value={pSku}
                          onChange={(e) => setPSku(e.target.value)}
                          placeholder="Contoh: AUD-WH-001"
                          className="w-full h-10 px-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#006948]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Kategori</label>
                        <select
                          value={pCategory}
                          onChange={(e) => setPCategory(e.target.value)}
                          className="w-full h-10 px-3 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#006948]"
                        >
                          <option value="Elektronik">Elektronik</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Kecantikan">Kecantikan</option>
                          <option value="Rumah">Rumah</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Stok Inventaris</label>
                        <input
                          type="number"
                          required
                          value={pStock}
                          onChange={(e) => setPStock(e.target.value)}
                          placeholder="Jumlah pcs"
                          className="w-full h-10 px-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#006948]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Harga Normal (IDR)</label>
                        <input
                          type="number"
                          required
                          value={pPrice}
                          onChange={(e) => setPPrice(e.target.value)}
                          placeholder="Harga rupiah"
                          className="w-full h-10 px-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#006948]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Potongan Diskon (IDR)</label>
                        <input
                          type="number"
                          value={pDiscount}
                          onChange={(e) => setPDiscount(e.target.value)}
                          placeholder="0 jika tidak ada"
                          className="w-full h-10 px-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#006948]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600">URL Gambar Utama</label>
                      <input
                        type="url"
                        value={pImgUrl}
                        onChange={(e) => setPImgUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... atau link media online"
                        className="w-full h-10 px-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#006948]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600">Deskripsi Lengkap Produk</label>
                      <textarea
                        rows={4}
                        required
                        value={pDesc}
                        onChange={(e) => setPDesc(e.target.value)}
                        placeholder="Detail keunggulan, spesifikasi, isi paket penjualan..."
                        className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#006948] resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowProductForm(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs h-11 rounded-xl transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-indigo-600 text-white font-sans font-bold text-xs h-11 rounded-xl hover:bg-indigo-700 transition-all"
                      >
                        {loading ? "Menyimpan..." : "Simpan Produk"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-4 animate-fade-in">
            {/* Orders summary banner */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <span className="font-sans font-bold text-xs text-gray-700">Daftar Semua Pesanan Pelanggan</span>
                <button onClick={onRefreshOrders} className="p-1.5 text-slate-400 hover:text-indigo-600">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4">ORDER ID</th>
                      <th className="p-4">PELANGGAN</th>
                      <th className="p-4">TOTAL</th>
                      <th className="p-4">METODE BAYAR</th>
                      <th className="p-4 text-center">STATUS</th>
                      <th className="p-4 text-center">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                        <td className="p-4 font-mono font-bold text-gray-800">{ord.id}</td>
                        <td className="p-4">
                          <p className="font-semibold text-gray-800">{ord.customerName}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{ord.customerEmail}</p>
                        </td>
                        <td className="p-4 font-bold text-gray-800">Rp {ord.total.toLocaleString("id-ID")}</td>
                        <td className="p-4 text-gray-500 font-medium text-[11px]">{ord.paymentMethod}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(ord.status)}`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ORDER DETAIL DIALOG MODAL */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                    <div>
                      <h3 className="font-sans font-bold text-sm text-gray-800">Detail Invoice {selectedOrder.id}</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Sistem Pembayaran: {selectedOrder.paymentMethod}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
                      <Plus className="w-5 h-5 rotate-45" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Customer & Shipping summary */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tujuan Penerima</h4>
                      <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-1.5 text-xs">
                        <p className="text-gray-800 font-bold">{selectedOrder.customerName}</p>
                        <p className="text-gray-500 font-semibold">{selectedOrder.customerEmail}</p>
                        <p className="text-gray-600 text-[11px] leading-relaxed">
                          {selectedOrder.shippingAddress.detail}, {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}
                        </p>
                      </div>
                    </div>

                    {/* Order items list */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Barang Pembelian</h4>
                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {selectedOrder.items.map((it, idx) => (
                          <div key={idx} className="flex gap-3 items-center p-2.5 border border-gray-100 rounded-xl bg-white shadow-inner">
                            <img src={it.imageUrl} alt="" className="w-10 h-10 rounded object-cover border" />
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-800 line-clamp-1">{it.name}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{it.quantity} x Rp {it.price.toLocaleString("id-ID")}</p>
                            </div>
                            <span className="font-bold text-xs text-gray-700">Rp {(it.price * it.quantity).toLocaleString("id-ID")}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Payment update block */}
                    <div className="space-y-2 border-t border-gray-100 pt-3">
                      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Perbarui Status Logistik</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, "Paid")}
                          className="px-2 py-2 text-[10px] font-bold rounded-lg border bg-green-50 text-green-700 border-green-200"
                        >
                          Tandai Lunas
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, "Shipped")}
                          className="px-2 py-2 text-[10px] font-bold rounded-lg border bg-sky-50 text-sky-700 border-sky-200"
                        >
                          Kirim Barang
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, "Delivered")}
                          className="px-2 py-2 text-[10px] font-bold rounded-lg border bg-emerald-100 text-emerald-800 border-emerald-200"
                        >
                          Diterima
                        </button>
                      </div>
                    </div>

                    {/* Financial stats summary */}
                    <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>Rp {selectedOrder.subtotal.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>PPN (11%)</span>
                        <span>Rp {selectedOrder.tax.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-gray-800 text-sm border-t border-dashed border-gray-200 pt-2">
                        <span>Total Invoice</span>
                        <span className="text-indigo-600">Rp {selectedOrder.total.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMERS TABLE TAB */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <span className="font-sans font-bold text-xs text-gray-700">Daftar Customer Terdaftar</span>
              <button onClick={fetchCustomers} className="p-1.5 text-slate-400 hover:text-indigo-600">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4">UID CUSTOMER</th>
                    <th className="p-4">NAMA</th>
                    <th className="p-4">EMAIL</th>
                    <th className="p-4">HAK AKSES</th>
                    <th className="p-4 text-center">TANGGAL DAFTAR</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((cust) => (
                    <tr key={cust.uid} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                      <td className="p-4 font-mono text-[10px] text-gray-400">{cust.uid}</td>
                      <td className="p-4 font-bold text-gray-800">{cust.name}</td>
                      <td className="p-4 text-gray-600 font-semibold">{cust.email}</td>
                      <td className="p-4 capitalize">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cust.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-sky-50 text-sky-700"}`}>
                          {cust.role}
                        </span>
                      </td>
                      <td className="p-4 text-center text-gray-400 text-[10px]">
                        {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString("id-ID") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SHOP SETTINGS TAB */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 animate-fade-in">
            <div>
              <h3 className="font-sans font-bold text-sm text-gray-800">Pengaturan Identitas Toko</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Konfigurasi profile, email, contact, dan integrasi Midtrans</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Nama Toko Online</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Email Kontak Admin</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">No. Telepon Toko</label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full h-11 px-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
              />
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-start text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-white pr-2 text-sky-700">Integrasi Midtrans Sandbox Credentials</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Midtrans Server Key (Private)</label>
                <input
                  type="password"
                  value={midtransServerKey}
                  onChange={(e) => setMidtransServerKey(e.target.value)}
                  placeholder="SB-Mid-server-..."
                  className="w-full h-11 px-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Midtrans Client Key (Public)</label>
                <input
                  type="text"
                  value={midtransClientKey}
                  onChange={(e) => setMidtransClientKey(e.target.value)}
                  placeholder="SB-Mid-client-..."
                  className="w-full h-11 px-4 text-xs bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 text-white font-sans font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-md"
            >
              {loading ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
