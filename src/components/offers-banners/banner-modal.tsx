'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { bannerApi, Banner, CreateBannerData, UpdateBannerData } from '@/lib/api/banners';
import { getPresignedUrl } from '@/lib/api/products';
import toast from 'react-hot-toast';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: Banner | null;
  onSave: () => void;
}

export function BannerModal({ isOpen, onClose, banner, onSave }: BannerModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    imageUrl: '',
    type: 'offers' as 'hero' | 'offers',
    order: 0,
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Initialize form data when modal opens or banner changes
  useEffect(() => {
    if (isOpen) {
      if (banner) {
        // Edit mode
        setFormData({
          title: banner.title || '',
          link: banner.link || '',
          imageUrl: banner.imageUrl || '',
          type: banner.type || 'offers',
          order: banner.order,
          isActive: banner.isActive,
        });
        setPreviewUrl(banner.imageUrl || null);
      } else {
        // Add mode
        setFormData({
          title: '',
          link: '',
          imageUrl: '',
          type: 'offers' as 'hero' | 'offers',
          order: 0,
          isActive: true,
        });
        setPreviewUrl(null);
      }
    }
  }, [isOpen, banner]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileExtension = file.name.split('.').pop();
      const fileName = `${fileId}.${fileExtension}`;
      const folder = 'banners/images';

      setUploadProgress(25);
      const presignedData = await getPresignedUrl(fileName, file.type, folder);

      if (!presignedData || !presignedData.presignedUrl) {
        throw new Error('Failed to get presigned URL from server');
      }

      const { presignedUrl, imageUrl } = presignedData;

      setUploadProgress(50);

      // Upload file to S3 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to S3');
      }

      setUploadProgress(100);
      setFormData((prev) => ({ ...prev, imageUrl }));
      setPreviewUrl(imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleImageUpload(files[0]);
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleImageUpload(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      toast.error('Please upload a banner image');
      return;
    }

    try {
      setIsSaving(true);

      if (banner) {
        // Update existing banner
        const updateData: UpdateBannerData = {
          imageUrl: formData.imageUrl,
          type: formData.type,
          title: formData.title || undefined,
          link: formData.link || undefined,
          order: formData.order,
          isActive: formData.isActive,
        };
        await bannerApi.update(banner._id, updateData);
        toast.success('Banner updated successfully');
      } else {
        // Create new banner
        const createData: CreateBannerData = {
          imageUrl: formData.imageUrl,
          type: formData.type,
          title: formData.title || undefined,
          link: formData.link || undefined,
          order: formData.order || undefined,
          isActive: formData.isActive,
        };
        await bannerApi.create(createData);
        toast.success('Banner created successfully');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving && !isUploading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {banner ? 'Edit Banner' : 'Add New Banner'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSaving || isUploading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image <span className="text-red-500">*</span>
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isUploading
                  ? 'border-blue-400 bg-blue-50'
                  : previewUrl
                  ? 'border-gray-300'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Banner preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Uploading... {uploadProgress}%</p>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setFormData((prev) => ({ ...prev, imageUrl: '' }));
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                    disabled={isUploading}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div>
                  {isUploading ? (
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag and drop an image here, or click to select
                      </p>
                      <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
                        <Upload className="h-4 w-4 mr-2" />
                        Select Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInput}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'hero' | 'offers' })}
              disabled={isSaving || isUploading || !!banner}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="hero">Hero Banner</option>
              <option value="offers">Offers Banner</option>
            </select>
            {banner && (
              <p className="mt-1 text-xs text-gray-500">
                Banner type cannot be changed after creation.
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isSaving || isUploading}
              placeholder="Enter banner title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link (Optional)
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              disabled={isSaving || isUploading}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              min="0"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              disabled={isSaving || isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lower numbers appear first. Leave as 0 to add at the end.
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={isSaving || isUploading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active (Banner will be visible on the home page)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving || isUploading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading || !formData.imageUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {banner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

