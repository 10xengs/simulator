/**
 * Type definitions for metrics data
 */

export type ResourceStatus = "healthy" | "warning" | "critical";
export type ResourceKey = "cpu" | "memory" | "storage" | "diskIO" | "networkIO";

export type WorkloadParams = {
  requestsPerSecond: number;
  metricsPerRequest: number;
  uniqueMetricsRatio: number;
  calculationComplexity: number;
  flushIntervalSeconds: number;
  retentionPeriodDays: number;
};

export type Resource = {
  value: number;
  unit: string;
  status: ResourceStatus;
  utilization: number;
  explanation: string;
};

export type ResourceRequirements = {
  cpu: Resource;
  memory: Resource;
  diskIO: Resource;
  networkIO: Resource;
  storage: Resource;
};

export type UserResources = {
  cpu: number;
  memory: number;
  diskIO: number;
  networkIO: number;
  storage: number;
  statsdInstances: number;
  carbonInstances: number;
};

export type FlowMetrics = {
  totalMetricsPerSecond: number;
  uniqueMetricsPerSecond: number;
  writesPerSecond: number;
  storagePerDay: number;
  metricsPerInstance: number;
  writesPerInstance: number;
  totalStorageRequired: number;
};

export interface RetentionPolicy {
  resolution: number; // in seconds
  duration: number; // in seconds
}

export interface SimulationResults {
  // Core metrics calculations
  totalUpdatesPerSecond: number;
  estimatedUniqueMetrics: number;
  updatesPerFlushInterval: number;
  totalStorageGB: number;
  bytesPerMetricMB: number;
  totalPoints: number;

  // Resource needs
  statsdInstances: number;
  carbonInstances: number;
  iopsRequired: number;
  cpuCores: number;
  memoryGB: number;

  // Performance metrics
  statsdBottleneckScore: number;
  carbonBottleneckScore: number;
  primaryBottleneckComponent: string;

  // System status
  canRunOnSingleInstance: boolean;
  canRunOnVerticalInstance: boolean;
  optimalScalingStrategy: string;

  // Detailed metrics
  statsdPacketDropRate: number;
  carbonQueueGrowthPerSecond: number;
  memoryPressureStandard: number;
  memoryPressureVertical: number;
  diskIopsUtilization: number;
  verticalStatsdPacketDropRate: number;
  verticalCarbonQueueGrowth: number;
  maxPacketsPerSecondByNetwork: number;
}

export interface DataFlowStatus {
  incoming: { rate: number; status: string };
  statsd: { utilization: number; capacity: number; status: string };
  carbon: { utilization: number; capacity: number; status: string };
  whisper: { iops: number; capacity: number; status: string };
  storage: { sizeGB: number; growthRate: number; status: string };
}

export interface ScalingPoint {
  metric: string;
  value: number;
  threshold: number;
  status: "ok" | "warning" | "critical";
}
