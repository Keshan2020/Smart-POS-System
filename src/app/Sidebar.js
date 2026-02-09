"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, ShoppingCart, Package, 
  BarChart3, Users, Wallet, LogOut, Settings 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Terminal', href: '/', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Expenses', href: '/expenses', icon: Wallet },
    
  ];

  return (
    <aside className="print:hidden w-24 lg:w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl">
          <ShoppingCart className="text-white" size={24} />
        </div>
        <span className="hidden lg:block font-black text-xl tracking-tight text-gray-800 uppercase">Smart POS</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="hidden lg:block">{item.name}</span>
            </Link>
          );
        })}
      </nav>

     
    </aside>
  );
}