import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";

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
    url: "https://wishbee-admin.vercel.app",
    type: "website",
    images: [{ url: "https://wishbee-admin.vercel.app/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wishbee - Admin Dashboard",
    description: "Wishbee - Admin Dashboard",
    images: [{ url: "https://wishbee-admin.vercel.app/logo.png" }],
  },
  metadataBase: new URL("https://wishbee-admin.vercel.app"),
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
      >
        {children}
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
