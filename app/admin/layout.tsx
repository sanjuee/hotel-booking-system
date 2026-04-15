'use client'

import { useState } from 'react'
import { Menu, X, BedDouble, LifeBuoy, LogOut, Building2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation' // <-- NEW: For dynamic active states

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname() // <-- NEW: Get current URL

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sans text-gray-900 overflow-hidden">
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#FDFBF7] border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-30">
         <h1 className="text-xl font-serif font-bold tracking-tight text-[#8B6E4E]">The Boutique</h1>
         <button 
           onClick={() => setIsSidebarOpen(true)} 
           className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-md active:bg-gray-100"
         >
           <Menu size={24} />
         </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
         <div
           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
           onClick={() => setIsSidebarOpen(false)}
         />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#fcf7ec] border-r border-gray-200 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* TOP SECTION: Primary Navigation */}
        <div>
          <div className="p-6 md:p-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-gray-900">The Boutique</h1>
              <p className="text-xs text-gray-500 tracking-widest mt-1 uppercase">Editorial Admin</p>
            </div>
            <button 
              className="lg:hidden p-2 -mr-2 -mt-2 text-gray-400 hover:text-gray-900 rounded-md transition-colors active:bg-gray-200" 
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="mt-2 md:mt-4">
            <ul className="flex flex-col gap-1">
              {/* LIVE FRONT DESK - Primary Action */}
              <li className={`transition-colors ${pathname === '/admin' ? 'border-l-4 border-[#8B6E4E] bg-white shadow-sm' : 'border-l-4 border-transparent hover:bg-black/5'}`}>
                <Link 
                  href="/admin" 
                  className={`flex items-center px-6 md:px-8 py-3.5 md:py-3 font-medium ${pathname === '/admin' ? 'text-[#8B6E4E]' : 'text-gray-600'}`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Building2 size={20} className="mr-3" />
                  Live Front Desk
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* BOTTOM SECTION: Admin & Settings */}
        <div className="p-6 md:p-8 space-y-2 border-t border-gray-200/50 bg-[#f9f3e6]/50">
          <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-3 px-2">System Settings</p>
          
          {/* DEMOTED ROOM INVENTORY */}
          <Link 
            href="/admin/inventory" 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center w-full font-medium p-2 rounded-md transition-colors ${
              pathname.includes('/admin/inventory') 
                ? 'text-[#8B6E4E] bg-white shadow-sm border border-gray-200/60' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
            }`}
          >
            <BedDouble size={18} className="mr-3 opacity-70" /> 
            Rooms Inventory
          </Link>

          <button className="flex items-center text-gray-500 hover:text-gray-900 transition-colors w-full font-medium p-2 rounded-md hover:bg-black/5">
            <LifeBuoy size={18} className="mr-3 opacity-70" /> 
            Support
          </button>
          
          <button className="flex items-center text-red-600/80 hover:text-red-700 transition-colors w-full font-medium p-2 rounded-md hover:bg-red-50 mt-4">
            <LogOut size={18} className="mr-3 opacity-70" /> 
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 w-full relative z-0">
        {children}
      </main>

    </div>
  )
}