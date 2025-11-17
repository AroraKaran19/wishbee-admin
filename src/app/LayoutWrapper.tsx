"use client";
import React, { useEffect, useState } from "react";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  return isClient ? children : null;
};

export default LayoutWrapper;
