import React from "react";
import chroma from "chroma-js";
import useMapLegendStore from "../../../stores/use-map-legend-store";

interface LegendProps {
  layerFunctionType: string;
  layerName: string;
}

// ---------------------------------
// 1. Helper: Generate color gradient
// ---------------------------------
function generateColorGradient(min: number, max: number, palette: string[]) {
  const scale = chroma.scale(palette).domain([min, max]);
  const gradientColors = Array.from({ length: 100 }, (_, i) =>
    scale(min + (i / 99) * (max - min)).hex()
  );
  return `linear-gradient(to right, ${gradientColors.join(", ")})`;
}

// ---------------------------------
// 2. Helper: Legend Container
// ---------------------------------
interface LegendContainerProps {
  title?: string;
  children: React.ReactNode;
}

function LegendContainer({ title, children }: LegendContainerProps) {
  return (
    <div className="p-2 rounded-md">
      {title && <h4 className="mb-2 font-medium">{title}</h4>}
      {children}
    </div>
  );
}

// ---------------------------------
// 3. Individual Legend Components
// ---------------------------------
const LSTLegend: React.FC<{ min: number; max: number; palette: string[] }> = ({
  min,
  max,
  palette,
}) => {
  const gradient = generateColorGradient(min, max, palette);

  return (
    <LegendContainer>
      <div className="flex items-center justify-between">
        <span>{min.toFixed(2)}°C</span>
        <div className="mx-2 flex-grow h-5" style={{ background: gradient }} />
        <span>{max.toFixed(2)}°C</span>
      </div>
    </LegendContainer>
  );
};

const LCLULegend: React.FC<{ labelNames: string[]; palette: string[] }> = ({
  labelNames,
  palette,
}) => {
  return (
    <LegendContainer>
      <ul>
        {labelNames.map((className, index) => (
          <li key={index} className="flex items-center mb-1">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: palette[index] }}
            />
            {className}
          </li>
        ))}
      </ul>
    </LegendContainer>
  );
};

const CoastlineMapLegend: React.FC<{
  labelNames: string[];
  palette: string[];
}> = ({ labelNames, palette }) => {
  return (
    <LegendContainer>
      {labelNames.map((label, index) => (
        <div key={index} className="flex items-center mb-1">
          <div
            className="w-5 h-0 mr-2 border-t-4"
            style={{ borderColor: palette[index] }}
          />
          <span>{label}</span>
        </div>
      ))}
    </LegendContainer>
  );
};

const AirPollutantsAnalysisMapLegend: React.FC<{
  min: number;
  max: number;
  palette: string[];
}> = ({ min, max, palette }) => {
  const gradient = generateColorGradient(min, max, palette);

  return (
    <LegendContainer>
      <div className="flex items-center justify-between">
        <span>Min</span>
        <div className="mx-2 flex-grow h-5" style={{ background: gradient }} />
        <span>High</span>
      </div>
    </LegendContainer>
  );
};

const COLegend: React.FC<{ min: number; max: number; palette: string[] }> = ({
  min,
  max,
  palette,
}) => {
  const gradient = generateColorGradient(min, max, palette);

  return (
    <LegendContainer title="mol/m²">
      <div className="flex items-center justify-between">
        <span>{min.toExponential(2)}</span>
        <div className="mx-2 flex-grow h-5" style={{ background: gradient }} />
        <span>{max.toExponential(2)}</span>
      </div>
    </LegendContainer>
  );
};

const NO2Legend: React.FC<{ min: number; max: number; palette: string[] }> = ({
  min,
  max,
  palette,
}) => {
  const gradient = generateColorGradient(min, max, palette);

  return (
    <LegendContainer title="mol/m²">
      <div className="flex items-center justify-between">
        <span>{min.toExponential(2)}</span>
        <div className="mx-2 flex-grow h-5" style={{ background: gradient }} />
        <span>{max.toExponential(3)}</span>
      </div>
    </LegendContainer>
  );
};

const SusceptibilityMapLegend: React.FC<{
  min: number;
  max: number;
  palette: string[];
}> = ({ min, max, palette }) => {
  const gradient = generateColorGradient(min, max, palette);

  return (
    <LegendContainer title="Vulnerability score (0-100)">
      <div className="flex items-center justify-between">
        <span>{min}</span>
        <div className="mx-2 flex-grow h-5" style={{ background: gradient }} />
        <span>{max}</span>
      </div>
    </LegendContainer>
  );
};

const DefaultLegend: React.FC = () => {
  return (
    <LegendContainer title="Default Legend">
      <p>No specific legend available.</p>
    </LegendContainer>
  );
};

// ---------------------------------
// 4. Main Legend Switch
// ---------------------------------
const Legend: React.FC<LegendProps> = ({ layerFunctionType, layerName }) => {
  const legend = useMapLegendStore((state) => state.getLegend(layerName));

  // If no legend config is found, show nothing (or show DefaultLegend)
  if (!legend) return null;

  const { min, max, palette, labelNames } = legend.config;

  if (
    layerFunctionType === "Urban Heat Island (UHI) Analysis" &&
    min !== undefined &&
    max !== undefined &&
    palette
  ) {
    return <LSTLegend min={min} max={max} palette={palette} />;
  }

  if (
    layerFunctionType === "Bi-Temporal Coastline Analysis" &&
    labelNames &&
    palette
  ) {
    return <CoastlineMapLegend labelNames={labelNames} palette={palette} />;
  }

  if (
    (layerFunctionType === "Land Use/Land Cover Maps" ||
      layerFunctionType === "Land Use/Land Cover Change Maps") &&
    labelNames &&
    palette
  ) {
    return <LCLULegend labelNames={labelNames} palette={palette} />;
  }

  if (
    layerFunctionType === "CO Emissions Analysis" &&
    min !== undefined &&
    max !== undefined &&
    palette
  ) {
    return <COLegend min={min} max={max} palette={palette} />;
  }

  if (
    layerFunctionType === "NO2 Emissions Analysis" &&
    min !== undefined &&
    max !== undefined &&
    palette
  ) {
    return <NO2Legend min={min} max={max} palette={palette} />;
  }

  if (
    layerFunctionType === "Air Pollutants Analysis" &&
    min !== undefined &&
    max !== undefined &&
    palette
  ) {
    return (
      <AirPollutantsAnalysisMapLegend min={min} max={max} palette={palette} />
    );
  }

  if (
    layerFunctionType === "Vulnerability Map Builder" &&
    min !== undefined &&
    max !== undefined &&
    palette
  ) {
    return <SusceptibilityMapLegend min={min} max={max} palette={palette} />;
  }

  // Fallback if no match
  return <DefaultLegend />;
};

export default Legend;
