"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function MediaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MediaPage error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <AlertTriangle className="w-8 h-8 text-zinc-600" />
        <div>
          <p className="text-white text-sm font-semibold">Something went wrong</p>
          <p className="text-zinc-500 text-xs mt-1">Failed to load the media page.</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm transition-colors"
        >
          <RefreshCw size={13} /> Try again
        </button>
      </div>
    </div>
  );
}
