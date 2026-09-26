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
    map_location_url: '',
  });

  const [hasStore, setHasStore] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
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
          map_location_url: response.data.map_location_url || '',
        });
        setHasStore(true);
        setIsEditing(false);
      }
    } catch (err) {
      if (err.response?.status === 404) {
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

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }
    setDetectingLocation(true);
    setMessage({ type: 'info', text: 'Detecting GPS coordinates and generating map link...' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          map_location_url: prev.map_location_url || mapUrl,
        }));
        setMessage({ type: 'success', text: 'Google Maps location link generated successfully!' });
        setDetectingLocation(false);
      },
      (error) => {
        setMessage({ type: 'error', text: 'Unable to retrieve location. Please check browser permissions or enter map location link manually.' });
        setDetectingLocation(false);
      }
    );
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
        await api.put('/stores/my-store', payload);
        setMessage({ type: 'success', text: 'Store profile updated successfully!' });
      } else {
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
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading store profile...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="px-8 py-5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-semibold bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            ← Dashboard
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center font-bold text-white text-sm">
            🏪
          </div>
          <div>
            <span className="text-lg font-bold text-white">Store Profile & Geolocation</span>
            <span className="block text-[10px] text-slate-400">Google Maps GPS Navigation Setup</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-black text-white">{hasStore ? 'Store Information' : 'Create Store Profile'}</h2>
              <p className="text-xs text-slate-400 mt-1">{hasStore ? 'Your physical store is mapped on StockLive' : 'Enter store details & GPS coordinates for customer navigation'}</p>
            </div>
            {hasStore && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold text-xs rounded-xl border border-slate-700 transition">✏️ Edit Profile</button>
            )}
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>{message.text}</div>
          )}

          {!isEditing && hasStore ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Store Name</span>
                  <p className="text-lg font-bold text-white">{formData.store_name}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Category</span>
                  <p className="text-lg font-bold text-indigo-400">{formData.category}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 md:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Store Address</span>
                  <p className="text-sm font-medium text-slate-200">{formData.address}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Phone Number</span>
                  <p className="text-sm font-bold text-white">{formData.phone}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 md:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Google Maps Location Link</span>
                  {formData.map_location_url ? (
                    <a href={formData.map_location_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1.5 truncate">
                      <span>🗺️</span> {formData.map_location_url}
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400">No map link set (using store address)</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Store Name *</label>
                <input type="text" name="store_name" required value={formData.store_name} onChange={handleChange} placeholder="e.g. Metro Supermarket" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <input type="text" name="category" required value={formData.category} onChange={handleChange} placeholder="e.g. Grocery & Supermarket" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleChange} placeholder="e.g. +91 9876543210" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Store Address *</label>
                <textarea name="address" required rows="2" value={formData.address} onChange={handleChange} placeholder="e.g. 123 Main Street, Indiranagar, Bengaluru" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none" />
              </div>

              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block text-xs font-bold text-white mb-0.5">Google Maps Location Link / Map Pin</label>
                    <p className="text-[11px] text-slate-400">Paste your store's Google Maps link or click auto-detect below.</p>
                  </div>
                  <button type="button" onClick={handleAutoDetectLocation} disabled={detectingLocation} className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl hover:bg-indigo-500/20 transition font-bold flex items-center gap-1.5 shrink-0">
                    {detectingLocation ? <span className="animate-spin">⏳</span> : <span>📍</span>}
                    {detectingLocation ? 'Detecting...' : 'Auto-Detect Map Location'}
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    name="map_location_url"
                    value={formData.map_location_url}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/?q=12.971598,77.594566 or Google Maps share link"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition text-sm shadow-lg shadow-emerald-500/20">{saving ? 'Saving...' : 'Save Store Profile'}</button>
                {hasStore && (
                  <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 text-sm transition">
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
