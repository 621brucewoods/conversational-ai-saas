"use client";

import React from "react";
import Image from "next/image";
import { Tooltip } from "react-tooltip";

const thumbnailImages = [
  { src: "/images/air_quality.webp", tooltip: "Air Quality Analysis" },
  {
    src: "/images/landcover_landuse.webp",
    tooltip: "Land-Use/Land-Cover Mapping",
  },
  { src: "/images/risk_map.webp", tooltip: "Risk Assessment" },
];

const ThumbnailsAnalysisSuggestions = () => {
  return (
    <>
      <div className="flex justify-center">
        {thumbnailImages.map((image, index) => (
          <div
            key={index}
            className="m-2 text-xs shadow-lg hover:scale-125 rounded-2xl cursor-pointer transition-transform duration-500"
            style={{ width: "100px", height: "100px" }}
            data-tooltip-id={`tooltip-${index}`}
            data-tooltip-content={image.tooltip}
          >
            <Image
              src={image.src}
              alt="Thumbnail"
              width={100}
              height={100}
              className="rounded-2xl w-full h-full object-contain"
            />
          </div>
        ))}
        <div
          className="m-2 bg-base-200 text-xs border border-base-300 bg-opacity-50 rounded-2xl shadow-lg hover:scale-125 cursor-pointer transition-transform duration-500 flex justify-center items-center"
          style={{ width: "100px", height: "100px" }}
          data-tooltip-id="explore-more"
          data-tooltip-content="Explore additional features"
        >
          <p className="text-center">Explore more...</p>
        </div>
      </div>

      <Tooltip
        place="top"
        style={{
          backgroundColor: "white",
          color: "black",
          position: "fixed",
          zIndex: 10000,
          padding: "8px",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          fontWeight: "600",
        }}
      />
    </>
  );
};

export default ThumbnailsAnalysisSuggestions;
