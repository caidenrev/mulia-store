import React from "react";
import { X, Mail, Lock, User, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserProfile } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("Nama lengkap wajib diisi");
        
        // Sign up
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;
        
        const newUser: UserProfile = {
          uid,
          email,
          name,
          role: "user",
          createdAt: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, "users", uid), newUser);
        } catch (dbErr) {
          console.warn("Failed to write user to Firestore (database might be locked/unconfigured). Falling back to prototype user state:", dbErr);
        }
        onSuccess(newUser);
      } else {
        // Sign in
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        let profile: UserProfile | null = null;
        try {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            profile = userDoc.data() as UserProfile;
          }
        } catch (dbErr) {
          console.warn("Failed to read user doc from Firestore. Falling back to prototype user state:", dbErr);
        }

        if (!profile) {
          profile = {
            uid,
            email,
            name: email.split("@")[0],
            role: "user"
          };
          try {
            await setDoc(doc(db, "users", uid), profile);
          } catch (dbErr) {
            console.warn("Failed to write default user fallback to Firestore:", dbErr);
          }
        }
        onSuccess(profile);
      }
      onClose();
    } catch (e: any) {
      console.error(e);
      let errMsg = e.message || "Terjadi kesalahan";
      if (e.code === "auth/email-already-in-use") {
        errMsg = "Email ini sudah terdaftar. Silakan masuk.";
      } else if (e.code === "auth/wrong-password" || e.code === "auth/user-not-found") {
        errMsg = "Email atau password salah.";
      } else if (e.code === "auth/invalid-email") {
        errMsg = "Format email tidak valid.";
      } else if (e.code === "auth/weak-password") {
        errMsg = "Password harus minimal 6 karakter.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Instant demo user sign-in helper
  const handleInstantDemo = async (role: "admin" | "user") => {
    setError("");
    setLoading(true);

    try {
      const demoEmail = role === "admin" ? "admin@muliastore.com" : "customer@muliastore.com";
      const demoPassword = "password123";
      
      let userCred;
      try {
        userCred = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      } catch (signInError: any) {
        // If demo user doesn't exist yet, create it on the fly!
        userCred = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
      }

      const uid = userCred.user.uid;
      
      let existingProfile: UserProfile | null = null;
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          existingProfile = userDoc.data() as UserProfile;
        }
      } catch (dbErr) {
        console.warn("Could not read demo user doc from Firestore. Using runtime fallback:", dbErr);
      }
      
      const demoUser: UserProfile = existingProfile || {
        uid,
        email: demoEmail,
        name: role === "admin" ? "Mulia Admin" : "Demo Customer",
        role: role,
        createdAt: new Date().toISOString()
      };

      // Ensure the role is locked in Firestore
      try {
        await setDoc(doc(db, "users", uid), demoUser);
      } catch (dbErr) {
        console.warn("Failed to save demo user state to Firestore (database might be locked/unconfigured):", dbErr);
      }
      
      onSuccess(demoUser);
      onClose();
    } catch (e: any) {
      console.error(e);
      setError("Gagal masuk dengan akun demo: " + (e.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden relative border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="font-sans font-bold text-lg text-slate-800">
              {isRegister ? "Buat Akun Baru" : "Masuk ke Akun Anda"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRegister ? "Daftar untuk menikmati belanja mudah" : "Masukkan email & password untuk masuk"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-3">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Min. 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border-none rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 text-white font-sans font-bold text-sm rounded-xl hover:bg-indigo-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? "Memproses..." : isRegister ? "Daftar Akun" : "Masuk"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle register / login */}
          <div className="text-center text-xs text-slate-400 py-1">
            <span>{isRegister ? "Sudah punya akun? " : "Belum punya akun? "}</span>
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-indigo-600 font-bold hover:underline"
            >
              {isRegister ? "Masuk Sekarang" : "Daftar Sekarang"}
            </button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400">Atau Coba Akses Instan</span>
            </div>
          </div>

          {/* Demo Sign-In Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleInstantDemo("user")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 p-3 border border-slate-200 rounded-xl hover:bg-indigo-50/30 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Customer Demo</span>
            </button>
            <button
              onClick={() => handleInstantDemo("admin")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 p-3 border border-amber-200 rounded-xl hover:bg-amber-50/50 text-xs font-semibold text-slate-700 hover:text-amber-800 transition-all disabled:opacity-50 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
