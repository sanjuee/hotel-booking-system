'use client'

import { useState } from 'react'
import { Menu, X, BedDouble, LifeBuoy, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sans text-gray-900 overflow-hidden">
      
      {/* MOBILE & TABLET HEADER (Hidden on Desktop 'lg') */}
      {/* Changed z-index to 30 so the drawer (z-50) clearly overlaps it */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#FDFBF7] border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-30">
         <h1 className="text-xl font-serif font-bold tracking-tight text-[#8B6E4E]">The Boutique</h1>
         <button 
           onClick={() => setIsSidebarOpen(true)} 
           className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-md active:bg-gray-100"
         >
           <Menu size={24} />
         </button>
      </div>

      {/* MOBILE & TABLET OVERLAY (Darkens the background when menu is open) */}
      {isSidebarOpen && (
         <div
           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
           onClick={() => setIsSidebarOpen(false)}
         />
      )}

      {/* SIDEBAR (Drawer on Mobile/Tablet 'lg:hidden', Fixed on Desktop 'lg:static') */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#fcf7ec] border-r border-gray-200 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          <div className="p-6 md:p-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-gray-900">The Boutique</h1>
              <p className="text-xs text-gray-500 tracking-widest mt-1 uppercase">Editorial Admin</p>
            </div>
            {/* Close button for mobile/tablet */}
            <button 
              className="lg:hidden p-2 -mr-2 -mt-2 text-gray-400 hover:text-gray-900 rounded-md transition-colors active:bg-gray-200" 
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="mt-2 md:mt-4">
            <ul>
              <li className="border-l-4 border-[#8B6E4E] bg-white shadow-sm">
                <a 
                  href="#" 
                  className="flex items-center px-6 md:px-8 py-3.5 md:py-3 text-[#8B6E4E] font-medium"
                  onClick={() => setIsSidebarOpen(false)} // Close menu on mobile/tablet when clicked
                >
                  <BedDouble size={20} className="mr-3" />
                  Rooms Inventory
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="p-6 md:p-8 space-y-4">
          <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors w-full font-medium p-2 -ml-2 rounded-md hover:bg-black/5">
            <LogOut size={20} className="mr-3 text-gray-400" /> Logout
          </button>
          <button className="w-full bg-[#7A633F] text-white py-3.5 md:py-3 rounded-lg hover:bg-[#685333] transition-colors font-medium flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]">
            <LifeBuoy size={18} /> Support
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      {/* pt-16 on smaller screens pushes the content down below the fixed header. 
          lg:pt-0 removes that gap on desktop where the header doesn't exist. */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 w-full relative z-0">
        {children}
      </main>

    </div>
  )
}