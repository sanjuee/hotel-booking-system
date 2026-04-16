'use client'

import { useState } from 'react'
import { Menu, X, BedDouble, LifeBuoy, LogOut, Building2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation' 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname() 

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-30">
         <h1 className="text-xl font-bold tracking-tight text-slate-900">Admin Portal</h1>
         <button 
           onClick={() => setIsSidebarOpen(true)} 
           className="p-2 text-slate-600 hover:text-slate-900 transition-colors rounded-md active:bg-slate-100"
         >
           <Menu size={24} />
         </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
         <div
           className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
           onClick={() => setIsSidebarOpen(false)}
         />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* TOP SECTION: Primary Navigation */}
        <div>
          <div className="p-6 md:p-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Portal</h1>
              <p className="text-xs text-slate-500 tracking-widest mt-1 uppercase">Hotel Management</p>
            </div>
            <button 
              className="lg:hidden p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-900 rounded-md transition-colors active:bg-slate-100" 
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="mt-2 md:mt-4">
            <ul className="flex flex-col gap-1">
              {/* LIVE FRONT DESK - Primary Action */}
              <li className={`bg-slate-200 transition-colors ${pathname === '/admin' ? 'border-l-4 border-blue-600 bg-blue-50/50' : 'border-l-4 border-transparent hover:bg-slate-100'}`}>
                <Link 
                  href="/admin" 
                  className={`flex items-center px-6 md:px-8 py-3.5 md:py-3 font-medium ${pathname === '/admin' ? 'text-blue-600' : 'text-slate-600'}`}
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
        <div className="p-6 md:p-8 space-y-2 border-t border-slate-200 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-3 px-2">System Settings</p>
          
          {/* DEMOTED ROOM INVENTORY */}
          <Link 
            href="/admin/room-inventory" 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center w-full font-medium p-2 rounded-md transition-colors ${
              pathname.includes('/admin/room-inventory') 
                ? 'text-blue-600 bg-white shadow-sm border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BedDouble size={18} className="mr-3 opacity-70" /> 
            Rooms Inventory
          </Link>

          <button className="flex items-center text-slate-600 hover:text-slate-900 transition-colors w-full font-medium p-2 rounded-md hover:bg-slate-100">
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