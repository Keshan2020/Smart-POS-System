"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  BarChart3, Calendar, DollarSign, ShoppingBag, 
  TrendingUp, Package, RefreshCcw 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useRouter } from 'next/navigation';

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({ todayTotal: 0, totalOrders: 0, totalProfit: 0 });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetchSalesData();
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkUser();
  }, []);

  async function fetchSalesData() {
    setLoading(true);
    try {
      const { data: items, error: iErr } = await supabase.from('sale_items').select('*');
      const { data: pros, error: pErr } = await supabase.from('products').select('*');
      const { data: salesData, error: sErr } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (iErr || pErr || sErr) throw (iErr || pErr || sErr);

      if (items && pros && salesData) {
        const todayStr = new Date().toLocaleDateString('en-CA'); 
        let todaySum = 0;
        let totalProfitSum = 0;
        let productMap = {};

        const productsMap = {};
        pros.forEach(p => { 
          productsMap[String(p.id).toLowerCase()] = p; 
        });

        const salesDateMap = {};
        salesData.forEach(s => {
          if (s.created_at) {
            salesDateMap[String(s.id).toLowerCase()] = new Date(s.created_at).toLocaleDateString('en-CA');
          }
        });

        items.forEach(item => {
          const productId = String(item.product_id).toLowerCase();
          const saleId = String(item.sale_id).toLowerCase();
          const product = productsMap[productId];
          const qty = Number(item.quantity) || 0;
          const price = Number(item.unit_price) || 0;
          const cost = product?.cost_price ? Number(product.cost_price) : (price * 0.8);

          const saleValue = qty * price;
          const profit = saleValue - (qty * cost);
          totalProfitSum += profit;

          if (salesDateMap[saleId] === todayStr) {
            todaySum += saleValue;
          }

          const pName = product?.name || "Unknown Product";
          productMap[pName] = (productMap[pName] || 0) + qty;
        });

        const chartArray = Object.keys(productMap).map(name => ({
          name: name,
          qty: productMap[name]
        })).sort((a, b) => b.qty - a.qty).slice(0, 5);

        setReportData(chartArray);
        setStats({
          todayTotal: todaySum,
          totalOrders: salesData.length,
          totalProfit: totalProfitSum
        });
        setSales(salesData);
      }
    } catch (error) {
      console.error("Report Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans w-full">
      
      {/* Sidebar එක දැන් layout.js මගින් පාලනය වේ */}

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="text-blue-600" size={32} /> Business Analytics
              </h1>
              <p className="text-gray-500 font-medium">Insights and sales performance overview</p>
            </div>
            <div className="flex gap-3 print:hidden">
                <button onClick={fetchSalesData} className="bg-white border border-gray-200 px-4 py-3 rounded-2xl font-bold hover:bg-gray-50 flex items-center gap-2 text-gray-600 shadow-sm transition-all active:scale-95">
                  <RefreshCcw size={18} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                <button onClick={() => window.print()} className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
                  <Calendar size={18} /> Print Report
                </button>
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-96 text-gray-400 gap-4">
               <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="font-bold italic">Gathering data insights...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                    <p className="text-blue-100 font-black uppercase text-[10px] tracking-widest opacity-80">Today's Revenue</p>
                    <h2 className="text-4xl font-black mt-2 tracking-tighter">Rs. {stats.todayTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                    <DollarSign className="absolute right-[-10px] bottom-[-10px] size-32 opacity-10" />
                  </div>

                  <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                    <p className="text-emerald-100 font-black uppercase text-[10px] tracking-widest opacity-80">Total Profit</p>
                    <h2 className="text-4xl font-black mt-2 tracking-tighter">Rs. {stats.totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                    <TrendingUp className="absolute right-[-10px] bottom-[-10px] size-32 opacity-10" />
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Total Bills</p>
                      <h2 className="text-4xl font-black text-gray-800 mt-2 tracking-tighter">{stats.totalOrders}</h2>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-3xl text-gray-400">
                      <ShoppingBag size={32} />
                    </div>
                  </div>
              </div>

              {/* Chart and Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                  <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="font-black text-xl mb-8 flex items-center gap-3 text-gray-800">
                      <Package size={24} className="text-blue-600" /> Top Selling Items
                    </h3>
                    <div className="h-[350px] w-full">
                      {reportData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 'bold'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 'bold'}} />
                            <Tooltip 
                              cursor={{fill: '#f8fafc'}}
                              contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '15px'}} 
                            />
                            <Bar dataKey="qty" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={45} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-300 italic font-bold">No product data to visualize</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                      <h3 className="font-black text-gray-700">Recent Activity</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                          <tr>
                            <th className="p-5">Bill ID</th>
                            <th className="p-5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                          {sales.length > 0 ? sales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-blue-50/50 transition-colors group">
                              <td className="p-5 font-mono text-gray-400 text-xs tracking-tighter">#{String(sale.id).slice(0, 8)}</td>
                              <td className="p-5 text-right font-black text-gray-800">Rs.{(Number(sale.total_amount) || 0).toFixed(2)}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan="2" className="p-20 text-center text-gray-300 font-bold">No transactions</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}