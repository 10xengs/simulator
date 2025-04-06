// src/components/UserResourceConfig.tsx
import React, { useState } from "react";
import { UserResources } from "./Simulator";

interface UserResourceConfigProps {
  userResources: UserResources;
  setUserResources: React.Dispatch<React.SetStateAction<UserResources>>;
}

const UserResourceConfig: React.FC<UserResourceConfigProps> = ({
  userResources,
  setUserResources,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: keyof UserResources, value: number) => {
    setUserResources((prev) => ({ ...prev, [key]: value }));
  };

  // Ensure values are defined with defaults if needed
  const safeResources = {
    cpu: userResources?.cpu ?? 2,
    memory: userResources?.memory ?? 4,
    diskIO: userResources?.diskIO ?? 50,
    networkIO: userResources?.networkIO ?? 100,
    storage: userResources?.storage ?? 100,
    statsdInstances: userResources?.statsdInstances ?? 1,
    carbonInstances: userResources?.carbonInstances ?? 1,
  };

  // Custom slider styles
  const sliderTrackClass =
    "w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer";
  const sliderLabelClass =
    "block text-base text-gray-700 mb-2 font-light flex justify-between";
  const sliderValueClass = "font-medium text-blue-600";
  const sliderMarkersClass = "flex justify-between text-xs text-gray-400 mt-1";
  const sliderDescriptionClass = "text-xs text-gray-500 mt-1.5 leading-relaxed";

  return (
    <div className="space-y-5">
      {/* CPU Slider */}
      <div className="group transition-all duration-200">
        <label className={sliderLabelClass}>
          <span>CPU Cores</span>
          <span className={sliderValueClass}>{safeResources.cpu}</span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="32"
            step="1"
            value={safeResources.cpu}
            onChange={(e) => handleChange("cpu", Number(e.target.value))}
            className={`${sliderTrackClass} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 group-hover:[&::-webkit-slider-thumb]:scale-110`}
            aria-label={`CPU Cores: ${safeResources.cpu}`}
          />
        </div>
        <div className={sliderMarkersClass}>
          <span>1</span>
          <span>16</span>
          <span>32</span>
        </div>
        <div className={sliderDescriptionClass}>
          Number of CPU cores available for processing. Affects query
          performance and dashboard calculations.
        </div>
      </div>

      {/* Memory Slider */}
      <div className="group transition-all duration-200">
        <label className={sliderLabelClass}>
          <span>Memory (GB)</span>
          <span className={sliderValueClass}>{safeResources.memory}</span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="64"
            step="1"
            value={safeResources.memory}
            onChange={(e) => handleChange("memory", Number(e.target.value))}
            className={`${sliderTrackClass} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 group-hover:[&::-webkit-slider-thumb]:scale-110`}
            aria-label={`Memory: ${safeResources.memory} GB`}
          />
        </div>
        <div className={sliderMarkersClass}>
          <span>1</span>
          <span>32</span>
          <span>64</span>
        </div>
        <div className={sliderDescriptionClass}>
          RAM available for caching and processing. More memory helps with
          high-volume metric processing and query performance.
        </div>
      </div>

      {/* Storage Slider */}
      <div className="group transition-all duration-200">
        <label className={sliderLabelClass}>
          <span>Storage (GB)</span>
          <span className={sliderValueClass}>{safeResources.storage}</span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="10"
            max="5000"
            step="10"
            value={safeResources.storage}
            onChange={(e) => handleChange("storage", Number(e.target.value))}
            className={`${sliderTrackClass} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 group-hover:[&::-webkit-slider-thumb]:scale-110`}
            aria-label={`Storage: ${safeResources.storage} GB`}
          />
        </div>
        <div className={sliderMarkersClass}>
          <span>10 GB</span>
          <span>1 TB</span>
          <span>5 TB</span>
        </div>
        <div className={sliderDescriptionClass}>
          Disk space for storing metrics. Required space depends on retention
          period and number of unique metrics.
        </div>
      </div>

      {/* StatsD Instances */}
      <div className="group transition-all duration-200">
        <label className={sliderLabelClass}>
          <span>Collector Instances</span>
          <span className={sliderValueClass}>
            {safeResources.statsdInstances}
          </span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={safeResources.statsdInstances}
            onChange={(e) =>
              handleChange("statsdInstances", Number(e.target.value))
            }
            className={`${sliderTrackClass} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 group-hover:[&::-webkit-slider-thumb]:scale-110`}
            aria-label={`Collector Instances: ${safeResources.statsdInstances}`}
          />
        </div>
        <div className={sliderMarkersClass}>
          <span>1</span>
          <span>10</span>
          <span>20</span>
        </div>
        <div className={sliderDescriptionClass}>
          Number of StatsD collector instances. Each instance can handle ~20K
          metrics/sec. Scale up for high-volume metrics.
        </div>
      </div>

      {/* Carbon Instances */}
      <div className="group transition-all duration-200">
        <label className={sliderLabelClass}>
          <span>Processor Instances</span>
          <span className={sliderValueClass}>
            {safeResources.carbonInstances}
          </span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={safeResources.carbonInstances}
            onChange={(e) =>
              handleChange("carbonInstances", Number(e.target.value))
            }
            className={`${sliderTrackClass} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 group-hover:[&::-webkit-slider-thumb]:scale-110`}
            aria-label={`Processor Instances: ${safeResources.carbonInstances}`}
          />
        </div>
        <div className={sliderMarkersClass}>
          <span>1</span>
          <span>10</span>
          <span>20</span>
        </div>
        <div className={sliderDescriptionClass}>
          Number of Carbon processor instances. Each handles writes to the
          storage. More instances help with I/O bottlenecks.
        </div>
      </div>

      {/* Advanced Toggle */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg
            className={`w-4 h-4 mr-1 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          {showAdvanced ? "Hide advanced options" : "Show advanced options"}
        </button>

        {showAdvanced && (
          <div className="pt-4 space-y-5 animate-fadeIn">
            {/* Disk I/O Slider */}
            <div className="group transition-all duration-200">
              <label className={sliderLabelClass}>
                <span>Disk I/O (MB/s)</span>
                <span className={sliderValueClass}>{safeResources.diskIO}</span>
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={safeResources.diskIO}
                  onChange={(e) =>
                    handleChange("diskIO", Number(e.target.value))
                  }
                  className={`${sliderTrackClass} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 group-hover:[&::-webkit-slider-thumb]:scale-110`}
                  aria-label={`Disk I/O: ${safeResources.diskIO} MB/s`}
                />
              </div>
              <div className={sliderMarkersClass}>
                <span>10</span>
                <span>500</span>
                <span>1000</span>
              </div>
              <div className={sliderDescriptionClass}>
                Storage read/write speed. Higher values are needed for
                high-volume metrics storage and queries.
              </div>
            </div>

            {/* Network I/O Slider */}
            <div className="group transition-all duration-200">
              <label className={sliderLabelClass}>
                <span>Network I/O (Mbps)</span>
                <span className={sliderValueClass}>
                  {safeResources.networkIO}
                </span>
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="10"
                  max="10000"
                  step="10"
                  value={safeResources.networkIO}
                  onChange={(e) =>
                    handleChange("networkIO", Number(e.target.value))
                  }
                  className={`${sliderTrackClass} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 group-hover:[&::-webkit-slider-thumb]:scale-110`}
                  aria-label={`Network I/O: ${safeResources.networkIO} Mbps`}
                />
              </div>
              <div className={sliderMarkersClass}>
                <span>10</span>
                <span>1000</span>
                <span>10000</span>
              </div>
              <div className={sliderDescriptionClass}>
                Network bandwidth for receiving metrics and serving dashboard
                queries. Affects system responsiveness.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserResourceConfig;
