"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Upload,
  Package,
  X,
  Layers,
  Save,
  Tag,
  Search,
  Plus,
  Calendar,
  Weight,
  ScanBarcode,
} from "lucide-react";
import { productApi } from "@/lib/api/products";
import { categoryApi, subcategoryApi } from "@/lib/api/categories";
import { getPresignedUrl, deleteImage } from "@/lib/api/products";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import toast from "react-hot-toast";
import { Product } from "@/lib/types";

// Form data type for product editing
interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  highlights: { key: string; value: string }[];
  categoryId: string;
  subCategoryId: string;
  images: string[];
  status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
  isOrganic: boolean;
  mrp: number;
  pricing_range: {
    quantity_start: number;
    quantity_end: number;
    price: number;
  }[];
  discount: {
    type: "percentage" | "fixed";
    value: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  minimumOrderQuantity: number;
  maximumOrderQuantity: number;
  stock: number;
  weight: {
    value: number;
    unit: string;
  };
  productCollections: { quantity: number; price: number; unit: string }[];
  alertExpiry: number;
  expiry: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  slug: string;
  isB2B: boolean;
  dotd: boolean;
  pfy: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

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
      categoryId: "",
      subCategoryId: "",
      images: [],
      status: "ACTIVE",
      isOrganic: false,
      mrp: 0,
      pricing_range: [],
      discount: {
        type: "percentage",
        value: 0,
        startDate: "",
        endDate: "",
        isActive: true,
      },
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 100,
      stock: 0,
      weight: {
        value: 0,
        unit: "kg",
      },
      productCollections: [],
      alertExpiry: 7,
      expiry: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
      slug: "",
      isB2B: false,
      dotd: false,
      pfy: false,
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [showDiscountFields, setShowDiscountFields] = useState(false);
  const [categoriesPagination, setCategoriesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
  });
  const [subcategoriesPagination, setSubcategoriesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
  });

  // State for form inputs
  const highlights = watch("highlights") || [];
  const metaKeywords = watch("metaKeywords") || [];
  const productCollections = watch("productCollections") || [];
  const [highlightKeyInput, setHighlightKeyInput] = useState("");
  const [highlightValueInput, setHighlightValueInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [newCollection, setNewCollection] = useState({
    quantity: 0,
    price: 0,
    unit: "",
  });
  const [newPricingRange, setNewPricingRange] = useState({
    quantity_start: 0,
    quantity_end: 0,
    price: 0,
  });

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await productApi.getById(productId);
        const product = response.data;

        if (product) {
          // Populate form with existing product data
          setValue("sku", product.sku || "");
          setValue("name", product.name || "");
          setValue("description", product.description || "");
          setValue("highlights", product.highlights || []);
          setValue("categoryId", product.category?._id || "");
          setValue("subCategoryId", product.subCategory?._id || "");

          // If we have category and subcategory data, add them to the dropdowns
          if (product.category) {
            setCategories([product.category]);
          }
          if (product.subCategory) {
            setSubcategories([product.subCategory]);
          }
          setValue("images", product.images || []);
          setValue("status", product.status || "ACTIVE");
          setValue("isOrganic", product.isOrganic || false);
          setValue("mrp", product.mrp || 0);
          setValue("pricing_range", product.pricing_range || []);
          setValue(
            "discount",
            product.discount || {
              type: "percentage",
              value: 0,
              startDate: "",
              endDate: "",
              isActive: true,
            }
          );
          setValue("minimumOrderQuantity", product.minimumOrderQuantity || 1);
          setValue("maximumOrderQuantity", product.maximumOrderQuantity || 100);
          setValue("stock", product.stock || 0);
          setValue("weight", product.weight || { value: 0, unit: "kg" });
          setValue("productCollections", product.productCollections || []);
          setValue("alertExpiry", product.alertExpiry || 7);
          setValue(
            "expiry",
            product.expiry
              ? new Date(product.expiry).toISOString().split("T")[0]
              : ""
          );
          setValue("metaTitle", product.metaTitle || "");
          setValue("metaDescription", product.metaDescription || "");
          setValue("metaKeywords", product.metaKeywords || []);
          setValue("slug", product.slug || "");
          setValue("isB2B", product.isB2B || false);
          setValue("dotd", product.dotd || false);
          setValue("pfy", product.pfy || false);

          // Set discount fields visibility
          setShowDiscountFields(!!product.discount);
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Failed to load product");
        router.push("/inventory");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, setValue, router]);

  // Load initial categories
  useEffect(() => {
    const loadInitialCategories = async () => {
      try {
        const response = await categoryApi.getAll({
          page: 1,
          limit: 20,
          isActive: true,
        });
        const categoriesData =
          response.data?.categories || response.data || response;
        if (Array.isArray(categoriesData)) {
          setCategories((prev) => {
            // Merge with existing categories (from product data) and remove duplicates
            const existingIds = new Set(prev.map((cat) => cat._id));
            const newCategories = categoriesData.filter(
              (cat) => !existingIds.has(cat._id)
            );
            return [...prev, ...newCategories];
          });
        }
        setCategoriesPagination({
          currentPage: 1,
          totalPages: response.data?.totalPages || 1,
          hasMore: (response.data?.totalPages || 1) > 1,
        });
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadInitialCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const selectedCategoryId = watch("categoryId");
    if (selectedCategoryId) {
      const loadSubcategories = async () => {
        try {
          const response = await subcategoryApi.getByCategory(
            selectedCategoryId,
            {
              page: 1,
              limit: 20,
            }
          );
          const subcategoriesData =
            response.data?.subcategories || response.data || response;
          if (Array.isArray(subcategoriesData)) {
            setSubcategories((prev) => {
              // Merge with existing subcategories (from product data) and remove duplicates
              const existingIds = new Set(prev.map((sub) => sub._id));
              const newSubcategories = subcategoriesData.filter(
                (sub) => !existingIds.has(sub._id)
              );
              return [...prev, ...newSubcategories];
            });
          }
          setSubcategoriesPagination({
            currentPage: 1,
            totalPages: response.data?.totalPages || 1,
            hasMore: (response.data?.totalPages || 1) > 1,
          });
        } catch (error) {
          console.error("Error loading subcategories:", error);
        }
      };

      loadSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [watch("categoryId")]);

  const loadMoreCategories = async () => {
    if (!categoriesPagination.hasMore) return;

    try {
      const nextPage = categoriesPagination.currentPage + 1;
      const response = await categoryApi.getAll({
        page: nextPage,
        limit: 20,
        isActive: true,
      });

      const categoriesData =
        response.data?.categories || response.data || response;
      if (Array.isArray(categoriesData)) {
        setCategories((prev) => {
          // Filter out any categories that already exist to prevent duplicates
          const existingIds = new Set(prev.map((cat) => cat._id));
          const newCategories = categoriesData.filter(
            (cat) => !existingIds.has(cat._id)
          );
          return [...prev, ...newCategories];
        });
      }

      setCategoriesPagination((prev) => ({
        currentPage: nextPage,
        totalPages: response.data?.totalPages || prev.totalPages,
        hasMore: nextPage < (response.data?.totalPages || prev.totalPages),
      }));
    } catch (error) {
      console.error("Error loading more categories:", error);
    }
  };

  const loadMoreSubcategories = async () => {
    if (!subcategoriesPagination.hasMore) return;

    try {
      const nextPage = subcategoriesPagination.currentPage + 1;
      const response = await subcategoryApi.getByCategory(watch("categoryId"), {
        page: nextPage,
        limit: 20,
      });

      const subcategoriesData =
        response.data?.subcategories || response.data || response;
      if (Array.isArray(subcategoriesData)) {
        setSubcategories((prev) => {
          // Filter out any subcategories that already exist to prevent duplicates
          const existingIds = new Set(prev.map((sub) => sub._id));
          const newSubcategories = subcategoriesData.filter(
            (sub) => !existingIds.has(sub._id)
          );
          return [...prev, ...newSubcategories];
        });
      }

      setSubcategoriesPagination((prev) => ({
        currentPage: nextPage,
        totalPages: response.data?.totalPages || prev.totalPages,
        hasMore: nextPage < (response.data?.totalPages || prev.totalPages),
      }));
    } catch (error) {
      console.error("Error loading more subcategories:", error);
    }
  };

  const categoryOptions = (categories || []).map((category, index) => ({
    id: category._id || `category-${index}`,
    value: category._id || `category-${index}`,
    label: category.name,
  }));

  const subcategoryOptions = (subcategories || []).map(
    (subcategory, index) => ({
      id: subcategory._id || `subcategory-${index}`,
      value: subcategory._id || `subcategory-${index}`,
      label: subcategory.name,
    })
  );

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
      const folder = `products/images`;

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
        currentImages.filter((_: string, i: number) => i !== index)
      );

      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image from server");

      setValue(
        "images",
        currentImages.filter((_: string, i: number) => i !== index)
      );
    }
  };

  // Highlights functions
  const addHighlight = () => {
    if (highlightKeyInput.trim() && highlightValueInput.trim()) {
      const currentHighlights = watch("highlights") || [];
      setValue("highlights", [
        ...currentHighlights,
        { key: highlightKeyInput.trim(), value: highlightValueInput.trim() },
      ]);
      setHighlightKeyInput("");
      setHighlightValueInput("");
    }
  };

  const removeHighlight = (index: number) => {
    const currentHighlights = watch("highlights") || [];
    setValue(
      "highlights",
      currentHighlights.filter((_, i: number) => i !== index)
    );
  };

  // Keywords functions
  const addKeyword = () => {
    if (keywordInput.trim()) {
      setValue("metaKeywords", [...metaKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    setValue(
      "metaKeywords",
      metaKeywords.filter((_, i: number) => i !== index)
    );
  };

  // Collections functions
  const addCollection = () => {
    if (newCollection.quantity > 0 && newCollection.price > 0) {
      const currentCollections = watch("productCollections") || [];
      setValue("productCollections", [
        ...currentCollections,
        { ...newCollection },
      ]);
      setNewCollection({ quantity: 0, price: 0, unit: "" });
    }
  };

  const removeCollection = (index: number) => {
    const currentCollections = watch("productCollections") || [];
    setValue(
      "productCollections",
      currentCollections.filter((_, i: number) => i !== index)
    );
  };

  // Pricing range functions
  const addPricingRange = () => {
    if (
      newPricingRange.quantity_start > 0 &&
      newPricingRange.quantity_end > 0 &&
      newPricingRange.price > 0
    ) {
      const currentPricingRange = watch("pricing_range") || [];
      setValue("pricing_range", [
        ...currentPricingRange,
        { ...newPricingRange },
      ]);
      setNewPricingRange({ quantity_start: 0, quantity_end: 0, price: 0 });
    }
  };

  const removePricingRange = (index: number) => {
    const currentPricingRange = watch("pricing_range") || [];
    setValue(
      "pricing_range",
      currentPricingRange.filter((_, i: number) => i !== index)
    );
  };

  // Discount toggle
  const handleDiscountToggle = (checked: boolean) => {
    setShowDiscountFields(checked);
    if (!checked) {
      setValue("discount", {
        type: "percentage",
        value: 0,
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
  };

  // Auto generate SEO
  const autoGenerateSEO = () => {
    const productName = watch("name");
    if (!productName || productName.trim() === "") {
      toast.error("Please enter a product name first");
      return;
    }

    // Generate meta title (max 60 characters for SEO best practices)
    const metaTitle =
      productName.length > 60 ? productName.substring(0, 60) : productName;

    // Generate slug (lowercase, replace spaces with hyphens, remove special chars)
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Generate meta description (max 160 characters for SEO best practices)
    const description = watch("description");
    const metaDescription =
      description && description.length > 0
        ? description.length > 160
          ? description.substring(0, 160)
          : description
        : `Buy ${productName} online. High quality product with fast delivery.`;

    const generateKeywords = (name: string, desc?: string) => {
      const keywords = new Set<string>();

      // Add words from product name
      name
        .toLowerCase()
        .split(/\s+/)
        .forEach((word) => {
          if (word.length > 2) keywords.add(word);
        });

      // Add words from description if available
      if (desc) {
        desc
          .toLowerCase()
          .split(/\s+/)
          .forEach((word) => {
            if (word.length > 2) keywords.add(word);
          });
      }

      // Add common keywords
      const commonKeywords = ["product", "buy", "online", "quality", "premium"];
      commonKeywords.forEach((keyword) => keywords.add(keyword));

      return Array.from(keywords);
    };

    const metaKeywords = generateKeywords(productName, description);

    // Update form values
    setValue("metaTitle", metaTitle);
    setValue("slug", slug);
    setValue("metaDescription", metaDescription);
    setValue("metaKeywords", metaKeywords);

    toast.success("SEO fields generated successfully!");
  };

  const validateFormData = (data: ProductFormData): string[] => {
    const errors: string[] = [];

    // Name validation
    if (!data.name?.trim()) {
      errors.push("Product name is required");
    } else if (data.name.length > 200) {
      errors.push("Product name must be less than 200 characters");
    }

    // Description validation
    if (!data.description?.trim()) {
      errors.push("Description is required");
    } else if (data.description.length < 10) {
      errors.push("Description must be at least 10 characters");
    } else if (data.description.length > 2000) {
      errors.push("Description must be less than 2000 characters");
    }

    // Images validation
    if (!data.images || data.images.length === 0) {
      errors.push("At least one image is required");
    }

    // Category validation
    if (!data.categoryId) {
      errors.push("Category is required");
    }

    // MRP validation
    if (data.mrp === undefined || data.mrp === null) {
      errors.push("MRP is required");
    } else if (data.mrp <= 0) {
      errors.push("MRP must be greater than 0");
    }

    // Stock validation
    if (data.stock === undefined || data.stock === null) {
      errors.push("Stock quantity is required");
    } else if (data.stock < 0) {
      errors.push("Stock cannot be negative");
    }

    // Weight validation
    if (data.weight?.value === undefined || data.weight?.value === null) {
      errors.push("Weight value is required");
    } else if (data.weight?.value <= 0) {
      errors.push("Weight value must be greater than 0");
    }

    // Order quantity validation
    if (
      data.minimumOrderQuantity === undefined ||
      data.minimumOrderQuantity === null
    ) {
      errors.push("Minimum order quantity is required");
    } else if (data.minimumOrderQuantity < 1) {
      errors.push("Minimum order quantity must be at least 1");
    }
    if (
      data.maximumOrderQuantity === undefined ||
      data.maximumOrderQuantity === null
    ) {
      errors.push("Maximum order quantity is required");
    } else if (data.maximumOrderQuantity < 1) {
      errors.push("Maximum order quantity must be at least 1");
    }

    // Highlights validation
    if (data.highlights && data.highlights.length > 0) {
      data.highlights.forEach((highlight, index) => {
        if (!highlight.key?.trim() || !highlight.value?.trim()) {
          errors.push(`Highlight ${index + 1} must have both key and value`);
        }
      });
    }

    // Discount validation (only if discount fields are shown)
    if (showDiscountFields && data.discount) {
      if (data.discount.value < 0) {
        errors.push("Discount value cannot be negative");
      }
      if (data.discount.startDate && data.discount.endDate) {
        const startDate = new Date(data.discount.startDate);
        const endDate = new Date(data.discount.endDate);
        if (startDate >= endDate) {
          errors.push("Discount start date must be before end date");
        }
      }
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

      // Prepare data for backend - matching API documentation exactly
      const productData = {
        sku: data.sku?.trim() || "",
        name: data.name?.trim() || "",
        description: data.description?.trim() || "",
        highlights: data.highlights || [],
        category: data.categoryId,
        subCategory: data.subCategoryId,
        images: data.images,
        status: data.status,
        isOrganic: data.isOrganic,
        mrp: Number(data.mrp),
        pricing_range: data.pricing_range || [],
        discount:
          showDiscountFields && data.discount
            ? {
                type: data.discount.type,
                value: Number(data.discount.value),
                startDate: data.discount.startDate
                  ? new Date(data.discount.startDate)
                  : undefined,
                endDate: data.discount.endDate
                  ? new Date(data.discount.endDate)
                  : undefined,
                isActive: data.discount.isActive,
              }
            : undefined,
        minimumOrderQuantity: Number(data.minimumOrderQuantity),
        maximumOrderQuantity: Number(data.maximumOrderQuantity),
        stock: Number(data.stock),
        weight: {
          value: Number(data.weight?.value || 0),
          unit: String(data.weight?.unit || "kg"),
        },
        productCollections: data.productCollections || [],
        alertExpiry: Number(data.alertExpiry),
        expiry: data.expiry ? new Date(data.expiry) : undefined,
        metaTitle: data.metaTitle?.trim() || "",
        metaDescription: data.metaDescription?.trim() || "",
        metaKeywords: data.metaKeywords || [],
        slug: data.slug?.trim() || "",
        type: "product" as const,
        isB2B: data.isB2B,
        dotd: data.dotd,
        pfy: data.pfy,
        reviewsCount: 0,
        totalRating: 0,
      };

      // Submit to backend
      const result = await productApi.update(productId, productData as any);
      console.log("Product updated successfully:", result);

      setSubmitSuccess(true);
      toast.success("Product updated successfully!");

      // Redirect to product detail page after successful submission
      setTimeout(() => {
        router.push(`/inventory/product/${productId}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating product:", error);
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
          <span className="ml-2 text-gray-600">Loading product...</span>
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
            <h1 className="text-xl font-semibold text-gray-900">
              Edit Product
            </h1>
          </div>
          <p className="text-gray-500 mt-1 text-sm">
            Update product information and settings.
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
                    Product updated successfully! Redirecting to product
                    details...
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
                        SKU *
                      </label>
                      <Input
                        variant="muted"
                        icon={<FileText className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter SKU"
                        {...register("sku", {
                          required: "SKU is required",
                        })}
                      />
                      {errors.sku && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.sku.message}
                        </p>
                      )}
                    </div>
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
                    <div className="space-y-2 md:col-span-2">
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
                        placeholder="Enter product description (minimum 10 characters, maximum 2000)"
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
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Highlights *{" "}
                        <span className="text-gray-500 text-xs">
                          (at least one required)
                        </span>
                      </label>
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            variant="muted"
                            placeholder="Highlight key (e.g., Material)"
                            value={highlightKeyInput}
                            onChange={(e) =>
                              setHighlightKeyInput(e.target.value)
                            }
                          />
                          <Input
                            variant="muted"
                            placeholder="Highlight value (e.g., 100% Cotton)"
                            value={highlightValueInput}
                            onChange={(e) =>
                              setHighlightValueInput(e.target.value)
                            }
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
                                <strong>{highlight.key}:</strong>{" "}
                                {highlight.value}
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
                        {highlights.length === 0 && (
                          <p className="text-red-500 text-xs">
                            At least one highlight is required
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Category & Subcategory
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Category *
                      </label>
                      <Controller
                        name="categoryId"
                        control={control}
                        rules={{ required: "Category is required" }}
                        render={({ field }) => (
                          <ActionDropdown
                            options={categoryOptions}
                            selectedValue={field.value}
                            onSelect={(option) => {
                              field.onChange(option.value);
                              setValue("subCategoryId", ""); // Reset subcategory when category changes
                            }}
                            placeholder="Select category"
                            hasMore={categoriesPagination.hasMore}
                            onLoadMore={loadMoreCategories}
                            loading={false}
                          />
                        )}
                      />
                      {errors.categoryId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.categoryId.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Subcategory
                      </label>
                      <Controller
                        name="subCategoryId"
                        control={control}
                        render={({ field }) => (
                          <ActionDropdown
                            options={subcategoryOptions}
                            selectedValue={field.value}
                            onSelect={(option) => field.onChange(option.value)}
                            placeholder="Select subcategory"
                            disabled={!watch("categoryId")}
                            hasMore={subcategoriesPagination.hasMore}
                            onLoadMore={loadMoreSubcategories}
                            loading={false}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700">
                    Product Images *
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
                      document.getElementById("file-upload")?.click()
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
                            {Object.keys(uploadProgress).length} file(s)
                            uploading
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
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      aria-label="Upload product images"
                      multiple
                      disabled={uploadingImages}
                    />
                  </div>

                  {/* Image Preview Grid */}
                  {(watch("images") && watch("images").length > 0) ||
                  Object.keys(uploadProgress).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {watch("images") &&
                        watch("images").map((image: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product image ${index + 1}`}
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
                            icon={<DollarSign className="w-4 h-4" />}
                            className="text-sm"
                            placeholder="Enter MRP"
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
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
                        Weight Value *
                      </label>
                      <Input
                        variant="muted"
                        icon={<Package className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter weight value"
                        type="number"
                        step="0.01"
                        {...register("weight.value", {
                          required: "Weight value is required",
                          min: {
                            value: 0.01,
                            message: "Weight must be greater than 0",
                          },
                        })}
                      />
                      {errors.weight?.value && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.weight.value.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Weight Unit *
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-muted text-sm"
                        {...register("weight.unit", {
                          required: "Weight unit is required",
                        })}
                      >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="lb">Pounds (lb)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="piece">Piece</option>
                        <option value="pack">Pack</option>
                        <option value="box">Box</option>
                        <option value="bottle">Bottle</option>
                        <option value="can">Can</option>
                        <option value="bag">Bag</option>
                      </select>
                      {errors.weight?.unit && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.weight.unit.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Quantities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Order Quantities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Min Order Quantity *
                      </label>
                      <Input
                        variant="muted"
                        icon={<Package className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter minimum order quantity"
                        type="number"
                        {...register("minimumOrderQuantity", {
                          required: "Minimum order quantity is required",
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
                        Max Order Quantity *
                      </label>
                      <Input
                        variant="muted"
                        icon={<Package className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter maximum order quantity"
                        type="number"
                        {...register("maximumOrderQuantity", {
                          required: "Maximum order quantity is required",
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
                  </div>
                </div>

                {/* Product Flags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Product Flags
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register("isOrganic")}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Organic Product
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register("isB2B")}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          B2B Product
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register("dotd")}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Deal of the Day
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register("pfy")}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Pick for You
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Product Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                </div>


                {/* Discount Section */}
                <div className="space-y-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showDiscountFields}
                        onChange={(e) => handleDiscountToggle(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Add Discount
                        </span>
                      </div>
                    </label>
                  </div>

                  {showDiscountFields && (
                    <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                      <h4 className="text-sm font-medium text-blue-900">
                        Discount Settings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                icon={<DollarSign className="w-4 h-4" />}
                                className="text-sm"
                                placeholder="Enter discount value"
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Discount Start Date
                          </label>
                          <Controller
                            name="discount.startDate"
                            control={control}
                            render={({ field }) => (
                              <Input
                                variant="muted"
                                icon={<Calendar className="w-4 h-4" />}
                                className="text-sm"
                                type="date"
                                {...field}
                              />
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Discount End Date
                          </label>
                          <Controller
                            name="discount.endDate"
                            control={control}
                            render={({ field }) => (
                              <Input
                                variant="muted"
                                icon={<Calendar className="w-4 h-4" />}
                                className="text-sm"
                                type="date"
                                {...field}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Ranges Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Pricing Ranges
                    </h3>
                    <p className="text-sm text-gray-500">
                      Add bulk pricing tiers
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        variant="muted"
                        placeholder="Min Quantity"
                        type="number"
                        value={newPricingRange.quantity_start}
                        onChange={(e) =>
                          setNewPricingRange((prev) => ({
                            ...prev,
                            quantity_start: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                      <Input
                        variant="muted"
                        placeholder="Max Quantity"
                        type="number"
                        value={newPricingRange.quantity_end}
                        onChange={(e) =>
                          setNewPricingRange((prev) => ({
                            ...prev,
                            quantity_end: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                      <Input
                        variant="muted"
                        placeholder="Price"
                        type="number"
                        value={newPricingRange.price}
                        onChange={(e) =>
                          setNewPricingRange((prev) => ({
                            ...prev,
                            price: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addPricingRange}
                        icon={<Plus className="w-4 h-4" />}
                      >
                        Add Range
                      </Button>
                    </div>

                    {watch("pricing_range") &&
                      watch("pricing_range").length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Added Pricing Ranges
                          </label>
                          <div className="space-y-2">
                            {watch("pricing_range").map((range, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                              >
                                <span className="text-sm text-gray-900">
                                  {range.quantity_start}-{range.quantity_end}{" "}
                                  units: ₹{range.price}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removePricingRange(index)}
                                  className="ml-auto p-1 hover:bg-red-100 rounded-full transition-colors"
                                >
                                  <X className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Product Collections Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Product Collections
                    </h3>
                    <p className="text-sm text-gray-500">
                      Add collection pricing
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        variant="muted"
                        placeholder="Quantity"
                        type="number"
                        value={newCollection.quantity}
                        onChange={(e) =>
                          setNewCollection((prev) => ({
                            ...prev,
                            quantity: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                      <Input
                        variant="muted"
                        placeholder="Price"
                        type="number"
                        value={newCollection.price}
                        onChange={(e) =>
                          setNewCollection((prev) => ({
                            ...prev,
                            price: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                      <Input
                        variant="muted"
                        placeholder="Unit (e.g., kg, piece)"
                        value={newCollection.unit}
                        onChange={(e) =>
                          setNewCollection((prev) => ({
                            ...prev,
                            unit: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addCollection}
                        icon={<Plus className="w-4 h-4" />}
                      >
                        Add Collection
                      </Button>
                    </div>

                    {productCollections.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Added Collections
                        </label>
                        <div className="space-y-2">
                          {productCollections.map((collection, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                            >
                              <span className="text-sm text-gray-900">
                                {collection.quantity} {collection.unit} - ₹
                                {collection.price}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeCollection(index)}
                                className="ml-auto p-1 hover:bg-red-100 rounded-full transition-colors"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SEO Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        SEO Information
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Generate SEO fields automatically from product name
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={autoGenerateSEO}
                      icon={<Search className="w-4 h-4" />}
                    >
                      Auto Generate
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Meta Title
                      </label>
                      <Input
                        variant="muted"
                        icon={<FileText className="w-4 h-4" />}
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
                        icon={<FileText className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter slug"
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
                        rows={3}
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
                            placeholder="Enter keyword"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addKeyword())
                            }
                            className="flex-1"
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
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {keyword}
                                <button
                                  type="button"
                                  onClick={() => removeKeyword(index)}
                                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
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
                    {isSubmitting ? "Updating Product..." : "Update Product"}
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
