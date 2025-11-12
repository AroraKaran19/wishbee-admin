'use client';

import React, { useState } from 'react';
import { Plus, ArrowRight, Edit, Pause, Trash2, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CouponsTable, Coupon } from './coupons-table';

export interface Banner {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Scheduled';
  startDate: string;
  endDate: string;
  imageUrl?: string;
}


export function OffersBannersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const banners: Banner[] = [
    {
      id: 'banner_1',
      title: 'Monsoon Offer Banner',
      description: 'Create, update, and schedule promotional content to engage users and boost sales.',
      status: 'Active',
      startDate: '15 June 2025',
      endDate: '27 June 2025',
    },
    {
      id: 'banner_2',
      title: 'Summer Sale',
      description: 'Create, update, and schedule promotional content to engage users and boost sales.',
      status: 'Scheduled',
      startDate: '15 June 2025',
      endDate: '27 June 2025',
    },
  ];

  const coupons: Coupon[] = [
    {
      id: 'coupon_1',
      offerName: 'Welcome ₹100 Off',
      code: 'SAVE100',
      discount: '₹100 Off',
      minCart: '₹499',
      status: 'Active',
      validity: '01 Aug - 31 Aug 2025',
    },
    {
      id: 'coupon_2',
      offerName: 'Weekend Flash Sale',
      code: 'WEEKDAY20',
      discount: '20% Off',
      minCart: 'No Min.',
      status: 'Upcoming',
      validity: '27 Jul - 28 Jul 2025',
    },
    {
      id: 'coupon_3',
      offerName: 'First Order Deal',
      code: 'NEWUSER75',
      discount: '₹75 Off',
      minCart: '₹399',
      status: 'Active',
      validity: 'Ongoing',
    },
  ];

  const totalPages = Math.ceil(coupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCoupons = coupons.slice(startIndex, startIndex + itemsPerPage);

  const handleAddBanner = () => {
    console.log('Add new banner');
  };

  const handleCreateCoupon = () => {
    console.log('Create coupon');
  };

  const handleExportCSV = () => {
    console.log('Export CSV');
  };

  const handleEditCoupon = (coupon: Coupon) => {
    console.log('Edit coupon:', coupon);
  };

  const handleToggleCoupon = (coupon: Coupon) => {
    console.log('Toggle coupon:', coupon);
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    console.log('Delete coupon:', coupon);
  };

  const handleSeeAll = () => {
    console.log('See all banners');
  };

  const handleEditBanner = (banner: Banner) => {
    console.log('Edit banner:', banner);
  };

  const handleToggleBanner = (banner: Banner) => {
    console.log('Toggle banner:', banner);
  };

  const handleDeleteBanner = (banner: Banner) => {
    console.log('Delete banner:', banner);
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Offers & Banners Management</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Create, update, and schedule promotional content to engage users and boost sales.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleAddBanner} variant="primary" className="flex items-center gap-2 w-full sm:w-auto text-xs md:text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add new Banner</span>
          <span className="sm:hidden">Add Banner</span>
        </Button>
        <Button onClick={handleCreateCoupon} variant="primary" className="flex items-center gap-2 w-full sm:w-auto text-xs md:text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Coupon</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      <div className="flex flex-col space-y-6 pb-12 sm:pb-0">
        {/* Home Page Banners Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#d9f4ff] border-b border-blue-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Home Page Banners</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Start Date</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">End Date</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-56 h-32 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mountain className="w-12 h-12 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{banner.title}</h3>
                          <p className="text-sm text-gray-500">{banner.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                          banner.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {banner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">{banner.startDate}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">{banner.endDate}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditBanner(banner)}
                          className="text-green-600 hover:text-green-700 bg-transparent hover:bg-green-50 border-0 shadow-none rounded-full p-2 cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {banner.status === 'Active' ? (
                          <button
                            onClick={() => handleToggleBanner(banner)}
                            className="text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 border-0 shadow-none rounded-full p-2 cursor-pointer"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteBanner(banner)}
                            className="text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 border-0 shadow-none rounded-full p-2 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 flex justify-center border-t border-gray-200">
            <Button onClick={handleSeeAll} variant="primary" className="flex items-center gap-2">
              See All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Coupons and Promo Codes Section */}
        <CouponsTable
          coupons={currentCoupons}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onExportCSV={handleExportCSV}
          onEdit={handleEditCoupon}
          onToggle={handleToggleCoupon}
          onDelete={handleDeleteCoupon}
        />
      </div>
    </div>
  );
}
