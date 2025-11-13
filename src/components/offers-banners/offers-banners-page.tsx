"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Pause,
  Trash2,
  Mountain,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { CouponsTable, Coupon } from './coupons-table';
import { bannerApi, Banner } from "@/lib/api/banners";
import toast from "react-hot-toast";
import { BannerModal } from "./banner-modal";

export function OffersBannersPage() {
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 10;
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [offersBanners, setOffersBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // const coupons: Coupon[] = [
  //   {
  //     id: 'coupon_1',
  //     offerName: 'Welcome ₹100 Off',
  //     code: 'SAVE100',
  //     discount: '₹100 Off',
  //     minCart: '₹499',
  //     status: 'Active',
  //     validity: '01 Aug - 31 Aug 2025',
  //   },
  //   {
  //     id: 'coupon_2',
  //     offerName: 'Weekend Flash Sale',
  //     code: 'WEEKDAY20',
  //     discount: '20% Off',
  //     minCart: 'No Min.',
  //     status: 'Upcoming',
  //     validity: '27 Jul - 28 Jul 2025',
  //   },
  //   {
  //     id: 'coupon_3',
  //     offerName: 'First Order Deal',
  //     code: 'NEWUSER75',
  //     discount: '₹75 Off',
  //     minCart: '₹399',
  //     status: 'Active',
  //     validity: 'Ongoing',
  //   },
  // ];

  // const totalPages = Math.ceil(coupons.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const currentCoupons = coupons.slice(startIndex, startIndex + itemsPerPage);

  // Fetch all banners from API (both "hero" and "offers" types)
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const allBanners = await bannerApi.getAll();
      // Sort by order (ascending) and separate by type
      const sortedBanners = [...allBanners].sort((a, b) => a.order - b.order);
      const hero = sortedBanners.filter((b) => b.type === "hero");
      const offers = sortedBanners.filter((b) => b.type === "offers");
      setHeroBanners(hero);
      setOffersBanners(offers);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = () => {
    setEditingBanner(null);
    setIsBannerModalOpen(true);
  };

  // const handleCreateCoupon = () => {
  //   console.log('Create coupon');
  // };

  // const handleExportCSV = () => {
  //   console.log('Export CSV');
  // };

  // const handleEditCoupon = (coupon: Coupon) => {
  //   console.log('Edit coupon:', coupon);
  // };

  // const handleToggleCoupon = (coupon: Coupon) => {
  //   console.log('Toggle coupon:', coupon);
  // };

  // const handleDeleteCoupon = (coupon: Coupon) => {
  //   console.log('Delete coupon:', coupon);
  // };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setIsBannerModalOpen(true);
  };

  const handleToggleBanner = async (banner: Banner) => {
    try {
      await bannerApi.update(banner._id, { isActive: !banner.isActive });
      toast.success(
        `Banner ${!banner.isActive ? "activated" : "deactivated"} successfully`
      );
      // Refresh banners
      await fetchBanners();
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast.error("Failed to update banner status");
    }
  };

  const handleDeleteBanner = async (banner: Banner) => {
    if (
      !confirm(
        `Are you sure you want to delete "${banner.title || "this banner"}"?`
      )
    ) {
      return;
    }

    try {
      await bannerApi.delete(banner._id);
      toast.success("Banner deleted successfully");
      // Refresh banners
      await fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  const handleBannerSave = async () => {
    // Refresh banners after save
    await fetchBanners();
  };

  // Helper function to render banner table rows
  const renderBannerRows = (banners: Banner[]) => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} className="px-6 py-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="text-gray-500">Loading banners...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (banners.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
            No banners found. Click &quot;Add new Banner&quot; to create one.
          </td>
        </tr>
      );
    }

    return banners.map((banner) => (
      <tr key={banner._id} className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-56 h-32 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {banner.imageUrl ? (
                <img
                  src={banner.imageUrl}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Mountain className="w-12 h-12 text-blue-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {banner.title || "Untitled Banner"}
              </h3>
              {banner.link && (
                <p className="text-sm text-gray-500">Link: {banner.link}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Order: {banner.order}
              </p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
              banner.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {banner.isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-6 py-4 text-center text-sm text-gray-900">
          {new Date(banner.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-center text-sm text-gray-900">
          {new Date(banner.updatedAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEditBanner(banner)}
              className="text-green-600 hover:text-green-700 bg-transparent hover:bg-green-50 border-0 shadow-none rounded-full p-2 cursor-pointer"
              title="Edit banner"
            >
              <Edit className="h-4 w-4" />
            </button>
            {banner.isActive ? (
              <button
                onClick={() => handleToggleBanner(banner)}
                className="text-orange-600 hover:text-orange-700 bg-transparent hover:bg-orange-50 border-0 shadow-none rounded-full p-2 cursor-pointer"
                title="Deactivate banner"
              >
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => handleToggleBanner(banner)}
                className="text-green-600 hover:text-green-700 bg-transparent hover:bg-green-50 border-0 shadow-none rounded-full p-2 cursor-pointer"
                title="Activate banner"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => handleDeleteBanner(banner)}
              className="text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 border-0 shadow-none rounded-full p-2 cursor-pointer"
              title="Delete banner"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Offers & Banners Management
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Create, update, and schedule promotional content to engage users and
          boost sales.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleAddBanner}
          variant="primary"
          className="flex items-center gap-2 w-full sm:w-auto text-xs md:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add new Banner</span>
          <span className="sm:hidden">Add Banner</span>
        </Button>
        {/* <Button onClick={handleCreateCoupon} variant="primary" className="flex items-center gap-2 w-full sm:w-auto text-xs md:text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Coupon</span>
          <span className="sm:hidden">Create</span>
        </Button> */}
      </div>

      <div className="flex flex-col space-y-6 pb-12 sm:pb-0">
        {/* Hero Banners Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#d9f4ff] border-b border-blue-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Hero Banners
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderBannerRows(heroBanners)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Offers Banners Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#d9f4ff] border-b border-blue-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Offers Banners
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderBannerRows(offersBanners)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coupons and Promo Codes Section */}
        {/* <CouponsTable
          coupons={currentCoupons}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onExportCSV={handleExportCSV}
          onEdit={handleEditCoupon}
          onToggle={handleToggleCoupon}
          onDelete={handleDeleteCoupon}
        /> */}
      </div>

      {/* Banner Modal */}
      <BannerModal
        isOpen={isBannerModalOpen}
        onClose={() => {
          setIsBannerModalOpen(false);
          setEditingBanner(null);
        }}
        banner={editingBanner}
        onSave={handleBannerSave}
      />
    </div>
  );
}
