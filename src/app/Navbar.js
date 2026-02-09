"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Settings, LogOut, ChevronDown, Store } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [businessName, setBusinessName] = useState('Smart POS');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // Notification States
  const [notifications, setNotifications] = useState([]); 
  const [unreadCount, setUnreadCount] = useState(0); // අලුතින් එක් කළා

  const router = useRouter();

  useEffect(() => {
    fetchUserDetails();

    // --- Real-time Notification Logic ---
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'products' },
        (payload) => {
          const newNotify = {
            id: Date.now(),
            title: 'New Product Added',
            message: `${payload.new.name} has been added to inventory.`,
            time: new Date().toLocaleTimeString(),
            type: 'success'
          };
          setNotifications(prev => [newNotify, ...prev]);
          setUnreadCount(prev => prev + 1); // අලුත් එකක් ආ විට count එක වැඩි කරයි
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.new.stock_quantity <= 5) {
            const lowStockNotify = {
              id: Date.now(),
              title: 'Low Stock Alert!',
              message: `${payload.new.name} is running low (${payload.new.stock_quantity} left)`,
              time: new Date().toLocaleTimeString(),
              type: 'warning'
            };
            setNotifications(prev => [lowStockNotify, ...prev]);
            setUnreadCount(prev => prev + 1); // Low stock alert එකකදීත් count එක වැඩි කරයි
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchUserDetails() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email);
      const { data } = await supabase
        .from('business_details')
        .select('business_name')
        .eq('id', user.id)
        .single();
      if (data?.business_name) setBusinessName(data.business_name);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      <nav className="fixed top-0 right-0 sm:left-64 h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-end z-[100] print:hidden shadow-sm">
        <div className="flex items-center gap-6">
          
          {/* Notification Button & Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotifyOpen(!isNotifyOpen);
                setIsDropdownOpen(false);
                setUnreadCount(0); // Dropdown එක ඇරිය විට count එක reset කරයි
              }}
              className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-all relative"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full border-2 border-white text-white text-[10px] font-black flex items-center justify-center animate-in zoom-in">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifyOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsNotifyOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-gray-50 z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-black text-gray-800 uppercase tracking-tighter">Notifications</h3>
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg">
                      {notifications.length} Total
                    </span>
                  </div>
                  
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                          <div className="flex gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'warning' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                            <div>
                              <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-2 font-medium italic">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-gray-400 font-bold">
                        No new notifications
                      </div>
                    )}
                  </div>
                  <button className="w-full py-4 text-center text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-50">
                    View All Notifications
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsNotifyOpen(false);
              }}
              className="flex items-center gap-3 p-1.5 pr-4 bg-gray-50 rounded-[1.5rem] hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
            >
              <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100">
                <Store size={20} />
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-800 leading-none uppercase tracking-tighter">{businessName}</p>
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">System Active</p>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-gray-50 z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-6 bg-blue-600">
                    <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Account Details</p>
                    <p className="text-white font-bold truncate mt-1">{userEmail}</p>
                    <p className="text-white/80 text-xs mt-1 font-medium">{businessName} - Administrator</p>
                  </div>
                  <div className="p-2">
                    <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-bold transition-all">
                      <Settings size={20} className="text-gray-400" />
                      <span>System Settings</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all"
                    >
                      <LogOut size={20} />
                      <span>Logout System</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="h-20 print:hidden w-full"></div>
    </>
  );
}