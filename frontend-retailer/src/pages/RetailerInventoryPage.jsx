import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function RetailerInventoryPage() {
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Grocery',
    price: '',
    availability: 'In Stock',
    stock_quantity: 10,
    image_url: '',
    description: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // CSV Bulk Upload State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [csvError, setCsvError] = useState('');

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
        navigate('/login');
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
      stock_quantity: 10,
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
      stock_quantity: product.stock_quantity !== undefined && product.stock_quantity !== null ? product.stock_quantity : 10,
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
      stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
    };

    try {
      if (editingProduct) {
        await api.put(`/retailer/products/${editingProduct.id}`, payload);
        setMessage({ type: 'success', text: `Updated "${formData.name}" successfully!` });
      } else {
        await api.post('/retailer/products', payload);
        setMessage({ type: 'success', text: `Added "${formData.name}" to inventory!` });
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
    if (!window.confirm(`Delete "${productName}" from your inventory?`)) return;

    try {
      await api.delete(`/retailer/products/${productId}`);
      setMessage({ type: 'success', text: `Deleted "${productName}".` });
      fetchInventory();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete product item.' });
    }
  };

  const handleDownloadSampleCsv = () => {
    const sampleCsvContent = `name,category,price,availability,stock_quantity,description
Dove Daily Shine Shampoo 180ml,Personal Care,185.00,In Stock,15,Nourishing shampoo for smooth hair
Fortune Sunlite Sunflower Oil 1L,Grocery,145.00,In Stock,20,Refined sunflower cooking oil
Surf Excel Detergent Powder 1kg,Home Care,140.00,Low Stock,3,Easy stain removal detergent
Tropicana Mixed Fruit Juice 1L,Beverages,110.00,In Stock,12,100% real fruit juice
Lays Classic Salted Chips 50g,Snacks,20.00,In Stock,50,Crispy salted potato chips`;

    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'stocklive_inventory_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setCsvError('Please select a .csv file to upload.');
      return;
    }

    setUploadingCsv(true);
    setCsvError('');

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await api.post('/retailer/inventory/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage({ type: 'success', text: res.data.message || 'CSV inventory uploaded successfully!' });
      setShowCsvModal(false);
      setCsvFile(null);
      fetchInventory();
    } catch (err) {
      setCsvError(err.response?.data?.detail || 'Failed to upload CSV file. Please verify CSV format.');
    } finally {
      setUploadingCsv(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (statusFilter === 'All') return true;
    return p.availability === statusFilter;
  });

  const getSelectStyle = (availability) => {
    switch (availability) {
      case 'In Stock':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'Low Stock':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default:
        return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="px-8 py-5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-semibold bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            ← Dashboard
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center font-bold text-white text-sm">
            📦
          </div>
          <div>
            <span className="text-lg font-bold text-white">Store Inventory Management</span>
            <span className="block text-[10px] text-slate-400">Live Shelf Availability Control</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCsvModal(true)} className="px-3.5 py-2 bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 border border-indigo-400/30">
            <span>📁</span> Upload CSV Inventory
          </button>
          <button onClick={openAddModal} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20">
            + Add New Product
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Your Shelf Inventory</h1>
            <p className="text-xs text-slate-400 mt-1">Update prices and switch stock status (`In Stock`, `Low Stock`, `Out of Stock`) instantly.</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === status
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3"></div>
            <p className="text-sm">Loading store inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8 max-w-md mx-auto">
            <span className="text-4xl block mb-3">📦</span>
            <h3 className="text-lg font-bold text-white mb-1">No Products Found</h3>
            <p className="text-xs text-slate-400 mb-4">{statusFilter !== 'All' ? `No items with status "${statusFilter}".` : 'Start by listing items on your local store shelf.'}</p>
            <button onClick={openAddModal} className="px-6 py-3 bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20">
              + Add Product
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock Qty</th>
                    <th className="p-4">Availability Toggle</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded-xl bg-slate-800" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 font-bold border border-slate-700">📦</div>
                          )}
                          <div>
                            <span className="block text-white font-bold text-sm">{item.name}</span>
                            <span className="text-[11px] text-slate-400 line-clamp-1">{item.description || 'Verified local item'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 text-xs font-semibold">{item.category}</td>
                      <td className="p-4 text-emerald-400 font-extrabold">₹{item.price.toFixed(2)}</td>
                      <td className="p-4 text-slate-200 font-bold text-xs">{item.stock_quantity ?? 0} units</td>
                      <td className="p-4">
                        <select
                          value={item.availability}
                          onChange={(e) => handleToggleStatus(item, e.target.value)}
                          className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border focus:outline-none transition ${getSelectStyle(item.availability)}`}
                        >
                          <option value="In Stock" className="bg-slate-900 text-emerald-400">🟢 In Stock</option>
                          <option value="Low Stock" className="bg-slate-900 text-amber-400">🟡 Low Stock</option>
                          <option value="Out of Stock" className="bg-slate-900 text-rose-400">🔴 Out of Stock</option>
                        </select>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEditModal(item)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition">✏️ Edit</button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition">🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

            <h2 className="text-2xl font-bold text-white mb-1">{editingProduct ? 'Edit Inventory Product' : 'Add New Inventory Product'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Product Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. Tata Salt 1kg" className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                    <option value="Grocery">Grocery</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Home Care">Home Care</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Price (₹) *</label>
                  <input type="number" step="any" name="price" required value={formData.price} onChange={handleInputChange} placeholder="28.00" className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Stock Availability</label>
                  <select name="availability" value={formData.availability} onChange={handleInputChange} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Stock Quantity (Units) *</label>
                  <input type="number" min="0" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange} placeholder="10" className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Image URL (Optional)</label>
                <input type="text" name="image_url" value={formData.image_url} onChange={handleInputChange} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Description (Optional)</label>
                <textarea name="description" rows="2" value={formData.description} onChange={handleInputChange} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>

              <button type="submit" disabled={saving} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20">{saving ? 'Saving...' : 'Save Product'}</button>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Upload Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setShowCsvModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📁</span>
              <h2 className="text-2xl font-black text-white">Bulk CSV Inventory Upload</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Upload your full store inventory in CSV format. Items will be automatically categorized and displayed on both Retailer and Customer dashboards.
            </p>

            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-800 mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Need a starting template?</span>
                <span className="text-[11px] text-slate-400">Download pre-formatted sample CSV file</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-emerald-400 text-xs font-bold rounded-xl border border-slate-600 transition flex items-center gap-1 shrink-0"
              >
                <span>📥</span> Sample CSV
              </button>
            </div>

            {csvError && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
                {csvError}
              </div>
            )}

            <form onSubmit={handleUploadCsvSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Select CSV File (.csv)</label>
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer bg-slate-800 p-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploadingCsv}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition shadow-lg shadow-indigo-500/20 text-xs flex items-center justify-center gap-2"
                >
                  {uploadingCsv ? <span className="animate-spin">⏳</span> : <span>📤</span>}
                  {uploadingCsv ? 'Processing Inventory CSV...' : 'Upload & Process CSV Inventory'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 text-xs transition"
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
