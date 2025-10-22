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
    router.push(`/inventory/product/${product._id}/edit`);
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
                        MRP:
                      </label>
                      <p className="text-gray-900 font-medium">
                        ₹{product.mrp}
                      </p>
                    </div>

                    {product.pricing_range &&
                      product.pricing_range.length > 0 && (
                        <div className="flex items-center gap-10">
                          <label className="text-sm font-medium text-gray-600 w-32">
                            Pricing Range:
                          </label>
                          <div className="flex-1">
                            {product.pricing_range.map((range, index) => (
                              <div
                                key={index}
                                className="text-sm text-gray-900"
                              >
                                {range.quantity_start}-{range.quantity_end}{" "}
                                units: ₹{range.price}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
                        B2B Product:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.isB2B ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Deal of the Day:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.dotd ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Pay for You:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.pfy ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">
                        Weight:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {product.weight.value} {product.weight.unit}
                      </p>
                    </div>

                    {product.expiry && (
                      <div className="flex items-center gap-10">
                        <label className="text-sm font-medium text-gray-600 w-32">
                          Expiry Date:
                        </label>
                        <p className="text-gray-900 font-medium">
                          {new Date(product.expiry).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {product.alertExpiry && (
                      <div className="flex items-center gap-10">
                        <label className="text-sm font-medium text-gray-600 w-32">
                          Alert Expiry:
                        </label>
                        <p className="text-gray-900 font-medium">
                          {product.alertExpiry} days before expiry
                        </p>
                      </div>
                    )}

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
                    <div className="space-y-2">
                      {product.highlights.map((highlight, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                        >
                          <span className="text-sm font-medium text-blue-900">
                            {highlight.key}:
                          </span>
                          <span className="text-sm text-blue-800">
                            {highlight.value}
                          </span>
                        </div>
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
                    MRP:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{product.mrp}
                  </span>
                </div>
                {product.pricing_range && product.pricing_range.length > 0 && (
                  <div className="py-2">
                    <span className="text-sm font-medium text-gray-600 block mb-2">
                      Pricing Range:
                    </span>
                    <div className="space-y-1">
                      {product.pricing_range.map((range, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {range.quantity_start}-{range.quantity_end} units:
                          </span>
                          <span className="font-semibold text-gray-900">
                            ₹{range.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {product.discount && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Discount:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {product.discount.value}{" "}
                      {product.discount.type === "percentage" ? "%" : "₹"}
                    </span>
                  </div>
                )}
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
