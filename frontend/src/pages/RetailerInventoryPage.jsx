import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function RetailerInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Grocery',
    price: '',
    availability: 'In Stock',
    image_url: '',
    description: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/retailer/products');
      setProducts(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setMessage({ type: 'error', text: 'Please create a Store Profile first before adding inventory items.' });
      } else if (err.response?.status === 401) {
        navigate('/business/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Grocery',
      price: '',
      availability: 'In Stock',
      image_url: '',
      description: '',
    });
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      availability: product.availability,
      image_url: product.image_url || '',
      description: product.description || '',
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
    };

    try {
      if (editingProduct) {
        await api.put(`/retailer/products/${editingProduct.id}`, payload);
        setMessage({ type: 'success', text: `Updated "${formData.name}" successfully!` });
      } else {
        await api.post('/retailer/products', payload);
        setMessage({ type: 'success', text: `Added "${formData.name}" to store inventory!` });
      }
      setShowAddModal(false);
      fetchInventory();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to save product.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product, newStatus) => {
    try {
      await api.put(`/retailer/products/${product.id}`, { availability: newStatus });
      fetchInventory();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}" from your inventory?`)) return;

    try {
      await api.delete(`/retailer/products/${productId}`);
      setMessage({ type: 'success', text: `Deleted "${productName}".` });
      fetchInventory();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete product item.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="px-8 py-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/business/dashboard" className="text-slate-400 hover:text-white transition text-sm">
            ← Dashboard
          </Link>
          <span className="text-slate-700">|</span>
          <span className="text-xl font-bold text-white">Store Inventory Management</span>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-md shadow-emerald-500/10"
        >
          + Add New Product
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
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

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Store Shelf Stock</h1>
            <p className="text-xs text-slate-400 mt-1">Manage items, update prices, and set real-time stock availability.</p>
          </div>
          <span className="text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-full">
            Total Items: {products.length}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3"></div>
            <p className="text-sm">Loading store inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8 max-w-md mx-auto">
            <span className="text-4xl block mb-3">📦</span>
            <h3 className="text-lg font-bold text-white mb-1">No Inventory Items Yet</h3>
            <p className="text-slate-400 text-xs mb-6">
              Start adding your store products so nearby local shoppers can find them.
            </p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition"
            >
              + Add First Product
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-slate-800" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">📦</div>
                          )}
                          <div>
                            <span className="block text-white font-bold">{item.name}</span>
                            <span className="text-[11px] text-slate-400 line-clamp-1">{item.description || 'No description'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">{item.category}</td>
                      <td className="p-4 text-emerald-400 font-bold">₹{item.price.toFixed(2)}</td>
                      <td className="p-4">
                        <select
                          value={item.availability}
                          onChange={(e) => handleToggleStatus(item, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition ${
                            item.availability === 'In Stock'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : item.availability === 'Low Stock'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          <option value="In Stock" className="bg-slate-900 text-emerald-400">In Stock</option>
                          <option value="Low Stock" className="bg-slate-900 text-amber-400">Low Stock</option>
                          <option value="Out of Stock" className="bg-slate-900 text-red-400">Out of Stock</option>
                        </select>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20 transition"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg p-1"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-white mb-1">
              {editingProduct ? 'Edit Inventory Product' : 'Add New Inventory Product'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              This item will immediately be visible to local shoppers searching nearby.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Tata Salt 1kg"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Home Care">Home Care</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="28.00"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Stock Availability Status</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Product specs, quantity, or variant details"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition text-sm shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Inventory'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl border border-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
