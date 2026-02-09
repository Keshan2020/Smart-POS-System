"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; 
import { 
  Plus, Trash2, Package, Save, AlertCircle, Upload, X, Image as ImageIcon, Edit2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const showNotify = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type: type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };
  
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    cost_price: '', 
    stock_quantity: '', 
    barcode: '' 
  });
  
  const router = useRouter();

  useEffect(() => { 
    fetchProducts(); 
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkUser();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Fetch Error:", error.message);
    else setProducts(data || []);
    setLoading(false);
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.cost_price) {
      return showNotify("Please fill Name, Cost and Selling Price", "error");
    }

    setSaving(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('products').insert([
        { 
          name: form.name, 
          price: parseFloat(form.price), 
          cost_price: parseFloat(form.cost_price),
          stock_quantity: parseInt(form.stock_quantity) || 0,
          barcode: form.barcode,
          image_url: imageUrl,
          user_id: user?.id 
        }
      ]);

      if (error) throw error;
      setForm({ name: '', price: '', cost_price: '', stock_quantity: '', barcode: '' });
      setPreviewUrl(null);
      setImageFile(null);
      fetchProducts(); 
      showNotify("Product added successfully!", "success");
    } catch (err) {
      showNotify("Error: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          price: parseFloat(editingProduct.price),
          cost_price: parseFloat(editingProduct.cost_price),
          stock_quantity: parseInt(editingProduct.stock_quantity),
          barcode: editingProduct.barcode
        })
        .eq('id', editingProduct.id);

      if (error) throw error;
      
      showNotify("Product updated successfully!", "success");
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err) {
      showNotify("Update Error: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) showNotify("Delete error: " + error.message, "error");
      else {
        showNotify("Product deleted!");
        fetchProducts();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] w-full font-sans">
      {notification.show && (
        <div className={`fixed top-5 right-5 z-[300] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all animate-bounce ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? <Package size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Package className="text-blue-600" size={32} /> Inventory Management
            </h1>
            <p className="text-gray-500 font-medium">Add and manage your shop products with images</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ADD FORM SECTION */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 sticky top-8">
                <h2 className="text-xl font-black text-gray-800 mb-6">Add New Item</h2>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  
                  {/* Image Upload Box */}
                  <div className="relative h-40 w-full border-2 border-dashed border-gray-200 rounded-3xl overflow-hidden group hover:bg-gray-50 transition-all">
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={() => {setPreviewUrl(null); setImageFile(null);}} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        <Upload className="text-gray-300 group-hover:text-blue-500 transition-colors" size={32} />
                        <span className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">Upload Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>

                  {/* Product Name */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Product Name</label>
                    <input type="text" required className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold text-sm" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Product Name" />
                  </div>

                  {/* Pricing Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Cost Price</label>
                      <input type="number" required className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 text-orange-600 font-bold text-sm" value={form.cost_price} onChange={(e) => setForm({...form, cost_price: e.target.value})} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Selling Price</label>
                      <input type="number" required className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 text-blue-600 font-bold text-sm" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="0.00" />
                    </div>
                  </div>

                  {/* Stock and Barcode Grid - Re-added here */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Stock Qty</label>
                      <input type="number" required className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold text-sm" value={form.stock_quantity} onChange={(e) => setForm({...form, stock_quantity: e.target.value})} placeholder="0" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Barcode</label>
                      <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold text-sm" value={form.barcode} onChange={(e) => setForm({...form, barcode: e.target.value})} placeholder="Optional" />
                    </div>
                  </div>

                  <button disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/10 transition-all active:scale-95 disabled:bg-gray-300 mt-2">
                    {saving ? "Saving..." : <span className="flex items-center justify-center gap-2 tracking-tighter"><Save size={20} /> Add to Inventory</span>}
                  </button>
                </form>
              </div>
            </div>

            {/* TABLE SECTION */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      <th className="p-6">Product Info</th>
                      <th className="p-6">Pricing</th>
                      <th className="p-6">Availability</th>
                      <th className="p-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan="4" className="p-20 text-center animate-pulse font-bold text-gray-400">Loading your stock...</td></tr>
                    ) : products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden border border-gray-50 flex items-center justify-center">
                              {product.image_url ? <img src={product.image_url} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="text-gray-300" size={24} />}
                            </div>
                            <div>
                              <div className="font-black text-gray-800 text-base uppercase tracking-tight">{product.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono tracking-widest">{product.barcode || 'NO BARCODE'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="text-[10px] text-orange-500 font-black uppercase tracking-tighter">Cost: {product.cost_price?.toFixed(2)}</div>
                          <div className="font-black text-blue-600 text-lg">Rs. {product.price?.toFixed(2)}</div>
                        </td>
                        <td className="p-6">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-sm ${product.stock_quantity < 10 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                            {product.stock_quantity} Left
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEditClick(product)} className="p-3 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                              <Edit2 size={20} />
                            </button>
                            <button onClick={() => deleteProduct(product.id)} className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* EDIT MODAL SECTION */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8 bg-blue-600 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold uppercase tracking-tighter">Edit Product</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Name</label>
                <input type="text" required value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cost Price</label>
                  <input type="number" required value={editingProduct.cost_price} onChange={(e) => setEditingProduct({...editingProduct, cost_price: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selling Price</label>
                  <input type="number" required value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Qty</label>
                  <input type="number" required value={editingProduct.stock_quantity} onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Barcode</label>
                  <input type="text" value={editingProduct.barcode || ''} onChange={(e) => setEditingProduct({...editingProduct, barcode: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 mt-4 disabled:bg-gray-300 transition-all">
                {saving ? "Updating..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}