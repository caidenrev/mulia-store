export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  discount: number; // Diskon dalam Rupiah (0 jika tidak ada)
  stock: number;
  description: string;
  category: string;
  imageUrls: string[];
  createdAt?: any;
  salesCount?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number; // final price (price - discount)
  originalPrice: number;
  quantity: number;
  imageUrl: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface ShippingAddress {
  province: string;
  city: string;
  district: string;
  detail: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "Pending" | "Paid" | "Processing" | "Shipped" | "Delivered" | "Canceled";
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt?: any;
  address?: ShippingAddress;
}

export interface ShopSettings {
  shopName: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
}
