import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [showConsumerNotice, setShowConsumerNotice] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Navbar */}
      <header className="px-8 py-6 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            S
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">StockLive</span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            Retailer Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 font-semibold transition shadow-md shadow-emerald-500/10"
          >
            Register as Retailer
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-6">
          Real-Time Local Discovery
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
          Stock<span className="text-emerald-400">Live</span>
        </h1>
        
        <p className="text-xl md:text-2xl font-light text-slate-300 max-w-2xl mb-10 leading-relaxed">
          "Find local products before you make the trip."
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <button
            onClick={() => setShowConsumerNotice(true)}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition shadow-lg"
          >
            Find Products
          </button>
          
          <Link
            to="/login"
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            Retailer Login
          </Link>

          <Link
            to="/register"
            className="px-8 py-4 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 font-semibold rounded-xl border border-emerald-800/50 transition shadow-lg"
          >
            Register as Retailer
          </Link>
        </div>

        {/* Consumer Search Notice Modal */}
        {showConsumerNotice && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-left shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Consumer Search</h3>
              <p className="text-slate-400 text-sm mb-6">
                Consumer search and real-time product discovery will be available in the next phase! For now, retailers can register, log in, and set up store profiles.
              </p>
              <button
                onClick={() => setShowConsumerNotice(false)}
                className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-800/60">
        © {new Date().getFullYear()} StockLive — Local Inventory Discovery & Navigation Assistant
      </footer>
    </div>
  );
}
