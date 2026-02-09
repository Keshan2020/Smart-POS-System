"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, Save, Store, User, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [business, setBusiness] = useState({ business_name: '' });
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        const { data } = await supabase
          .from('business_details')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setBusiness(data);
      }
    }
    fetchData();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('business_details')
      .upsert({ id: user.id, business_name: business.business_name });

    if (error) alert("Error: " + error.message);
    else alert("Settings saved successfully!");
    setLoading(false);
  };

  return (
    <main className="flex-1 p-8 bg-[#f1f5f9] min-h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-blue-600">
               <Settings size={32} />
            </div>
            Settings
          </h1>
          <p className="text-gray-500 font-medium mt-2">Manage your business profile and account preferences</p>
        </header>

        <div className="grid gap-8">
          {/* Business Configuration */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                <Store size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-800">Business Identity</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase ml-2 tracking-widest">Business Display Name</label>
                <input 
                  type="text"
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-2 focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                  placeholder="Enter your shop name"
                  value={business.business_name}
                  onChange={(e) => setBusiness({...business, business_name: e.target.value})}
                />
              </div>
              <button 
                onClick={handleUpdate}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-blue-100 disabled:bg-gray-200"
              >
                <Save size={20} /> {loading ? "Updating..." : "Save Settings"}
              </button>
            </div>
          </section>

          {/* Account Security */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-50 p-2 rounded-xl text-green-600">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-800">Account Information</h2>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <User className="text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Registered Email</p>
                <p className="font-bold text-gray-800">{userEmail}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}