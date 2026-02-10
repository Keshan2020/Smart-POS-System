import './globals.css'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { Toaster } from 'react-hot-toast' // Toaster එක import කිරීම

export const metadata = {
  title: 'My POS System',
  description: 'Cloud Based POS',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      
      <body className="bg-gray-50 flex min-h-screen font-sans">
        {/* Toast Notifications පෙන්වන ස්ථානය */}
        <Toaster position="top-right" reverseOrder={false} />

        {/* වම් පසින් Sidebar එක ස්ථාවරව පවතී */}
        <Sidebar />
        
        {/* දකුණු පස ඇති ප්‍රධාන කොටස (Navbar + Content) */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          
          {/* ඉහළින් Navbar එක (Account & Notifications මෙහි පවතී) */}
          <Navbar /> 
          
          {/* පිටුවල අන්තර්ගතය (Terminal, Inventory, Settings ආදිය) */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          
        </div>
      </body>
    </html>
  )
}