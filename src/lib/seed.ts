import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";
import { Product } from "../types";

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-headphone",
    name: "Headphone Nirkabel Pro - Hitam Matte",
    sku: "AUD-WH-001",
    price: 1250000,
    discount: 0,
    stock: 45,
    description: "Hadirkan pengalaman mendengarkan audio yang belum pernah Anda rasakan sebelumnya dengan Premium Active Noise-Cancelling Headphones Pro. Didesain secara ergonomis untuk kenyamanan maksimal sepanjang hari, headphone ini menggabungkan teknologi akustik terkini dengan desain minimalis yang elegan.\n\nFitur Utama:\n- Advanced ANC: Meredam kebisingan latar belakang hingga 95%.\n- High-Fidelity Audio: Driver 40mm kustom menghasilkan bass yang dalam.\n- Baterai Tahan Lama: Nikmati musik hingga 40 jam.",
    category: "Elektronik",
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuA_SUVnChHprjzafIT9wLDNmMA2sp7Pg0oO39iG-r8yCrJ5tVRw8_J8pcht23VOv_KR6WIiPczw6JPS9YSaGBiusnbovobrrfPS3LnHVYnCe-Arx_zd7gs_9q3R57w-y0PlSwk1WYrdGRdzKcC7fmabNuYu8G3Ft4rmGwRrEwPfXpfSJV_wt-6UKERhT4CclzMMT46lDotYFKpCz178tUMNAX6OkvHQZORSvh1jeZXu-VqAjyJbbGehfWTiQy2lZ6ykeO_0QMP9kvc"],
    salesCount: 120
  },
  {
    id: "prod-tas",
    name: "Tas Selempang Kulit Klasik - Coklat Karamel",
    sku: "FSH-BG-001",
    price: 450000,
    discount: 0,
    stock: 25,
    description: "Tas selempang kulit klasik bergaya minimalis modern, dibuat dari kulit sintetis premium bertekstur halus. Sangat cocok untuk aktivitas harian, kuliah, maupun kerja kantor. Dilengkapi dengan kompartemen luas dan tali yang dapat disesuaikan panjangnya.",
    category: "Fashion",
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBFyWdidt2jclDdpEeN2lApCSrub1IPOWZRHuQ-bom8bKhxbjwEauOF8OM121hvJFD8Z7KZIUpuDf0sQerAFu_KTW-pOQkYUh_9Hd8yU0aKfC_CGplSSmAFOwrgNJwTLSL80xB2tDRxRRr2e6ZMMsBLGqlNnyQl-nHVSMSj3N70GhQQpR6UuCaCIl3pdma5SfodrdLD5YC9_5OsgqmKixpe0sI3A_AK_8n7KMSTNoZHPqIfKRmosKbA9vtBeHvsoBst1V3MCkzfxK0"],
    salesCount: 85
  },
  {
    id: "prod-smartwatch",
    name: "Smartwatch Modern Minimalis",
    sku: "ELC-SW-002",
    price: 1500000,
    discount: 250000, // final price 1.250.000
    stock: 12,
    description: "Smartwatch modern dengan desain bezel logam perak mengkilap dan tali silikon hitam matte. Dilengkapi dengan pemantau kesehatan detak jantung, pola tidur, dan berbagai mode olahraga harian. Sinkronisasi mudah dengan smartphone Anda.",
    category: "Elektronik",
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuArOOqWAFFSxOMyxC87Aqj_B0KEwODieSw3u6uL-d7VKCIAuco7tpdAhbs3BzQPVzTKWlSrWZfLGNYOeQxO-I7aMeqVzckVROWmX6BHTkamzIyG0So0uQ7OnZMZ3LcdfzVn0ensr22ZnL2ElRJmb1beHt_xbr4QBfLDTH-fNB1Y9wR8hJ0vGz8arIa76KTueoDn6rdnqmrU3jepKWpcSwyRSeomXCYDTG9JCdgsx8O7Ny6YdLD0xeiSpHlDd_W_JzcOq0VFNpfgJdo"],
    salesCount: 120
  },
  {
    id: "prod-kursi",
    name: "Kursi Ergonomis Premium",
    sku: "FNT-CH-003",
    price: 3500000,
    discount: 0,
    stock: 15,
    description: "Kursi kantor ergonomis kelas atas dengan sandaran jala (mesh) abu-abu arang dan aksen aluminium yang elegan. Memberikan dukungan lumbar maksimal, ketinggian yang dapat disesuaikan, serta sandaran lengan 3D untuk kenyamanan kerja jangka panjang.",
    category: "Kecantikan", // or "Rumah", let's map to categorized options: "Elektronik", "Fashion", "Kecantikan", "Rumah"
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDrfK6pUJpJvWJ6h72rQtASR53mmjm-8chuUcHi5EUbIlgPW0TC3uAGS6UutrN_ftZ_b1WBiA4yG8NgKexI4JDJXw3velGLf5eVhkJ_wubTW7gfTZJ7xs5k4pB75f4pjfVnrUlFz_G2-Kkix2K3dwIGBKvYDTqUCBNBQTwJmmI0xkq6AGz1ugIBQI2Tx1G1f7j--nR5X0hmahbpSLro0VsMVs_PPjjAjf-sq6HH6BQ3JoTi7QEQUXcmu6Pe6aRiiw1rpto-vB9L8rg"],
    salesCount: 85
  },
  {
    id: "prod-cangkir",
    name: "Set Cangkir Keramik Estetik",
    sku: "HOM-CP-004",
    price: 250000,
    discount: 0,
    stock: 60,
    description: "Set cangkir kopi keramik berkualitas tinggi dengan desain minimalis elegan berwarna krem matte dan hijau zamrud tua. Lengkap dengan tatakan kayu ek yang menambah kesan estetik dan premium saat menikmati teh atau kopi Anda.",
    category: "Rumah",
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBBNsrxRQIigqCdNy2C4yQKklC-y5Ent9Edme9D1D3LbbuSIPqFbETo_Z0T-Fn43atw9XtlootUS2iQloTJ1eV1yc4onYy_GIIaSD0cYPuUi-XWF7Fz0hyuUPpNd3ASNThHP3xTUDuw7sTlrA4PLeYPU6usakN6siG9VdPUBA8lxIBV05hwwhX7q5yuB4TBFKLgDE8SU0vwk9GM-d7krYoENfnFTGOGSQyDhBJYKFORF8GaM4k7wnBIb57HbnXbAJfqjjfwRhTLn2E"],
    salesCount: 210
  },
  {
    id: "prod-keyboard",
    name: "Keyboard Mekanikal Slim",
    sku: "ELC-KB-005",
    price: 1850000,
    discount: 0,
    stock: 18,
    description: "Keyboard mekanikal ultra-tipis dengan tombol (keycaps) putih low-profile dan sasis aluminium berwarna perak mengkilap. Dirancang secara presisi untuk kenyamanan mengetik maksimal serta estetik meja kerja yang bersih dan modern.",
    category: "Elektronik",
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuD9i5ecpreL3vf_2wsPrZUtwAl36Mtju1nlN99y7U5fBvgYgX2-3XyJiKyzD0HOLtMD--DATfFJTEVtDc8ExYvJxCrsPefmtrAypzNKas9vEMfCGPGIkxxIw9HYCpANd2e73h3G6ljJ6nm_YU14ff2wfrsMaebrPBZ42SEGtP8L0Zn4hqgotsJmkhcBlN_V47e1Q_oLcVgo8WgHwOY3czTxmoZgCiOAweaLzfYSPUXgWsXyzFVT4mfHmNNRajNvSLYIan0s0OGSndA"],
    salesCount: 50
  }
];

export async function seedProductsIfNeeded() {
  try {
    const productsCollection = collection(db, "products");
    const snapshot = await getDocs(productsCollection);
    
    if (snapshot.empty) {
      console.log("No products found in Firestore. Seeding database with initial products...");
      const batch = writeBatch(db);
      
      for (const prod of SEED_PRODUCTS) {
        const docRef = doc(db, "products", prod.id);
        batch.set(docRef, prod);
      }
      
      await batch.commit();
      console.log("Database seeded successfully!");
      return true;
    }
    return false;
  } catch (error) {
    console.warn("Seeding products is not available or blocked by permissions (running in client-only fallback):", error);
    return false;
  }
}
