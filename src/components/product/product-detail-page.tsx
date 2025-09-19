'use client';

import React, { useState } from 'react';
import { ProductDetail } from '@/lib/types';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProductDetailPageProps {
  product: ProductDetail;
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    console.log('Edit product:', product);
  };

  const handleDelete = () => {
    console.log('Delete product:', product);
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
          <span className="text-lg font-medium">{product.productName}</span>
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
                      <label className="text-sm font-medium text-gray-600 w-32">Product name:</label>
                      <p className="text-gray-900 font-medium">{product.productName}</p>
                    </div>
                    
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">Product description:</label>
                      <p className="text-gray-900 text-sm leading-relaxed flex-1">{product.productDescription}</p>
                    </div>
                    
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">Product ID:</label>
                      <p className="text-gray-900 font-medium">{product.productId}</p>
                    </div>
                    
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">Buying price:</label>
                      <p className="text-gray-900 font-medium">₹{product.buyingPrice}</p>
                    </div>
                    
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">Product category:</label>
                      <p className="text-gray-900 font-medium">{product.productCategory}</p>
                    </div>
                    
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">Expiry date:</label>
                      <p className="text-gray-900 font-medium">{product.expiryDate}</p>
                    </div>
                    
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">Quantity:</label>
                      <p className="text-gray-900 font-medium">{product.quantity}</p>
                    </div>
                    
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">Threshold value:</label>
                      <p className="text-gray-900 font-medium">{product.thresholdValue}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200">
                <div className="px-6 py-3">
                  <div className="py-2 px-4 rounded-lg text-sm font-medium bg-gray-300 inline-block text-gray-600">
                    Supplier Detail
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">Supplier name:</label>
                      <p className="text-gray-900 font-medium">{product.supplier.name}</p>
                    </div>
                    <div className="flex items-center gap-10">
                      <label className="text-sm font-medium text-gray-600 w-32">Contact Number:</label>
                      <p className="text-gray-900 font-medium">{product.supplier.contactNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200">
              <div className="px-6 py-3 border-gray-200">
                  <div className="py-2 px-4 rounded-lg text-sm font-medium bg-gray-300 inline-block text-gray-600">
                    Stock Location
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-10">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-600 mb-3 block">Store name:</label>
                      <div className="space-y-2">
                        {product.stockLocations.map((location, index) => (
                          <p key={index} className="text-gray-900 font-medium">{location.storeName}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-600 mb-3 block">Stock in hand:</label>
                      <div className="space-y-2">
                        {product.stockLocations.map((location, index) => (
                          <p key={index} className="text-gray-900 font-medium">{location.stockInHand}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex gap-4">
                <div className="flex-1 aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={product.images[selectedImageIndex] || '/placeholder-product.jpg'}
                    alt={product.productName}
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
                          ? 'border-primary shadow-md'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image || '/placeholder-product.jpg'}
                        alt={`${product.productName} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">Opening stock:</span>
                  <span className="text-sm font-semibold text-gray-900">{product.stockOverview.openingStock}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">Remaining stock:</span>
                  <span className="text-sm font-semibold text-gray-900">{product.stockOverview.remainingStock}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">On the way:</span>
                  <span className="text-sm font-semibold text-gray-900">{product.stockOverview.onTheWay}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">Threshold value:</span>
                  <span className="text-sm font-semibold text-gray-900">{product.stockOverview.thresholdValue}</span>
                </div>
              </div>
            </div>
                  
            <div className="flex space-x-4">
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
