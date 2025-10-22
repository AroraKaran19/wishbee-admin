"use client";

import React, { useState } from "react";
import { ComboProduct } from "@/lib/types/combo";
import { ArrowLeft, Edit, Trash2, Package, DollarSign, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ComboDetailPageProps {
  combo: ComboProduct;
}

export function ComboDetailPage({ combo }: ComboDetailPageProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/inventory/combo/${combo._id}/edit`);
  };

  const handleDelete = () => {
    console.log("Delete combo:", combo);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-4">
        <button
          title="Back"
          onClick={handleBack}
          className="flex items-center text-gray-600 cursor-pointer hover:text-gray-900 transition-colors mb-"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
        </button>
        <span className="text-lg font-medium">{combo.name}</span>
      </div>

      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white mb-10 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="py-3 border-gray-200">
                <div className="flex space-x-1">
                  <div className="px-4 py-3 rounded-tr-3xl text-sm font-medium bg-primary text-white">
                    Combo Details
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-10">
                    <label className="text-sm font-medium text-gray-600 w-32">
                      Name:
                    </label>
                    <p className="text-gray-900 font-medium">{combo.name}</p>
                  </div>

                  <div className="flex items-center gap-10">
                    <label className="text-sm font-medium text-gray-600 w-32">
                      Description:
                    </label>
                    <p className="text-gray-900 font-medium">{combo.description}</p>
                  </div>

                  <div className="flex items-center gap-10">
                    <label className="text-sm font-medium text-gray-600 w-32">
                      Status:
                    </label>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        combo.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : combo.status === "OUT_OF_STOCK"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {combo.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-10">
                    <label className="text-sm font-medium text-gray-600 w-32">
                      Organic:
                    </label>
                    <p className="text-gray-900 font-medium">
                      {combo.isOrganic ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="flex items-center gap-10">
                    <label className="text-sm font-medium text-gray-600 w-32">
                      MRP:
                    </label>
                    <p className="text-gray-900 font-medium">₹{combo.mrp}</p>
                  </div>

                  <div className="flex items-center gap-10">
                    <label className="text-sm font-medium text-gray-600 w-32">
                      Stock:
                    </label>
                    <p className="text-gray-900 font-medium">{combo.stock}</p>
                  </div>

                  {combo.minimumOrderQuantity && (
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Min Order Qty:
                      </label>
                      <p className="text-gray-900 font-medium">{combo.minimumOrderQuantity}</p>
                    </div>
                  )}

                  {combo.maximumOrderQuantity && (
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Max Order Qty:
                      </label>
                      <p className="text-gray-900 font-medium">{combo.maximumOrderQuantity}</p>
                    </div>
                  )}

                  {combo.alertExpiry && (
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Alert Expiry:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {combo.alertExpiry} days before expiry
                      </p>
                    </div>
                  )}

                  {combo.expiry && (
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Expiry Date:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {new Date(combo.expiry).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {combo.metaTitle && (
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Meta Title:
                      </label>
                      <p className="text-gray-900 font-medium">{combo.metaTitle}</p>
                    </div>
                  )}

                  {combo.metaDescription && (
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Meta Description:
                      </label>
                      <p className="text-gray-900 font-medium">{combo.metaDescription}</p>
                    </div>
                  )}

                  {combo.metaKeywords && combo.metaKeywords.length > 0 && (
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Meta Keywords:
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {combo.metaKeywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {combo.slug && (
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Slug:
                      </label>
                      <p className="text-gray-900 font-medium">{combo.slug}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Images Section */}
            {combo.images && combo.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="py-3 border-gray-200">
                  <div className="flex space-x-1">
                    <div className="px-4 py-3 rounded-tr-3xl text-sm font-medium bg-primary text-white">
                      Images
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {combo.images.map((image, index) => (
                      <div
                        key={index}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-primary"
                            : "border-gray-200"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <Image
                          src={image}
                          alt={`Combo image ${index + 1}`}
                          fill
                          className="object-cover"
                          loading="lazy"
                          unoptimized
                          quality={100}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Products Section */}
            {combo.products && combo.products.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="py-3 border-gray-200">
                  <div className="flex space-x-1">
                    <div className="px-4 py-3 rounded-tr-3xl text-sm font-medium bg-primary text-white">
                      Products in Combo
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {combo.products.map((product, index) => (
                      <div
                        key={product._id || index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {product.images && product.images.length > 0 && (
                          <Image
                            src={product.images[0]}
                            alt={product.name || `Product image ${index + 1}`}
                            width={50}
                            height={50}
                            className="w-12 h-12 object-cover rounded-lg"
                            loading="lazy"
                            unoptimized
                            quality={100}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            SKU: {product.sku} | ₹{product.mrp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Pricing & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="py-3 border-gray-200">
                <div className="flex space-x-1">
                  <div className="px-4 py-3 rounded-tr-3xl text-sm font-medium bg-primary text-white">
                    Pricing & Inventory
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      MRP:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{combo.mrp}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Stock:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {combo.stock} units
                    </span>
                  </div>

                  {combo.minimumOrderQuantity && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">
                        Min Order:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {combo.minimumOrderQuantity} units
                      </span>
                    </div>
                  )}

                  {combo.maximumOrderQuantity && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">
                        Max Order:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {combo.maximumOrderQuantity} units
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="py-3 border-gray-200">
                <div className="flex space-x-1">
                  <div className="px-4 py-3 rounded-tr-3xl text-sm font-medium bg-primary text-white">
                    Actions
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex space-x-4 pb-4">
                  <Button
                    onClick={handleEdit}
                    variant="success"
                    className="flex-1 py-3"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="danger"
                    className="flex-1 py-3"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
