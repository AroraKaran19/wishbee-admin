"use client";

import React, { useState, useEffect } from "react";
import { useSessionStore } from "@/stores/sessionStore";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, User, Mail, Lock, Save, Loader2, Image as ImageIcon, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { getPresignedUrl, deleteImage } from "@/lib/api/products";

export function ProfilePage() {
  const { admin, generateAccessToken } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    photo: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const token = await generateAccessToken();
        const profile = await authApi.getProfile(token);
        setProfileData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          photo: profile.photo || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    };

    if (admin) {
      fetchProfile();
    }
  }, [admin, generateAccessToken]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.firstName && !profileData.lastName && !profileData.photo) {
      toast.error("Please provide at least firstName and lastName, or photo");
      return;
    }

    try {
      setLoading(true);
      const token = await generateAccessToken();
      const updateData: any = {};
      if (profileData.firstName) updateData.firstName = profileData.firstName;
      if (profileData.lastName) updateData.lastName = profileData.lastName;
      if (profileData.photo) updateData.photo = profileData.photo;

      await authApi.updateProfile(token, updateData);
      toast.success("Profile updated successfully");
      
      // Update session store with new admin data
      const updatedProfile = await authApi.getProfile(token);
      useSessionStore.setState({ admin: updatedProfile });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await authApi.changePassword(
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Image upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadingPhoto) {
      setIsDragging(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadingPhoto) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (uploadingPhoto) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
      // Reset the input value to allow selecting the same file again
      e.target.value = "";
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    try {
      setUploadingPhoto(true);

      // Generate file name
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileExtension = file.name.split(".").pop();
      const fileName = `${fileId}.${fileExtension}`;
      const folder = `profiles/images`;

      // Get presigned URL from backend
      const presignedData = await getPresignedUrl(fileName, file.type, folder);

      if (!presignedData || !presignedData.presignedUrl) {
        throw new Error("Failed to get presigned URL from server");
      }

      const { presignedUrl, imageUrl } = presignedData;

      // Upload file to S3 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to S3");
      }

      // Delete old photo if exists
      if (profileData.photo) {
        try {
          const url = new URL(profileData.photo);
          const pathParts = url.pathname.split("/");
          const wishbeeIndex = pathParts.findIndex((part) => part === "wishbee");
          if (wishbeeIndex !== -1) {
            const s3Key = pathParts.slice(wishbeeIndex).join("/");
            await deleteImage(s3Key);
          }
        } catch (error) {
          console.error("Error deleting old photo:", error);
          // Continue even if deletion fails
        }
      }

      // Update profile data with new photo URL
      setProfileData({ ...profileData, photo: imageUrl });
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload photo"
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = async () => {
    if (!profileData.photo) return;

    try {
      // Delete from S3
      const url = new URL(profileData.photo);
      const pathParts = url.pathname.split("/");
      const wishbeeIndex = pathParts.findIndex((part) => part === "wishbee");
      if (wishbeeIndex !== -1) {
        const s3Key = pathParts.slice(wishbeeIndex).join("/");
        await deleteImage(s3Key);
      }

      // Update profile data
      setProfileData({ ...profileData, photo: "" });
      toast.success("Photo removed successfully!");
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error("Failed to remove photo from server");
      // Still remove from UI even if deletion fails
      setProfileData({ ...profileData, photo: "" });
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your profile information and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-700" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black z-10" />
                  <Input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                {/* Image Upload Area */}
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
                    document.getElementById("profile-photo-upload")?.click()
                  }
                >
                  {profileData.photo ? (
                    <div className="relative group">
                      <Image
                        src={profileData.photo}
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
                    id="profile-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    aria-label="Upload profile photo"
                    disabled={uploadingPhoto}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                icon={loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
                className="w-full"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-700" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black z-10" />
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword || ""}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black z-10" />
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword || ""}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                icon={loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Lock className="w-4 h-4 text-white" />}
                className="w-full"
              >
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

