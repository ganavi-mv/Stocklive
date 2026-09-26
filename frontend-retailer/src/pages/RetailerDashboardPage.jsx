import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function RetailerDashboardPage() {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [productStats, setProductStats] = useState({ total: 0, inStock: 0, outOfStock: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('stocklive_token');
    const storedUser = localStorage.getItem('stocklive_user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch store details
      try {
        const storeRes = await api.get('/stores/my-store');
        setStore(storeRes.data);
      } catch (e) {
        setStore(null);
      }

      // Fetch retailer products stats
      try {
        const prodRes = await api.get('/retailer/products');
        const prods = prodRes.data || [];
        const inStockCount = prods.filter(p => p.availability === 'In Stock').length;
        const outOfStockCount = prods.filter(p => p.availability === 'Out of Stock').length;
        setProductStats({
          total: prods.length,
          inStock: inStockCount,
          outOfStock: outOfStockCount
        });
      } catch (e) {
        setProductStats({ total: 0, inStock: 0, outOfStock: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('stocklive_token');
    localStorage.removeItem('stocklive_user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Clean Glass Header */}
      <header className="px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-zinc-900/10 transform hover:scale-105 transition duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4m0 4h4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-zinc-900 tracking-tight">StockLive</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                Partner
              </span>
            </div>
            <span className="block text-[11px] text-zinc-500 font-medium">Merchant Operations Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-zinc-100/90 border border-zinc-200 px-3.5 py-1.5 rounded-2xl shadow-xs">
            <div className="w-7 h-7 rounded-xl bg-zinc-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <span className="text-xs text-zinc-800 font-semibold hidden sm:inline">
              {user.name}
            </span>
          </div>
          <button onClick={handleLogout} className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-xs font-semibold rounded-xl text-zinc-700 transition border border-zinc-200/90 shadow-xs">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">Welcome, {user.name} 👋</h1>
            <p className="text-zinc-500 text-sm mt-1">Manage your store map pin, bulk CSV inventory, and shelf availability.</p>
          </div>
          {store && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-extrabold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Active Store: {store.name}</span>
            </div>
          )}
        </div>

        {/* Live Operational Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-zinc-200/90 p-5 rounded-3xl shadow-xs hover:shadow-md transition duration-200">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Total Products</span>
            <span className="text-3xl font-black text-zinc-900">{productStats.total}</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Items in inventory</span>
          </div>
          <div className="bg-white border border-zinc-200/90 p-5 rounded-3xl shadow-xs hover:shadow-md transition duration-200">
            <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider block mb-1">In Stock</span>
            <span className="text-3xl font-black text-emerald-600">{productStats.inStock}</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Ready on shelf</span>
          </div>
          <div className="bg-white border border-zinc-200/90 p-5 rounded-3xl shadow-xs hover:shadow-md transition duration-200">
            <span className="text-xs text-rose-600 font-semibold uppercase tracking-wider block mb-1">Out of Stock</span>
            <span className="text-3xl font-black text-rose-600">{productStats.outOfStock}</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Needs restock</span>
          </div>
          <div className="bg-white border border-zinc-200/90 p-5 rounded-3xl shadow-xs hover:shadow-md transition duration-200">
            <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider block mb-1">GPS Location</span>
            <span className="text-xl font-bold text-zinc-900 mt-1 block">
              {store && (store.latitude || store.address || store.map_location_url) ? '🟢 Mapped' : '🔴 Pending'}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-1">Google Maps navigation</span>
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200/90 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/60 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 group shadow-xs">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center mb-5 text-3xl group-hover:scale-105 transition duration-200">🏪</div>
              <h3 className="text-2xl font-black text-zinc-900 mb-2">Configure Store</h3>
              <p className="text-xs text-zinc-500 mb-6 leading-relaxed">Update store profile name, address, phone number, and Google Maps location pin share URL.</p>
            </div>
            <Link to="/store-profile" className="inline-flex items-center justify-center w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs rounded-2xl transition shadow-md shadow-zinc-900/10">
              Configure Store Profile →
            </Link>
          </div>

          <div className="bg-white border border-zinc-200/90 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/60 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 group shadow-xs">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center mb-5 text-3xl group-hover:scale-105 transition duration-200">📦</div>
              <h3 className="text-2xl font-black text-zinc-900 mb-2">Shelf Inventory</h3>
              <p className="text-xs text-zinc-500 mb-6 leading-relaxed">Add individual items or upload entire store inventory via bulk CSV. Update prices and unit stock counts.</p>
            </div>
            <Link to="/inventory" className="inline-flex items-center justify-center w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl transition shadow-md shadow-emerald-600/20">
              Manage Inventory →
            </Link>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-7 flex flex-col justify-between shadow-xs opacity-90">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 text-violet-700 flex items-center justify-center mb-5 text-3xl">📊</div>
              <h3 className="text-2xl font-black text-zinc-900 mb-2">Demand Analytics</h3>
              <p className="text-xs text-zinc-500 mb-6 leading-relaxed">View nearby shopper search activity, peak discovery times, and high-demand product categories.</p>
            </div>
            <div className="px-4 py-3 bg-zinc-100 text-violet-700 text-center font-bold text-xs rounded-2xl border border-zinc-200/80">Analytics Engine Active</div>
          </div>
        </div>
      </main>
    </div>
  );
}
