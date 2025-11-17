import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "./LayoutWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Wishbee - Admin Dashboard",
  description: "Wishbee - Admin Dashboard",
  openGraph: {
    title: "Wishbee - Admin Dashboard",
    description: "Wishbee - Admin Dashboard",
    url: "https://admin.wishbee.in",
    type: "website",
    images: [{ url: "https://admin.wishbee.in/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wishbee - Admin Dashboard",
    description: "Wishbee - Admin Dashboard",
    images: [{ url: "https://admin.wishbee.in/logo.png" }],
  },
  metadataBase: new URL("https://admin.wishbee.in"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased ${poppins.className} relative overflow-x-hidden custom-scrollbar`}
        suppressHydrationWarning
      >
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              style: {
                background: "#10B981",
                color: "#fff",
              },
            },
            error: {
              duration: 5000,
              style: {
                background: "#EF4444",
                color: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
