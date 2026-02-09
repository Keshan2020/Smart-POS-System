"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Wallet, Plus, Search, Trash2, Calendar, Tag, AlignLeft 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'General', description: '' });
  const router = useRouter();

  useEffect(() => {
    fetchExpenses();
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkUser();
  }, []);

  async function fetchExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    if (!error) setExpenses(data);
  }

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('expenses').insert([newExpense]);
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      setNewExpense({ title: '', amount: '', category: 'General', description: '' });
      fetchExpenses();
    }
    setLoading(false);
  };

  const deleteExpense = async (id) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (!error) fetchExpenses();
    }
  };

  const filteredExpenses = expenses.filter(ex => 
    ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans w-full">
      
      {/* Sidebar එක ඉවත් කර ඇත. දැන් Layout එක මගින් මෙය පාලනය වේ */}

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Expense Tracker</h1>
              <p className="text-gray-500 font-medium">Monitor and manage your business outgoings</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 text-right min-w-[200px]">
               <span className="text-gray-400 text-xs font-black uppercase block mb-1">Total Expenses</span>
               <span className="text-3xl font-black text-red-500 tracking-tighter">Rs. {totalExpenses.toFixed(2)}</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Add New Expense Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-7 rounded-[2.5rem] shadow-xl shadow-blue-50 border border-gray-100 sticky top-8">
                <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                  <Plus className="bg-blue-600 text-white rounded-lg p-1" size={24} /> Log Expense
                </h2>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">Expense Title</label>
                    <input 
                      required
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                      placeholder="e.g. Electricity Bill"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase ml-2">Amount (Rs.)</label>
                      <input 
                        required
                        type="number"
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold text-red-500"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase ml-2">Category</label>
                      <select 
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold"
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      >
                        <option value="General">General</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Rent">Rent</option>
                        <option value="Stock">Stock Purchase</option>
                        <option value="Salary">Salary</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">Short Description</label>
                    <textarea 
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      placeholder="Optional details..."
                      rows="2"
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95 disabled:bg-gray-200"
                  >
                    {loading ? "Recording..." : "Save Expense"}
                  </button>
                </form>
              </div>
            </div>

            {/* Expense List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative mb-6">
                <input 
                  type="text" 
                  placeholder="Search expenses or categories..." 
                  className="w-full bg-white border-none rounded-3xl py-5 pl-14 shadow-sm focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              </div>

              <div className="grid gap-4 overflow-y-auto pb-10">
                {filteredExpenses.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                        <Wallet size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-gray-800 text-lg">{item.title}</h3>
                          <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-400 font-bold">
                            <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                          </span>
                          {item.description && (
                            <span className="flex items-center gap-1 text-xs text-gray-400 font-bold">
                              <AlignLeft size={12} /> {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <div className="font-black text-xl text-gray-900">Rs. {Number(item.amount).toFixed(2)}</div>
                       </div>
                       <button 
                         onClick={() => deleteExpense(item.id)}
                         className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all md:opacity-0 md:group-hover:opacity-100"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                ))}
                
                {filteredExpenses.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <Wallet size={64} className="mx-auto text-gray-100 mb-4" />
                    <p className="text-gray-400 font-bold">No expense records found</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}