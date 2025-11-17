import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Add Product | Wishbee",
  description: "Add Product | Wishbee",
  openGraph: {
    title: "Add Product | Wishbee",
    description: "Add Product | Wishbee",
    url: "https://admin.wishbee.in/inventory/add/product",
    type: "website",
    images: [{ url: "https://admin.wishbee.in/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Product | Wishbee",
    description: "Add Product | Wishbee",
    images: [{ url: "https://admin.wishbee.in/logo.png" }],
  },
  metadataBase: new URL("https://admin.wishbee.in"),
};

const ProductAddLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default ProductAddLayout;
