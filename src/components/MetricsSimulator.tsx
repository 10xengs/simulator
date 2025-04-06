// src/components/MetricsSimulator.tsx
"use client";

import React, { lazy, Suspense, useState, useMemo } from "react";
import WorkloadInputs from "./WorkloadInputs";
import UserResourceConfig from "./UserResourceConfig";
import { MetricsProvider, useMetrics } from "../context/MetricsContext";
import ResourceMetrics from "./ResourceMetrics";
import ErrorBoundary from "./ErrorBoundary";
import type { ResourceKey } from "../types/metrics";

// Lazy load components that aren't needed immediately
const LazyResourceExplanations = lazy(
  () => import("./LazyResourceExplanations"),
);

// Preset configurations
const WORKLOAD_PRESETS = [
  { name: "Small App", rps: 50, mpr: 100, ratio: 0.2, complexity: 2 },
  { name: "Medium App", rps: 200, mpr: 150, ratio: 0.25, complexity: 3 },
  { name: "Large App", rps: 500, mpr: 200, ratio: 0.3, complexity: 5 },
  { name: "API Service", rps: 1000, mpr: 50, ratio: 0.4, complexity: 4 },
  { name: "Microservices", rps: 300, mpr: 300, ratio: 0.15, complexity: 6 },
];

// Resource configurations
const RESOURCE_PRESETS = [
  { name: "Small (t3.medium)", cpu: 2, memory: 4, diskIO: 50, networkIO: 100 },
  {
    name: "Medium (m5.xlarge)",
    cpu: 4,
    memory: 16,
    diskIO: 100,
    networkIO: 250,
  },
  {
    name: "Large (c5.2xlarge)",
    cpu: 8,
    memory: 32,
    diskIO: 200,
    networkIO: 500,
  },
];

/**
 * Inner MetricsContent component
 *
 * Uses the metrics context and renders the UI.
 * This follows Andrew Clark's pattern of splitting context consumers into separate components.
 */
function MetricsContent() {
  // State for UI controls
  const [showIntro, setShowIntro] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [showDetailedRequirements, setShowDetailedRequirements] =
    useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  // Get metrics from context
  const {
    workload,
    userResources,
    requirements,
    flowMetrics,
    systemStatus,
    statusMetrics,
    setWorkload,
    setUserResources,
    applyWorkloadPreset,
    applyResourcePreset,
  } = useMetrics();

  // Callbacks for preset application
  const handleApplyPreset = (preset: (typeof WORKLOAD_PRESETS)[0]) => {
    applyWorkloadPreset({
      rps: preset.rps,
      mpr: preset.mpr,
      ratio: preset.ratio,
      complexity: preset.complexity,
    });
  };

  const handleApplyResourcePreset = (preset: (typeof RESOURCE_PRESETS)[0]) => {
    applyResourcePreset({
      cpu: preset.cpu,
      memory: preset.memory,
      diskIO: preset.diskIO,
      networkIO: preset.networkIO,
    });
  };

  // Derived primary bottleneck data
  const primaryBottleneck = useMemo(() => {
    if (!requirements) return null;

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

  const hasIssues = useMemo(() => {
    return (
      requirements &&
      Object.values(requirements).some((r) => r.status !== "healthy")
    );
  }, [requirements]);

  // Early return if requirements not yet calculated
  if (!requirements || !flowMetrics) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-pulse text-gray-500">
          Calculating requirements...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header - Apple-style with minimalist design */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-light tracking-tight mb-3">
            Metrics Infrastructure Simulator
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Visualize and plan the optimal resources for your monitoring
            infrastructure
          </p>
        </header>

        {/* Introductory Section - Apple-style pedagogical approach */}
        {showIntro && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-10 overflow-hidden transition-all duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-light">
                  Understanding Metrics Infrastructure
                </h2>
                <button
                  onClick={() => setShowIntro(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Hide
                </button>
              </div>

              <div className="prose prose-sm max-w-none text-gray-600">
                <p>
                  This simulator helps you plan the right infrastructure for
                  StatsD and Graphite metrics collection. As you adjust the
                  parameters below, you&apos;ll see how your monitoring needs
                  translate to resource requirements.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="text-sm font-medium text-gray-800 mb-2">
                      Workload
                    </h3>
                    <p className="text-xs">
                      Define how many metrics your applications generate and
                      their characteristics, such as the ratio of unique metrics
                      and calculation complexity.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="text-sm font-medium text-gray-800 mb-2">
                      Resources
                    </h3>
                    <p className="text-xs">
                      Set the infrastructure resources you plan to allocate,
                      including CPU, memory, disk I/O capacity, and storage.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="text-sm font-medium text-gray-800 mb-2">
                      Requirements
                    </h3>
                    <p className="text-xs">
                      See the calculated resource utilization based on your
                      workload, with recommendations to ensure optimal
                      performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowIntro(false)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* Compact Resource Requirements Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="px-6 py-6 md:px-8 md:py-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-gray-800">
                Resource Requirements
              </h2>
              {!showIntro && (
                <button
                  onClick={() => setShowIntro(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Show Introduction
                </button>
              )}
            </div>

            {/* System Status Alert - using ResourceMetrics compound component */}
            <div className="mb-6">
              <div
                className={`px-6 py-4 rounded-xl ${
                  systemStatus === "healthy"
                    ? "bg-teal-50 border border-teal-100"
                    : systemStatus === "warning"
                      ? "bg-amber-50 border border-amber-100"
                      : "bg-rose-50 border border-rose-100"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        systemStatus === "healthy"
                          ? "bg-white text-teal-500"
                          : systemStatus === "warning"
                            ? "bg-white text-amber-500"
                            : "bg-white text-rose-500"
                      }`}
                    >
                      {systemStatus === "healthy" && (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {systemStatus === "warning" && (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      )}
                      {systemStatus === "critical" && (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3
                        className={`font-medium ${
                          systemStatus === "healthy"
                            ? "text-teal-700"
                            : systemStatus === "warning"
                              ? "text-amber-700"
                              : "text-rose-700"
                        }`}
                      >
                        {systemStatus === "healthy"
                          ? "All resources are optimally allocated"
                          : systemStatus === "warning"
                            ? "Some resources may need adjustment"
                            : "Resource allocations need attention"}
                      </h3>

                      {systemStatus !== "healthy" && (
                        <p className="text-sm mt-1 text-gray-600">
                          {systemStatus === "critical"
                            ? `${statusMetrics.critical} critical resources need immediate attention`
                            : `${statusMetrics.warning} resources may need adjustment`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div
                        className={`text-lg font-semibold ${statusMetrics.critical > 0 ? "text-rose-600" : "text-gray-400"}`}
                      >
                        {statusMetrics.critical}
                      </div>
                      <div className="text-xs text-gray-500">Critical</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-lg font-semibold ${statusMetrics.warning > 0 ? "text-amber-600" : "text-gray-400"}`}
                      >
                        {statusMetrics.warning}
                      </div>
                      <div className="text-xs text-gray-500">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold text-teal-600`}>
                        {statusMetrics.healthy}
                      </div>
                      <div className="text-xs text-gray-500">Optimal</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Resource Quick Status with Utilization */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                  {Object.entries(requirements).map(([key, resource]) => {
                    const percentage = Math.round(resource.utilization * 100);
                    return (
                      <div key={key} className="flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700 capitalize">
                            {key}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              resource.status === "healthy"
                                ? "text-teal-600"
                                : resource.status === "warning"
                                  ? "text-amber-600"
                                  : "text-rose-600"
                            }`}
                          >
                            {percentage}%
                          </span>
                        </div>
                        <div className="relative h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className={`absolute top-0 left-0 h-full rounded-full ${
                              resource.status === "healthy"
                                ? "bg-teal-500"
                                : resource.status === "warning"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-gray-500">
                            {resource.value} {resource.unit}
                          </span>
                          <span className="text-gray-500">
                            {resource.status === "healthy"
                              ? "Optimal"
                              : resource.status === "warning"
                                ? "Attention"
                                : "Critical"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Toggle for Detailed View */}
            <div className="flex justify-center">
              <button
                onClick={() =>
                  setShowDetailedRequirements(!showDetailedRequirements)
                }
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showDetailedRequirements
                  ? "Show Less Details"
                  : "Show Detailed Analysis"}
                <svg
                  className={`ml-1 w-4 h-4 transition-transform duration-200 ${showDetailedRequirements ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Full Resource Display (Collapsible) with Error Boundary */}
            {showDetailedRequirements && (
              <div className="mt-6 animate-fadeIn">
                <ErrorBoundary>
                  <ResourceMetrics initialShowAll={false}>
                    {hasIssues && (
                      <ResourceMetrics.StatusAlert
                        status={systemStatus}
                        primaryBottleneck={primaryBottleneck}
                      />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {Object.entries(requirements).map(([key, resource]) => {
                        const label =
                          {
                            cpu: "CPU Cores",
                            memory: "Memory",
                            storage: "Storage",
                            diskIO: "Disk I/O",
                            networkIO: "Network I/O",
                          }[key as keyof typeof requirements] || key;

                        const description =
                          {
                            cpu: "Processing power for metric calculations",
                            memory: "RAM for storing and processing metrics",
                            storage: "Space for metrics history",
                            diskIO: "Speed of storage operations",
                            networkIO: "Bandwidth for metrics collection",
                          }[key as keyof typeof requirements] || "";

                        const userValue =
                          userResources[key as keyof typeof userResources] || 0;

                        return (
                          <ResourceMetrics.Gauge
                            key={key}
                            resourceKey={key as ResourceKey}
                            resource={resource}
                            currentValue={userValue}
                            label={label}
                            description={description}
                          />
                        );
                      })}
                    </div>

                    <ResourceMetrics.Tips
                      primaryBottleneck={primaryBottleneck}
                    />
                  </ResourceMetrics>
                </ErrorBoundary>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Configuration - Apple-style with clean, focused controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Workload Configuration */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-light text-gray-800 mb-6">
                Workload
              </h2>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Starting Points
                  </h3>
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {showTips ? "Hide Tips" : "Show Tips"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {WORKLOAD_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handleApplyPreset(preset)}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-full text-sm transition-all"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {showTips && (
                <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm text-gray-600">
                  <p className="mb-2">
                    <span className="font-medium text-gray-800">Tip:</span> The
                    number of metrics and their uniqueness most significantly
                    impact your resource needs.
                  </p>
                  <p>
                    Higher request rates with fewer metrics per request are
                    generally more efficient than lower request rates with many
                    metrics per request.
                  </p>
                </div>
              )}

              <ErrorBoundary>
                <WorkloadInputs workload={workload} setWorkload={setWorkload} />
              </ErrorBoundary>

              {flowMetrics && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Metrics Flow
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Total Metrics/Sec
                      </div>
                      <div className="font-medium">
                        {flowMetrics.totalMetricsPerSecond.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Unique Metrics/Sec
                      </div>
                      <div className="font-medium">
                        {flowMetrics.uniqueMetricsPerSecond.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Database Writes/Sec
                      </div>
                      <div className="font-medium">
                        {flowMetrics.writesPerSecond.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Storage Growth/Day
                      </div>
                      <div className="font-medium">
                        {flowMetrics.storagePerDay.toFixed(1)} GB
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resource Configuration */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-light text-gray-800 mb-6">
                Resources
              </h2>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Resource Tiers
                </h3>
                <div className="flex flex-wrap gap-2">
                  {RESOURCE_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handleApplyResourcePreset(preset)}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-full text-sm transition-all"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {showTips && (
                <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm text-gray-600">
                  <p className="mb-2">
                    <span className="font-medium text-gray-800">Tip:</span>{" "}
                    Start with a minimal configuration and scale up as needed.
                  </p>
                  <p>
                    Memory is typically the most critical resource for StatsD,
                    while Disk I/O and CPU are more important for Graphite.
                  </p>
                </div>
              )}

              <ErrorBoundary>
                <UserResourceConfig
                  userResources={userResources}
                  setUserResources={setUserResources}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* Detailed Explanations with Lazy Loading */}
        <details className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 group">
          <summary
            className="p-6 list-none cursor-pointer"
            onClick={() => setShowExplanations(!showExplanations)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-light text-gray-800">
                Infrastructure Guide
              </h2>
              <svg
                className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </summary>
          <div className="px-6 pb-6">
            <div className="pt-4 border-t border-gray-100">
              <ErrorBoundary>
                {showExplanations && (
                  <Suspense
                    fallback={
                      <div className="h-40 w-full flex items-center justify-center">
                        <div className="animate-pulse text-gray-400">
                          Loading infrastructure guide...
                        </div>
                      </div>
                    }
                  >
                    <LazyResourceExplanations />
                  </Suspense>
                )}
              </ErrorBoundary>
            </div>
          </div>
        </details>

        <footer className="mt-12 mb-6 text-center text-xs text-gray-400">
          Designed for infrastructure planning excellence
        </footer>
      </div>

      {/* Animation for slide-in elements */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
}

/**
 * MetricsSimulator - Main component
 *
 * Using function declaration as recommended by Andrew Clark
 * instead of arrow function expressions.
 */
function MetricsSimulator() {
  return (
    <ErrorBoundary>
      <MetricsProvider>
        <MetricsContent />
      </MetricsProvider>
    </ErrorBoundary>
  );
}

export default MetricsSimulator;
