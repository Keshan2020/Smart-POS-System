"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState(''); // ව්‍යාපාරයේ නම සඳහා අලුතින් එක් කළා
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // දැනටමත් Login වී ඇත්නම් කෙලින්ම Dashboard එකට යවන්න
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push('/');
    };
    checkUser();
  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isRegistering) {
      // 1. User Register කිරීම
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        alert(error.message);
      } else if (data.user && businessName) {
        // 2. Register වීම සාර්ථක නම් Business නම database එකට දැමීම
        const { error: dbError } = await supabase
          .from('business_details')
          .insert([{ id: data.user.id, business_name: businessName }]);
        
        if (dbError) {
          alert("Error saving business details: " + dbError.message);
        } else {
          alert("Check your email for confirmation!");
        }
      } else if (data.user) {
        alert("Check your email for confirmation!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else {
        router.push('/'); 
        router.refresh(); // Layout එක refresh කිරීමට
      }
    }
    setLoading(false);
  };

  return (
    /* මෙහි z-index සහ fixed position භාවිතා කර ඇත්තේ layout එකේ ඇති sidebar එක යට කිරීමටයි */
    <div className="fixed inset-0 z-[9999] h-screen w-screen flex items-center justify-center bg-[#f1f5f9]">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {isRegistering ? 'Create Account' : 'Shop Login'}
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-center">
            {isRegistering ? 'Start managing your POS today' : 'Welcome back, please login'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Register වීමේදී පමණක් Business Name field එක පෙන්වයි */}
          {isRegistering && (
            <div>
              <label className="text-xs font-black text-gray-400 uppercase ml-2">Business Name (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Smart Supermarket" 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold mt-1"
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)} 
              />
            </div>
          )}

          <div>
            <label className="text-xs font-black text-gray-400 uppercase ml-2">Email Address</label>
            <input 
              required
              type="email" 
              placeholder="name@shop.com" 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold mt-1"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-xs font-black text-gray-400 uppercase ml-2">Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold mt-1"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:bg-gray-200 mt-2"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login to System')}
          </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full mt-6 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors"
        >
          {isRegistering ? 'Already have an account? Login' : 'New Shop? Create an account'}
        </button>
      </div>
    </div>
  );
}