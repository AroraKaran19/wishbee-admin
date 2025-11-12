"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  ArrowLeft,
  FileText,
  IndianRupee,
  Calendar,
  Upload,
  Package,
  Search,
  Plus,
  X,
  Layers,
  ShoppingCart,
  Save,
} from "lucide-react";
import { ComboProduct } from "@/lib/types";
import { comboApi, ComboFormData } from "@/lib/api/combos";
import { productApi } from "@/lib/api/products";
import { getPresignedUrl, deleteImage } from "@/lib/api/products";
import toast from "react-hot-toast";

export default function EditComboPage() {
  const params = useParams();
  const router = useRouter();
  const comboId = params.id as string;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ComboFormData>({
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      images: [],
      status: "ACTIVE",
      isOrganic: false,
      mrp: 0,
      productIds: [],
      stock: 0,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 100,
      alertExpiry: 7,
      expiry: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
      slug: "",
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [productsPagination, setProductsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
  });

  // Load combo data
  useEffect(() => {
    const loadCombo = async () => {
      try {
        setLoading(true);
        const response = await comboApi.getById(comboId);
        const combo = response.data;

        if (combo) {
          // Populate form with existing combo data
          setValue("name", combo.name || "");
          setValue("description", combo.description || "");
          setValue("images", combo.images || []);
          setValue("status", combo.status || "ACTIVE");
          setValue("isOrganic", combo.isOrganic || false);
          setValue("mrp", combo.mrp || 0);
          setValue("productIds", combo.productIds || []);
          setValue("stock", combo.stock || 0);
          setValue("minimumOrderQuantity", combo.minimumOrderQuantity || 1);
          setValue("maximumOrderQuantity", combo.maximumOrderQuantity || 100);
          setValue("alertExpiry", combo.alertExpiry || 7);
          setValue("expiry", combo.expiry ? new Date(combo.expiry).toISOString().split('T')[0] : "");
          setValue("metaTitle", combo.metaTitle || "");
          setValue("metaDescription", combo.metaDescription || "");
          setValue("metaKeywords", combo.metaKeywords || []);
          setValue("slug", combo.slug || "");

          // Set selected products if they exist
          if (combo.products && combo.products.length > 0) {
            setSelectedProducts(combo.products);
          }
        }
      } catch (error) {
        console.error("Error loading combo:", error);
        toast.error("Failed to load combo");
        router.push("/inventory");
      } finally {
        setLoading(false);
      }
    };

    if (comboId) {
      loadCombo();
    }
  }, [comboId, setValue, router]);

  // Load initial products for selection
  useEffect(() => {
    const loadInitialProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await productApi.getAll({
          page: 1,
          limit: 20,
          status: "ACTIVE",
        });
        const productsData = response.data?.products || response.data || response;
        if (Array.isArray(productsData)) {
          const uniqueProducts = productsData.filter(
            (product, index, self) =>
              index === self.findIndex((p) => p._id === product._id)
          );
          setAvailableProducts(uniqueProducts);
        }
        setProductsPagination({
          currentPage: 1,
          totalPages: response.data?.totalPages || 1,
          hasMore: (response.data?.totalPages || 1) > 1,
        });
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadInitialProducts();
  }, []);

  const loadMoreProducts = async () => {
    if (!productsPagination.hasMore || loadingProducts) return;

    try {
      setLoadingProducts(true);
      const nextPage = productsPagination.currentPage + 1;

      const response = await productApi.getAll({
        page: nextPage,
        limit: 20,
        status: "ACTIVE",
      });

      const productsData = response.data?.products || response.data || response;
      if (Array.isArray(productsData)) {
        setAvailableProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const newProducts = productsData.filter(
            (p) => !existingIds.has(p._id)
          );
          return [...prev, ...newProducts];
        });
      }

      setProductsPagination((prev) => ({
        currentPage: nextPage,
        totalPages: response.data?.totalPages || prev.totalPages,
        hasMore: nextPage < (response.data?.totalPages || prev.totalPages),
      }));
    } catch (error) {
      console.error("Error loading more products:", error);
      toast.error("Failed to load more products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const uniqueProducts = availableProducts.filter(
    (product, index, self) =>
      index === self.findIndex((p) => p._id === product._id)
  );

  const filteredProducts = uniqueProducts.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const isNotSelected = !selectedProducts.some(
      (selected) => selected._id === product._id
    );

    return matchesSearch && isNotSelected;
  });

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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await handleFileUpload(files[i]);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await handleFileUpload(files[i]);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      setUploadingImages(true);
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

      const fileExtension = file.name.split(".").pop();
      const fileName = `${fileId}.${fileExtension}`;
      const folder = `combos/images`;

      setUploadProgress((prev) => ({ ...prev, [fileId]: 25 }));
      const presignedData = await getPresignedUrl(fileName, file.type, folder);

      if (!presignedData || !presignedData.presignedUrl) {
        throw new Error("Failed to get presigned URL from server");
      }

      const { presignedUrl, imageUrl } = presignedData;

      setUploadProgress((prev) => ({ ...prev, [fileId]: 50 }));

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

      setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

      const currentImages = watch("images") || [];
      setValue("images", [...currentImages, imageUrl]);

      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 1000);

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );

      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = async (index: number) => {
    const currentImages = watch("images") || [];
    const imageToRemove = currentImages[index];

    try {
      const url = new URL(imageToRemove);
      const pathParts = url.pathname.split("/");
      const wishbeeIndex = pathParts.findIndex((part) => part === "wishbee");
      if (wishbeeIndex !== -1) {
        const s3Key = pathParts.slice(wishbeeIndex).join("/");
        await deleteImage(s3Key);
      }

      setValue(
        "images",
        currentImages.filter((_, i) => i !== index)
      );

      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image from server");

      setValue(
        "images",
        currentImages.filter((_, i) => i !== index)
      );
    }
  };

  const addProductToCombo = (product: any) => {
    if (!selectedProducts.find((p) => p._id === product._id)) {
      const newSelectedProducts = [...selectedProducts, product];
      setSelectedProducts(newSelectedProducts);
      setValue("productIds", newSelectedProducts.map((p) => p._id));
      setShowProductModal(false);
      setSearchTerm("");
    }
  };

  const removeProductFromCombo = (productId: string) => {
    const newSelectedProducts = selectedProducts.filter(
      (p) => p._id !== productId
    );
    setSelectedProducts(newSelectedProducts);
    setValue("productIds", newSelectedProducts.map((p) => p._id));
  };

  const validateFormData = (data: ComboFormData): string[] => {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push("Combo name is required");
    } else if (data.name.length > 200) {
      errors.push("Combo name must be less than 200 characters");
    }

    if (!data.description?.trim()) {
      errors.push("Description is required");
    } else if (data.description.length < 10) {
      errors.push("Description must be at least 10 characters");
    } else if (data.description.length > 2000) {
      errors.push("Description must be less than 2000 characters");
    }

    if (!data.images || data.images.length === 0) {
      errors.push("At least one image is required");
    }

    if (data.mrp === undefined || data.mrp === null) {
      errors.push("MRP is required");
    } else if (data.mrp <= 0) {
      errors.push("MRP must be greater than 0");
    }

    if (!data.productIds || data.productIds.length === 0) {
      errors.push("At least one product must be selected");
    }

    if (data.stock === undefined || data.stock === null) {
      errors.push("Stock quantity is required");
    } else if (data.stock < 0) {
      errors.push("Stock cannot be negative");
    }

    if (data.minimumOrderQuantity !== undefined && data.minimumOrderQuantity < 1) {
      errors.push("Minimum order quantity must be at least 1");
    }
    if (data.maximumOrderQuantity !== undefined && data.maximumOrderQuantity < 1) {
      errors.push("Maximum order quantity must be at least 1");
    }

    return errors;
  };

  const onSubmit = async (data: ComboFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      const validationErrors = validateFormData(data);
      if (validationErrors.length > 0) {
        setSubmitError(validationErrors.join(". "));
        return;
      }

      const comboData = {
        name: data.name.trim(),
        description: data.description.trim(),
        images: data.images,
        status: data.status,
        isOrganic: data.isOrganic,
        mrp: Number(data.mrp),
        productIds: data.productIds,
        stock: Number(data.stock),
      };

      const result = await comboApi.update({ _id: comboId, ...comboData });
      console.log("Combo updated successfully:", result);

      setSubmitSuccess(true);
      toast.success("Combo updated successfully!");

      setTimeout(() => {
        router.push(`/inventory/combo/${comboId}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating combo:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          <span className="ml-2 text-gray-600">Loading combo...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-gray-100 cursor-pointer rounded-md transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Edit Combo</h1>
          </div>
          <p className="text-gray-500 mt-1 text-sm">
            Update combo information and settings.
          </p>
        </div>

        <Card>
          <CardContent>
            <div className="grid gap-6 pb-10">
              {/* Error Message */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-red-700 text-sm font-medium">Error</p>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{submitError}</p>
                </div>
              )}

              {/* Success Message */}
              {submitSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-green-700 text-sm font-medium">Success</p>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    Combo updated successfully! Redirecting to combo details...
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Combo Name *
                      </label>
                      <Input
                        variant="muted"
                        icon={<FileText className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter combo name"
                        {...register("name", {
                          required: "Combo name is required",
                        })}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-muted text-sm"
                        {...register("status")}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                        <option value="DISCONTINUED">Discontinued</option>
                      </select>
                    </div>
                    {/* <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Description *{" "}
                        <span className="text-gray-500 text-xs">
                          (min 10 characters, max 2000)
                        </span>
                      </label>
                      <textarea
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none bg-muted text-sm ${
                          watch("description") &&
                          watch("description").length > 0 &&
                          (watch("description").length < 10 ||
                            watch("description").length > 2000)
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-gray-400"
                        }`}
                        placeholder="Enter combo description (minimum 10 characters, maximum 2000)"
                        {...register("description", {
                          required: "Description is required",
                        })}
                        rows={3}
                      />
                      <div className="flex justify-between items-center">
                        <div>
                          {errors.description && (
                            <p className="text-red-500 text-xs">
                              {errors.description.message}
                            </p>
                          )}
                          {watch("description") &&
                            watch("description").length > 0 &&
                            watch("description").length < 10 && (
                              <p className="text-red-500 text-xs">
                                Description must be at least 10 characters long
                              </p>
                            )}
                          {watch("description") &&
                            watch("description").length > 2000 && (
                              <p className="text-red-500 text-xs">
                                Description must be less than 2000 characters
                              </p>
                            )}
                        </div>
                        <span
                          className={`text-xs ${
                            watch("description") &&
                            watch("description").length > 0 &&
                            (watch("description").length < 10 ||
                              watch("description").length > 2000)
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          {watch("description")
                            ? `${watch("description").length} characters`
                            : "0 characters"}
                        </span>
                      </div>
                    </div> */}
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700">
                    Combo Images *
                  </label>

                  {/* Image Upload Area */}
                  <div
                    className={`flex items-center justify-center gap-12 rounded-xl border border-dashed border-gray-400 bg-white p-8 transition-colors ${
                      uploadingImages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer"
                    }`}
                    onDragOver={!uploadingImages ? handleDragOver : undefined}
                    onDragEnter={!uploadingImages ? handleDragEnter : undefined}
                    onDragLeave={!uploadingImages ? handleDragLeave : undefined}
                    onDrop={!uploadingImages ? handleDrop : undefined}
                    onClick={() =>
                      !uploadingImages &&
                      document.getElementById("combo-file-upload")?.click()
                    }
                  >
                    <div className="w-40 h-40 rounded-full bg-green-100 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                      <Layers
                        className="w-24 h-24 text-green-500"
                        strokeWidth={1.2}
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      {uploadingImages ? (
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-2 font-medium">
                            Uploading Images...
                          </p>
                          {Object.keys(uploadProgress).length > 0 && (
                            <div className="w-48 bg-gray-200 rounded-full h-1.5 mb-2">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    Object.values(uploadProgress).reduce(
                                      (acc, curr) => acc + curr,
                                      0
                                    ) / Object.keys(uploadProgress).length
                                  }%`,
                                }}
                              />
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {Object.keys(uploadProgress).length} file(s) uploading
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-400 mb-3 text-center font-medium">
                            Drag and Drop
                          </p>
                          <p className="text-xs text-gray-400 mb-3 text-center">
                            or
                          </p>
                          <Button
                            variant="secondary"
                            icon={<Upload className="w-4 h-4" />}
                          >
                            Upload Images
                          </Button>
                        </>
                      )}
                    </div>
                    <input
                      id="combo-file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      aria-label="Upload combo images"
                      multiple
                      disabled={uploadingImages}
                    />
                  </div>

                  {/* Image Preview Grid */}
                  {(watch("images") && watch("images").length > 0) ||
                  Object.keys(uploadProgress).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {watch("images") &&
                        watch("images").map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Combo image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                      {/* Upload Progress Items */}
                      {Object.entries(uploadProgress).map(
                        ([fileId, progress]) => (
                          <div key={fileId} className="relative group">
                            <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center p-2">
                              <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin mb-2" />
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 mt-1">
                                {progress}%
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Product Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Select Products *
                    </h3>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowProductModal(true)}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Add Products
                    </Button>
                  </div>

                  {selectedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedProducts.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
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
                          <button
                            type="button"
                            onClick={() => removeProductFromCombo(product._id)}
                            className="p-1 hover:bg-red-100 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No products selected</p>
                      <p className="text-sm">Click &quot;Add Products&quot; to select products for this combo</p>
                    </div>
                  )}
                </div>

                {/* Pricing Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Pricing Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        MRP (Maximum Retail Price) *
                      </label>
                      <Controller
                        name="mrp"
                        control={control}
                        rules={{
                          required: "MRP is required",
                          min: { value: 0, message: "MRP must be positive" },
                        }}
                        render={({ field }) => (
                          <Input
                            variant="muted"
                            icon={<IndianRupee className="w-4 h-4" />}
                            className="text-sm"
                            placeholder="Enter MRP"
                            type="number"
                            step="0.01"
                            value={field.value === 0 ? "" : field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || value === null || value === undefined) {
                                field.onChange("");
                              } else {
                                const numValue = parseFloat(value);
                                field.onChange(isNaN(numValue) ? "" : numValue);
                              }
                            }}
                          />
                        )}
                      />
                      {errors.mrp && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.mrp.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Stock Quantity *
                      </label>
                      <Input
                        variant="muted"
                        icon={<Package className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter stock quantity"
                        type="number"
                        {...register("stock", {
                          required: "Stock quantity is required",
                          min: {
                            value: 0,
                            message: "Stock must be non-negative",
                          },
                        })}
                      />
                      {errors.stock && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.stock.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Min Order Quantity
                      </label>
                      <Input
                        variant="muted"
                        icon={<Package className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter minimum order quantity"
                        type="number"
                        {...register("minimumOrderQuantity", {
                          min: {
                            value: 1,
                            message: "Minimum order quantity must be at least 1",
                          },
                        })}
                      />
                      {errors.minimumOrderQuantity && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.minimumOrderQuantity.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Max Order Quantity
                      </label>
                      <Input
                        variant="muted"
                        icon={<Package className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter maximum order quantity"
                        type="number"
                        {...register("maximumOrderQuantity", {
                          min: {
                            value: 1,
                            message: "Maximum order quantity must be at least 1",
                          },
                        })}
                      />
                      {errors.maximumOrderQuantity && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.maximumOrderQuantity.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register("isOrganic")}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Organic Combo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    icon={<Save className="w-4 h-4" />}
                  >
                    {isSubmitting ? "Updating Combo..." : "Update Combo"}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Product Selection Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Select Products for Combo
                  </h2>
                  {selectedProducts.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedProducts.length} product
                      {selectedProducts.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedProducts.length > 0 && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setShowProductModal(false);
                        setSearchTerm("");
                      }}
                    >
                      Done
                    </Button>
                  )}
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      setSearchTerm("");
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <Input
                  variant="muted"
                  icon={<Search className="w-4 h-4" />}
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div
                className="flex-1 overflow-y-auto"
                onScroll={(e) => {
                  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                  const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

                  if (isNearBottom && productsPagination.hasMore && !loadingProducts) {
                    loadMoreProducts();
                  }
                }}
              >
                {loadingProducts && availableProducts.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    <span className="ml-2 text-gray-600">
                      Loading products...
                    </span>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredProducts.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => addProductToCombo(product)}
                        >
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              SKU: {product.sku} | ₹{product.mrp}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {product.description}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={<Plus className="w-4 h-4" />}
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Load More Indicator */}
                    {productsPagination.hasMore && (
                      <div className="px-3 py-4 text-sm text-center border-t border-gray-100 mt-4">
                        {loadingProducts ? (
                          <div className="flex items-center justify-center gap-2 text-gray-500">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            Loading more products...
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            Scroll down to load more products
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No products found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
