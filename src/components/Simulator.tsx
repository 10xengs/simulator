// src/components/Simulator.tsx
"use client";

import React, { useState, useEffect } from "react";
import { calculateResourceRequirements } from "../lib/calculations";
import WorkloadInputs from "./WorkloadInputs";
import ResourceDisplay from "./ResourceDisplay";
import UserResourceConfig from "./UserResourceConfig";
import ResourceExplanations from "./ResourceExplanations";
import type {
  WorkloadParams,
  ResourceRequirements,
  UserResources,
  FlowMetrics,
} from "../types/metrics";

// Types
// Re-export for backwards compatibility
export type {
  WorkloadParams,
  ResourceRequirements,
  UserResources,
  FlowMetrics,
} from "../types/metrics";

const DEFAULT_WORKLOAD: WorkloadParams = {
  requestsPerSecond: 100,
  metricsPerRequest: 100,
  uniqueMetricsRatio: 0.2,
  calculationComplexity: 3,
  flushIntervalSeconds: 10,
  retentionPeriodDays: 30,
};

const DEFAULT_USER_RESOURCES: UserResources = {
  cpu: 2,
  memory: 4,
  diskIO: 50,
  networkIO: 100,
  storage: 100,
  statsdInstances: 1,
  carbonInstances: 1,
};

const MetricsSimulator: React.FC = () => {
  // State
  const [workload, setWorkload] = useState<WorkloadParams>(DEFAULT_WORKLOAD);
  const [userResources, setUserResources] = useState<UserResources>(
    DEFAULT_USER_RESOURCES,
  );
  const [requirements, setRequirements] = useState<ResourceRequirements | null>(
    null,
  );
  const [flowMetrics, setFlowMetrics] = useState<FlowMetrics | null>(null);
  const [showQuickTour, setShowQuickTour] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Calculate resource requirements when inputs change
  useEffect(() => {
    const { requirements, flowMetrics } = calculateResourceRequirements(
      workload,
      userResources,
    );
    setRequirements(requirements);
    setFlowMetrics(flowMetrics);
  }, [workload, userResources]);

  // Ensure we have default values for first render
  useEffect(() => {
    if (requirements === null || flowMetrics === null) {
      const { requirements: defaultReqs, flowMetrics: defaultFlow } =
        calculateResourceRequirements(workload, userResources);
      if (requirements === null) setRequirements(defaultReqs);
      if (flowMetrics === null) setFlowMetrics(defaultFlow);
    }
  }, [requirements, flowMetrics, workload, userResources]);

  // Preset configurations
  const presets = [
    { name: "Small App", rps: 50, mpr: 100, ratio: 0.2, complexity: 2 },
    { name: "Medium App", rps: 200, mpr: 150, ratio: 0.25, complexity: 3 },
    { name: "Large App", rps: 500, mpr: 200, ratio: 0.3, complexity: 5 },
    { name: "API Service", rps: 1000, mpr: 50, ratio: 0.4, complexity: 4 },
    { name: "Microservices", rps: 300, mpr: 300, ratio: 0.15, complexity: 6 },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setWorkload({
      ...workload,
      requestsPerSecond: preset.rps,
      metricsPerRequest: preset.mpr,
      uniqueMetricsRatio: preset.ratio,
      calculationComplexity: preset.complexity,
    });
  };

  // Resource configurations
  const resourcePresets = [
    {
      name: "Small (t3.medium)",
      cpu: 2,
      memory: 4,
      diskIO: 50,
      networkIO: 100,
    },
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

  const applyResourcePreset = (preset: (typeof resourcePresets)[0]) => {
    setUserResources({
      cpu: preset.cpu,
      memory: preset.memory,
      diskIO: preset.diskIO,
      networkIO: preset.networkIO,
      storage: 100,
      statsdInstances: userResources.statsdInstances,
      carbonInstances: userResources.carbonInstances,
    });
  };

  // Summary metrics for the mobile persistent bar
  const getSummaryMetrics = () => {
    if (!flowMetrics) return null;
    return {
      total: flowMetrics.totalMetricsPerSecond.toLocaleString(),
      unique: flowMetrics.uniqueMetricsPerSecond.toLocaleString(),
    };
  };

  const summaryMetrics = getSummaryMetrics();

  // Mobile navigation helper
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const isSectionActive = (section: string) => {
    // On larger screens, all sections are active
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      return true;
    }
    // On mobile, only the active section is shown (or all if none is selected)
    return activeSection === null || activeSection === section;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-light mb-3 tracking-tight text-gray-900">
            StatsD/Graphite Resource Simulator
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Visualize how your application&apos;s monitoring needs impact
            infrastructure requirements
          </p>
          <button
            onClick={() => setShowQuickTour(!showQuickTour)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center mx-auto"
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
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {showQuickTour ? "Hide" : "Show"} Quick Guide
          </button>
        </header>

        {/* Quick Tour/Guide */}
        {showQuickTour && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 transition-all duration-300">
            <h2 className="text-xl font-light mb-4 text-gray-800">
              How This Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-2">
                    1
                  </span>
                  <h3 className="font-medium text-gray-800">
                    Define Your Workload
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Start by selecting a preset or adjusting the metrics volume
                  your applications will generate.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-2">
                    2
                  </span>
                  <h3 className="font-medium text-gray-800">
                    Configure Resources
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Set up the CPU, memory, and storage capacity you&apos;re
                  planning to allocate.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-2">
                    3
                  </span>
                  <h3 className="font-medium text-gray-800">
                    View Requirements
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  See instant feedback on whether your planned resources will
                  meet your needs.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowQuickTour(false)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors mx-auto block"
            >
              Got it
            </button>
          </div>
        )}

        {/* Mobile Section Navigation */}
        <div className="flex lg:hidden mb-4 sticky top-0 z-10 bg-gray-50 p-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-3 w-full gap-1">
            <button
              onClick={() => toggleSection("workload")}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${activeSection === "workload" ? "bg-blue-50 text-blue-700" : "bg-white text-gray-600"}`}
            >
              Workload
            </button>
            <button
              onClick={() => toggleSection("resources")}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${activeSection === "resources" ? "bg-blue-50 text-blue-700" : "bg-white text-gray-600"}`}
            >
              Resources
            </button>
            <button
              onClick={() => toggleSection("requirements")}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${activeSection === "requirements" ? "bg-blue-50 text-blue-700" : "bg-white text-gray-600"}`}
            >
              Results
            </button>
          </div>
        </div>

        {/* Persistent Status Bar for Mobile */}
        {summaryMetrics && (
          <div className="lg:hidden sticky top-14 z-10 bg-white rounded-xl p-3 mb-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="text-gray-500">Total Metrics: </span>
                <span className="font-medium">{summaryMetrics.total}/sec</span>
              </div>
              <div>
                <span className="text-gray-500">Unique Metrics: </span>
                <span className="font-medium">{summaryMetrics.unique}/sec</span>
              </div>
              <div>
                {requirements && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      Object.values(requirements).some(
                        (r) => r.status === "critical",
                      )
                        ? "bg-orange-50 text-orange-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {Object.values(requirements).some(
                      (r) => r.status === "critical",
                    )
                      ? "Needs Resources"
                      : "Resources OK"}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Requirements Display Section - Always visible on desktop, conditionally on mobile */}
        {requirements && (
          <div
            className={`bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 ${
              // Hide on mobile only when another section is active and this one isn't
              activeSection !== null && activeSection !== "requirements"
                ? "hidden lg:block"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-gray-800">
                System Requirements
              </h2>
              <div className="lg:hidden">
                {activeSection === "requirements" && (
                  <button
                    onClick={() => setActiveSection(null)}
                    className="text-sm text-gray-500"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
            <ResourceDisplay
              requirements={requirements}
              userResources={userResources}
            />
          </div>
        )}

        {/* Interactive Controls Section - Workload and Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Workload Inputs Section */}
          {isSectionActive("workload") && (
            <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-gray-800">
                  Define Your Workload
                </h2>
                <div className="lg:hidden">
                  {activeSection === "workload" && (
                    <button
                      onClick={() => setActiveSection(null)}
                      className="text-sm text-gray-500"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Choose a starting point:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => applyPreset(preset)}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-full text-sm transition-all duration-150 shadow-sm"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <WorkloadInputs workload={workload} setWorkload={setWorkload} />
            </div>
          )}

          {/* Resource Configuration Section */}
          {isSectionActive("resources") && (
            <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-gray-800">
                  Allocate Resources
                </h2>
                <div className="lg:hidden">
                  {activeSection === "resources" && (
                    <button
                      onClick={() => setActiveSection(null)}
                      className="text-sm text-gray-500"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Choose a resource tier:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resourcePresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => applyResourcePreset(preset)}
                      className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm transition-all duration-150"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <UserResourceConfig
                userResources={userResources}
                setUserResources={setUserResources}
              />
            </div>
          )}
        </div>

        {/* Reference Guide Section (Collapsible) */}
        <details className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 group">
          <summary className="list-none cursor-pointer">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-light text-gray-800">
                Reference Guide
              </h2>
              <svg
                className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
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
          <div className="mt-4 pt-4 border-t border-gray-100">
            <ResourceExplanations />
          </div>
        </details>

        <footer className="mt-6 mb-6 text-center text-xs text-gray-400">
          Designed with precision for monitoring infrastructure planning
        </footer>
      </div>
    </div>
  );
};

export default MetricsSimulator;
