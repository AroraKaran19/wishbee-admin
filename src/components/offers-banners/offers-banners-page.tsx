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
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { CouponsTable, Coupon } from './coupons-table';
import { bannerApi, Banner, BannerType } from "@/lib/api/banners";
import toast from "react-hot-toast";
import { BannerModal } from "./banner-modal";

export function OffersBannersPage() {
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 10;
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [offersBanners, setOffersBanners] = useState<Banner[]>([]);
  const [heroMobBanners, setHeroMobBanners] = useState<Banner[]>([]);
  const [offersMobBanners, setOffersMobBanners] = useState<Banner[]>([]);
  const [authenticationBanners, setAuthenticationBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [draggedBanner, setDraggedBanner] = useState<Banner | null>(null);
  const [dragOverBanner, setDragOverBanner] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

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

  // Fetch all banners from API (all 5 types)
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const allBanners = await bannerApi.getAll();
      // Sort by order (ascending) and separate by type
      const sortedBanners = [...allBanners].sort((a, b) => {
        // First sort by type, then by order
        if (a.type !== b.type) {
          const typeOrder: Record<BannerType, number> = {
            hero: 0,
            offers: 1,
            "hero-mob": 2,
            "offers-mob": 3,
            authentication: 4,
          };
          return typeOrder[a.type] - typeOrder[b.type];
        }
        return a.order - b.order;
      });
      const hero = sortedBanners.filter((b) => b.type === "hero");
      const offers = sortedBanners.filter((b) => b.type === "offers");
      const heroMob = sortedBanners.filter((b) => b.type === "hero-mob");
      const offersMob = sortedBanners.filter((b) => b.type === "offers-mob");
      const authentication = sortedBanners.filter((b) => b.type === "authentication");
      setHeroBanners(hero);
      setOffersBanners(offers);
      setHeroMobBanners(heroMob);
      setOffersMobBanners(offersMob);
      setAuthenticationBanners(authentication);
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

  // Handle drag and drop reordering
  const handleDragStart = (banner: Banner) => {
    setDraggedBanner(banner);
  };

  const handleDragOver = (e: React.DragEvent, bannerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedBanner && draggedBanner._id !== bannerId) {
      setDragOverBanner(bannerId);
    }
  };

  const handleDragLeave = () => {
    setDragOverBanner(null);
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetBanner: Banner,
    banners: Banner[],
    setBanners: React.Dispatch<React.SetStateAction<Banner[]>>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedBanner || draggedBanner._id === targetBanner._id) {
      setDraggedBanner(null);
      setDragOverBanner(null);
      return;
    }

    // Ensure both banners are of the same type
    if (draggedBanner.type !== targetBanner.type) {
      toast.error("Banners can only be reordered within the same type");
      setDraggedBanner(null);
      setDragOverBanner(null);
      return;
    }

    try {
      setIsReordering(true);

      // Find the indices
      const draggedIndex = banners.findIndex(
        (b) => b._id === draggedBanner._id
      );
      const targetIndex = banners.findIndex((b) => b._id === targetBanner._id);

      if (draggedIndex === -1 || targetIndex === -1) {
        throw new Error("Banner not found");
      }

      // Create new array with reordered items
      const newBanners = [...banners];
      const [removed] = newBanners.splice(draggedIndex, 1);
      newBanners.splice(targetIndex, 0, removed);

      // Update orders sequentially starting from 0
      const bannerOrders = newBanners.map((banner, index) => ({
        id: banner._id,
        order: index,
      }));

      // Call API to reorder
      await bannerApi.reorder(bannerOrders);

      // Update local state
      setBanners(
        newBanners.map((banner, index) => ({ ...banner, order: index }))
      );

      toast.success("Banner order updated successfully");
    } catch (error) {
      console.error("Error reordering banners:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reorder banners"
      );
      // Refresh to get correct order
      await fetchBanners();
    } finally {
      setIsReordering(false);
      setDraggedBanner(null);
      setDragOverBanner(null);
    }
  };

  // Helper function to render banner table rows
  const renderBannerRows = (
    banners: Banner[],
    setBanners: React.Dispatch<React.SetStateAction<Banner[]>>
  ) => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-8 text-center">
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
          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
            No banners found. Click &quot;Add new Banner&quot; to create one.
          </td>
        </tr>
      );
    }

    return banners.map((banner) => {
      const isDragging = draggedBanner?._id === banner._id;
      const isDragOver = dragOverBanner === banner._id;

      return (
        <tr
          key={banner._id}
          draggable={!isReordering}
          onDragStart={(e) => {
            // Only allow drag from the grip handle or row (not buttons)
            const target = e.target as HTMLElement;
            if (target.closest("button") || target.closest("a")) {
              e.preventDefault();
              return;
            }
            handleDragStart(banner);
          }}
          onDragOver={(e) => handleDragOver(e, banner._id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, banner, banners, setBanners)}
          className={`hover:bg-gray-50 transition-colors ${
            isDragging ? "opacity-50 cursor-grabbing" : "cursor-grab"
          } ${isDragOver ? "bg-blue-50 border-t-2 border-blue-400" : ""}`}
        >
          <td className="px-6 py-4 w-12">
            <div
              className="flex items-center justify-center"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing" />
            </div>
          </td>
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
            <div
              className="flex items-center justify-center gap-2"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
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
      );
    });
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
        {/* Hero Banners Section (Desktop) */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#d9f4ff] border-b border-blue-200">
                <tr>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 w-12">
                    Drag
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Hero Banners (Desktop)
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderBannerRows(heroBanners, setHeroBanners)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Offers Banners Section (Desktop) */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#d9f4ff] border-b border-blue-200">
                <tr>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 w-12">
                    Drag
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Offers Banners (Desktop)
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderBannerRows(offersBanners, setOffersBanners)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hero Banners Section (Mobile) */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#d9f4ff] border-b border-blue-200">
                <tr>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 w-12">
                    Drag
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Hero Banners (Mobile)
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderBannerRows(heroMobBanners, setHeroMobBanners)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Offers Banners Section (Mobile) */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#d9f4ff] border-b border-blue-200">
                <tr>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 w-12">
                    Drag
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Offers Banners (Mobile)
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderBannerRows(offersMobBanners, setOffersMobBanners)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Authentication Banners Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#d9f4ff] border-b border-blue-200">
                <tr>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 w-12">
                    Drag
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Authentication Banners
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderBannerRows(authenticationBanners, setAuthenticationBanners)}
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
