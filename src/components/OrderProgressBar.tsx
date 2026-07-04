import React from "react";
import { ClipboardList, CreditCard, Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { Order } from "../types";

interface OrderProgressBarProps {
  status: Order["status"];
}

export default function OrderProgressBar({ status }: OrderProgressBarProps) {
  const steps = [
    {
      label: "Pemesanan",
      desc: "Pesanan dibuat",
      icon: ClipboardList,
    },
    {
      label: "Pembayaran",
      desc: "Pembayaran sukses",
      icon: CreditCard,
    },
    {
      label: "Diproses",
      desc: "Sedang disiapkan",
      icon: Package,
    },
    {
      label: "Dikirim",
      desc: "Dalam perjalanan",
      icon: Truck,
    },
    {
      label: "Selesai",
      desc: "Pesanan diterima",
      icon: CheckCircle2,
    },
  ];

  const statusOrder: Order["status"][] = ["Pending", "Paid", "Processing", "Shipped", "Delivered"];
  const currentIdx = status === "Canceled" ? -1 : statusOrder.indexOf(status);

  // Helper to determine step states
  const getStepState = (index: number) => {
    if (status === "Canceled") {
      return index === 0 ? "canceled" : "pending";
    }
    if (currentIdx === -1) return "pending";
    if (index < currentIdx) return "completed";
    if (index === currentIdx) return "active";
    return "pending";
  };

  // Progress line width (percentage) for desktop horizontal line
  const progressPercent = currentIdx >= 0 ? (currentIdx / (steps.length - 1)) * 100 : 0;

  return (
    <div id="order-progress-container" className="w-full bg-slate-50/50 border border-slate-100/80 rounded-2xl p-5 md:p-6 my-4">
      
      {/* Canceled Status Alert */}
      {status === "Canceled" && (
        <div id="canceled-alert" className="flex items-center gap-2.5 mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Pesanan Dibatalkan</p>
            <p className="text-rose-500 font-medium mt-0.5">Pesanan ini telah dibatalkan dan tidak dilanjutkan.</p>
          </div>
        </div>
      )}

      {/* Desktop View: Horizontal Stepper */}
      <div id="desktop-progress" className="hidden md:block relative select-none">
        {/* Background connector line */}
        <div className="absolute top-6 left-8 right-8 h-1 bg-slate-200/60 rounded-full -z-0" />
        
        {/* Active connector line */}
        <motion.div 
          className="absolute top-6 left-8 h-1 bg-emerald-500 rounded-full -z-0 origin-left"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        <div className="flex justify-between items-start relative z-10">
          {steps.map((step, idx) => {
            const state = getStepState(idx);
            const StepIcon = step.icon;

            let nodeStyles = "";
            let textStyles = "";
            let descStyles = "";

            if (state === "completed") {
              nodeStyles = "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100";
              textStyles = "text-emerald-700 font-bold";
              descStyles = "text-emerald-500/80 font-medium";
            } else if (state === "active") {
              nodeStyles = "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-100 animate-pulse-subtle";
              textStyles = "text-indigo-600 font-extrabold";
              descStyles = "text-slate-500 font-semibold";
            } else if (state === "canceled") {
              nodeStyles = "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-100";
              textStyles = "text-rose-600 font-bold";
              descStyles = "text-rose-400 font-medium";
            } else {
              nodeStyles = "bg-white border-slate-200 text-slate-400";
              textStyles = "text-slate-400 font-bold";
              descStyles = "text-slate-300";
            }

            return (
              <div key={idx} className="flex flex-col items-center text-center w-36 group">
                <motion.div 
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${nodeStyles}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <StepIcon className="w-5 h-5" />
                </motion.div>
                
                <div className="mt-3.5 space-y-0.5 px-1">
                  <p className={`text-xs tracking-tight ${textStyles}`}>{step.label}</p>
                  <p className={`text-[10px] ${descStyles}`}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View: Vertical Timeline */}
      <div id="mobile-progress" className="block md:hidden relative select-none pl-4 py-2">
        {/* Background vertical line */}
        <div className="absolute left-[29px] top-4 bottom-4 w-[2px] bg-slate-200/60 rounded-full" />
        
        {/* Active vertical line */}
        <motion.div 
          className="absolute left-[29px] top-4 w-[2px] bg-emerald-500 rounded-full origin-top"
          initial={{ height: 0 }}
          animate={{ height: status === "Canceled" ? 0 : `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        <div className="space-y-6 relative z-10">
          {steps.map((step, idx) => {
            const state = getStepState(idx);
            const StepIcon = step.icon;

            let nodeStyles = "";
            let textStyles = "";
            let descStyles = "";

            if (state === "completed") {
              nodeStyles = "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-50";
              textStyles = "text-emerald-700 font-bold";
              descStyles = "text-emerald-600/80 font-medium";
            } else if (state === "active") {
              nodeStyles = "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-50 shadow-md shadow-indigo-50";
              textStyles = "text-indigo-600 font-extrabold";
              descStyles = "text-slate-500 font-semibold";
            } else if (state === "canceled") {
              nodeStyles = "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-50";
              textStyles = "text-rose-600 font-bold";
              descStyles = "text-rose-400 font-medium";
            } else {
              nodeStyles = "bg-white border-slate-200 text-slate-400";
              textStyles = "text-slate-400 font-semibold";
              descStyles = "text-slate-300";
            }

            return (
              <div key={idx} className="flex items-center gap-4 group">
                <div className={`w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${nodeStyles}`}>
                  <StepIcon className="w-3.5 h-3.5" />
                </div>
                
                <div className="space-y-0.5">
                  <p className={`text-xs ${textStyles}`}>{step.label}</p>
                  <p className={`text-[10px] ${descStyles}`}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
