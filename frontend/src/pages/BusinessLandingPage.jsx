import React from 'react';
import { Link } from 'react-router-dom';

export default function BusinessLandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="px-8 py-5 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            S
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white">StockLive <span className="text-emerald-400">Business</span></span>
            <span className="block text-[10px] text-slate-400 font-medium">Retailer & Merchant Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/business/login"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            Retailer Login
          </Link>
          <Link
            to="/business/register"
            className="px-4 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition shadow-md shadow-emerald-500/10"
          >
            Register Your Store
          </Link>
          <Link
            to="/"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition ml-2"
          >
            Go to Customer Site 🛍️
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-6">
          Dedicated Retailer Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
          Grow Your Local Footfall with <span className="text-emerald-400">StockLive Business</span>
        </h1>

        <p className="text-lg md:text-xl font-light text-slate-300 max-w-2xl mb-10 leading-relaxed">
          List your store location, publish live shelf inventory, and connect directly with nearby shoppers searching for products right now.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Link
            to="/business/register"
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/20 text-base"
          >
            Register Store Profile
          </Link>
          <Link
            to="/business/login"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition shadow-lg text-base"
          >
            Retailer Login
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <div className="text-2xl mb-2">🏪</div>
            <h3 className="font-bold text-white text-lg mb-1">Store Profile Management</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Add your store name, business category, phone, physical address, and exact pin geolocation.
            </p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-bold text-white text-lg mb-1">Merchant Dashboard</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Manage your local presence and prepare your product catalog for neighbourhood shoppers.
            </p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <div className="text-2xl mb-2">📍</div>
            <h3 className="font-bold text-white text-lg mb-1">Local Shopper Visibility</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Allow local consumers searching online to find your physical store stock before they travel.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-800/60">
        © {new Date().getFullYear()} StockLive Business — Merchant Inventory & Store Management System
      </footer>
    </div>
  );
}
