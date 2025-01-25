import React from "react";

interface LoadingWidgetForContainerProps {
  loadingSize: "xs" | "sm" | "md" | "lg" | "xl";
  color?:
    | "white"
    | "blue"
    | "red"
    | "green"
    | "yellow"
    | "gray"
    | "purple"
    | "pink";
}

const LoadingWidgetForContainer: React.FC<LoadingWidgetForContainerProps> = ({
  loadingSize = "sm",
  color = "white",
}) => {
  // Define size mappings
  const sizeClasses = {
    xs: "w-4 h-4 border-2",
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-10 h-10 border-4",
    xl: "w-12 h-12 border-4",
  };

  // Define color mappings
  const colorClasses = {
    white: "border-white",
    blue: "border-blue-500",
    red: "border-red-500",
    green: "border-green-500",
    yellow: "border-yellow-500",
    gray: "border-gray-500",
    purple: "border-purple-500",
    pink: "border-pink-500",
  };

  return (
    <div
      className={`inline-block rounded-full border-t-transparent animate-spin ${sizeClasses[loadingSize]} ${colorClasses[color]}`}
    ></div>
  );
};

export default LoadingWidgetForContainer;
