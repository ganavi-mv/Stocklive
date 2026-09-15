import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RetailerDashboardPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('stocklive_token');
    const storedUser = localStorage.getItem('stocklive_user');

    if (!token || !storedUser) {
      navigate('/business/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      navigate('/business/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('stocklive_token');
    localStorage.removeItem('stocklive_user');
    navigate('/business/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-8 py-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">S</div>
          <div>
            <span className="text-xl font-bold text-white">StockLive <span className="text-emerald-400">Business</span></span>
            <span className="block text-[10px] text-slate-400">Retailer Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 font-medium">Logged in as <strong className="text-slate-200">{user.name}</strong></span>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition"
          >
            Logout
          </button>
          <Link
            to="/"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            Customer Site 🛍️
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white">Welcome, {user.name} 👋</h1>
          <p className="text-slate-400 mt-1">Manage your store details and local inventory operations.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Store Profile (Functional) */}
          <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition flex flex-col justify-between shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 text-2xl">
                🏪
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Store Profile</h3>
              <p className="text-sm text-slate-400 mb-6">
                Create, view, and edit your store name, category, address, phone, and geolocation.
              </p>
            </div>
            <Link
              to="/business/store-profile"
              className="inline-flex items-center justify-center w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition"
            >
              Manage Store Profile →
            </Link>
          </div>

          {/* Card 2: Inventory (Coming soon) */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 flex flex-col justify-between opacity-75">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 text-2xl">
                📦
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Inventory</h3>
              <p className="text-sm text-slate-400 mb-6">
                Publish live stock levels, CSV uploads, and POS sync.
              </p>
            </div>
            <div className="px-4 py-2.5 bg-slate-800 text-amber-400 text-center font-medium text-xs rounded-xl border border-slate-700">
              Coming in next phase
            </div>
          </div>

          {/* Card 3: Consumer Search (Coming soon) */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 flex flex-col justify-between opacity-75">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 text-2xl">
                🔍
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Consumer Search</h3>
              <p className="text-sm text-slate-400 mb-6">
                View consumer search trends and local availability queries near your store.
              </p>
            </div>
            <div className="px-4 py-2.5 bg-slate-800 text-blue-400 text-center font-medium text-xs rounded-xl border border-slate-700">
              Coming in next phase
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
