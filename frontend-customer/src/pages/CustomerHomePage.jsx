import React, { useState, useEffect } from 'react';
import api from '../api';

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Auth State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailedProduct, setDetailedProduct] = useState(null);

  // Wishlist & Stock Alerts State
  const [wishlist, setWishlist] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [authPromptReason, setAuthPromptReason] = useState('Wishlist & Stock Alerts');

  // Login/Signup Modal state
  const [authMode, setAuthMode] = useState('prompt'); // 'prompt' | 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const categoryIcons = {
    'All': '✨',
    'Personal Care': '🧴',
    'Grocery': '🛒',
    'Home Care': '🧼',
    'Beverages': '🥤',
    'Snacks': '🍿'
  };

  useEffect(() => {
    const token = localStorage.getItem('stocklive_customer_token');
    const storedUser = localStorage.getItem('stocklive_customer_user');
    if (token && storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        fetchUserWishlistAndAlerts(token);
      } catch (e) {
        setUser(null);
      }
    }
    fetchProducts();
  }, [selectedCategory]);

  const fetchUserWishlistAndAlerts = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [wRes, aRes] = await Promise.all([
        api.get('/customer/wishlist', config).catch(() => ({ data: [] })),
        api.get('/customer/stock-alerts', config).catch(() => ({ data: [] }))
      ]);
      setWishlist(wRes.data || []);
      setStockAlerts(aRes.data || []);
    } catch (e) {
      console.error('Failed to fetch user wishlist/alerts', e);
    }
  };

  const getStatusBadge = (product) => {
    const isGuest = !user;
    const qty = product.stock_quantity ?? 10;
    const availability = product.availability;

    if (isGuest) {
      switch (availability) {
        case 'In Stock':
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              In Stock
            </span>
          );
        case 'Low Stock':
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Low Stock
            </span>
          );
        default:
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Out of Stock
            </span>
          );
      }
    }

    // Quantitative display for logged-in registered customers
    if (availability === 'Out of Stock' || qty <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          0 left (Out of Stock)
        </span>
      );
    } else if (availability === 'Low Stock' || qty <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          {qty} left (Low Stock)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {qty} items in stock
        </span>
      );
    }
  };

  const getStockProgressBar = (product) => {
    if (!user) return null;
    const qty = product.stock_quantity ?? 10;
    const maxQty = 20;
    const percentage = Math.min(100, Math.max(5, (qty / maxQty) * 100));

    let barColor = 'bg-emerald-500';
    if (qty <= 0 || product.availability === 'Out of Stock') barColor = 'bg-rose-500';
    else if (qty <= 5 || product.availability === 'Low Stock') barColor = 'bg-amber-500';

    return (
      <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2.5 overflow-hidden border border-zinc-200/60">
        <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  const getCategoryFallbackEmoji = (cat) => {
    return categoryIcons[cat] || '📦';
  };

  const fetchProducts = async (query = searchQuery) => {
    setLoading(true);
    try {
      let url = '/products?';
      if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'Wishlist') {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (query) {
        url += `search=${encodeURIComponent(query)}`;
      }
      const res = await api.get(url);
      let data = res.data || [];

      if (selectedCategory === 'Wishlist') {
        data = data.filter(p => wishlist.includes(p.id));
      }

      setProducts(data);
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
    fetchFullProductDetails(product.id);
  };

  const fetchFullProductDetails = async (productId) => {
    try {
      const token = localStorage.getItem('stocklive_customer_token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await api.get(`/products/${productId}`, config);
      setDetailedProduct(res.data);
    } catch (err) {
      console.error('Failed to fetch product details', err);
    }
  };

  const handleToggleWishlist = async (productId, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      setAuthPromptReason('save items to your Wishlist');
      setAuthMode('prompt');
      setShowAuthModal(true);
      return;
    }

    const token = localStorage.getItem('stocklive_customer_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const isWishlisted = wishlist.includes(productId);

    try {
      if (isWishlisted) {
        await api.delete(`/customer/wishlist/${productId}`, config);
        setWishlist(prev => prev.filter(id => id !== productId));
      } else {
        await api.post(`/customer/wishlist/${productId}`, {}, config);
        setWishlist(prev => [...prev, productId]);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist', err);
    }
  };

  const handleToggleStockAlert = async (productId, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      setAuthPromptReason('set restock alerts');
      setAuthMode('prompt');
      setShowAuthModal(true);
      return;
    }

    const token = localStorage.getItem('stocklive_customer_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const res = await api.post(`/customer/stock-alerts/${productId}`, {}, config);
      if (res.data.status === 'subscribed') {
        setStockAlerts(prev => [...prev, productId]);
      } else {
        setStockAlerts(prev => prev.filter(id => id !== productId));
      }
    } catch (err) {
      console.error('Failed to toggle stock alert', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('stocklive_customer_token');
    localStorage.removeItem('stocklive_customer_user');
    setUser(null);
    setWishlist([]);
    setStockAlerts([]);
    setDetailedProduct(null);
  };

  const handleOpenGoogleMaps = (prod) => {
    let mapsUrl = '';
    if (prod.store_map_location_url) {
      mapsUrl = prod.store_map_location_url;
    } else if (prod.store_latitude && prod.store_longitude) {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${prod.store_latitude},${prod.store_longitude}`;
    } else if (prod.store_address) {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prod.store_address)}`;
    } else {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prod.store_name)}`;
    }
    window.open(mapsUrl, '_blank');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      if (authMode === 'register') {
        await api.post('/customer/register', {
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        });
        setAuthSuccess('Account created! Logging you in...');
        const loginRes = await api.post('/customer/login', {
          email: authForm.email,
          password: authForm.password,
        });
        localStorage.setItem('stocklive_customer_token', loginRes.data.access_token);
        localStorage.setItem('stocklive_customer_user', JSON.stringify(loginRes.data.user));
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
        localStorage.setItem('stocklive_customer_token', res.data.access_token);
        localStorage.setItem('stocklive_customer_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setShowAuthModal(false);
        if (selectedProduct) {
          fetchFullProductDetails(selectedProduct.id);
        }
      }
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Authentication failed. Check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Clean Glass Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-zinc-900/10 transform hover:scale-105 transition duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-zinc-900">StockLive</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                Shopper
              </span>
            </div>
            <span className="block text-[11px] text-zinc-500 font-medium">Real-Time Local Shelf Availability</span>
          </div>
        </div>

        {/* Crisp Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg mx-2">
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchProducts(e.target.value);
              }}
              placeholder="Search local shelf inventory (e.g. Dove, Parle-G, Shampoo)..."
              className="w-full pl-11 pr-10 py-2.5 bg-zinc-100/80 border border-zinc-200/90 rounded-2xl text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all duration-300 shadow-xs"
            />
            <span className="absolute left-4 top-2.5 text-zinc-400 text-base group-focus-within:text-zinc-900 transition">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchProducts('');
                }}
                className="absolute right-3.5 top-2.5 text-zinc-400 hover:text-zinc-900 text-xs font-bold bg-zinc-200 hover:bg-zinc-300 rounded-full w-5 h-5 flex items-center justify-center transition"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* User Navigation */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-zinc-100/90 border border-zinc-200 px-3.5 py-1.5 rounded-2xl shadow-xs">
              <div className="w-7 h-7 rounded-xl bg-zinc-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs text-zinc-800 font-semibold hidden sm:inline">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-[11px] font-semibold text-zinc-700 rounded-xl border border-zinc-200 transition"
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
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900 transition rounded-xl hover:bg-zinc-100"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-zinc-900/10 transform hover:scale-[1.02]"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-12 text-center bg-gradient-to-b from-white via-zinc-50 to-zinc-100/60 border-b border-zinc-200/80">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            ⚡ Real-Time Neighborhood Store Inventory
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight mb-4 leading-tight">
            Know what's in stock <span className="underline decoration-emerald-400 decoration-4 underline-offset-4">before you leave home.</span>
          </h1>
          <p className="text-zinc-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Check live shelf availability across verified local stores. Browse freely as a guest or sign in for detailed item quantities and restock alerts.
          </p>

          {/* Quick Platform Stats */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-xs text-zinc-600 font-medium">
            <div className="flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2 rounded-2xl shadow-xs">
              <span className="text-emerald-600 font-bold">🏪 10+</span> Verified Stores
            </div>
            <div className="flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2 rounded-2xl shadow-xs">
              <span className="text-emerald-600 font-bold">📦 400+</span> Stocked Products
            </div>
            <div className="flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2 rounded-2xl shadow-xs">
              <span className="text-emerald-600 font-bold">🗺️ Direct</span> Map Share Pins
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-9">
            {['All', 'Personal Care', 'Grocery', 'Home Care', 'Beverages', 'Snacks', ...(user ? ['Wishlist'] : [])].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 border ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-md shadow-zinc-900/10 scale-105'
                    : 'bg-white text-zinc-700 border-zinc-200/90 hover:border-zinc-300 hover:bg-zinc-100/70 shadow-xs'
                }`}
              >
                <span>{cat === 'Wishlist' ? '❤️' : categoryIcons[cat]}</span>
                <span>{cat === 'Wishlist' ? `My Wishlist (${wishlist.length})` : cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Product Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-900 flex items-center gap-3">
              <span>{selectedCategory === 'Wishlist' ? '❤️ My Wishlist Items' : 'Available Local Products'}</span>
              <span className="text-xs bg-zinc-200/70 text-zinc-700 font-bold px-3 py-1 rounded-full border border-zinc-300/60">
                {products.length} items
              </span>
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Real-time shelf updates from verified local store owners.</p>
          </div>

          {!user && (
            <span className="text-xs text-zinc-600 bg-white border border-zinc-200 px-4 py-2 rounded-2xl font-medium hidden md:inline-flex items-center gap-2 shadow-xs">
              <span className="text-emerald-600">💡</span> Guest Mode: Sign in to view exact item counts & Wishlist alerts
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-24 text-center text-zinc-400">
            <div className="inline-block animate-spin w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full mb-4"></div>
            <p className="text-sm font-medium text-zinc-500">Loading live inventory shelf...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-white border border-zinc-200/80 rounded-3xl p-10 max-w-md mx-auto shadow-sm">
            <span className="text-5xl block mb-3 opacity-90">🔍</span>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              {selectedCategory === 'Wishlist' ? 'Your Wishlist is Empty' : 'No Products Found'}
            </h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              {selectedCategory === 'Wishlist' ? 'Click the ❤️ icon on any product card to save it to your personal wishlist.' : 'Try adjusting your search terms or category filters.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                fetchProducts('');
              }}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-2xl border border-zinc-300/80 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              const isAlerted = stockAlerts.includes(product.id);

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="group bg-white border border-zinc-200/90 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/60 hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between relative shadow-xs"
                >
                  <div>
                    {/* Card Image Container */}
                    <div className="h-48 bg-zinc-50/80 relative overflow-hidden flex items-center justify-center p-4 border-b border-zinc-100">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="text-center">
                          <span className="text-5xl block mb-1 group-hover:scale-110 transition duration-300">
                            {getCategoryFallbackEmoji(product.category)}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">Verified Local Item</span>
                        </div>
                      )}

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => handleToggleWishlist(product.id, e)}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        className={`absolute top-3 left-3 w-9 h-9 rounded-2xl flex items-center justify-center text-sm border shadow-xs transition-all duration-200 ${
                          isWishlisted
                            ? 'bg-rose-50 border-rose-200 text-rose-600 scale-105'
                            : 'bg-white/90 border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-300'
                        }`}
                      >
                        {isWishlisted ? '❤️' : '🤍'}
                      </button>

                      {/* Stock Badge */}
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(product)}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/60">
                          {product.category || 'General'}
                        </span>
                      </div>
                      <h3 className="font-bold text-zinc-900 text-base line-clamp-2 mb-3 group-hover:text-emerald-700 transition-colors duration-200">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200/60">
                        <span>🏪</span>
                        <span className="font-semibold text-zinc-700 truncate">{product.store_name}</span>
                      </div>

                      {/* Quantitative Stock Bar (Logged in) */}
                      {getStockProgressBar(product)}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase font-medium">Price</span>
                      <span className="text-xl font-black text-zinc-900">₹{product.price.toFixed(2)}</span>
                    </div>
                    <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-extrabold rounded-xl transition shadow-xs">
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 text-base">✕</button>

            {authMode === 'prompt' && (
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">🔒</div>
                <h3 className="text-2xl font-black text-zinc-900 mb-2">Sign in to Continue</h3>
                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                  Please sign in or create an account to <strong className="text-emerald-700 font-bold">{authPromptReason}</strong> and unlock exact quantitative inventory updates.
                </p>
                <div className="space-y-3">
                  <button onClick={() => setAuthMode('login')} className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold rounded-2xl transition shadow-md shadow-zinc-900/10 text-xs">Sign In</button>
                  <button onClick={() => setAuthMode('register')} className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-2xl border border-zinc-200 transition text-xs">Create Account</button>
                </div>
              </div>
            )}

            {(authMode === 'login' || authMode === 'register') && (
              <div>
                <h3 className="text-2xl font-black text-zinc-900 mb-4">{authMode === 'login' ? 'Customer Sign In' : 'Create Account'}</h3>
                {authError && <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">{authError}</div>}
                {authSuccess && <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl font-medium">{authSuccess}</div>}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
                      <input type="text" required value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 text-sm focus:border-zinc-400 focus:outline-none" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
                    <input type="email" required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 text-sm focus:border-zinc-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
                    <input type="password" required value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 text-sm focus:border-zinc-400 focus:outline-none" />
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold rounded-2xl transition shadow-md shadow-zinc-900/10 text-xs mt-2">{authMode === 'login' ? 'Sign In' : 'Create Account'}</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refined Product Details Modal */}
      {detailedProduct && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setDetailedProduct(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 text-base">✕</button>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span>{categoryIcons[detailedProduct.category] || '📦'}</span>
                <span>{detailedProduct.category}</span>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleToggleWishlist(detailedProduct.id, e)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    wishlist.includes(detailedProduct.id)
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-zinc-900'
                  }`}
                >
                  <span>{wishlist.includes(detailedProduct.id) ? '❤️' : '🤍'}</span>
                  <span>{wishlist.includes(detailedProduct.id) ? 'Wishlisted' : 'Wishlist'}</span>
                </button>
                <button
                  onClick={(e) => handleToggleStockAlert(detailedProduct.id, e)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    stockAlerts.includes(detailedProduct.id)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-zinc-900'
                  }`}
                >
                  <span>{stockAlerts.includes(detailedProduct.id) ? '🔔' : '🔕'}</span>
                  <span>{stockAlerts.includes(detailedProduct.id) ? 'Alert Active' : 'Stock Alert'}</span>
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-black text-zinc-900 mb-2">{detailedProduct.name}</h2>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">{detailedProduct.description || 'Verified local inventory item available at partner store.'}</p>

            <div className="bg-zinc-50 p-5 rounded-2xl mb-6 space-y-3.5 border border-zinc-200/80">
              <div className="flex justify-between border-b border-zinc-200/80 pb-3 items-center">
                <span className="text-xs text-zinc-500 font-semibold">Verified Price</span>
                <span className="text-2xl font-black text-zinc-900">₹{detailedProduct.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/80 pb-3 items-center">
                <span className="text-xs text-zinc-500 font-semibold">Live Stock Status</span>
                {getStatusBadge(detailedProduct)}
              </div>
              <div className="flex justify-between border-b border-zinc-200/80 pb-3 items-center">
                <span className="text-xs text-zinc-500 font-semibold">Partner Store</span>
                <span className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">🏪 {detailedProduct.store_name}</span>
              </div>
              {detailedProduct.store_address && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-500 font-semibold">Store Address</span>
                  <span className="text-xs font-medium text-zinc-700 text-right max-w-[220px]">{detailedProduct.store_address}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleOpenGoogleMaps(detailedProduct)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 text-xs transform hover:scale-[1.01]"
            >
              <span>🗺️</span> Navigate to Store on Google Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
