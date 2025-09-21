"use client";

import React, { useState } from "react";
import { Product } from "@/lib/types/product";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProductDetailPageProps {
  product: Product;
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    console.log("Edit product:", product);
  };

  const handleDelete = () => {
    console.log("Delete product:", product);
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
        <span className="text-lg font-medium">{product.name}</span>
      </div>

      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white mb-10 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="py-3 border-gray-200">
                <div className="flex space-x-1">
                  <div className="px-4 py-3 rounded-tr-3xl text-sm font-medium bg-primary text-white">
                    Product Details
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Product name:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Product description:
                      </label>
                      <p className="text-gray-900 text-sm leading-relaxed flex-1">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        SKU:
                      </label>
                      <p className="text-gray-900 font-medium">{product.sku}</p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Single price:
                      </label>
                      <p className="text-gray-900 font-medium">
                        ₹{product.price.single}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Bulk price:
                      </label>
                      <p className="text-gray-900 font-medium">
                        ₹{product.price.bulk}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Category:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.category?.name || "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Sub-category:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.subCategory?.name || "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Stock:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.stock}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Status:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.status}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Organic:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.isOrganic ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Weight (Single):
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.weight.single.value}{" "}
                        {product.weight.single.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Weight (Bulk):
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.weight.bulk.value} {product.weight.bulk.unit}
                      </p>
                    </div>

                    {product.slug && (
                      <div className="flex items-center gap-10">
                        <label className="text-sm font-medium text-gray-600 w-32">
                          Slug:
                        </label>
                        <p className="text-gray-900 font-medium">
                          /{product.slug}
                        </p>
                      </div>
                    )}

                    {product.metaTitle && (
                      <div className="flex items-center gap-10">
                        <label className="text-sm font-medium text-gray-600 w-32">
                          Meta Title:
                        </label>
                        <p className="text-gray-900 font-medium">
                          {product.metaTitle}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {product.highlights && product.highlights.length > 0 && (
                <div className="border-t border-gray-200">
                  <div className="px-6 py-3">
                    <div className="py-2 px-4 rounded-lg text-sm font-medium bg-gray-300 inline-block text-gray-600">
                      Product Highlights
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {product.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {product.productCollections &&
                product.productCollections.length > 0 && (
                  <div className="border-t border-gray-200">
                    <div className="px-6 py-3">
                      <div className="py-2 px-4 rounded-lg text-sm font-medium bg-gray-300 inline-block text-gray-600">
                        Collection Options
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-3">
                        {product.productCollections.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-600">
                                Quantity:
                              </span>
                              <span className="text-gray-900 font-medium">
                                {item.quantity} {item.unit || "units"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-600">
                                Price:
                              </span>
                              <span className="text-gray-900 font-medium">
                                ₹{item.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {product.metaKeywords && product.metaKeywords.length > 0 && (
                <div className="border-t border-gray-200">
                  <div className="px-6 py-3">
                    <div className="py-2 px-4 rounded-lg text-sm font-medium bg-gray-300 inline-block text-gray-600">
                      SEO Keywords
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {product.metaKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex gap-4">
                <div className="flex-1 aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={
                      product.images[selectedImageIndex] ||
                      "/placeholder-product.jpg"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? "border-primary shadow-md"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image || "/placeholder-product.jpg"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Pricing & Inventory
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">
                    Current Stock:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {product.stock}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">
                    Single Price:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{product.price.single}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">
                    Bulk Price:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{product.price.bulk}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">
                    Discount:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {product.discount.value}{" "}
                    {product.discount.type === "percentage" ? "%" : "₹"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">
                    Min Order Qty:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {product.minimumOrderQuantity || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">
                    Max Order Qty:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {product.maximumOrderQuantity || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">
                    Reviews:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {product.reviewsCount} ({product.totalRating}/5)
                  </span>
                </div>
              </div>
            </div>

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
  );
}
