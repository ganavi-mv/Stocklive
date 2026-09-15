import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function StoreProfilePage() {
  const [formData, setFormData] = useState({
    store_name: '',
    category: '',
    address: '',
    phone: '',
    latitude: '',
    longitude: '',
  });

  const [hasStore, setHasStore] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  const fetchStoreProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/stores/my-store');
      if (response.data) {
        setFormData({
          store_name: response.data.store_name || '',
          category: response.data.category || '',
          address: response.data.address || '',
          phone: response.data.phone || '',
          latitude: response.data.latitude ?? '',
          longitude: response.data.longitude ?? '',
        });
        setHasStore(true);
        setIsEditing(false);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // No store profile yet
        setHasStore(false);
        setIsEditing(true);
      } else {
        setMessage({ type: 'error', text: 'Failed to load store profile.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const payload = {
      ...formData,
      latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
    };

    try {
      if (hasStore) {
        // Update existing store
        await api.put('/stores/my-store', payload);
        setMessage({ type: 'success', text: 'Store profile updated successfully!' });
      } else {
        // Create new store
        await api.post('/stores', payload);
        setMessage({ type: 'success', text: 'Store profile created successfully!' });
        setHasStore(true);
      }
      setIsEditing(false);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to save store profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading store profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-8 py-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition">
            ← Back to Dashboard
          </Link>
        </div>
        <span className="text-xl font-bold text-white">Store Profile</span>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {hasStore ? 'Store Information' : 'Create Store Profile'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {hasStore
                  ? 'Your store is registered on StockLive'
                  : 'Enter your retail store details to get started'}
              </p>
            </div>
            {hasStore && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-sm rounded-xl border border-slate-700 transition"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {!isEditing && hasStore ? (
            /* View Store Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Store Name
                  </span>
                  <p className="text-lg font-bold text-white">{formData.store_name}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Category
                  </span>
                  <p className="text-lg font-bold text-white">{formData.category}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 md:col-span-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Store Address
                  </span>
                  <p className="text-lg font-bold text-white">{formData.address}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Phone Number
                  </span>
                  <p className="text-lg font-bold text-white">{formData.phone}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Geolocation Coordinates
                  </span>
                  <p className="text-sm font-semibold text-emerald-400">
                    Lat: {formData.latitude || 'N/A'}, Long: {formData.longitude || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Create / Edit Form Mode */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Store Name *</label>
                <input
                  type="text"
                  name="store_name"
                  required
                  value={formData.store_name}
                  onChange={handleChange}
                  placeholder="e.g. City Supermarket"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                <input
                  type="text"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Grocery, Pharmacy, Electronics"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Address *</label>
                <textarea
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full physical store address"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="13.0827"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="80.2707"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : hasStore ? 'Update Store Profile' : 'Create Store Profile'}
                </button>
                {hasStore && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
