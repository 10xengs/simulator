import { useState, useEffect, useMemo, useCallback } from "react";
import {
  WorkloadParams,
  UserResources,
  ResourceRequirements,
  FlowMetrics,
} from "../types/metrics";
import { calculateResourceRequirements } from "../lib/calculations";

/**
 * Custom hook for metrics calculation
 *
 * Handles calculating resource requirements and flow metrics based on workload and resources.
 * This follows Andrew Clark's pattern of extracting complex logic into reusable hooks.
 */
function useMetricsCalculation(
  initialWorkload: WorkloadParams,
  initialResources: UserResources,
) {
  // State management
  const [workload, setWorkload] = useState<WorkloadParams>(initialWorkload);
  const [userResources, setUserResources] =
    useState<UserResources>(initialResources);
  const [requirements, setRequirements] = useState<ResourceRequirements | null>(
    null,
  );
  const [flowMetrics, setFlowMetrics] = useState<FlowMetrics | null>(null);

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

  // Determine overall system status
  const systemStatus = useMemo(() => {
    if (!requirements) return "healthy" as const;

    return Object.values(requirements).some((r) => r.status === "critical")
      ? ("critical" as const)
      : Object.values(requirements).some((r) => r.status === "warning")
        ? ("warning" as const)
        : ("healthy" as const);
  }, [requirements]);

  // Calculate status metrics
  const statusMetrics = useMemo(() => {
    if (!requirements) return { critical: 0, warning: 0, healthy: 0 };

    return {
      critical: Object.values(requirements).filter(
        (r) => r.status === "critical",
      ).length,
      warning: Object.values(requirements).filter((r) => r.status === "warning")
        .length,
      healthy: Object.values(requirements).filter((r) => r.status === "healthy")
        .length,
    };
  }, [requirements]);

  // Preset application handlers
  const applyWorkloadPreset = useCallback(
    (preset: {
      rps: number;
      mpr: number;
      ratio: number;
      complexity: number;
    }) => {
      setWorkload((current) => ({
        ...current,
        requestsPerSecond: preset.rps,
        metricsPerRequest: preset.mpr,
        uniqueMetricsRatio: preset.ratio,
        calculationComplexity: preset.complexity,
      }));
    },
    [],
  );

  const applyResourcePreset = useCallback(
    (preset: {
      cpu: number;
      memory: number;
      diskIO: number;
      networkIO: number;
    }) => {
      setUserResources((current) => ({
        ...current,
        cpu: preset.cpu,
        memory: preset.memory,
        diskIO: preset.diskIO,
        networkIO: preset.networkIO,
      }));
    },
    [],
  );

  return {
    // State
    workload,
    userResources,
    requirements,
    flowMetrics,

    // Derived state
    systemStatus,
    statusMetrics,

    // Actions
    setWorkload,
    setUserResources,
    applyWorkloadPreset,
    applyResourcePreset,
  };
}

export default useMetricsCalculation;
