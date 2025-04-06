// src/components/ResourceDisplay.tsx
import React, { useState, useMemo } from "react";
import { ResourceRequirements, UserResources } from "./Simulator";
import { Resource } from "../types/metrics";

// Enhanced type definitions for better type safety and documentation
type ResourceStatus = "healthy" | "warning" | "critical";
type ResourceKey = "cpu" | "memory" | "storage" | "diskIO" | "networkIO";

interface ResourceInfo {
  key: ResourceKey;
  resource: Resource;
  label: string;
  description: string;
  currentValue: number;
}

interface ResourceDisplayProps {
  requirements: ResourceRequirements;
  userResources?: UserResources;
}

/**
 * Custom hook for resource display logic
 * Extracts business logic from the component for better separation of concerns
 */
function useResourceDisplay(
  requirements: ResourceRequirements,
  userResources: Partial<UserResources> = {},
) {
  const [expandedSection, setExpandedSection] = useState<ResourceKey | null>(
    null,
  );
  const [showAllDetails, setShowAllDetails] = useState<boolean>(false);

  // Ensure we have default values with safeguards
  const safeUserResources = useMemo(
    () => ({
      cpu: userResources?.cpu ?? 1,
      memory: userResources?.memory ?? 1,
      diskIO: userResources?.diskIO ?? 10,
      networkIO: userResources?.networkIO ?? 10,
      storage: userResources?.storage ?? 100,
      statsdInstances: userResources?.statsdInstances ?? 1,
      carbonInstances: userResources?.carbonInstances ?? 1,
    }),
    [userResources],
  );

  // Toggle section expansion
  const toggleSection = (section: ResourceKey) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Toggle all details
  const toggleAllDetails = () => {
    setShowAllDetails(!showAllDetails);
    setExpandedSection(null);
  };

  // Get sorted resources to prioritize critical resources
  const resourcesInfo = useMemo<ResourceInfo[]>(() => {
    const resources: ResourceInfo[] = [
      {
        key: "cpu",
        resource: requirements.cpu,
        label: "CPU Cores",
        description: "Processing power for metric calculations",
        currentValue: safeUserResources.cpu,
      },
      {
        key: "memory",
        resource: requirements.memory,
        label: "Memory",
        description: "RAM for storing and processing metrics",
        currentValue: safeUserResources.memory,
      },
      {
        key: "storage",
        resource: requirements.storage,
        label: "Storage",
        description: "Space for metrics history",
        currentValue: safeUserResources.storage,
      },
      {
        key: "diskIO",
        resource: requirements.diskIO,
        label: "Disk I/O",
        description: "Speed of storage operations",
        currentValue: safeUserResources.diskIO,
      },
      {
        key: "networkIO",
        resource: requirements.networkIO,
        label: "Network I/O",
        description: "Bandwidth for metrics collection",
        currentValue: safeUserResources.networkIO,
      },
    ];

    // Sort by criticality (critical → warning → healthy)
    return resources.sort((a, b) => {
      const statusPriority: Record<ResourceStatus, number> = {
        critical: 0,
        warning: 1,
        healthy: 2,
      };
      return (
        statusPriority[a.resource.status] - statusPriority[b.resource.status]
      );
    });
  }, [requirements, safeUserResources]);

  // Calculate if there are any issues
  const hasIssues = useMemo(() => {
    return Object.values(requirements).some((r) => r.status !== "healthy");
  }, [requirements]);

  // Get system status
  const systemStatus = useMemo<ResourceStatus>(() => {
    if (Object.values(requirements).some((r) => r.status === "critical"))
      return "critical";
    if (Object.values(requirements).some((r) => r.status === "warning"))
      return "warning";
    return "healthy";
  }, [requirements]);

  // Primary bottleneck identification
  const primaryBottleneck = useMemo(() => {
    const resources = [
      { name: "CPU", utilization: requirements.cpu.utilization },
      { name: "Memory", utilization: requirements.memory.utilization },
      { name: "Disk I/O", utilization: requirements.diskIO.utilization },
      { name: "Network I/O", utilization: requirements.networkIO.utilization },
      { name: "Storage", utilization: requirements.storage.utilization },
    ];

    resources.sort((a, b) => b.utilization - a.utilization);

    if (resources[0].utilization > 0.7) {
      return resources[0].name;
    }

    return null;
  }, [requirements]);

  return {
    resourcesInfo,
    expandedSection,
    showAllDetails,
    hasIssues,
    systemStatus,
    primaryBottleneck,
    toggleSection,
    toggleAllDetails,
  };
}

/**
 * Utility functions extracted for cleaner component code
 */
const utils = {
  formatValue: (value: number, unit: string): string => {
    if (value >= 1000 && unit === "GB") {
      return `${(value / 1000).toFixed(1)} TB`;
    }
    return `${value} ${unit}`;
  },

  getUtilizationText: (utilization: number): string => {
    const utilizationPercent = Math.round(utilization * 100);
    return utilizationPercent > 90
      ? "critically high"
      : utilizationPercent > 70
        ? "approaching capacity"
        : "at a healthy level";
  },

  getStatusColorClasses: (
    status: ResourceStatus,
  ): { colorClass: string; backColorClass: string; textColorClass: string } => {
    const sufficient = status !== "critical";

    const colorClass = sufficient
      ? status === "warning"
        ? "from-amber-400 to-amber-300"
        : "from-teal-500 to-teal-400"
      : "from-rose-500 to-rose-400";

    const backColorClass = sufficient
      ? status === "warning"
        ? "bg-amber-50"
        : "bg-teal-50"
      : "bg-rose-50";

    const textColorClass = sufficient
      ? status === "warning"
        ? "text-amber-700"
        : "text-teal-700"
      : "text-rose-700";

    return { colorClass, backColorClass, textColorClass };
  },

  getSystemStatusClasses: (status: ResourceStatus): string => {
    return {
      healthy: "bg-teal-50 text-teal-700 border-teal-100",
      warning: "bg-amber-50 text-amber-700 border-amber-100",
      critical: "bg-rose-50 text-rose-700 border-rose-100",
    }[status];
  },

  getSystemStatusText: (status: ResourceStatus): string => {
    return {
      healthy: "All resources are optimally allocated",
      warning: "Some resources may need adjustment",
      critical: "Resource allocations need attention",
    }[status];
  },
};

/**
 * Detailed Info Component - Extracts the detail rendering logic
 */
const ResourceDetailInfo: React.FC<{
  resourceType: string;
  resource: Resource;
  currentValue: number;
}> = ({ resourceType, resource, currentValue }) => {
  const utilization = Math.round(resource.utilization * 100);
  const utilizationText = utils.getUtilizationText(resource.utilization);

  // Calculate the recommended additional resource if needed
  const calculateRecommended = () => {
    if (resource.utilization <= 0.7) return null;
    const additionalNeeded = Math.ceil((resource.value - currentValue) * 1.3); // Add 30% buffer
    return additionalNeeded > 0 ? additionalNeeded : null;
  };

  const recommendedAdditional = calculateRecommended();

  switch (resourceType) {
    case "CPU Cores":
      return (
        <div className="space-y-2">
          <div className="text-xs">
            <span className="font-medium">Impact:</span> Affects how quickly
            your system can process metrics and serve dashboard requests
          </div>
          <div className="text-xs">
            <span className="font-medium">Current Status:</span> Your CPU
            utilization is {utilizationText} at {utilization}%.
            {recommendedAdditional &&
              ` Adding ${recommendedAdditional} more cores would provide optimal performance headroom.`}
          </div>
          <div className="text-xs">
            <span className="font-medium">Recommendation:</span> Allocate
            approximately 1 core per 100,000 metrics per second for optimal
            performance.
            {resource.status === "critical" &&
              " Consider distributing metric collection across multiple instances to reduce CPU load."}
          </div>
        </div>
      );
    case "Memory":
      return (
        <div className="space-y-2">
          <div className="text-xs">
            <span className="font-medium">Impact:</span> Determines how
            efficiently your system handles concurrent metrics and queries
          </div>
          <div className="text-xs">
            <span className="font-medium">Current Status:</span> Your memory
            utilization is {utilizationText} at {utilization}%.
            {recommendedAdditional &&
              ` Adding ${recommendedAdditional}GB RAM would improve query performance and reduce cache evictions.`}
          </div>
          <div className="text-xs">
            <span className="font-medium">Recommendation:</span> For best
            results, provide 1GB RAM for every 200,000 unique metrics tracked.
            {resource.status !== "healthy" &&
              " Insufficient memory will cause increased disk I/O and slower query response times."}
          </div>
        </div>
      );
    case "Storage":
      return (
        <div className="space-y-2">
          <div className="text-xs">
            <span className="font-medium">Impact:</span> Defines how much
            historical data you can retain and how quickly it can be accessed
          </div>
          <div className="text-xs">
            <span className="font-medium">Current Status:</span> Your storage
            utilization is {utilizationText} at {utilization}%.
            {recommendedAdditional &&
              ` Adding ${recommendedAdditional}GB of storage would accommodate your current retention period.`}
          </div>
          <div className="text-xs">
            <span className="font-medium">Recommendation:</span> Use SSD storage
            for frequently accessed metrics, especially for query-intensive
            workloads.
            {resource.status !== "healthy" &&
              " Consider reducing your retention period or implementing data aggregation to decrease storage needs."}
          </div>
        </div>
      );
    case "Disk I/O":
      return (
        <div className="space-y-2">
          <div className="text-xs">
            <span className="font-medium">Impact:</span> Controls the speed at
            which metrics can be written to and read from storage
          </div>
          <div className="text-xs">
            <span className="font-medium">Current Status:</span> Your disk I/O
            utilization is {utilizationText} at {utilization}%.
            {resource.status !== "healthy" &&
              " This may lead to write queues forming and delayed metric persistence."}
          </div>
          <div className="text-xs">
            <span className="font-medium">Recommendation:</span> For high-volume
            metric collection, isolate metrics storage from other disk-intensive
            workloads.
            {resource.status === "critical" &&
              " Consider provisioned IOPS storage or distributing writes across multiple storage volumes."}
          </div>
        </div>
      );
    case "Network I/O":
      return (
        <div className="space-y-2">
          <div className="text-xs">
            <span className="font-medium">Impact:</span> Governs how quickly
            your system can receive metrics and respond to queries
          </div>
          <div className="text-xs">
            <span className="font-medium">Current Status:</span> Your network
            utilization is {utilizationText} at {utilization}%.
            {resource.status !== "healthy" &&
              " This may cause metric collection delays or dropped packets."}
          </div>
          <div className="text-xs">
            <span className="font-medium">Recommendation:</span> Ensure low
            latency between application servers and metrics infrastructure.
            {resource.status === "critical" &&
              " Consider implementing client-side buffering or batch sending to reduce network pressure."}
          </div>
        </div>
      );
    default:
      return null;
  }
};

/**
 * Resource Gauge Component - Extracted as a separate component
 */
const ResourceGauge = React.memo<{
  resource: Resource;
  currentValue: number;
  label: string;
  description: string;
  showDetails: boolean;
  resourceKey: ResourceKey;
  onToggleDetails: (key: ResourceKey) => void;
}>(
  ({
    resource,
    currentValue,
    label,
    description,
    showDetails,
    resourceKey,
    onToggleDetails,
  }) => {
    const percentage = Math.min(100, resource.utilization * 100);
    const { colorClass, backColorClass, textColorClass } =
      utils.getStatusColorClasses(resource.status);

    const statusText =
      resource.status === "healthy"
        ? "Optimal"
        : resource.status === "warning"
          ? "Attention Needed"
          : "Insufficient";

    // Unique ID for accessibility and aria attributes
    const detailsId = `resource-details-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div
        className={`p-5 rounded-xl border transition-all duration-300 ${showDetails ? "shadow-md" : "shadow-sm hover:shadow-md"} ${backColorClass} border-gray-200`}
        role="region"
        aria-label={`${label} resource status`}
      >
        <div className="flex items-start mb-4">
          <div className="mr-3 p-2 rounded-full bg-white" aria-hidden="true">
            <ResourceIcon resourceKey={resourceKey} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-800">{label}</h3>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${textColorClass} ${backColorClass}`}
                role="status"
              >
                {statusText}
              </span>
            </div>
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="flex justify-between items-center">
          <div
            className="relative w-20 h-20 mr-4"
            role="img"
            aria-label={`${label} usage: ${Math.round(percentage)}%`}
          >
            <ResourceGaugeCircle
              percentage={percentage}
              colorClass={colorClass}
              label={label}
            />
          </div>

          <div className="flex-1">
            <div className="mb-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Allocated</span>
                <span className="font-medium text-gray-700">
                  {utils.formatValue(currentValue, resource.unit)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Needed</span>
                <span className="font-medium text-gray-700">
                  {utils.formatValue(resource.value, resource.unit)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onToggleDetails(resourceKey)}
              className={`mt-3 w-full text-center py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${textColorClass} border border-gray-200 hover:bg-white focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 focus:outline-none`}
              aria-expanded={showDetails}
              aria-controls={detailsId}
            >
              {showDetails ? "Hide Details" : "Learn More"}
            </button>
          </div>
        </div>

        {/* Expanded Details Section */}
        {showDetails && (
          <div
            id={detailsId}
            className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn text-sm text-gray-600"
          >
            <p className="mb-3">{resource.explanation}</p>
            <ResourceDetailInfo
              resourceType={label}
              resource={resource}
              currentValue={currentValue}
            />
          </div>
        )}
      </div>
    );
  },
);

ResourceGauge.displayName = "ResourceGauge";

/**
 * Resource Gauge Circle Component - Further componentization
 */
const ResourceGaugeCircle: React.FC<{
  percentage: number;
  colorClass: string;
  label: string;
}> = ({ percentage, colorClass, label }) => (
  <svg className="w-full h-full" viewBox="0 0 120 120">
    {/* Background Circle */}
    <circle
      cx="60"
      cy="60"
      r="54"
      fill="none"
      stroke="#E5E7EB"
      strokeWidth="12"
      aria-hidden="true"
    />

    {/* Foreground Circle - the actual gauge */}
    {percentage > 0 && (
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke={`url(#gradient-${label.replace(/\s+/g, "-").toLowerCase()})`}
        strokeWidth="12"
        strokeDasharray={`${percentage * 3.39} 339`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        className="transition-all duration-700 ease-out"
        aria-hidden="true"
      />
    )}

    {/* Gradient definition */}
    <defs>
      <linearGradient
        id={`gradient-${label.replace(/\s+/g, "-").toLowerCase()}`}
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
      >
        <stop
          offset="0%"
          className={`stop-color-start ${colorClass.split(" ")[0]}`}
        />
        <stop
          offset="100%"
          className={`stop-color-end ${colorClass.split(" ")[1]}`}
        />
      </linearGradient>
    </defs>

    {/* Central Text */}
    <text
      x="60"
      y="65"
      textAnchor="middle"
      fill="#374151"
      className="text-lg font-medium"
      fontSize="20"
      aria-hidden="true"
    >
      {Math.round(percentage)}%
    </text>
    <text
      x="60"
      y="85"
      textAnchor="middle"
      fill="#6B7280"
      className="text-xs"
      fontSize="11"
      aria-hidden="true"
    >
      Used
    </text>
  </svg>
);

/**
 * Resource Icon Component - Extracted for reuse
 */
const ResourceIcon: React.FC<{ resourceKey: ResourceKey }> = ({
  resourceKey,
}) => {
  const iconPath = {
    cpu: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
    memory:
      "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    storage:
      "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
    diskIO:
      "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
    networkIO: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  };

  return (
    <svg
      className="w-5 h-5 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d={iconPath[resourceKey]}
      />
    </svg>
  );
};

/**
 * Optimization Tips Component - Extracted for clarity
 */
const OptimizationTips: React.FC<{ primaryBottleneck: string | null }> = ({
  primaryBottleneck,
}) => (
  <div
    className="p-6 rounded-xl bg-blue-50 border border-blue-100"
    aria-labelledby="optimization-tips"
  >
    <div className="flex items-start">
      <svg
        className="w-6 h-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      <div>
        <h3 id="optimization-tips" className="font-medium text-gray-800 mb-3">
          Optimization Strategies
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p className="flex items-start">
            <span className="text-blue-600 mr-2" aria-hidden="true">
              •
            </span>
            <span>
              Consider aggregating metrics at the application level before
              sending them to reduce volume and improve performance
            </span>
          </p>
          <p className="flex items-start">
            <span className="text-blue-600 mr-2" aria-hidden="true">
              •
            </span>
            <span>
              Balance your metrics retention period with your actual analysis
              needs to optimize storage usage
            </span>
          </p>
          <p className="flex items-start">
            <span className="text-blue-600 mr-2" aria-hidden="true">
              •
            </span>
            <span>
              For large deployments, distribute the collection load across
              multiple instances for greater resilience
            </span>
          </p>
          {primaryBottleneck && (
            <p className="flex items-start">
              <span className="text-blue-600 mr-2" aria-hidden="true">
                •
              </span>
              <span>
                <strong>Specific advice:</strong> Focus on improving{" "}
                {primaryBottleneck} for the most immediate performance gains
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Status Alert Component - Extracted for reuse
 */
const StatusAlert: React.FC<{
  status: ResourceStatus;
  primaryBottleneck: string | null;
  showAllDetails: boolean;
  onToggleAllDetails: () => void;
}> = ({ status, primaryBottleneck, showAllDetails, onToggleAllDetails }) => {
  const statusColorClass = utils.getSystemStatusClasses(status);
  const statusText = utils.getSystemStatusText(status);

  return (
    <div className={`p-4 rounded-lg ${statusColorClass} mb-4`} role="alert">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-medium">{statusText}</span>
        {primaryBottleneck && (
          <span className="ml-2">Primary constraint: {primaryBottleneck}</span>
        )}
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={onToggleAllDetails}
          className={`text-xs py-1 px-3 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 ${statusColorClass}`}
        >
          {showAllDetails ? "Hide All Details" : "Show All Details"}
        </button>
      </div>
    </div>
  );
};

/**
 * Main ResourceDisplay Component - Now a clean composition of smaller components
 */
const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  requirements,
  userResources = {},
}) => {
  const {
    resourcesInfo,
    expandedSection,
    showAllDetails,
    hasIssues,
    systemStatus,
    primaryBottleneck,
    toggleSection,
    toggleAllDetails,
  } = useResourceDisplay(requirements, userResources as Partial<UserResources>);

  return (
    <div className="space-y-6">
      {/* Overall Status Summary - only display if there are issues */}
      {hasIssues && (
        <StatusAlert
          status={systemStatus}
          primaryBottleneck={primaryBottleneck}
          showAllDetails={showAllDetails}
          onToggleAllDetails={toggleAllDetails}
        />
      )}

      {/* Resource Gauges Grid - more balanced layout with most critical first */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {resourcesInfo.map(
          ({ key, resource, label, description, currentValue }) => (
            <ResourceGauge
              key={key}
              resourceKey={key}
              resource={resource}
              currentValue={currentValue}
              label={label}
              description={description}
              showDetails={showAllDetails || expandedSection === key}
              onToggleDetails={toggleSection}
            />
          ),
        )}
      </div>

      {/* Optimization Tips */}
      <OptimizationTips primaryBottleneck={primaryBottleneck} />

      {/* Animation keyframes for the fadeIn effect */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ResourceDisplay;
