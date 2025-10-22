import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Add Product | Wishbee",
  description: "Add Product | Wishbee",
  openGraph: {
    title: "Add Product | Wishbee",
    description: "Add Product | Wishbee",
    url: "https://wishbee-admin.vercel.app/inventory/add/product",
    type: "website",
    images: [{ url: "https://wishbee-admin.vercel.app/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Product | Wishbee",
    description: "Add Product | Wishbee",
    images: [{ url: "https://wishbee-admin.vercel.app/logo.png" }],
  },
  metadataBase: new URL("https://wishbee-admin.vercel.app"),
};

const ProductAddLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default ProductAddLayout;
