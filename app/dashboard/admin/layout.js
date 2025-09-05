import { Suspense } from 'react';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';

export default async function AdminLayout({ children }) {
  const auth = await verifyAuth();
  
  if (auth.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 px-4">
            <Suspense fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            }>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}