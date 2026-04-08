import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-foreground text-background flex flex-col">
        <div className="p-6 font-bold text-2xl tracking-widest border-b border-gray-700">
          ADMIN
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 bg-secondary text-on-secondary rounded">
            Rooms Inventory
          </Link>
          <Link href="#" className="block px-4 py-2 text-gray-400 hover:text-white transition">
            Bookings (Coming Soon)
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
          Logged in as Manager
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}