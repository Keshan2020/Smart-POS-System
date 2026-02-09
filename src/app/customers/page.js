"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, UserPlus, Search, Phone, Mail, 
  Trash2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkUser();
  }, []);

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setCustomers(data);
  }

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('customers').insert([newCustomer]);
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      fetchCustomers();
    }
    setLoading(false);
  };

  const deleteCustomer = async (id) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (!error) fetchCustomers();
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans w-full">
      
      {/* Sidebar ඉවත් කර ඇත */}

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Directory</h1>
              <p className="text-gray-500 font-medium">Manage your loyal customers and their details</p>
            </div>
            <div className="flex bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 items-center gap-2">
               <Users className="text-blue-600" size={20} />
               <span className="font-black text-lg">{customers.length}</span>
               <span className="text-gray-400 text-sm font-bold">Total</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Add New Customer Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-50 border border-gray-100 sticky top-8">
                <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                  <UserPlus className="text-blue-600" /> New Customer
                </h2>
                <form onSubmit={handleAddCustomer} className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">Full Name</label>
                    <input 
                      required
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      placeholder="e.g. Kasun Perera"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">Phone Number</label>
                    <input 
                      required
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      placeholder="071XXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">Email Address</label>
                    <input 
                      type="email"
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      placeholder="kasun@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">Address</label>
                    <textarea 
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-500 font-bold"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                      placeholder="City, Street"
                      rows="2"
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:bg-gray-200"
                  >
                    {loading ? "Saving..." : "Register Customer"}
                  </button>
                </form>
              </div>
            </div>

            {/* Customer List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative mb-6">
                <input 
                  type="text" 
                  placeholder="Search by name or phone..." 
                  className="w-full bg-white border-none rounded-3xl py-5 pl-14 shadow-sm focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              </div>

              <div className="grid gap-4">
                {filteredCustomers.map(customer => (
                  <div key={customer.id} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-800 text-xl tracking-tight">{customer.name}</h3>
                        <div className="flex flex-wrap gap-4 mt-1">
                          <span className="flex items-center gap-1 text-sm text-gray-500 font-bold">
                            <Phone size={14} className="text-blue-400" /> {customer.phone}
                          </span>
                          {customer.email && (
                            <span className="flex items-center gap-1 text-sm text-gray-500 font-bold">
                              <Mail size={14} className="text-orange-400" /> {customer.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => deleteCustomer(customer.id)}
                         className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all md:opacity-0 md:group-hover:opacity-100"
                       >
                         <Trash2 size={20} />
                       </button>
                    </div>
                  </div>
                ))}
                {filteredCustomers.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <Users size={64} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold">No customers found</p>
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