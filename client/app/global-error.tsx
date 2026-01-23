"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
          <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
          <p className="mb-8 text-gray-600">
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
