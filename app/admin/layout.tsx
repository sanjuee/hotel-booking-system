// app/admin/layout.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ClientLayout from './ClientLayout' // We import the UI file we just made!

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  // SECURE BACKEND CHECK
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // HAND-OFF TO THE CLIENT
  return (
    <ClientLayout userEmail={user.email || 'Staff Member'}>
      {children}
    </ClientLayout>
  )
}