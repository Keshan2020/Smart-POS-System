"use client"
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ShoppingCart, Printer, Search, Package, Barcode, 
  Plus, Bell, LogOut, Store 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [businessName, setBusinessName] = useState('Smart POS');
  const searchInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => { 
    fetchProducts(); 
    fetchBusinessDetails();
    searchInputRef.current?.focus();
  }, []);

  async function fetchBusinessDetails() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('business_details')
        .select('business_name')
        .eq('id', user.id)
        .single();
      if (data?.business_name) setBusinessName(data.business_name);
    }
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    setProducts(data || []);
  }

  const handleSearch = (val) => {
    setSearchQuery(val);
    const scannedProduct = products.find(p => p.barcode === val);
    if (scannedProduct) {
      addToCart(scannedProduct);
      setSearchQuery(""); 
    }
  };

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) return alert("Out of stock!");
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? {...item, qty: item.qty + 1} : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setLoading(true);
    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    try {
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{ total_amount: totalAmount }])
        .select();

      if (saleError) throw saleError;
      const saleId = saleData[0].id;

      const itemsToInsert = cart.map(item => ({
        sale_id: saleId,
        product_id: item.id,
        quantity: item.qty,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      for (const item of cart) {
        await supabase.rpc('decrement_stock', { row_id: item.id, amount: item.qty });
      }

      setLastSale({
        id: saleId.slice(0, 8),
        items: cart,
        total: totalAmount,
        date: new Date().toLocaleString()
      });

      setTimeout(() => {
        window.print();
        setCart([]);
        setLastSale(null);
        fetchProducts();
        setLoading(false);
        searchInputRef.current?.focus();
      }, 500);

    } catch (error) {
      console.error("Checkout Error:", error.message);
      alert("Error processing sale: " + error.message);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col w-full overflow-hidden">
      <main className="print:hidden flex-1 flex flex-col overflow-hidden p-6">
        
        {/* New Centered Search Bar Section */}
        <div className="max-w-4xl mx-auto w-full mb-8">
          <div className="relative group">
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search product or scan barcode..." 
              className="w-full bg-white border-none shadow-sm rounded-3xl py-5 pl-16 pr-6 focus:ring-4 focus:ring-blue-500/10 font-bold text-gray-700 h-20 text-lg transition-all"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 transition-transform group-focus-within:scale-110" size={28} />
          </div>
        </div>

        {/* Product & Cart Grid */}
        <div className="flex-1 flex gap-8 overflow-hidden">
          
          {/* Products Section */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Terminal</h2>
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 text-sm font-bold text-gray-500 shadow-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 overflow-y-auto pb-10 pr-2 custom-scrollbar">
              {filteredProducts.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => addToCart(p)} 
                  className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all text-left flex flex-col h-48 group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-600 transition-colors">
                      <Package className="text-blue-500 group-hover:text-white" size={22} />
                    </div>
                    <div className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm ${p.stock_quantity < 5 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                      {p.stock_quantity < 5 ? 'Low Stock' : 'In Stock'}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 leading-tight mb-1 line-clamp-2 uppercase text-sm relative z-10">{p.name}</h3>
                  <div className="text-[10px] text-gray-400 font-mono mb-auto uppercase relative z-10">{p.barcode || 'Manual Entry'}</div>
                  <div className="flex justify-between items-center mt-3 relative z-10">
                    <span className="text-xl font-black text-gray-900">Rs.{p.price.toFixed(2)}</span>
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <Plus size={20} className="text-blue-600" />
                    </div>
                  </div>
                  {/* Decorative background circle */}
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="w-[400px] shrink-0 flex flex-col pb-6">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 flex flex-col h-full overflow-hidden">
              <div className="p-7 border-b border-gray-50 flex items-center justify-between bg-blue-600 text-white">
                <h2 className="text-xl font-black flex items-center gap-3">
                  <ShoppingCart size={26} /> Active Order
                </h2>
                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{cart.length} Items</span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50/50 hover:bg-gray-50 rounded-[1.5rem] transition-all group border border-transparent hover:border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center font-black text-blue-600 text-sm border border-gray-100">{item.qty}x</div>
                      <div>
                        <div className="font-bold text-gray-800 text-[14px] line-clamp-1 uppercase tracking-tight">{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-0.5">Price: Rs.{item.price.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="font-black text-gray-900 text-sm">
                      Rs.{(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
                    <div className="bg-gray-50 p-8 rounded-full mb-4">
                      <Barcode size={64} className="opacity-20" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest opacity-40">Scan or search to add</p>
                  </div>
                )}
              </div>

              <div className="p-8 bg-gray-50/80 border-t border-gray-100 rounded-b-[2.5rem]">
                <div className="flex justify-between items-center mb-6 px-2">
                  <span className="text-gray-500 font-black uppercase text-xs tracking-[0.2em]">Grand Total</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">
                    Rs.{cart.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2)}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center gap-4 active:scale-95"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <><Printer size={22} /> Print & Complete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- RECEIPT TEMPLATE --- */}
      <div className="hidden print:flex flex-col items-center w-full bg-white min-h-screen">
        <div className="w-[80mm] text-black font-mono text-sm p-4">
          <div className="text-center mb-4 border-b border-dashed pb-4">
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-1">{businessName}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest">Customer Copy</p>
            <div className="flex justify-between text-[10px] mt-4 font-bold border-t border-dashed pt-3">
              <span>INV: #{lastSale?.id}</span>
              <span>{lastSale?.date}</span>
            </div>
          </div>

          <table className="w-full mb-4 text-xs">
            <thead>
              <tr className="border-b border-dashed text-left">
                <th className="pb-2 uppercase">Description</th>
                <th className="pb-2 text-center uppercase">Qty</th>
                <th className="pb-2 text-right uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lastSale?.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 uppercase text-[10px] pr-2">{item.name}</td>
                  <td className="text-center font-bold">{item.qty}</td>
                  <td className="text-right">{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-dashed pt-3 flex justify-between font-black text-xl">
            <span className="tracking-tighter">NET TOTAL</span>
            <span>Rs.{lastSale?.total.toFixed(2)}</span>
          </div>

          <div className="text-center mt-12 pt-6 border-t border-dashed">
            <p className="uppercase text-[11px] font-black tracking-[0.2em] mb-1">Thank you!</p>
            <p className="text-[9px] font-bold text-gray-500 uppercase">Software by Smart POS</p>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          @page { margin: 0; size: auto; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}