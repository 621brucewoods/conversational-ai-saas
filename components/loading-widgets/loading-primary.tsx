import React from "react";
import useLoadingStore from "@/stores/use-loading-store";

const LoadingWidget = () => {
  const { isLoading, isLocal } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-muted opacity-70 z-[1000] h-full w-full"></div>
      {/* Spinner */}
      <div className="absolute inset-0 flex items-center justify-center z-[2000] h-full w-full">
        <div className="inline-block w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </>
  );
};

export default LoadingWidget;
