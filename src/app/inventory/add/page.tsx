"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  ArrowLeft,
  ScanBarcode,
  FileText,
  DollarSign,
  Calendar,
  Upload,
  Package,
  Weight,
  Tag,
  Search,
  Plus,
  X,
} from "lucide-react";
import { Product } from "@/lib/types/product";

type ProductFormData = Omit<
  Product,
  "_id" | "createdAt" | "updatedAt" | "reviews" | "categoryId" | "subCategory"
> & {
  categoryId: string;
  subCategory: string;
  highlights: string[];
  metaKeywords: string[];
  collection: {
    quantity: number;
    price: number;
    unit?: string;
  }[];
};

export default function InventoryAddProductPage() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    mode: "onChange",
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      highlights: [],
      images: [],
      status: "ACTIVE",
      isOrganic: false,
      price: {
        single: 0,
        bulk: 0,
      },
      discount: {
        type: "percentage",
        value: 0,
      },
      stock: 0,
      weight: {
        single: {
          value: 0,
          unit: "kg",
        },
        bulk: {
          value: 0,
          unit: "kg",
        },
      },
      reviewsCount: 0,
      totalRating: 0,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 100,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
      slug: "",
      categoryId: "",
      subCategory: "",
      collection: [],
    },
  });

  const highlights = watch("highlights") || [];
  const metaKeywords = watch("metaKeywords") || [];
  const collections = watch("collection") || [];

  const [highlightInput, setHighlightInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [newCollection, setNewCollection] = useState({
    quantity: 0,
    price: 0,
    unit: "",
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const currentImages = watch("images") || [];
        setValue("images", [...currentImages, imageUrl]);
      };
      reader.readAsDataURL(file);
    }
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setValue("highlights", [...highlights, highlightInput.trim()]);
      setHighlightInput("");
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setValue("metaKeywords", [...metaKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeHighlight = (index: number) => {
    setValue(
      "highlights",
      highlights.filter((_, i) => i !== index)
    );
  };

  const removeKeyword = (index: number) => {
    setValue(
      "metaKeywords",
      metaKeywords.filter((_, i) => i !== index)
    );
  };

  const addCollection = () => {
    if (newCollection.quantity > 0 && newCollection.price > 0) {
      setValue("collection", [...collections, { ...newCollection }]);
      setNewCollection({ quantity: 0, price: 0, unit: "" });
    }
  };

  const removeCollection = (index: number) => {
    setValue(
      "collection",
      collections.filter((_, i) => i !== index)
    );
  };

  const updateCollection = (index: number, field: string, value: any) => {
    const updatedCollections = [...collections];
    updatedCollections[index] = {
      ...updatedCollections[index],
      [field]: value,
    };
    setValue("collection", updatedCollections);
  };

  const removeImage = (index: number) => {
    const currentImages = watch("images") || [];
    setValue(
      "images",
      currentImages.filter((_, i) => i !== index)
    );
  };

  const validateFormData = (data: ProductFormData): string[] => {
    const errors: string[] = [];

    // Required field validations
    if (!data.sku?.trim()) errors.push("SKU is required");
    if (!data.name?.trim()) errors.push("Product name is required");
    if (!data.description?.trim()) errors.push("Description is required");
    if (!data.categoryId?.trim()) errors.push("Category is required");
    if (!data.subCategory?.trim()) errors.push("Sub-category is required");
    if (data.images.length === 0)
      errors.push("At least one product image is required");

    // Price validations
    if (data.price.single <= 0)
      errors.push("Single price must be greater than 0");
    if (data.price.bulk <= 0) errors.push("Bulk price must be greater than 0");
    if (data.price.bulk >= data.price.single) {
      errors.push("Bulk price should be less than single price");
    }

    // Stock validation
    if (data.stock < 0) errors.push("Stock quantity cannot be negative");

    // Weight validations
    if (data.weight.single.value <= 0)
      errors.push("Single weight must be greater than 0");
    if (data.weight.bulk.value <= 0)
      errors.push("Bulk weight must be greater than 0");
    if (!data.weight.single.unit?.trim())
      errors.push("Single weight unit is required");
    if (!data.weight.bulk.unit?.trim())
      errors.push("Bulk weight unit is required");

    // Order quantity validations
    if (data.minimumOrderQuantity && data.minimumOrderQuantity < 1) {
      errors.push("Minimum order quantity must be at least 1");
    }
    if (data.maximumOrderQuantity && data.maximumOrderQuantity < 1) {
      errors.push("Maximum order quantity must be at least 1");
    }
    if (
      data.minimumOrderQuantity &&
      data.maximumOrderQuantity &&
      data.minimumOrderQuantity > data.maximumOrderQuantity
    ) {
      errors.push(
        "Minimum order quantity cannot be greater than maximum order quantity"
      );
    }

    // Collection validations
    if (data.collection && data.collection.length > 0) {
      data.collection.forEach((item, index) => {
        if (item.quantity <= 0) {
          errors.push(
            `Collection item ${index + 1}: Quantity must be greater than 0`
          );
        }
        if (item.price <= 0) {
          errors.push(
            `Collection item ${index + 1}: Price must be greater than 0`
          );
        }
      });
    }

    return errors;
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      // Frontend validation
      const validationErrors = validateFormData(data);
      if (validationErrors.length > 0) {
        setSubmitError(validationErrors.join(". "));
        return;
      }

      // Prepare data for backend
      const productData = {
        sku: data.sku.trim(),
        name: data.name.trim(),
        description: data.description.trim(),
        highlights: data.highlights,
        categoryId: data.categoryId,
        subCategory: data.subCategory,
        images: data.images,
        status: data.status,
        isOrganic: data.isOrganic,
        price: {
          single: data.price.single,
          bulk: data.price.bulk,
        },
        discount: {
          type: data.discount.type,
          value: data.discount.value,
        },
        stock: data.stock,
        weight: {
          single: {
            value: data.weight.single.value,
            unit: data.weight.single.unit,
          },
          bulk: {
            value: data.weight.bulk.value,
            unit: data.weight.bulk.unit,
          },
        },
        minimumOrderQuantity: data.minimumOrderQuantity || 1,
        maximumOrderQuantity: data.maximumOrderQuantity || 100,
        collection:
          data.collection && data.collection.length > 0
            ? data.collection
            : undefined,
        metaTitle: data.metaTitle?.trim() || undefined,
        metaDescription: data.metaDescription?.trim() || undefined,
        metaKeywords:
          data.metaKeywords.length > 0 ? data.metaKeywords : undefined,
        slug: data.slug?.trim() || undefined,
        reviewsCount: 0,
        totalRating: 0,
      };

      // Submit to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/product`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Product created successfully:", result);

      setSubmitSuccess(true);

      // Redirect to inventory page after successful submission
      setTimeout(() => {
        router.push("/inventory");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.push("/inventory")}
              className="p-1 hover:bg-gray-100 cursor-pointer rounded-md transition-colors"
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Add Product</h1>
          </div>
          <p className="text-gray-500 mt-1 text-sm">
            Add new items to your inventory with complete details.
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
                    <p className="text-green-700 text-sm font-medium">
                      Success
                    </p>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    Product added successfully! Redirecting to inventory page...
                  </p>
                </div>
              )}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  Product Images
                </label>

                {/* Image Upload Area */}
                <div
                  className="flex items-center justify-center gap-12 rounded-xl border border-dashed border-gray-400 bg-white p-8 hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <div className="w-40 h-40 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                    <ImageIcon
                      className="w-24 h-24 text-sky-500"
                      strokeWidth={1.2}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm text-gray-400 mb-3 text-center font-medium">
                      Drag and Drop
                    </p>
                    <p className="text-xs text-gray-400 mb-3 text-center">or</p>
                    <Button
                      variant="secondary"
                      icon={<Upload className="w-4 h-4" />}
                    >
                      Upload Images
                    </Button>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    aria-label="Upload product images"
                    multiple
                  />
                </div>

                {/* Image Preview Grid */}
                {watch("images") && watch("images").length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {watch("images").map((image, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={image}
                          alt={`Product image ${index + 1}`}
                          width={120}
                          height={120}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Product Name *
                      </label>
                      <Input
                        variant="muted"
                        icon={<FileText className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter product name"
                        {...register("name", {
                          required: "Product name is required",
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
                        SKU *
                      </label>
                      <Input
                        variant="muted"
                        icon={<ScanBarcode className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter product SKU"
                        {...register("sku", { required: "SKU is required" })}
                      />
                      {errors.sku && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.sku.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Category *
                      </label>
                      <Input
                        variant="muted"
                        icon={<Tag className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter category ID"
                        {...register("categoryId", {
                          required: "Category is required",
                        })}
                      />
                      {errors.categoryId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.categoryId.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Sub-category *
                      </label>
                      <Input
                        variant="muted"
                        icon={<Tag className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter sub-category ID"
                        {...register("subCategory", {
                          required: "Sub-category is required",
                        })}
                      />
                      {errors.subCategory && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.subCategory.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Description *
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-muted text-sm"
                        placeholder="Enter product description"
                        {...register("description", {
                          required: "Description is required",
                        })}
                        rows={3}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Highlights
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            variant="muted"
                            placeholder="Add a highlight"
                            value={highlightInput}
                            onChange={(e) => setHighlightInput(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addHighlight())
                            }
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={addHighlight}
                            icon={<Plus className="w-4 h-4" />}
                          >
                            Add
                          </Button>
                        </div>
                        {highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {highlights.map((highlight, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {highlight}
                                <button
                                  type="button"
                                  onClick={() => removeHighlight(index)}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Pricing Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Single Price *
                      </label>
                      <Controller
                        name="price.single"
                        control={control}
                        rules={{
                          required: "Single price is required",
                          min: { value: 0, message: "Price must be positive" },
                        }}
                        render={({ field }) => (
                          <Input
                            variant="muted"
                            icon={<DollarSign className="w-4 h-4" />}
                            className="text-sm"
                            placeholder="Enter single price"
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        )}
                      />
                      {errors.price?.single && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.price.single.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Bulk Price *
                      </label>
                      <Controller
                        name="price.bulk"
                        control={control}
                        rules={{
                          required: "Bulk price is required",
                          min: { value: 0, message: "Price must be positive" },
                        }}
                        render={({ field }) => (
                          <Input
                            variant="muted"
                            icon={<DollarSign className="w-4 h-4" />}
                            className="text-sm"
                            placeholder="Enter bulk price"
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        )}
                      />
                      {errors.price?.bulk && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.price.bulk.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Discount Type
                      </label>
                      <Controller
                        name="discount.type"
                        control={control}
                        render={({ field }) => (
                          <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-muted text-sm"
                            {...field}
                          >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Discount Value
                      </label>
                      <Controller
                        name="discount.value"
                        control={control}
                        rules={{
                          min: {
                            value: 0,
                            message: "Discount value must be positive",
                          },
                        }}
                        render={({ field }) => (
                          <Input
                            variant="muted"
                            icon={<Tag className="w-4 h-4" />}
                            className="text-sm"
                            placeholder="Enter discount value"
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        )}
                      />
                      {errors.discount?.value && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.discount.value.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inventory Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Inventory Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            message:
                              "Minimum order quantity must be at least 1",
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
                            message:
                              "Maximum order quantity must be at least 1",
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
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register("isOrganic")}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Organic Product
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Weight Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Weight Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Single Weight
                      </label>
                      <div className="flex gap-2">
                        <Controller
                          name="weight.single.value"
                          control={control}
                          rules={{
                            min: {
                              value: 0,
                              message: "Weight must be positive",
                            },
                          }}
                          render={({ field }) => (
                            <Input
                              variant="muted"
                              icon={<Weight className="w-4 h-4" />}
                              className="text-sm"
                              placeholder="Enter weight value"
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          )}
                        />
                        <Controller
                          name="weight.single.unit"
                          control={control}
                          render={({ field }) => (
                            <select
                              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-muted text-sm"
                              {...field}
                            >
                              <option value="kg">kg</option>
                              <option value="g">g</option>
                              <option value="lb">lb</option>
                              <option value="oz">oz</option>
                            </select>
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Bulk Weight
                      </label>
                      <div className="flex gap-2">
                        <Controller
                          name="weight.bulk.value"
                          control={control}
                          rules={{
                            min: {
                              value: 0,
                              message: "Weight must be positive",
                            },
                          }}
                          render={({ field }) => (
                            <Input
                              variant="muted"
                              icon={<Weight className="w-4 h-4" />}
                              className="text-sm"
                              placeholder="Enter bulk weight value"
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          )}
                        />
                        <Controller
                          name="weight.bulk.unit"
                          control={control}
                          render={({ field }) => (
                            <select
                              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-muted text-sm"
                              {...field}
                            >
                              <option value="kg">kg</option>
                              <option value="g">g</option>
                              <option value="lb">lb</option>
                              <option value="oz">oz</option>
                            </select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collection Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Collection Information
                  </h3>
                  <p className="text-sm text-gray-500">
                    Add different collection options for this product (e.g.,
                    5kg, 2 packets, etc.)
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <Input
                          variant="muted"
                          icon={<Package className="w-4 h-4" />}
                          className="text-sm"
                          placeholder="Enter quantity"
                          type="number"
                          value={newCollection.quantity}
                          onChange={(e) =>
                            setNewCollection({
                              ...newCollection,
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <Input
                          variant="muted"
                          icon={<DollarSign className="w-4 h-4" />}
                          className="text-sm"
                          placeholder="Enter price"
                          type="number"
                          step="0.01"
                          value={newCollection.price}
                          onChange={(e) =>
                            setNewCollection({
                              ...newCollection,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Unit
                        </label>
                        <Input
                          variant="muted"
                          icon={<Weight className="w-4 h-4" />}
                          className="text-sm"
                          placeholder="e.g., kg, packets"
                          value={newCollection.unit}
                          onChange={(e) =>
                            setNewCollection({
                              ...newCollection,
                              unit: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Action
                        </label>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addCollection}
                          icon={<Plus className="w-4 h-4" />}
                          className="w-full"
                        >
                          Add Collection
                        </Button>
                      </div>
                    </div>

                    {/* Collection List */}
                    {collections.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Added Collections
                        </label>
                        <div className="space-y-2">
                          {collections.map((collection, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex-1 grid grid-cols-3 gap-4">
                                <div>
                                  <label className="text-xs text-gray-500">
                                    Quantity
                                  </label>
                                  <Input
                                    variant="muted"
                                    className="text-sm"
                                    type="number"
                                    value={collection.quantity}
                                    onChange={(e) =>
                                      updateCollection(
                                        index,
                                        "quantity",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">
                                    Price
                                  </label>
                                  <Input
                                    variant="muted"
                                    className="text-sm"
                                    type="number"
                                    step="0.01"
                                    value={collection.price}
                                    onChange={(e) =>
                                      updateCollection(
                                        index,
                                        "price",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">
                                    Unit
                                  </label>
                                  <Input
                                    variant="muted"
                                    className="text-sm"
                                    value={collection.unit || ""}
                                    onChange={(e) =>
                                      updateCollection(
                                        index,
                                        "unit",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => removeCollection(index)}
                                icon={<X className="w-4 h-4" />}
                                className="px-2 py-1"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SEO Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    SEO Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Meta Title
                      </label>
                      <Input
                        variant="muted"
                        icon={<Search className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter meta title"
                        {...register("metaTitle")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Slug
                      </label>
                      <Input
                        variant="muted"
                        icon={<Search className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter URL slug"
                        {...register("slug")}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Meta Description
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-muted text-sm"
                        placeholder="Enter meta description"
                        {...register("metaDescription")}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Meta Keywords
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            variant="muted"
                            placeholder="Add a keyword"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addKeyword())
                            }
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={addKeyword}
                            icon={<Plus className="w-4 h-4" />}
                          >
                            Add
                          </Button>
                        </div>
                        {metaKeywords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {metaKeywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {keyword}
                                <button
                                  type="button"
                                  onClick={() => removeKeyword(index)}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push("/inventory")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding Product..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
