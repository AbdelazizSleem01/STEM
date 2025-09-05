import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FiBook, FiTarget, FiGlobe, FiAward, FiHeart } from 'react-icons/fi';

export default async function AuthLayout({ children }) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('token');

  if (isLoggedIn) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
     
        <Suspense fallback={
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }>
          {children}
        </Suspense>

  
    </div>
  );
}