"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { status, isLoading } = useSessionStore();
  const hasRedirected = useRef(false);
  useSessionManager(); // Initialize session management

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) {
      return;
    }

    if (!isLoading) {
      hasRedirected.current = true;
      if (status === "authenticated") {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isLoading, status, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
