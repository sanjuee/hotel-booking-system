// app/admin/ClientLayout.tsx
'use client'

import { useState } from 'react'
import { Menu, X, BedDouble, LifeBuoy, LogOut, Building2, UserCircle, BookUser } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation' 
import { createClient } from '@/utils/supabase/client'

export default function ClientLayout({ 
  children,
  userEmail
}: { 
  children: React.ReactNode,
  userEmail: string
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname() 
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    
    await supabase.auth.signOut()
    
    router.refresh()
    router.push('/login')
  }

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
              
              {/* DISPLAY LOGGED IN USER HERE */}
              <div className="flex items-center gap-2 mt-3 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
                <UserCircle size={16} className="text-slate-400" />
                <span className="truncate max-w-[150px] font-medium">{userEmail}</span>
              </div>

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
              <li className={`transition-colors ${pathname === '/admin' ? 'border-l-4 border-blue-600 bg-blue-50/50' : 'border-l-4 border-transparent hover:bg-slate-100'}`}>
                <Link 
                  href="/admin" 
                  className={`flex items-center px-6 md:px-8 py-3.5 md:py-3 font-medium ${pathname === '/admin' ? 'text-blue-600' : 'text-slate-600'}`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Building2 size={20} className="mr-3" />
                  Front Desk
                </Link>
              </li>
              <li className={`transition-colors ${pathname === '/admin/bookings' ? 'border-l-4 border-blue-600 bg-blue-50/50' : 'border-l-4 border-transparent hover:bg-slate-100'}`}>
                <Link 
                  href="/admin/bookings" 
                  className={`flex items-center px-6 md:px-8 py-3.5 md:py-3 font-medium ${pathname === '/admin/bookings' ? 'text-blue-600' : 'text-slate-600'}`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <BookUser size={20} className="mr-3" />
                  Bookings
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* BOTTOM SECTION: Admin & Settings */}
        <div className="p-6 md:p-8 space-y-2 border-t border-slate-200 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-3 px-2">System Settings</p>
          
          {/* ROOM INVENTORY */}
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
          
          {/* LOGOUT BUTTON WITH LOADING STATE */}
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center text-red-600/80 hover:text-red-700 transition-colors w-full font-medium p-2 rounded-md hover:bg-red-50 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
               <span className="flex items-center">
                 <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Signing out...
               </span>
            ) : (
              <>
                <LogOut size={18} className="mr-3 opacity-70" /> 
                Logout
              </>
            )}
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