"use client";

import { useEffect } from "react";

export default function ReactGrabProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    void import("react-grab").catch((error) => {
      console.error("Failed to load react-grab:", error);
    });
  }, []);

  return null;
}
