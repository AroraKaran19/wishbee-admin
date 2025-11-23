"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALL_PERMISSIONS } from "@/lib/constants/permissions";
import { customerApi } from "@/lib/api/customers";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
// import Image from "next/image";
// import { getPresignedUrl, deleteImage } from "@/lib/api/products";

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAdminModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAdminModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    photo: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
    permissions: [] as string[],
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [uploadingPhoto, setUploadingPhoto] = useState(false);
  // const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...submitData } = formData;
      await customerApi.createAdmin(submitData);
      toast.success("Admin created successfully");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      photo: "",
      gender: "MALE",
      permissions: [],
      isActive: true,
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const toggleAllPermissions = () => {
    if (formData.permissions.length === ALL_PERMISSIONS.length) {
      setFormData((prev) => ({ ...prev, permissions: [] }));
    } else {
      setFormData((prev) => ({ ...prev, permissions: [...ALL_PERMISSIONS] }));
    }
  };

  // Image upload handlers - COMMENTED OUT
  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   if (!uploadingPhoto) {
  //     setIsDragging(true);
  //   }
  // };

  // const handleDragEnter = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   if (!uploadingPhoto) {
  //     setIsDragging(true);
  //   }
  // };

  // const handleDragLeave = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setIsDragging(false);
  // };

  // const handleDrop = async (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setIsDragging(false);

  //   if (uploadingPhoto) return;

  //   const files = e.dataTransfer.files;
  //   if (files && files.length > 0) {
  //     await handleFileUpload(files[0]);
  //   }
  // };

  // const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (files && files.length > 0) {
  //     await handleFileUpload(files[0]);
  //     // Reset the input value to allow selecting the same file again
  //     e.target.value = "";
  //   }
  // };

  // const handleFileUpload = async (file: File) => {
  //   if (!file.type.startsWith("image/")) {
  //     toast.error("Please select a valid image file");
  //     return;
  //   }

  //   try {
  //     setUploadingPhoto(true);

  //     // Generate file name
  //     const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  //     const fileExtension = file.name.split(".").pop();
  //     const fileName = `${fileId}.${fileExtension}`;
  //     const folder = `profiles/images`;

  //     // Get presigned URL from backend
  //     const presignedData = await getPresignedUrl(fileName, file.type, folder);

  //     if (!presignedData || !presignedData.presignedUrl) {
  //       throw new Error("Failed to get presigned URL from server");
  //     }

  //     const { presignedUrl, imageUrl } = presignedData;

  //     // Upload file to S3 using presigned URL
  //     const uploadResponse = await fetch(presignedUrl, {
  //       method: "PUT",
  //       body: file,
  //       headers: {
  //         "Content-Type": file.type,
  //       },
  //     });

  //     if (!uploadResponse.ok) {
  //       throw new Error("Failed to upload image to S3");
  //     }

  //     // Delete old photo if exists
  //     if (formData.photo) {
  //       try {
  //         const url = new URL(formData.photo);
  //         const pathParts = url.pathname.split("/");
  //         const wishbeeIndex = pathParts.findIndex((part) => part === "wishbee");
  //         if (wishbeeIndex !== -1) {
  //           const s3Key = pathParts.slice(wishbeeIndex).join("/");
  //           await deleteImage(s3Key);
  //         }
  //       } catch (error) {
  //         console.error("Error deleting old photo:", error);
  //         // Continue even if deletion fails
  //       }
  //     }

  //     // Update form data with new photo URL
  //     setFormData({ ...formData, photo: imageUrl });
  //     toast.success("Photo uploaded successfully!");
  //   } catch (error) {
  //     console.error("Error uploading photo:", error);
  //     toast.error(
  //       error instanceof Error ? error.message : "Failed to upload photo"
  //     );
  //   } finally {
  //     setUploadingPhoto(false);
  //   }
  // };

  // const removePhoto = async () => {
  //   if (!formData.photo) return;

  //   try {
  //     // Delete from S3
  //     const url = new URL(formData.photo);
  //     const pathParts = url.pathname.split("/");
  //     const wishbeeIndex = pathParts.findIndex((part) => part === "wishbee");
  //     if (wishbeeIndex !== -1) {
  //       const s3Key = pathParts.slice(wishbeeIndex).join("/");
  //       await deleteImage(s3Key);
  //     }

  //     // Update form data
  //     setFormData({ ...formData, photo: "" });
  //     toast.success("Photo removed successfully!");
  //   } catch (error) {
  //     console.error("Error removing photo:", error);
  //     toast.error("Failed to remove photo from server");
  //     // Still remove from UI even if deletion fails
  //     setFormData({ ...formData, photo: "" });
  //   }
  // };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Admin">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value as "MALE" | "FEMALE" | "OTHER",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Profile Photo Section - COMMENTED OUT */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
          </label>
          <div
            className={`flex items-center justify-center gap-4 rounded-xl border border-dashed ${
              isDragging ? "border-blue-400 bg-blue-50/30" : "border-gray-400"
            } bg-white p-6 transition-colors ${
              uploadingPhoto
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer"
            }`}
            onDragOver={!uploadingPhoto ? handleDragOver : undefined}
            onDragEnter={!uploadingPhoto ? handleDragEnter : undefined}
            onDragLeave={!uploadingPhoto ? handleDragLeave : undefined}
            onDrop={!uploadingPhoto ? handleDrop : undefined}
            onClick={() =>
              !uploadingPhoto &&
              document.getElementById("admin-photo-upload")?.click()
            }
          >
            {formData.photo ? (
              <div className="relative group">
                <Image
                  src={formData.photo}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  loading="lazy"
                  unoptimized
                  quality={100}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto();
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                {uploadingPhoto ? (
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      Uploading...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-2">
                      <ImageIcon
                        className="w-8 h-8 text-sky-500"
                        strokeWidth={1.2}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mb-1 font-medium">
                      Upload Photo
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      Click to select or drag & drop
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              id="admin-photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              aria-label="Upload profile photo"
              disabled={uploadingPhoto}
            />
          </div>
        </div> */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter password (min 6 characters)"
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm password"
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Permissions
            </label>
            <button
              type="button"
              onClick={toggleAllPermissions}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {formData.permissions.length === ALL_PERMISSIONS.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {ALL_PERMISSIONS.map((permission) => (
              <label
                key={permission}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={formData.permissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{permission}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Active Account
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            icon={
              loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )
            }
          >
            {loading ? "Creating..." : "Create Admin"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

