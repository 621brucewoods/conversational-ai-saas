"use client";
import React, { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";

// Full list of analysis suggestions
const fullAnalysisSuggestions = [
  "Land cover mapping",
  "Methane monitoring",
  "Urban heat island analysis",
  "Flood risk analysis",
  "Vegetation health monitoring",
  "Air quality prediction",
  "Soil moisture estimation",
  "Drought assessment",
  "Wildfire risk mapping",
  "Biodiversity tracking",
];

// Array of gentle pastel colors
const pastelColors = [
  "rgba(255, 179, 186, .8)", // Very Light Pink
  "rgba(255, 223, 186, .8)", // Very Light Orange
  "rgba(255, 255, 186, .8)", // Very Light Yellow
  "rgba(186, 255, 201, .8)", // Very Light Green
  "rgba(186, 225, 255, .8)", // Very Light Blue
];

// Helper function to get random elements from an array
const getRandomElements = <T,>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => Math.random() - 0.5); // Shuffle array
  return shuffled.slice(0, count); // Take the first `count` elements
};

const TextAnalysisSuggestions = () => {
  const [randomSuggestions, setRandomSuggestions] = useState<
    { suggestion: string; color: string }[]
  >([]);

  // Select 3 random suggestions and colors on component mount
  useEffect(() => {
    const suggestions = getRandomElements(fullAnalysisSuggestions, 3);
    const colors = getRandomElements(pastelColors, 3);
    const randomizedData = suggestions.map((suggestion, index) => ({
      suggestion,
      color: colors[index % colors.length],
    }));
    setRandomSuggestions(randomizedData);
  }, []);

  return (
    <>
      <div className="flex items-center justify-center">
        {randomSuggestions.map(({ suggestion, color }, index) => (
          <div
            key={index}
            className="py-2 px-3 m-2 text-xs rounded-2xl border border-stone-300 dark:border-stone-600 cursor-pointer hover:scale-105 transition-all"
            style={{
              backgroundColor: color.replace(".8)", "0.2)"),
            }}
            data-tooltip-id={`tooltip-${index}`}
            data-tooltip-content="Use this prompt"
          >
            {suggestion}
          </div>
        ))}
      </div>

      {/* Render Tooltips */}
      {randomSuggestions.map((_, index) => (
        <Tooltip
          key={index}
          id={`tooltip-${index}`}
          place="top"
          style={{
            backgroundColor: "white",
            color: "black",
            position: "fixed",
            zIndex: 10000,
            padding: "8px",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        />
      ))}
    </>
  );
};

export default TextAnalysisSuggestions;
