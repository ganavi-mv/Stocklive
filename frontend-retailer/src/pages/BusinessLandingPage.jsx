import React from 'react';
import { Link } from 'react-router-dom';

export default function BusinessLandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="px-8 py-5 flex justify-between items-center border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-emerald-400 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4m0 4h4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">StockLive</span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                Partner
              </span>
            </div>
            <span className="block text-[10px] text-slate-400 font-medium">Merchant & Retailer Management Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition">
            Retailer Login
          </Link>
          <Link to="/register" className="px-5 py-2.5 text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition shadow-lg shadow-emerald-500/20">
            Register Store Profile
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-6">
          Dedicated Merchant Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
          Grow Your Local Footfall with <span className="text-emerald-400">StockLive Partner</span>
        </h1>

        <p className="text-lg md:text-xl font-light text-slate-300 max-w-2xl mb-10 leading-relaxed">
          List your store location, publish live shelf inventory, and connect directly with nearby shoppers searching for products right now.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition text-base">
            Register Store Profile
          </Link>
          <Link to="/login" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition text-base">
            Merchant Login
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <div className="text-2xl mb-2">🏪</div>
            <h3 className="font-bold text-white text-lg mb-1">Store Profile & Geolocation</h3>
            <p className="text-slate-400 text-xs">Set address, phone, and auto-detect precise GPS location coordinates.</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-bold text-white text-lg mb-1">Live Shelf Inventory</h3>
            <p className="text-slate-400 text-xs">Add products and toggle stock status (`In Stock` / `Out of Stock`) in real time.</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <div className="text-2xl mb-2">📍</div>
            <h3 className="font-bold text-white text-lg mb-1">Google Maps Navigation</h3>
            <p className="text-slate-400 text-xs">Guide nearby shoppers directly to your physical store location.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-800/60">
        © {new Date().getFullYear()} StockLive Partner — Merchant Inventory & Store Management Platform
      </footer>
    </div>
  );
}
