import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f0eeea]">
      {/* Sidebar */}
        <aside className="w-64 bg-[#e7dcc4] border-r border-gray-200 flex flex-col justify-between  md:flex">
        <div>
          <div className="p-8">
            <h1 className="text-2xl font-serif font-bold tracking-tight">The Boutique</h1>
            <p className="text-xs text-primary tracking-widest mt-1 uppercase">Editorial Admin</p>
          </div>
          <nav className="mt-4">
            <ul>
              <li className="border-l-4 border-[#8B6E4E] bg-white">
                <a href="#" className="flex items-center px-8 py-3 text-[#8B6E4E] font-medium">
                  <span className="mr-3">🛏️</span>
                  Rooms Inventory
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="p-8 space-y-4">
          <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors w-full">
            <span className="mr-3">🚪</span> Logout
          </button>
          <button className="w-full bg-secondary text-white py-3 rounded hover:bg-[#685333] transition-colors font-medium">
            Support
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}