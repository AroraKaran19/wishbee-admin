'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, ArrowLeft, ScanBarcode, FileText, DollarSign, Calendar, Upload } from 'lucide-react';

export default function InventoryAddProductPage() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const router = useRouter();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileUpload = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <button 
                            onClick={() => router.push('/inventory')}
                            className="p-1 hover:bg-gray-100 cursor-pointer rounded-md transition-colors"
                            aria-label="Go back to dashboard"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">Add Product</h1>
                    </div>
                    <p className="text-gray-500 mt-1 text-sm">Add new items to your inventory with complete details.</p>
                </div>

                <Card>
                    <CardContent>
                        <div className="grid gap-6 pb-10">
                            <div className="flex items-center justify-center">
                                <div className="w-full">
                                    <div className="flex items-center justify-center">
                                        <div className="w-full max-w-xl">
                                            <div
                                                className="flex items-center justify-center gap-12 rounded-xl border border-dashed border-gray-400 bg-white p-8 hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer"
                                                onDragOver={handleDragOver}
                                                onDragEnter={handleDragEnter}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                onClick={() => document.getElementById('file-upload')?.click()}
                                            >
                                                <div className="w-40 h-40 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                                                    {uploadedImage ? (
                                                        <>
                                                            <Image
                                                                src={uploadedImage}
                                                                alt="Uploaded product"
                                                                width={160}
                                                                height={160}
                                                                className="w-full h-full object-cover rounded-full"
                                                            />
                                                        </>
                                                    ) : (
                                                        <ImageIcon className="w-24 h-24 text-sky-500" strokeWidth={1.2} />
                                                    )}
                                                </div>
                                                <div className='flex flex-col items-center justify-center'>
                                                    {uploadedImage ? (
                                                        <>
                                                            <p className="text-sm text-green-600 mb-3 text-center font-medium">Image Uploaded!</p>
                                                            <p className="text-xs text-gray-400 mb-3 text-center">Click to change</p>
                                                            <Button variant="secondary" icon={<Upload className="w-4 h-4" />}>Change Image</Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm text-gray-400 mb-3 text-center font-medium">Drag and Drop</p>
                                                            <p className="text-xs text-gray-400 mb-3 text-center">or</p>
                                                            <Button variant="secondary" icon={<Upload className="w-4 h-4" />}>Upload Image</Button>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileInput}
                                                    className="hidden"
                                                    aria-label="Upload product image"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Product Name</label>
                                    <Input variant='muted' icon={<FileText className="w-4 h-4" />} className='text-sm' placeholder="Enter product name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Product ID</label>
                                    <Input variant='muted' icon={<ScanBarcode className="w-4 h-4" />} className='text-sm' placeholder="Enter product ID" />
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <label className="text-sm font-medium text-gray-700">Product Description</label>
                                    <Input variant='muted' icon={<FileText className="w-4 h-4" />} className='text-sm' placeholder="Enter product Description" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Buying price</label>
                                    <Input variant='muted' icon={<DollarSign className="w-4 h-4" />} className='text-sm' placeholder="Enter buying price" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Product category</label>
                                    <div className="relative">
                                        <Input variant='muted' icon={<FileText className="w-4 h-4" />} className='text-sm' placeholder="Select product category" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Expiry date</label>
                                    <Input variant='muted' icon={<Calendar className="w-4 h-4" />} className='text-sm' placeholder="Enter Product expiry date" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                                    <Input variant='muted' icon={<DollarSign className="w-4 h-4" />} className='text-sm' placeholder="Enter product quantity" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Threshold Value</label>
                                    <Input variant='muted' icon={<DollarSign className="w-4 h-4" />} className='text-sm' placeholder="Enter threshold value" />
                                </div>
                            </div>

                            <div>
                                <Button variant="primary">Add Products</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}


