import React, { createContext, useContext, ReactNode } from "react";
import {
  WorkloadParams,
  UserResources,
  ResourceRequirements,
  FlowMetrics,
} from "../types/metrics";
import useMetricsCalculation from "../hooks/useMetricsCalculation";

// Default values
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

// Define context type
interface MetricsContextType {
  // State
  workload: WorkloadParams;
  userResources: UserResources;
  requirements: ResourceRequirements | null;
  flowMetrics: FlowMetrics | null;

  // Derived state
  systemStatus: "healthy" | "warning" | "critical";
  statusMetrics: {
    critical: number;
    warning: number;
    healthy: number;
  };

  // Actions
  setWorkload: (workload: React.SetStateAction<WorkloadParams>) => void;
  setUserResources: (resources: React.SetStateAction<UserResources>) => void;
  applyWorkloadPreset: (preset: {
    rps: number;
    mpr: number;
    ratio: number;
    complexity: number;
  }) => void;
  applyResourcePreset: (preset: {
    cpu: number;
    memory: number;
    diskIO: number;
    networkIO: number;
  }) => void;
}

// Create the context with undefined as default - this forces consumers to use the useMetrics hook
const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

// Provider component
interface MetricsProviderProps {
  children: ReactNode;
  initialWorkload?: WorkloadParams;
  initialResources?: UserResources;
}

/**
 * Metrics Provider Component
 *
 * Provides metrics calculation state and actions to the component tree.
 * This follows Andrew Clark's pattern of using context for shared state.
 */
function MetricsProvider({
  children,
  initialWorkload = DEFAULT_WORKLOAD,
  initialResources = DEFAULT_USER_RESOURCES,
}: MetricsProviderProps) {
  const metrics = useMetricsCalculation(initialWorkload, initialResources);

  return (
    <MetricsContext.Provider value={metrics}>
      {children}
    </MetricsContext.Provider>
  );
}

/**
 * Custom hook to use the metrics context
 *
 * This follows Andrew Clark's pattern of creating a custom hook to use context
 * that throws a helpful error if used outside the provider.
 */
function useMetrics(): MetricsContextType {
  const context = useContext(MetricsContext);

  if (context === undefined) {
    throw new Error("useMetrics must be used within a MetricsProvider");
  }

  return context;
}

export { MetricsProvider, useMetrics };
