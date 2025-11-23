"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  ArrowLeft,
  ScanBarcode,
  FileText,
  IndianRupee,
  Percent,
  Calendar,
  Upload,
  Package,
  Weight,
  Tag,
  Search,
  Plus,
  X,
  Edit,
} from "lucide-react";
import { Product, Category, Discount } from "@/lib/types";
import { productApi, getPresignedUrl, deleteImage } from "@/lib/api/products";
import { categoryApi, subcategoryApi } from "@/lib/api/categories";
import {
  ActionDropdown,
  DropdownOption,
} from "@/components/ui/action-dropdown";
import toast from "react-hot-toast";

type ProductFormData = Omit<
  Product,
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "reviews"
  | "category"
  | "subCategory"
  | "type"
  | "expiry"
  | "discount"
> & {
  categoryId: string;
  subCategoryId?: string; // Optional per API documentation
  expiry?: string; // Form uses string for date input
  discount: {
    type: "percentage" | "fixed";
    value: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
  };
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
      hsn: "",
      name: "",
      description: "",
      highlights: [],
      images: [],
      status: "ACTIVE",
      isOrganic: false,
      mrp: 0,
      gst: 0,
      pricing_range: [],
      discount: {
        type: "percentage",
        value: 0,
        startDate: "",
        endDate: "",
        isActive: true,
      },
      stock: 0,
      weight: {
        value: 0,
        unit: "kg",
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
      subCategoryId: "",
      productCollections: [],
      expiry: "",
      alertExpiry: 7,
      isB2B: true,
      dotd: false,
      pfy: false,
      isEssential: false,
    },
  });

  const highlights = watch("highlights") || [];
  const metaKeywords = watch("metaKeywords") || [];
  const productCollections = watch("productCollections") || [];

  const [highlightKeyInput, setHighlightKeyInput] = useState("");
  const [highlightValueInput, setHighlightValueInput] = useState("");
  const [editingHighlightIndex, setEditingHighlightIndex] = useState<number | null>(null);
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
  const [editingPricingRangeIndex, setEditingPricingRangeIndex] = useState<number | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [uploadingSubcategoryImage, setUploadingSubcategoryImage] =
    useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "category" | "subcategory";
    item: any;
  } | null>(null);
  const [showDiscountFields, setShowDiscountFields] = useState(false);

  // Reset discount fields when checkbox is unchecked
  const handleDiscountToggle = (checked: boolean) => {
    setShowDiscountFields(checked);
    if (!checked) {
      // Reset discount fields when hiding them
      setValue("discount", {
        type: "percentage",
        value: 0,
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
  };

  // Load initial categories on component mount
  useEffect(() => {
    const loadInitialCategories = async () => {
      try {
        setLoadingCategories(true);

        const response = await categoryApi.getAll({
          isActive: true,
          page: 1,
          limit: 20, // Load 20 categories initially
        });

        const categoriesData = response.data?.categories;
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }

        // Set pagination info
        setCategoriesPagination({
          currentPage: 1,
          totalPages: response.data?.totalPages || 1,
          hasMore: (response.data?.totalPages || 1) > 1,
        });
      } catch (error) {
        console.error("Error loading categories:", error);
        const errorMessage =
          "Failed to load categories. Please refresh the page.";
        setSubmitError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoadingCategories(false);
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
          setLoadingSubcategories(true);

          const response = await subcategoryApi.getByCategory(
            selectedCategoryId,
            { page: 1, limit: 20 }
          );

          const subcategoriesData =
            response.data?.subcategories || response.data;
          if (Array.isArray(subcategoriesData)) {
            setSubcategories(subcategoriesData);
          }

          // Set pagination info
          setSubcategoriesPagination({
            currentPage: 1,
            totalPages: response.data?.totalPages || 1,
            hasMore: (response.data?.totalPages || 1) > 1,
          });
        } catch (error) {
          console.error("Error loading subcategories:", error);
          setSubcategories([]);
          toast.error("Failed to load subcategories");
        } finally {
          setLoadingSubcategories(false);
        }
      };

      loadSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [watch("categoryId")]);

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
      // Upload files one by one
      for (let i = 0; i < files.length; i++) {
        await handleFileUpload(files[i]);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Upload files one by one
      for (let i = 0; i < files.length; i++) {
        await handleFileUpload(files[i]);
      }
      // Reset the input value to allow selecting the same file again
      e.target.value = "";
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

      // Generate generic folder structure: /products/images
      const fileExtension = file.name.split(".").pop();
      const fileName = `${fileId}.${fileExtension}`;
      const folder = `products/images`;

      // Get presigned URL from backend
      setUploadProgress((prev) => ({ ...prev, [fileId]: 25 }));
      const presignedData = await getPresignedUrl(fileName, file.type, folder);

      if (!presignedData || !presignedData.presignedUrl) {
        throw new Error("Failed to get presigned URL from server");
      }

      const { presignedUrl, imageUrl } = presignedData;

      setUploadProgress((prev) => ({ ...prev, [fileId]: 50 }));

      // Upload file to S3 using presigned URL with progress tracking
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

      // Add the S3 URL to the images array
      const currentImages = watch("images") || [];
      setValue("images", [...currentImages, imageUrl]);

      // Clear progress after successful upload
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

      // Clear progress on error
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const addHighlight = () => {
    if (highlightKeyInput.trim() && highlightValueInput.trim()) {
      if (editingHighlightIndex !== null) {
        // Update existing highlight
        const updatedHighlights = [...highlights];
        updatedHighlights[editingHighlightIndex] = {
          key: highlightKeyInput.trim(),
          value: highlightValueInput.trim(),
        };
        setValue("highlights", updatedHighlights);
        setEditingHighlightIndex(null);
      } else {
        // Add new highlight
        setValue("highlights", [
          ...highlights,
          {
            key: highlightKeyInput.trim(),
            value: highlightValueInput.trim(),
          },
        ]);
      }
      setHighlightKeyInput("");
      setHighlightValueInput("");
    }
  };

  const editHighlight = (index: number) => {
    const highlight = highlights[index];
    setHighlightKeyInput(highlight.key);
    setHighlightValueInput(highlight.value);
    setEditingHighlightIndex(index);
  };

  const cancelEditHighlight = () => {
    setHighlightKeyInput("");
    setHighlightValueInput("");
    setEditingHighlightIndex(null);
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
      setValue("productCollections", [
        ...productCollections,
        { ...newCollection },
      ]);
      setNewCollection({ quantity: 0, price: 0, unit: "" });
    }
  };

  const addPricingRange = () => {
    if (
      newPricingRange.quantity_start > 0 &&
      newPricingRange.quantity_end > 0 &&
      newPricingRange.price > 0
    ) {
      const currentPricingRange = watch("pricing_range") || [];
      if (editingPricingRangeIndex !== null) {
        // Update existing pricing range
        const updatedRanges = [...currentPricingRange];
        updatedRanges[editingPricingRangeIndex] = { ...newPricingRange };
        setValue("pricing_range", updatedRanges);
        setEditingPricingRangeIndex(null);
      } else {
        // Add new pricing range
        setValue("pricing_range", [
          ...currentPricingRange,
          { ...newPricingRange },
        ]);
      }
      setNewPricingRange({ quantity_start: 0, quantity_end: 0, price: 0 });
    }
  };

  const editPricingRange = (index: number) => {
    const currentPricingRange = watch("pricing_range") || [];
    const range = currentPricingRange[index];
    setNewPricingRange({
      quantity_start: range.quantity_start,
      quantity_end: range.quantity_end,
      price: range.price,
    });
    setEditingPricingRangeIndex(index);
  };

  const cancelEditPricingRange = () => {
    setNewPricingRange({ quantity_start: 0, quantity_end: 0, price: 0 });
    setEditingPricingRangeIndex(null);
  };

  const removePricingRange = (index: number) => {
    const currentPricingRange = watch("pricing_range") || [];
    setValue(
      "pricing_range",
      currentPricingRange.filter((_, i) => i !== index)
    );
  };

  const removeCollection = (index: number) => {
    setValue(
      "productCollections",
      productCollections.filter((_, i) => i !== index)
    );
  };

  const updateCollection = (index: number, field: string, value: any) => {
    const updatedCollections = [...productCollections];
    updatedCollections[index] = {
      ...updatedCollections[index],
      [field]: value,
    };
    setValue("productCollections", updatedCollections);
  };

  const removeImage = async (index: number) => {
    const currentImages = watch("images") || [];
    const imageToRemove = currentImages[index];

    try {
      // Extract S3 key from the image URL
      // URL format: https://testing-v23.s3.ap-south-1.amazonaws.com/wishbee/products/images/filename.jpg
      // We need to extract: wishbee/products/images/filename.jpg
      const url = new URL(imageToRemove);
      const pathParts = url.pathname.split("/");
      // Find the 'wishbee' part and get everything from there
      const wishbeeIndex = pathParts.findIndex((part) => part === "wishbee");
      if (wishbeeIndex !== -1) {
        const s3Key = pathParts.slice(wishbeeIndex).join("/");

        // Delete from S3
        await deleteImage(s3Key);
      } else {
        throw new Error("Invalid image URL format - wishbee folder not found");
      }

      // Remove from form
      setValue(
        "images",
        currentImages.filter((_, i) => i !== index)
      );

      // Reset file input to allow selecting new images
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image from server");

      // Still remove from UI even if server deletion fails
      setValue(
        "images",
        currentImages.filter((_, i) => i !== index)
      );

      // Reset file input to allow selecting new images
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  // Auto generate SEO fields
  const autoGenerateSEO = () => {
    const productName = watch("name");
    if (!productName || productName.trim() === "") {
      toast.error("Please enter a product name first");
      return;
    }

    // Generate meta title (max 60 characters for SEO best practices)
    const metaTitle =
      productName.length > 60
        ? productName.substring(0, 57) + "..."
        : productName;

    // Generate slug from product name
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Generate meta description (max 160 characters for SEO best practices)
    const description = watch("description");
    const metaDescription =
      description && description.length > 0
        ? description.length > 160
          ? description.substring(0, 157) + "..."
          : description
        : `Buy ${productName} online. High quality products with fast delivery.`;

    // Generate meta keywords from product name and description
    const generateKeywords = (name: string, desc?: string) => {
      const keywords = new Set<string>();

      // Add words from product name
      const nameWords = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 2);

      nameWords.forEach((word) => keywords.add(word));

      // Add words from description if available
      if (desc && desc.trim()) {
        const descWords = desc
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .split(/\s+/)
          .filter((word) => word.length > 3)
          .slice(0, 10); // Limit to first 10 words from description

        descWords.forEach((word) => keywords.add(word));
      }

      // Add some common product-related keywords
      const commonKeywords = ["product", "buy", "online", "quality", "premium"];
      commonKeywords.forEach((keyword) => keywords.add(keyword));

      // Convert to array and limit to 15 keywords max
      return Array.from(keywords).slice(0, 15);
    };

    const metaKeywords = generateKeywords(productName, description);

    // Update form values
    setValue("metaTitle", metaTitle);
    setValue("slug", slug);
    setValue("metaDescription", metaDescription);
    setValue("metaKeywords", metaKeywords);

    toast.success("SEO fields generated successfully!");
  };

  // Image upload handler for categories/subcategories
  const handleCategoryImageUpload = async (
    file: File,
    type: "category" | "subcategory"
  ): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return null;
    }

    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      if (type === "category") {
        setUploadingCategoryImage(true);
      } else {
        setUploadingSubcategoryImage(true);
      }

      // Generate folder structure: /categories/{type}/images
      const fileExtension = file.name.split(".").pop();
      const fileName = `${fileId}.${fileExtension}`;
      const folder = `categories/${type}/images`;

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

      toast.success("Image uploaded successfully!");
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
      return null;
    } finally {
      if (type === "category") {
        setUploadingCategoryImage(false);
      } else {
        setUploadingSubcategoryImage(false);
      }
    }
  };

  // Convert categories to dropdown options
  const categoryOptions: DropdownOption[] = (categories || []).map(
    (category, index) => ({
      id: category._id || `category-${index}`,
      label: category.name,
      value: category._id,
      image: category.image,
    })
  );

  // Convert subcategories to dropdown options
  const subcategoryOptions: DropdownOption[] = (subcategories || []).map(
    (subcategory, index) => ({
      id: subcategory._id || `subcategory-${index}`,
      label: subcategory.name,
      value: subcategory._id,
      image: subcategory.image,
    })
  );

  // Load more categories
  const loadMoreCategories = async () => {
    if (!categoriesPagination.hasMore || loadingCategories) return;

    try {
      setLoadingCategories(true);
      const nextPage = categoriesPagination.currentPage + 1;

      const response = await categoryApi.getAll({
        isActive: true,
        page: nextPage,
        limit: 20,
      });

      const categoriesData = response.data?.categories;
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
      toast.error("Failed to load more categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load more subcategories
  const loadMoreSubcategories = async () => {
    if (!subcategoriesPagination.hasMore || loadingSubcategories) return;

    try {
      setLoadingSubcategories(true);
      const nextPage = subcategoriesPagination.currentPage + 1;
      const selectedCategoryId = watch("categoryId");

      if (!selectedCategoryId) return;

      const response = await subcategoryApi.getByCategory(selectedCategoryId, {
        page: nextPage,
        limit: 20,
      });

      const subcategoriesData = response.data?.subcategories || response.data;
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
      toast.error("Failed to load more subcategories");
    } finally {
      setLoadingSubcategories(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (option: DropdownOption) => {
    setValue("categoryId", option.value);
    setValue("subCategoryId", ""); // Reset subcategory when category changes
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (option: DropdownOption) => {
    setValue("subCategoryId", option.value);
  };

  // Handle category edit
  const handleCategoryEdit = (option: DropdownOption) => {
    const category = categories.find((cat) => cat._id === option.value);
    if (category) {
      setEditingCategory(category);
      setShowCategoryModal(true);
    }
  };

  // Handle category delete
  const handleCategoryDelete = (option: DropdownOption) => {
    const category = categories.find((cat) => cat._id === option.value);
    if (category) {
      setItemToDelete({ type: "category", item: category });
      setShowDeleteConfirm(true);
    }
  };

  // Handle subcategory edit
  const handleSubcategoryEdit = (option: DropdownOption) => {
    const subcategory = subcategories.find((sub) => sub._id === option.value);
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setShowSubcategoryModal(true);
    }
  };

  // Handle subcategory delete
  const handleSubcategoryDelete = (option: DropdownOption) => {
    const subcategory = subcategories.find((sub) => sub._id === option.value);
    if (subcategory) {
      setItemToDelete({ type: "subcategory", item: subcategory });
      setShowDeleteConfirm(true);
    }
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "category") {
        await categoryApi.delete(itemToDelete.item._id);
        setCategories((prev) =>
          prev.filter((cat) => cat._id !== itemToDelete.item._id)
        );
        // Reset form if deleted category was selected
        if (watch("categoryId") === itemToDelete.item._id) {
          setValue("categoryId", "");
          setValue("subCategoryId", "");
        }
        toast.success("Category deleted successfully!");
      } else if (itemToDelete.type === "subcategory") {
        await subcategoryApi.delete(itemToDelete.item._id);
        setSubcategories((prev) =>
          prev.filter((sub) => sub._id !== itemToDelete.item._id)
        );
        // Reset form if deleted subcategory was selected
        if (watch("subCategoryId") === itemToDelete.item._id) {
          setValue("subCategoryId", "");
        }
        toast.success("Sub-category deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete item"
      );
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  // Category creation
  const handleCreateCategory = async (data: {
    name: string;
    description: string;
    slug: string;
    image?: string;
    showOnHomepage: boolean;
  }) => {
    try {
      // Prepare data - description is optional if not provided
      const categoryData = {
        ...data,
        description: data.description || "",
      };
      const response = await categoryApi.create(categoryData);
      const newCategory = response.data || response;

      // Update categories state with the new category
      setCategories((prev) => [...prev, newCategory]);
      setShowCategoryModal(false);
      setSubmitError(null);
      toast.success("Category created successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create category";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Category update
  const handleUpdateCategory = async (data: {
    name: string;
    description: string;
    slug: string;
    image?: string;
    showOnHomepage: boolean;
  }) => {
    if (!editingCategory) return;

    try {
      const response = await categoryApi.update(editingCategory._id, data);
      const updatedCategory = response.data || response;

      // Update categories state
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === editingCategory._id ? updatedCategory : cat
        )
      );
      setShowCategoryModal(false);
      setEditingCategory(null);
      setSubmitError(null);
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update category";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Subcategory creation
  const handleCreateSubcategory = async (data: {
    name: string;
    description: string;
    parentCategoryId: string;
    slug: string;
    image?: string;
  }) => {
    try {
      // Prepare data - description is optional if not provided
      const subcategoryData = {
        ...data,
        description: data.description || "",
      };
      const response = await subcategoryApi.create(subcategoryData);
      const newSubcategory = response.data || response;

      // Update subcategories state with the new subcategory
      setSubcategories((prev) => [...prev, newSubcategory]);
      setShowSubcategoryModal(false);
      setSubmitError(null);
      toast.success("Sub-category created successfully!");
    } catch (error) {
      console.error("Error creating subcategory:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create subcategory";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Subcategory update
  const handleUpdateSubcategory = async (data: {
    name: string;
    description: string;
    parentCategoryId: string;
    slug: string;
    image?: string;
  }) => {
    if (!editingSubcategory) return;

    try {
      // Prepare data - description is optional if not provided
      const subcategoryData = {
        ...data,
        description: data.description || "",
      };
      const response = await subcategoryApi.update(
        editingSubcategory._id,
        subcategoryData
      );
      const updatedSubcategory = response.data || response;

      // Update subcategories state
      setSubcategories((prev) =>
        prev.map((sub) =>
          sub._id === editingSubcategory._id ? updatedSubcategory : sub
        )
      );
      setShowSubcategoryModal(false);
      setEditingSubcategory(null);
      setSubmitError(null);
      toast.success("Sub-category updated successfully!");
    } catch (error) {
      console.error("Error updating subcategory:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update subcategory";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const validateFormData = (data: ProductFormData): string[] => {
    const errors: string[] = [];

    // SKU validation (matching API: required, max 50 chars)
    if (!data.sku?.trim()) {
      errors.push("SKU is required");
    } else if (data.sku.length > 50) {
      errors.push("SKU must be less than 50 characters");
    }

    // Product name validation (matching API: required, max 200 chars)
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
    } else if (data.description.length > 1000) {
      errors.push("Description must be less than 1000 characters");
    }

    // Highlights validation (matching API: required, at least one)
    if (!data.highlights || data.highlights.length === 0) {
      errors.push("At least one highlight is required");
    } else {
      data.highlights.forEach((highlight, index) => {
        if (!highlight.key?.trim() || !highlight.value?.trim()) {
          errors.push(
            `Highlight ${index + 1}: Both key and value are required`
          );
        }
      });
    }

    // Category validation (matching API: required)
    if (!data.categoryId?.trim()) {
      errors.push("Category is required");
    }
    // Subcategory is optional per API documentation

    // Images validation (matching API: required, at least one)
    if (!data.images || data.images.length === 0) {
      errors.push("At least one image is required");
    }

    // MRP validation (matching API: required, must be positive)
    if (data.mrp === undefined || data.mrp === null) {
      errors.push("MRP is required");
    } else if (data.mrp <= 0) {
      errors.push("MRP must be greater than 0");
    }

    // Pricing range validation (matching API: required, at least one)
    if (!data.pricing_range || data.pricing_range.length === 0) {
      errors.push("At least one pricing range is required");
    } else {
      data.pricing_range.forEach((range, index) => {
        if (range.quantity_start <= 0) {
          errors.push(
            `Pricing range ${index + 1}: Quantity start must be greater than 0`
          );
        }
        if (range.quantity_end <= 0) {
          errors.push(
            `Pricing range ${index + 1}: Quantity end must be greater than 0`
          );
        }
        if (range.quantity_start >= range.quantity_end) {
          errors.push(
            `Pricing range ${
              index + 1
            }: Quantity start must be less than quantity end`
          );
        }
        if (range.price <= 0) {
          errors.push(
            `Pricing range ${index + 1}: Price must be greater than 0`
          );
        }
      });
    }

    // Stock validation (matching API: required, cannot be negative)
    if (data.stock === undefined || data.stock === null) {
      errors.push("Stock quantity is required");
    } else if (data.stock < 0) {
      errors.push("Stock cannot be negative");
    }

    // Weight validation (matching API: required, value must be positive)
    if (data.weight.value === undefined || data.weight.value === null) {
      errors.push("Weight value is required");
    } else if (data.weight.value <= 0) {
      errors.push("Weight value must be greater than 0");
    }
    if (!data.weight.unit?.trim()) {
      errors.push("Weight unit is required");
    }

    // Order quantity validation (matching API: both required, min 1)
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

    // Product Collections validation (matching API: optional but if provided, must be valid)
    if (data.productCollections && data.productCollections.length > 0) {
      data.productCollections.forEach((item, index) => {
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

    // Meta fields validation (matching API limits)
    if (data.metaTitle && data.metaTitle.length > 60) {
      errors.push("Meta title must be 60 characters or less");
    }
    if (data.metaDescription && data.metaDescription.length > 160) {
      errors.push("Meta description must be 160 characters or less");
    }
    if (data.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
      errors.push(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      );
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
      const productData: {
        sku: string;
        hsn?: string;
        name: string;
        type: "product";
        description: string;
        highlights: { key: string; value: string; }[];
        category: string;
        subCategory?: string;
        images: string[];
        status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
        isOrganic: boolean;
        mrp: number;
        gst?: number;
        pricing_range: { quantity_start: number; quantity_end: number; price: number; }[];
        discount?: { type: "percentage" | "fixed"; value: number; startDate?: Date; endDate?: Date; isActive: boolean; };
        stock: number;
        weight: { value: number; unit: string; };
        minimumOrderQuantity?: number;
        maximumOrderQuantity?: number;
        productCollections?: { quantity: number; price: number; unit?: string; }[];
        alertExpiry?: number;
        expiry?: Date;
        metaTitle?: string;
        metaDescription?: string;
        metaKeywords?: string[];
        slug?: string;
        isB2B: boolean;
        dotd: boolean;
        pfy: boolean;
        isEssential: boolean;
        reviewsCount: number;
        totalRating: number;
      } = {
        sku: data.sku.trim(),
        hsn: data.hsn?.trim() || undefined,
        name: data.name.trim(),
        type: "product" as const,
        description: data.description?.trim() || "",
        highlights: data.highlights,
        category: data.categoryId,
        ...(data.subCategoryId?.trim() && { subCategory: data.subCategoryId.trim() }),
        images: data.images,
        status: data.status,
        isOrganic: data.isOrganic,
        mrp: Number(data.mrp),
        gst: data.gst ? Number(data.gst) : undefined,
        pricing_range: data.pricing_range.map((range) => ({
          quantity_start: Number(range.quantity_start),
          quantity_end: Number(range.quantity_end),
          price: Number(range.price),
        })),
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
        minimumOrderQuantity: Number(data.minimumOrderQuantity) || 1,
        maximumOrderQuantity: Number(data.maximumOrderQuantity) || 100,
        stock: Number(data.stock),
        weight: {
          value: Number(data.weight.value),
          unit: String(data.weight.unit || "kg"),
        },
        productCollections:
          data.productCollections && data.productCollections.length > 0
            ? data.productCollections.map((collection) => ({
                quantity: Number(collection.quantity),
                price: Number(collection.price),
                unit: collection.unit,
              }))
            : undefined,
        alertExpiry: data.alertExpiry ? Number(data.alertExpiry) : undefined,
        expiry: data.expiry ? new Date(data.expiry) : undefined,
        metaTitle: data.metaTitle?.trim() || undefined,
        metaDescription: data.metaDescription?.trim() || undefined,
        metaKeywords:
          data.metaKeywords && data.metaKeywords.length > 0
            ? data.metaKeywords
            : undefined,
        slug: data.slug?.trim() || undefined,
        isB2B: data.isB2B,
        dotd: data.dotd,
        pfy: data.pfy,
        isEssential: data.isEssential,
        reviewsCount: 0,
        totalRating: 0,
      };

      // Submit to backend
      const result = await productApi.create(productData);
      console.log("Product created successfully:", result);

      setSubmitSuccess(true);
      toast.success("Product created successfully!");

      // Redirect to inventory page after successful submission
      setTimeout(() => {
        router.push("/inventory");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <button
              onClick={() => router.push("/inventory")}
              className="p-1 hover:bg-gray-100 cursor-pointer rounded-md transition-colors"
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">Add Product</h1>
          </div>
          <p className="text-gray-500 mt-1 text-xs md:text-sm">
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
                  className={`flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 rounded-xl border border-dashed border-gray-400 bg-white p-4 md:p-8 transition-colors ${
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
                  <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                    <ImageIcon
                      className="w-14 h-14 md:w-24 md:h-24 text-sky-500"
                      strokeWidth={1.2}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    {uploadingImages ? (
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs md:text-sm text-gray-600 mb-2 font-medium">
                          Uploading Images...
                        </p>
                        {Object.keys(uploadProgress).length > 0 && (
                          <div className="w-32 md:w-48 bg-gray-200 rounded-full h-1.5 mb-2">
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
                        <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3 text-center font-medium">
                          Drag and Drop
                        </p>
                        <p className="text-xs text-gray-400 mb-2 md:mb-3 text-center">
                          or
                        </p>
                        <Button
                          variant="secondary"
                          icon={<Upload className="w-4 h-4" />}
                          className="text-xs md:text-sm"
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
                      watch("images").map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            width={120}
                            height={120}
                            loading="lazy"
                            unoptimized
                            quality={100}
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

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-gray-900">
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
                        HSN Code
                      </label>
                      <Input
                        variant="muted"
                        icon={<FileText className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter HSN code"
                        {...register("hsn")}
                      />
                      {errors.hsn && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.hsn.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Category *
                      </label>
                      <ActionDropdown
                        options={categoryOptions}
                        selectedValue={watch("categoryId")}
                        placeholder={
                          loadingCategories
                            ? "Loading categories..."
                            : "Select a category"
                        }
                        disabled={loadingCategories}
                        loading={loadingCategories}
                        onSelect={handleCategorySelect}
                        onEdit={handleCategoryEdit}
                        onDelete={handleCategoryDelete}
                        onAdd={() => {
                          setEditingCategory(null);
                          setShowCategoryModal(true);
                        }}
                        showActions={true}
                        showAddButton={true}
                        addButtonText="New"
                        error={errors.categoryId?.message}
                        hasMore={categoriesPagination.hasMore}
                        onLoadMore={loadMoreCategories}
                        loadingMore={loadingCategories}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Sub-category <span className="text-gray-500 text-xs">(Optional)</span>
                      </label>
                      <ActionDropdown
                        options={subcategoryOptions}
                        selectedValue={watch("subCategoryId")}
                        placeholder={
                          loadingSubcategories
                            ? "Loading subcategories..."
                            : !watch("categoryId")
                            ? "Select a category first"
                            : "Select a sub-category"
                        }
                        disabled={loadingSubcategories || !watch("categoryId")}
                        loading={loadingSubcategories}
                        onSelect={handleSubcategorySelect}
                        onEdit={handleSubcategoryEdit}
                        onDelete={handleSubcategoryDelete}
                        onAdd={() => {
                          setEditingSubcategory(null);
                          setShowSubcategoryModal(true);
                        }}
                        showActions={true}
                        showAddButton={true}
                        addButtonText="New"
                        error={errors.subCategoryId?.message}
                        hasMore={subcategoriesPagination.hasMore}
                        onLoadMore={loadMoreSubcategories}
                        loadingMore={loadingSubcategories}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Description *{" "}
                        <span className="text-gray-500 text-xs">
                          (min 10 characters, max 1000)
                        </span>
                      </label>
                      <textarea
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none bg-muted text-sm ${
                          watch("description") &&
                          watch("description").length > 0 &&
                          (watch("description").length < 10 ||
                            watch("description").length > 1000)
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-gray-400"
                        }`}
                        placeholder="Enter product description (minimum 10 characters, maximum 1000)"
                        {...register("description", {
                          required: "Description is required",
                          minLength: {
                            value: 10,
                            message: "Description must be at least 10 characters long",
                          },
                          maxLength: {
                            value: 1000,
                            message: "Description must be less than 1000 characters",
                          },
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
                            watch("description").length > 1000 && (
                              <p className="text-red-500 text-xs">
                                Description must be less than 1000 characters
                              </p>
                            )}
                        </div>
                        <span
                          className={`text-xs ${
                            watch("description") &&
                            watch("description").length > 0 &&
                            (watch("description").length < 10 ||
                              watch("description").length > 1000)
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          <Input
                            variant="muted"
                            placeholder="Highlight key (e.g., Material)"
                            value={highlightKeyInput}
                            onChange={(e) =>
                              setHighlightKeyInput(e.target.value)
                            }
                            className="text-xs md:text-sm"
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
                            className="text-xs md:text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={addHighlight}
                              icon={<Plus className="w-4 h-4" />}
                              className={`flex-1 text-xs md:text-sm font-medium transition-all ${
                                editingHighlightIndex !== null
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : ""
                              }`}
                            >
                              {editingHighlightIndex !== null ? "Update Highlight" : "Add Highlight"}
                            </Button>
                            {editingHighlightIndex !== null && (
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={cancelEditHighlight}
                                className="text-xs md:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                        {highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {highlights.map((highlight, index) => (
                              <div
                                key={index}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                                  editingHighlightIndex === index
                                    ? "bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-200"
                                    : "bg-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-sm"
                                }`}
                              >
                                <span className="text-xs font-medium text-blue-900">
                                  <strong>{highlight.key}:</strong>{" "}
                                  {highlight.value}
                                </span>
                                <div className="flex items-center gap-1 ml-1">
                                  <button
                                    type="button"
                                    onClick={() => editHighlight(index)}
                                    className="p-1 rounded hover:bg-blue-200 text-blue-700 hover:text-blue-900 transition-colors"
                                    title="Edit highlight"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeHighlight(index)}
                                    className="p-1 rounded hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                                    title="Remove highlight"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
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

                {/* Pricing Information */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-gray-900">
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
                        GST (Goods and Services Tax) %
                      </label>
                      <Controller
                        name="gst"
                        control={control}
                        rules={{
                          min: { value: 0, message: "GST must be positive" },
                          max: {
                            value: 100,
                            message: "GST cannot exceed 100%",
                          },
                        }}
                        render={({ field }) => (
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              <Percent className="w-4 h-4" />
                            </div>
                            <select
                              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-muted text-sm"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              value={field.value || 0}
                            >
                              <option value={0}>0%</option>
                              <option value={5}>5%</option>
                              <option value={18}>18%</option>
                              <option value={40}>40%</option>
                            </select>
                          </div>
                        )}
                      />
                      {errors.gst && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.gst.message}
                        </p>
                      )}
                    </div>

                    {/* Discount Toggle */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={showDiscountFields}
                          onChange={(e) =>
                            handleDiscountToggle(e.target.checked)
                          }
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

                    {/* Discount Fields - Only show when checkbox is checked */}
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
                                  icon={<Tag className="w-4 h-4" />}
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
                            {errors.discount?.value && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.discount.value.message}
                              </p>
                            )}
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
                                  placeholder="Select start date"
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
                                  placeholder="Select end date"
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

                  {/* Pricing Ranges */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h4 className="text-sm md:text-md font-medium text-gray-900">
                        Pricing Ranges
                      </h4>
                      <p className="text-xs md:text-sm text-gray-500">
                        Set different prices based on quantity ranges
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-medium text-gray-700">
                          Quantity Start
                        </label>
                        <Input
                          variant="muted"
                          icon={<Package className="w-4 h-4" />}
                          className="text-xs md:text-sm"
                          placeholder="Start quantity"
                          type="number"
                          value={newPricingRange.quantity_start}
                          onChange={(e) =>
                            setNewPricingRange({
                              ...newPricingRange,
                              quantity_start: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-medium text-gray-700">
                          Quantity End
                        </label>
                        <Input
                          variant="muted"
                          icon={<Package className="w-4 h-4" />}
                          className="text-xs md:text-sm"
                          placeholder="End quantity"
                          type="number"
                          value={newPricingRange.quantity_end}
                          onChange={(e) =>
                            setNewPricingRange({
                              ...newPricingRange,
                              quantity_end: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <Input
                          variant="muted"
                          icon={<IndianRupee className="w-4 h-4" />}
                          className="text-xs md:text-sm"
                          placeholder="Price for this range"
                          type="number"
                          step="0.01"
                          value={newPricingRange.price}
                          onChange={(e) =>
                            setNewPricingRange({
                              ...newPricingRange,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-medium text-gray-700">
                          Action
                        </label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={addPricingRange}
                            icon={<Plus className="w-4 h-4" />}
                            className={`flex-1 text-xs md:text-sm font-medium transition-all ${
                              editingPricingRangeIndex !== null
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : ""
                            }`}
                          >
                            {editingPricingRangeIndex !== null ? "Update Range" : "Add Range"}
                          </Button>
                          {editingPricingRangeIndex !== null && (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={cancelEditPricingRange}
                              className="text-xs md:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pricing Ranges List */}
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
                                className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-lg border transition-all ${
                                  editingPricingRangeIndex === index
                                    ? "bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-200"
                                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                }`}
                              >
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <p className="text-xs font-medium text-gray-700">
                                        Quantity Range
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {range.quantity_start} - {range.quantity_end}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <p className="text-xs font-medium text-gray-700">
                                        Price
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900">
                                        ₹{range.price}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => editPricingRange(index)}
                                    icon={<Edit className="w-4 h-4" />}
                                    className={`px-3 py-2 text-xs font-medium transition-all ${
                                      editingPricingRangeIndex === index
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                    }`}
                                    title="Edit pricing range"
                                  >
                                    {editingPricingRangeIndex === index ? "Editing..." : "Edit"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => removePricingRange(index)}
                                    icon={<X className="w-4 h-4" />}
                                    className="px-3 py-2 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all"
                                    title="Remove pricing range"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Inventory Information */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-gray-900">
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <Input
                        variant="muted"
                        icon={<Calendar className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Select expiry date"
                        type="date"
                        {...register("expiry")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Alert Before Expiry (Days)
                      </label>
                      <Input
                        variant="muted"
                        icon={<Calendar className="w-4 h-4" />}
                        className="text-sm"
                        placeholder="Enter days before expiry"
                        type="number"
                        {...register("alertExpiry", {
                          min: { value: 1, message: "Must be at least 1 day" },
                        })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            {...register("isB2B")}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            B2B Product
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            {...register("dotd")}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Deal of the Day
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            {...register("pfy")}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Pick for You
                          </span>
                        </label>
                      </div>
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
                      <Controller
                        name="weight.value"
                        control={control}
                        rules={{
                          required: "Weight value is required",
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
                      <Controller
                        name="weight.unit"
                        control={control}
                        rules={{
                          required: "Weight unit is required",
                        }}
                        render={({ field }) => (
                          <Input
                            variant="muted"
                            className="text-sm"
                            placeholder="e.g., kg, g, lb, oz, packets"
                            {...field}
                          />
                        )}
                      />
                      {errors.weight?.unit && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.weight.unit.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collection Information */}
                {false && (
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-gray-900">
                    Collection Information
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    Add different collection options for this product (e.g.,
                    5kg, 2 packets, etc.)
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <Input
                          variant="muted"
                          icon={<Package className="w-4 h-4" />}
                          className="text-xs md:text-sm"
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
                        <label className="text-xs md:text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <Input
                          variant="muted"
                          icon={<IndianRupee className="w-4 h-4" />}
                          className="text-xs md:text-sm"
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
                        <label className="text-xs md:text-sm font-medium text-gray-700">
                          Unit
                        </label>
                        <Input
                          variant="muted"
                          icon={<Weight className="w-4 h-4" />}
                          className="text-xs md:text-sm"
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
                        <label className="text-xs md:text-sm font-medium text-gray-700">
                          Action
                        </label>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addCollection}
                          icon={<Plus className="w-4 h-4" />}
                          className="w-full text-xs md:text-sm"
                        >
                          Add Collection
                        </Button>
                      </div>
                    </div>

                    {/* Collection List */}
                    {productCollections.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Added Collections
                        </label>
                        <div className="space-y-2">
                          {productCollections.map((collection, index) => (
                            <div
                              key={index}
                              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
                )}

                {/* SEO Information */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-gray-900">
                        SEO Information
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        Generate SEO fields automatically from product name
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={autoGenerateSEO}
                      icon={<Search className="w-4 h-4" />}
                      className="w-full sm:w-auto"
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

                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push("/inventory")}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? "Adding Product..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Category Creation/Edit Modal */}
        {showCategoryModal && (
          <CreateCategoryModal
            initialData={editingCategory}
            onClose={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
            }}
            onCreate={handleCreateCategory}
            onUpdate={handleUpdateCategory}
            onImageUpload={handleCategoryImageUpload}
            isUploading={uploadingCategoryImage}
          />
        )}

        {/* Subcategory Creation/Edit Modal */}
        {showSubcategoryModal && (
          <CreateSubcategoryModal
            categories={categories}
            selectedCategoryId={watch("categoryId")}
            initialData={editingSubcategory}
            onClose={() => {
              setShowSubcategoryModal(false);
              setEditingSubcategory(null);
            }}
            onCreate={handleCreateSubcategory}
            onUpdate={handleUpdateSubcategory}
            onImageUpload={handleCategoryImageUpload}
            isUploading={uploadingSubcategoryImage}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && itemToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-lg font-semibold mb-4 text-red-600">
                Confirm Delete
              </h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this {itemToDelete.type}? This
                action cannot be undone.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mb-6">
                <p className="text-sm font-medium text-gray-900">
                  {itemToDelete.item.name}
                </p>
                {itemToDelete.item.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {itemToDelete.item.description}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete{" "}
                  {itemToDelete.type === "category"
                    ? "Category"
                    : "Sub-category"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Category Creation/Edit Modal Component
function CreateCategoryModal({
  initialData,
  onClose,
  onCreate,
  onUpdate,
  onImageUpload,
  isUploading,
}: {
  initialData?: any;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    slug: string;
    image?: string;
    showOnHomepage: boolean;
  }) => void;
  onUpdate: (data: {
    name: string;
    description: string;
    slug: string;
    image?: string;
    showOnHomepage: boolean;
  }) => void;
  onImageUpload: (
    file: File,
    type: "category" | "subcategory"
  ) => Promise<string | null>;
  isUploading: boolean;
}) {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    slug: initialData?.slug || "",
    image: initialData?.image || "",
    showOnHomepage: initialData?.showOnHomepage || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.image || null
  );

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        slug: initialData.slug || "",
        image: initialData.image || "",
        showOnHomepage: initialData.showOnHomepage || false,
      });
      setPreviewImage(initialData.image || null);
    } else {
      setFormData({
        name: "",
        description: "",
        slug: "",
        image: "",
        showOnHomepage: false,
      });
      setPreviewImage(null);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;

    // Validate description length if provided
    if (formData.description && formData.description.length > 0 && formData.description.length < 10) {
      toast.error("Description must be at least 10 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditMode) {
        await onUpdate(formData);
      } else {
        await onCreate(formData);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} category:`, error);
      toast.error(
        error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "create"} category`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = await onImageUpload(file, "category");
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        setPreviewImage(imageUrl);
      }
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setPreviewImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">
          {isEditMode ? "Edit Category" : "Create Category"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <Input
              variant="muted"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *{" "}
              <span className="text-gray-500 text-xs">(min 10 characters)</span>
            </label>
            <textarea
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none bg-muted text-sm ${
                formData.description.length > 0 &&
                formData.description.length < 10
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-gray-400"
              }`}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter category description (minimum 10 characters)"
              rows={3}
              required
            />
            <div className="flex justify-between items-center mt-1">
              <span
                className={`text-xs ${
                  formData.description.length > 0 &&
                  formData.description.length < 10
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {formData.description.length > 0 &&
                formData.description.length < 10
                  ? "Description must be at least 10 characters long"
                  : `${formData.description.length} characters`}
              </span>
            </div>
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <Input
              variant="muted"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="Enter URL slug"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.showOnHomepage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    showOnHomepage: e.target.checked,
                  }))
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Show on Homepage
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image
            </label>

            {/* Image Upload Area */}
            <div
              className={`flex items-center justify-center gap-4 rounded-xl border border-dashed border-gray-400 bg-white p-6 transition-colors ${
                isUploading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer"
              }`}
              onClick={() =>
                !isUploading &&
                document.getElementById("category-file-upload")?.click()
              }
            >
              {previewImage ? (
                <div className="relative group">
                  <Image
                    src={previewImage}
                    alt="Category preview"
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    loading="lazy"
                    unoptimized
                    quality={100}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {isUploading ? (
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
                        Upload Image
                      </p>
                      <p className="text-xs text-gray-400 text-center">
                        Click to select or drag & drop
                      </p>
                    </>
                  )}
                </div>
              )}
              <input
                id="category-file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                aria-label="Upload category image"
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Category"
                : "Create Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcategory Creation/Edit Modal Component
function CreateSubcategoryModal({
  categories,
  selectedCategoryId,
  initialData,
  onClose,
  onCreate,
  onUpdate,
  onImageUpload,
  isUploading,
}: {
  categories: any[];
  selectedCategoryId: string;
  initialData?: any;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    parentCategoryId: string;
    slug: string;
    image?: string;
  }) => void;
  onUpdate: (data: {
    name: string;
    description: string;
    parentCategoryId: string;
    slug: string;
    image?: string;
  }) => void;
  onImageUpload: (
    file: File,
    type: "category" | "subcategory"
  ) => Promise<string | null>;
  isUploading: boolean;
}) {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    parentCategoryId: initialData?.parentCategory || selectedCategoryId || "",
    slug: initialData?.slug || "",
    image: initialData?.image || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.image || null
  );

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        parentCategoryId: initialData.parentCategory || selectedCategoryId || "",
        slug: initialData.slug || "",
        image: initialData.image || "",
      });
      setPreviewImage(initialData.image || null);
    } else {
      setFormData({
        name: "",
        description: "",
        parentCategoryId: selectedCategoryId || "",
        slug: "",
        image: "",
      });
      setPreviewImage(null);
    }
  }, [initialData, selectedCategoryId]);

  // Update parentCategoryId when selectedCategoryId changes (only in create mode)
  useEffect(() => {
    if (!isEditMode && selectedCategoryId) {
      setFormData((prev) => ({
        ...prev,
        parentCategoryId: selectedCategoryId,
      }));
    }
  }, [selectedCategoryId, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.parentCategoryId ||
      !formData.slug
    )
      return;

    // Validate description length if provided
    if (formData.description && formData.description.length > 0 && formData.description.length < 10) {
      toast.error("Description must be at least 10 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditMode) {
        await onUpdate(formData);
      } else {
        await onCreate(formData);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} subcategory:`, error);
      toast.error(
        error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "create"} subcategory`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = await onImageUpload(file, "subcategory");
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        setPreviewImage(imageUrl);
      }
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setPreviewImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">
          {isEditMode ? "Edit Sub-category" : "Create Sub-category"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-muted text-sm"
              value={formData.parentCategoryId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  parentCategoryId: e.target.value,
                }))
              }
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <Input
              variant="muted"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter sub-category name"
              required
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *{" "}
              <span className="text-gray-500 text-xs">(min 10 characters)</span>
            </label>
            <textarea
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none bg-muted text-sm ${
                formData.description.length > 0 &&
                formData.description.length < 10
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-gray-400"
              }`}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter sub-category description (minimum 10 characters)"
              rows={3}
              required
            />
            <div className="flex justify-between items-center mt-1">
              <span
                className={`text-xs ${
                  formData.description.length > 0 &&
                  formData.description.length < 10
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {formData.description.length > 0 &&
                formData.description.length < 10
                  ? "Description must be at least 10 characters long"
                  : `${formData.description.length} characters`}
              </span>
            </div>
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <Input
              variant="muted"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="Enter URL slug"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub-category Image
            </label>

            {/* Image Upload Area */}
            <div
              className={`flex items-center justify-center gap-4 rounded-xl border border-dashed border-gray-400 bg-white p-6 transition-colors ${
                isUploading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer"
              }`}
              onClick={() =>
                !isUploading &&
                document.getElementById("subcategory-file-upload")?.click()
              }
            >
              {previewImage ? (
                <div className="relative group">
                  <Image
                    src={previewImage}
                    alt="Sub-category preview"
                    width={80}
                    height={80}
                    loading="lazy"
                    unoptimized
                    quality={100}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {isUploading ? (
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
                        Upload Image
                      </p>
                      <p className="text-xs text-gray-400 text-center">
                        Click to select or drag & drop
                      </p>
                    </>
                  )}
                </div>
              )}
              <input
                id="subcategory-file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                aria-label="Upload sub-category image"
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Sub-category"
                : "Create Sub-category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
