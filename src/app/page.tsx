'use client';
import { redirect } from 'next/navigation';

export default function Home() {
  return (
  <div className='flex flex-col items-center justify-center h-screen'>
    <div onClick={() => redirect('/inventory')} className=' bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 cursor-pointer text-center flex justify-center items-center'>Go to Inventory</div>
  </div>
  );
}
