import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All', 'Personal Care', 'Grocery', 'Home Care', 'Beverages', 'Snacks']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Auth State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailedProduct, setDetailedProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Login/Signup Modal state within page
  const [authMode, setAuthMode] = useState('prompt'); // 'prompt' | 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Check logged in customer user
    const token = localStorage.getItem('stocklive_token');
    const storedUser = localStorage.getItem('stocklive_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async (query = searchQuery) => {
    setLoading(true);
    try {
      let url = '/products?';
      if (selectedCategory && selectedCategory !== 'All') {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (query) {
        url += `search=${encodeURIComponent(query)}`;
      }
      const res = await api.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(searchQuery);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
  };

  const handleProductClick = async (product) => {
    setSelectedProduct(product);
    const token = localStorage.getItem('stocklive_token');
    if (!token) {
      // Unauthenticated user -> Require Login/Signup modal prompt
      setAuthMode('prompt');
      setShowAuthModal(true);
    } else {
      // Authenticated user -> Fetch full product details
      fetchFullProductDetails(product.id);
    }
  };

  const fetchFullProductDetails = async (productId) => {
    setLoadingDetails(true);
    try {
      const res = await api.get(`/products/${productId}`);
      setDetailedProduct(res.data);
    } catch (err) {
      console.error('Failed to fetch product details', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('stocklive_token');
    localStorage.removeItem('stocklive_user');
    setUser(null);
    setDetailedProduct(null);
  };

  // Auth Form Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      if (authMode === 'register') {
        const res = await api.post('/customer/register', {
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        });
        setAuthSuccess('Registration successful! Logging you in...');
        const loginRes = await api.post('/customer/login', {
          email: authForm.email,
          password: authForm.password,
        });
        localStorage.setItem('stocklive_token', loginRes.data.access_token);
        localStorage.setItem('stocklive_user', JSON.stringify(loginRes.data.user));
        setUser(loginRes.data.user);
        setTimeout(() => {
          setShowAuthModal(false);
          if (selectedProduct) {
            fetchFullProductDetails(selectedProduct.id);
          }
        }, 1000);
      } else if (authMode === 'login') {
        const res = await api.post('/customer/login', {
          email: authForm.email,
          password: authForm.password,
        });
        localStorage.setItem('stocklive_token', res.data.access_token);
        localStorage.setItem('stocklive_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setShowAuthModal(false);
        if (selectedProduct) {
          fetchFullProductDetails(selectedProduct.id);
        }
      }
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            S
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-white">StockLive</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-emerald-400 ml-2 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Customer Store
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchProducts(e.target.value);
              }}
              placeholder="Search local products (e.g. Dove, Toothpaste)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-base">🔍</span>
          </div>
        </form>

        {/* User Navigation Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-medium hidden md:inline">
                Hello, <strong className="text-emerald-400">{user.name}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg border border-slate-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-md shadow-emerald-500/10"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Switcher to StockLive Business */}
          <Link
            to="/business"
            className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-800/60 transition shadow-sm"
            title="Switch to StockLive Business Website"
          >
            StockLive for Business 🏪
          </Link>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-10 border-b border-slate-800/80 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
            Find local products before you make the trip.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Browse live shelf availability across trusted stores in your neighbourhood. Browse freely as a guest!
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Product Browsing Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Available Local Products</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700">
              {products.length} items
            </span>
          </h2>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs text-emerald-400 hover:underline"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3"></div>
            <p className="text-sm">Loading available local products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8 max-w-md mx-auto">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="text-lg font-bold text-white mb-1">No Products Found</h3>
            <p className="text-slate-400 text-xs mb-4">
              We couldn't find matching items for "{searchQuery}" in {selectedCategory}.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                fetchProducts('');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Product Image */}
                  <div className="h-48 bg-slate-800 relative overflow-hidden flex items-center justify-center p-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <span className="text-4xl text-slate-600">📦</span>
                    )}
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-emerald-400 text-[10px] font-bold rounded-full">
                      {product.availability}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/90 mb-1 block">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-white text-base line-clamp-2 mb-2 group-hover:text-emerald-400 transition">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                      <span>🏪</span> {product.store_name}
                    </p>
                  </div>
                </div>

                {/* Footer Price & Action */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-800/60">
                  <div>
                    <span className="text-xs text-slate-500 block">Price</span>
                    <span className="text-lg font-black text-white">₹{product.price.toFixed(2)}</span>
                  </div>
                  <button className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950 text-emerald-400 text-xs font-bold rounded-xl transition">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ---------------------------------------------------- */}
      {/* AUTHENTICATION PROMPT & LOGIN/SIGNUP MODAL */}
      {/* ---------------------------------------------------- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg p-1"
            >
              ✕
            </button>

            {authMode === 'prompt' && (
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-2xl">
                  🔒
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2">Sign in to View Product Details</h3>
                <p className="text-sm text-slate-400 mb-6">
                  You are browsing as a guest. Please sign in or create an account to view full store inventory details for{' '}
                  <strong className="text-white">{selectedProduct?.name}</strong>.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => setAuthMode('login')}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/10"
                  >
                    Sign In to Account
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition"
                  >
                    Create New Account
                  </button>
                </div>
              </div>
            )}

            {(authMode === 'login' || authMode === 'register') && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {authMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {authMode === 'login' ? 'Access full product availability & store info' : 'Register to unlock product discovery'}
                  </p>
                </div>

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {authError}
                  </div>
                )}

                {authSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                    {authSuccess}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      placeholder="customer@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition mt-2 shadow-lg shadow-emerald-500/10"
                  >
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <div className="mt-4 text-center text-xs text-slate-400">
                  {authMode === 'login' ? (
                    <span>
                      Don't have an account?{' '}
                      <button onClick={() => setAuthMode('register')} className="text-emerald-400 font-semibold hover:underline">
                        Sign Up
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already have an account?{' '}
                      <button onClick={() => setAuthMode('login')} className="text-emerald-400 font-semibold hover:underline">
                        Sign In
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* FULL PRODUCT DETAILS MODAL (AFTER AUTHENTICATION) */}
      {/* ---------------------------------------------------- */}
      {detailedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setDetailedProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg p-1"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                {detailedProduct.category}
              </span>
              <span className="px-2.5 py-1 bg-slate-800 text-emerald-400 text-xs font-semibold rounded-full border border-slate-700">
                {detailedProduct.availability}
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-2">{detailedProduct.name}</h2>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {detailedProduct.description}
            </p>

            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-5 mb-6 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-700/60">
                <span className="text-xs text-slate-400 font-medium">Selling Price</span>
                <span className="text-xl font-black text-white">₹{detailedProduct.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700/60">
                <span className="text-xs text-slate-400 font-medium">Available Store</span>
                <span className="text-sm font-bold text-emerald-400">🏪 {detailedProduct.store_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Stock Status</span>
                <span className="text-xs font-bold text-white">{detailedProduct.availability}</span>
              </div>
            </div>

            <button
              onClick={() => setDetailedProduct(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition border border-slate-700"
            >
              Close Product View
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-800/60">
        © {new Date().getFullYear()} StockLive — Customer Local Inventory Discovery & Navigation Assistant
      </footer>
    </div>
  );
}
