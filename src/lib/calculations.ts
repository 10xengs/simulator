// src/lib/calculations.ts
import {
  WorkloadParams,
  ResourceRequirements,
  UserResources,
  FlowMetrics,
} from "../components/Simulator";
import { Resource } from "../types/metrics";

/**
 * Calculate resource requirements and flow metrics based on workload parameters and user resources
 */
export function calculateResourceRequirements(
  workload: WorkloadParams,
  userResources: UserResources,
): { requirements: ResourceRequirements; flowMetrics: FlowMetrics } {
  // Ensure inputs are valid, defaulting or correcting as needed
  const safeWorkload: WorkloadParams = {
    requestsPerSecond: Math.max(0, workload?.requestsPerSecond || 0),
    metricsPerRequest: Math.max(0, workload?.metricsPerRequest || 0),
    uniqueMetricsRatio: Math.min(
      1,
      Math.max(0, workload?.uniqueMetricsRatio || 0.2),
    ),
    calculationComplexity: Math.max(1, workload?.calculationComplexity || 1),
    flushIntervalSeconds: Math.max(1, workload?.flushIntervalSeconds || 10),
    retentionPeriodDays: Math.max(1, workload?.retentionPeriodDays || 1),
  };

  const safeResources: UserResources = {
    cpu: Math.max(0.1, userResources?.cpu || 1),
    memory: Math.max(0.1, userResources?.memory || 1),
    diskIO: Math.max(1, userResources?.diskIO || 10),
    networkIO: Math.max(1, userResources?.networkIO || 10),
    storage: Math.max(1, userResources?.storage || 10),
    statsdInstances: Math.max(1, userResources?.statsdInstances || 1),
    carbonInstances: Math.max(1, userResources?.carbonInstances || 1),
  };

  // Calculate base metrics flow using safe values
  const totalMetricsPerSecond =
    safeWorkload.requestsPerSecond * safeWorkload.metricsPerRequest;
  const uniqueMetricsPerSecond = Math.ceil(
    totalMetricsPerSecond * safeWorkload.uniqueMetricsRatio,
  );
  const writesPerSecond = uniqueMetricsPerSecond; // In steady state, writes/sec equals unique metrics/sec

  // Calculate per-instance metrics
  const metricsPerInstance = Math.ceil(
    totalMetricsPerSecond / safeResources.statsdInstances,
  );
  const writesPerInstance = Math.ceil(
    writesPerSecond / safeResources.carbonInstances,
  );

  // Average metric size in bytes (name + value + timestamp)
  const avgMetricSizeBytes = 50;

  // Calculate resource requirements

  // CPU calculation
  // StatsD CPU usage is primarily during aggregation and flush
  // Carbon CPU usage scales with write throughput
  // Graphite web CPU scales with query complexity

  // Calculate base CPU requirements as if running on a single instance
  const totalStatsDLoad = totalMetricsPerSecond / 10000; // Base load per 10K metrics
  const singleInstanceStatsDCpu =
    totalStatsDLoad * (1 + Math.log10(Math.max(1, totalStatsDLoad))) * 0.6;

  // Calculate total Carbon CPU needed for all writes (single instance)
  const totalWriteLoad = writesPerSecond / 5000; // Base load per 5K writes
  const singleInstanceCarbonCpu =
    totalWriteLoad * (1 + Math.log10(Math.max(1, totalWriteLoad))) * 1.2;

  // FIXED HORIZONTAL SCALING CALCULATION
  // For real StatsD/Carbon deployments, coordination overhead is minimal (<2% per instance)
  // The overwhelming benefit of horizontal scaling outweighs the coordination cost
  const statsdCoordinationOverhead = 0.015; // 1.5% overhead per additional instance
  const carbonCoordinationOverhead = 0.01; // 1% overhead per additional instance

  // Calculate effective CPU with horizontal scaling
  // First divide by instance count to distribute load, then add minimal coordination overhead
  const statsdCpuCores =
    singleInstanceStatsDCpu / safeResources.statsdInstances +
    singleInstanceStatsDCpu *
      statsdCoordinationOverhead *
      (safeResources.statsdInstances - 1);

  const carbonCpuCores =
    singleInstanceCarbonCpu / safeResources.carbonInstances +
    singleInstanceCarbonCpu *
      carbonCoordinationOverhead *
      (safeResources.carbonInstances - 1);

  const graphiteCpuCores =
    (safeWorkload.calculationComplexity / 5) *
    (1 + safeWorkload.calculationComplexity / 10) *
    0.4;
  const totalCpuRequired = Math.max(
    0.1,
    statsdCpuCores + carbonCpuCores + graphiteCpuCores,
  );

  // Memory calculation
  // StatsD memory usage is proportional to unique metrics * flush interval
  // Carbon memory usage is for caching metrics and write buffers
  // Graphite web memory is for query processing and JVM overhead
  const bytesPerMetricInMemory = 150; // Average bytes per metric in memory including overhead

  // Calculate base memory as if running on single instances
  const singleInstanceStatsDMemory =
    (uniqueMetricsPerSecond *
      safeWorkload.flushIntervalSeconds *
      bytesPerMetricInMemory *
      1.2) /
    (1024 * 1024 * 1024);

  const singleInstanceCarbonMemory =
    (uniqueMetricsPerSecond * 10 * bytesPerMetricInMemory) /
    (1024 * 1024 * 1024);

  // FIXED MEMORY SCALING
  // Memory has two components:
  // 1. Fixed JVM/process overhead per instance (small but unavoidable)
  // 2. Data-dependent memory that scales with workload (divisible across instances)

  // Reduce per-instance overhead to realistic values based on StatsD/Carbon benchmarks
  // In production, per-instance overhead is much smaller than we previously modeled
  const statsdInstanceOverhead = 0.05; // 50MB fixed overhead per StatsD instance
  const carbonInstanceOverhead = 0.075; // 75MB fixed overhead per Carbon instance

  // Calculate total memory with fixed overhead and distributed workload
  // The workload portion scales better than linearly due to less hash contention
  // Most real-world deployments see 10-15% memory efficiency gain with multiple instances
  const memoryEfficiency = 0.85; // 15% efficiency gain with multiple instances

  // Memory is the sum of:
  // 1. Data-dependent memory (divided by instances, with an efficiency gain)
  // 2. Fixed overhead per instance (minimal)
  const statsdMemoryGB =
    (singleInstanceStatsDMemory * memoryEfficiency) /
      safeResources.statsdInstances +
    statsdInstanceOverhead * safeResources.statsdInstances;

  // Carbon memory includes write cache that scales with write load per instance
  // This creates an efficiency gain when distributing the load
  const writeLoadFactor = Math.min(1.2, 1 + (writesPerInstance / 10000) * 0.2);

  // Apply similar efficiency gain to Carbon
  const carbonMemoryGB =
    ((singleInstanceCarbonMemory * memoryEfficiency) /
      safeResources.carbonInstances) *
      writeLoadFactor +
    carbonInstanceOverhead * safeResources.carbonInstances;

  // Apply a maximum cap to instance count for memory efficiency
  // Beyond 8-10 instances, memory benefit plateaus in real-world systems
  // This prevents adding 20+ instances from using more memory than necessary
  const effectiveStatsDMemory = Math.min(
    statsdMemoryGB,
    singleInstanceStatsDMemory * 0.4 + statsdInstanceOverhead,
  );
  const effectiveCarbonMemory = Math.min(
    carbonMemoryGB,
    singleInstanceCarbonMemory * 0.4 + carbonInstanceOverhead,
  );

  // Graphite memory with JVM overhead and query complexity impact
  const baseGraphiteMemory = 0.5; // Base 512MB for JVM
  const graphiteMemoryGB =
    baseGraphiteMemory +
    (safeWorkload.calculationComplexity / 5) *
      (1 + uniqueMetricsPerSecond / 100000) *
      2;

  const totalMemoryRequired = Math.max(
    0.5,
    effectiveStatsDMemory + effectiveCarbonMemory + graphiteMemoryGB,
  );

  // Disk I/O calculation - properly accounts for horizontal scaling
  const baseIopsPerWrite = 2.5; // Base IOPS per write operation
  const randomIoFactor = 1 + (uniqueMetricsPerSecond / 6000) * 0.4;

  // FIXED DISK I/O SCALING
  // Disk I/O is the most direct benefit of Carbon horizontal scaling
  // Each instance handles its own local whisper files with minimal coordination
  // Real-world scaling shows nearly linear improvement (95%+ efficiency)

  // Scale disk I/O inversely with number of carbon instances
  // Add tiny overhead (0.5% per instance) for metrics distribution
  const ioCoordinationOverhead = 0.005; // 0.5% coordination overhead per instance
  const diskScalingFactor =
    (1.0 / safeResources.carbonInstances) *
    (1 + ioCoordinationOverhead * (safeResources.carbonInstances - 1));

  // Final I/O calculation - almost perfectly scales with instance count
  const effectiveIopsPerWrite =
    baseIopsPerWrite * randomIoFactor * diskScalingFactor;

  const effectiveBlockSize = 4096; // Typical filesystem block size
  const metadataOverhead = 1.15; // 15% overhead for filesystem metadata
  const bytesPerOperation =
    Math.ceil(100 / effectiveBlockSize) * effectiveBlockSize * metadataOverhead;
  const diskIopsRequired = writesPerSecond * effectiveIopsPerWrite;
  const diskIORequired =
    Math.ceil(((diskIopsRequired * bytesPerOperation) / (1024 * 1024)) * 10) /
    10;

  // Network I/O calculation with proper horizontal scaling
  // FIXED NETWORK SCALING
  // Network traffic has three components with different scaling characteristics:
  // 1. Client → StatsD traffic: benefits from load distribution across StatsD instances
  // 2. StatsD → Carbon traffic: scales with both instance types
  // 3. Carbon → Client query traffic: relatively fixed, more instances don't increase it

  // 1. Client → StatsD traffic
  // Distributes across StatsD instances with minimal overhead
  // The key insight: adding StatsD instances DECREASES network load per instance
  const clientToStatsDOverhead = 0.01; // 1% overhead for load balancing
  const clientStatsDTraffic =
    (totalMetricsPerSecond * avgMetricSizeBytes * 8) / (1024 * 1024);
  const perInstanceStatsDInbound =
    (clientStatsDTraffic / safeResources.statsdInstances) *
    (1 + clientToStatsDOverhead * (safeResources.statsdInstances - 1));

  // 2. StatsD → Carbon traffic
  // Aggregated metrics from StatsD to Carbon, compressed by aggregation (~30% of original size)
  // Also benefits from distribution across Carbon instances
  const statsdToCarbonRatio = 0.3; // StatsD aggregates metrics, reducing traffic by ~70%
  const interNodeOverhead = 0.005; // 0.5% coordination overhead per node

  // Calculate traffic between StatsD and Carbon nodes
  // Total traffic is scaled by carbon instances for distribution
  const statsdToCarbonTraffic = clientStatsDTraffic * statsdToCarbonRatio;
  const perInstanceCarbonInbound =
    (statsdToCarbonTraffic / safeResources.carbonInstances) *
    (1 +
      interNodeOverhead *
        Math.max(
          1,
          safeResources.statsdInstances + safeResources.carbonInstances - 2,
        ));

  // 3. Query traffic (Carbon/Graphite to clients)
  // Not affected much by instance count, depends on query complexity
  const queryTrafficMbps =
    clientStatsDTraffic * 0.05 * safeWorkload.calculationComplexity;

  // Total network requirement: sum of peak traffic at each tier
  // Use max to represent peak load at different network segments
  const maxInboundTraffic = Math.max(
    clientStatsDTraffic, // Client → StatsD (total)
    statsdToCarbonTraffic, // StatsD → Carbon (total)
  );

  // Add query traffic to get total network bandwidth needed
  const totalNetworkRequired =
    Math.ceil((maxInboundTraffic + queryTrafficMbps) * 10) / 10;

  // Storage calculation (not a real-time resource but important for planning)
  // Storage is not affected by instance count - only by data volume and retention
  const bytesPerStoredPoint = 12; // 4 bytes timestamp + 8 bytes value
  const pointsPerMetricPerDay = 86400 / 10; // Assuming 10-second resolution
  const dailyStorageGB =
    (uniqueMetricsPerSecond * pointsPerMetricPerDay * bytesPerStoredPoint) /
    (1024 * 1024 * 1024);

  // Calculate resource status and utilization
  // Helper function to determine resource status
  function getResourceStatus(
    required: number,
    available: number,
  ): "healthy" | "warning" | "critical" {
    const utilization = required / available;
    if (utilization > 0.9) return "critical";
    if (utilization > 0.7) return "warning";
    return "healthy";
  }

  // Prepare resource information
  const cpuStatus = getResourceStatus(totalCpuRequired, safeResources.cpu);
  const memoryStatus = getResourceStatus(
    totalMemoryRequired,
    safeResources.memory,
  );
  const diskIOStatus = getResourceStatus(diskIORequired, safeResources.diskIO);
  const networkIOStatus = getResourceStatus(
    totalNetworkRequired,
    safeResources.networkIO,
  );
  const storageStatus = getResourceStatus(
    dailyStorageGB * safeWorkload.retentionPeriodDays,
    safeResources.storage,
  );

  // Create CPU resource info
  const cpuResource: Resource = {
    value: Math.ceil(totalCpuRequired * 10) / 10, // Round to 1 decimal
    unit: "cores",
    status: cpuStatus,
    utilization: totalCpuRequired / safeResources.cpu,
    explanation:
      safeResources.statsdInstances > 1 || safeResources.carbonInstances > 1
        ? `StatsD (${safeResources.statsdInstances} inst): ${Math.round(statsdCpuCores * 10) / 10} cores total (${Math.round((statsdCpuCores / safeResources.statsdInstances) * 100) / 100}/inst), Carbon (${safeResources.carbonInstances} inst): ${Math.round(carbonCpuCores * 10) / 10} cores total (${Math.round((carbonCpuCores / safeResources.carbonInstances) * 100) / 100}/inst), Graphite: ${Math.round(graphiteCpuCores * 10) / 10} cores.`
        : `StatsD: ${Math.round(statsdCpuCores * 10) / 10} cores, Carbon: ${Math.round(carbonCpuCores * 10) / 10} cores, Graphite: ${Math.round(graphiteCpuCores * 10) / 10} cores. Processing ${totalMetricsPerSecond.toLocaleString()} metrics/sec.`,
  };

  // Create memory resource info
  const memoryResource: Resource = {
    value: Math.ceil(totalMemoryRequired * 10) / 10, // Round to 1 decimal
    unit: "GB",
    status: memoryStatus,
    utilization: totalMemoryRequired / safeResources.memory,
    explanation:
      safeResources.statsdInstances > 1 || safeResources.carbonInstances > 1
        ? `StatsD (${safeResources.statsdInstances} inst): ${Math.round(effectiveStatsDMemory * 100) / 100} GB (${Math.round(((effectiveStatsDMemory - statsdInstanceOverhead * safeResources.statsdInstances) / safeResources.statsdInstances) * 100) / 100} GB data/inst, ${statsdInstanceOverhead} GB fixed/inst). Carbon (${safeResources.carbonInstances} inst): ${Math.round(effectiveCarbonMemory * 100) / 100} GB (${Math.round(((effectiveCarbonMemory - carbonInstanceOverhead * safeResources.carbonInstances) / safeResources.carbonInstances) * 100) / 100} GB data/inst, ${carbonInstanceOverhead} GB fixed/inst). Graphite: ${Math.round(graphiteMemoryGB * 100) / 100} GB.`
        : `StatsD: ${Math.round(statsdMemoryGB * 100) / 100} GB, Carbon: ${Math.round(carbonMemoryGB * 100) / 100} GB, Graphite: ${Math.round(graphiteMemoryGB * 100) / 100} GB. Storing ${uniqueMetricsPerSecond.toLocaleString()} unique metrics.`,
  };

  // Create disk I/O resource info
  const diskIOResource: Resource = {
    value: diskIORequired,
    unit: "MB/s",
    status: diskIOStatus,
    utilization: diskIORequired / safeResources.diskIO,
    explanation:
      safeResources.carbonInstances > 1
        ? `Carbon (${safeResources.carbonInstances} inst): ${diskIORequired} MB/s total (${Math.round((diskIORequired / safeResources.carbonInstances) * 10) / 10} MB/s per instance). Processing ${writesPerSecond.toLocaleString()} writes/sec (${writesPerInstance.toLocaleString()} per instance).`
        : `Carbon needs ~${diskIopsRequired.toLocaleString()} IOPS (${diskIORequired} MB/s) to write ${writesPerSecond.toLocaleString()} metrics/sec to Whisper files.`,
  };

  // Create network I/O resource info
  const networkIOResource: Resource = {
    value: totalNetworkRequired,
    unit: "Mbps",
    status: networkIOStatus,
    utilization: totalNetworkRequired / safeResources.networkIO,
    explanation:
      safeResources.statsdInstances > 1 || safeResources.carbonInstances > 1
        ? `Client traffic: ${Math.round(clientStatsDTraffic * 10) / 10} Mbps total (${Math.round(perInstanceStatsDInbound * 10) / 10} Mbps per StatsD), Internal: ${Math.round(statsdToCarbonTraffic * 10) / 10} Mbps total (${Math.round(perInstanceCarbonInbound * 10) / 10} Mbps per Carbon), Query: ${Math.round(queryTrafficMbps * 10) / 10} Mbps.`
        : `Inbound: ${Math.round(clientStatsDTraffic * 10) / 10} Mbps, Outbound: ${Math.round(queryTrafficMbps * 10) / 10} Mbps. Processing ${totalMetricsPerSecond.toLocaleString()} total metrics.`,
  };

  // Create storage resource info
  const storageResource: Resource = {
    value: Math.ceil(dailyStorageGB * 10) / 10, // Round to 1 decimal
    unit: "GB/day",
    status: storageStatus,
    utilization:
      (dailyStorageGB * safeWorkload.retentionPeriodDays) /
      safeResources.storage,
    explanation: `Daily storage growth: ${Math.round(dailyStorageGB * 10) / 10} GB/day. ${safeWorkload.retentionPeriodDays}-day storage requirement: ${Math.round(dailyStorageGB * safeWorkload.retentionPeriodDays * 10) / 10} GB.`,
  };

  // Combine all resources
  const resourceRequirements: ResourceRequirements = {
    cpu: cpuResource,
    memory: memoryResource,
    diskIO: diskIOResource,
    networkIO: networkIOResource,
    storage: storageResource,
  };

  // Flow metrics for visualization
  const flowMetrics: FlowMetrics = {
    totalMetricsPerSecond,
    uniqueMetricsPerSecond,
    writesPerSecond,
    storagePerDay: dailyStorageGB,
    metricsPerInstance,
    writesPerInstance,
    totalStorageRequired: dailyStorageGB * safeWorkload.retentionPeriodDays,
  };

  return { requirements: resourceRequirements, flowMetrics };
}

/**
 * Utility function to format numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Get a recommended scaling strategy based on the resource requirements
 */
export function getScalingRecommendation(
  requirements: ResourceRequirements,
): string {
  const maxUtilization = Math.max(
    requirements.cpu.utilization,
    requirements.memory.utilization,
    requirements.diskIO.utilization,
    requirements.networkIO.utilization,
  );

  if (maxUtilization <= 0.5) {
    return "Current resources are adequate with room for growth.";
  } else if (maxUtilization <= 0.7) {
    return "Current resources are adequate but approaching capacity.";
  } else if (maxUtilization <= 0.9) {
    return "Consider scaling the highlighted resources soon.";
  } else {
    return "Immediate scaling recommended for highlighted resources.";
  }
}

/**
 * Identify the primary bottleneck in the system
 */
export function identifyBottleneck(requirements: ResourceRequirements): string {
  const resources = [
    { name: "CPU", utilization: requirements.cpu.utilization },
    { name: "Memory", utilization: requirements.memory.utilization },
    { name: "Disk I/O", utilization: requirements.diskIO.utilization },
    { name: "Network I/O", utilization: requirements.networkIO.utilization },
  ];

  resources.sort((a, b) => b.utilization - a.utilization);

  if (resources[0].utilization > 0.7) {
    return `Primary bottleneck: ${resources[0].name} (${Math.round(resources[0].utilization * 100)}% utilized)`;
  }

  return "No significant bottlenecks detected";
}

/**
 * Analyzes how resources change when scaling instances, and validates that
 * the scaling behavior follows expected patterns.
 *
 * @param workload Current workload parameters
 * @param currentResources Base resource configuration to analyze
 * @returns Scaling analysis results including efficiency metrics and recommendations
 */
export function validateInstanceScaling(
  workload: WorkloadParams,
  currentResources: UserResources,
) {
  // Track key metrics across different scaling scenarios
  const results = {
    // Collector (StatsD) scaling effects
    collectorScaling: {
      instances: [] as number[],
      metricsPerInstance: [] as number[],
      cpuEfficiency: [] as number[],
      memoryEfficiency: [] as number[],
      networkOverhead: [] as number[],
    },

    // Processor (Carbon) scaling effects
    processorScaling: {
      instances: [] as number[],
      writesPerInstance: [] as number[],
      cpuEfficiency: [] as number[],
      memoryEfficiency: [] as number[],
      diskIoEfficiency: [] as number[],
    },

    // Analysis results
    analysis: {
      collectorIdealCount: 0,
      processorIdealCount: 0,
      collectorEfficiencyGain: 0,
      processorEfficiencyGain: 0,
      combinedScalingRecommendation: "",
    },
  };

  // Get baseline metrics with single instance configuration
  const singleInstanceResources = {
    ...currentResources,
    statsdInstances: 1,
    carbonInstances: 1,
  };

  const baselineResult = calculateResourceRequirements(
    workload,
    singleInstanceResources,
  );

  // Test collector (StatsD) scaling from 1 to 8 instances
  for (let instances = 1; instances <= 8; instances++) {
    const testResources = {
      ...currentResources,
      statsdInstances: instances,
      carbonInstances: 1, // Keep Carbon constant
    };

    const result = calculateResourceRequirements(workload, testResources);

    // Calculate efficiency: ratio of single instance resources to scaled resources
    // Values < 1.0 mean better efficiency (uses less resources per unit of work)
    // Values > 1.0 mean worse efficiency (overhead exceeds scaling benefits)
    const cpuPer10kMetrics =
      result.requirements.cpu.value /
      (result.flowMetrics.totalMetricsPerSecond / 10000);
    const baselineCpuPer10kMetrics =
      baselineResult.requirements.cpu.value /
      (baselineResult.flowMetrics.totalMetricsPerSecond / 10000);
    const cpuEfficiency = cpuPer10kMetrics / baselineCpuPer10kMetrics;

    // Memory efficiency calculation
    const memoryPerUniqueMetric =
      result.requirements.memory.value /
      result.flowMetrics.uniqueMetricsPerSecond;
    const baselineMemoryPerUniqueMetric =
      baselineResult.requirements.memory.value /
      baselineResult.flowMetrics.uniqueMetricsPerSecond;
    const memoryEfficiency =
      memoryPerUniqueMetric / baselineMemoryPerUniqueMetric;

    // Network overhead
    const networkRatio =
      result.requirements.networkIO.value /
      baselineResult.requirements.networkIO.value;

    // Track results
    results.collectorScaling.instances.push(instances);
    results.collectorScaling.metricsPerInstance.push(
      result.flowMetrics.metricsPerInstance,
    );
    results.collectorScaling.cpuEfficiency.push(cpuEfficiency);
    results.collectorScaling.memoryEfficiency.push(memoryEfficiency);
    results.collectorScaling.networkOverhead.push(networkRatio);
  }

  // Test processor (Carbon) scaling from 1 to 8 instances
  for (let instances = 1; instances <= 8; instances++) {
    const testResources = {
      ...currentResources,
      statsdInstances: 1, // Keep StatsD constant
      carbonInstances: instances,
    };

    const result = calculateResourceRequirements(workload, testResources);

    // Calculate efficiency metrics
    const cpuPerWrite =
      result.requirements.cpu.value / result.flowMetrics.writesPerSecond;
    const baselineCpuPerWrite =
      baselineResult.requirements.cpu.value /
      baselineResult.flowMetrics.writesPerSecond;
    const cpuEfficiency = cpuPerWrite / baselineCpuPerWrite;

    const memoryPerUniqueMetric =
      result.requirements.memory.value /
      result.flowMetrics.uniqueMetricsPerSecond;
    const baselineMemoryPerUniqueMetric =
      baselineResult.requirements.memory.value /
      baselineResult.flowMetrics.uniqueMetricsPerSecond;
    const memoryEfficiency =
      memoryPerUniqueMetric / baselineMemoryPerUniqueMetric;

    // I/O efficiency - should improve with more instances (value < 1.0)
    const diskIoRatio =
      result.requirements.diskIO.value /
      baselineResult.requirements.diskIO.value;

    // Track results
    results.processorScaling.instances.push(instances);
    results.processorScaling.writesPerInstance.push(
      result.flowMetrics.writesPerInstance,
    );
    results.processorScaling.cpuEfficiency.push(cpuEfficiency);
    results.processorScaling.memoryEfficiency.push(memoryEfficiency);
    results.processorScaling.diskIoEfficiency.push(diskIoRatio);
  }

  // Analyze collector (StatsD) scaling efficiency
  // Find where efficiency is best (where the value is lowest)
  let bestCollectorEfficiency = 1.0;
  let idealCollectorCount = 1;

  for (let i = 0; i < results.collectorScaling.instances.length; i++) {
    const currentEfficiency = results.collectorScaling.cpuEfficiency[i];
    if (currentEfficiency < bestCollectorEfficiency) {
      bestCollectorEfficiency = currentEfficiency;
      idealCollectorCount = results.collectorScaling.instances[i];
    }
  }

  // Calculate efficiency gain compared to single instance
  const collectorEfficiencyGain = (1.0 - bestCollectorEfficiency) * 100;

  // Analyze processor (Carbon) scaling efficiency
  // Find where efficiency is best for disk I/O (where the value is lowest)
  let bestProcessorEfficiency = 1.0;
  let idealProcessorCount = 1;

  for (let i = 0; i < results.processorScaling.instances.length; i++) {
    const currentEfficiency = results.processorScaling.diskIoEfficiency[i];
    if (currentEfficiency < bestProcessorEfficiency) {
      bestProcessorEfficiency = currentEfficiency;
      idealProcessorCount = results.processorScaling.instances[i];
    }
  }

  // Calculate efficiency gain compared to single instance
  const processorEfficiencyGain = (1.0 - bestProcessorEfficiency) * 100;

  // Set analysis results
  results.analysis.collectorIdealCount = idealCollectorCount;
  results.analysis.processorIdealCount = idealProcessorCount;
  results.analysis.collectorEfficiencyGain =
    Math.round(collectorEfficiencyGain * 10) / 10;
  results.analysis.processorEfficiencyGain =
    Math.round(processorEfficiencyGain * 10) / 10;

  // Generate scaling recommendation
  const baseResult = calculateResourceRequirements(workload, currentResources);
  const highestUtilization = Math.max(
    baseResult.requirements.cpu.utilization,
    baseResult.requirements.memory.utilization,
    baseResult.requirements.diskIO.utilization,
    baseResult.requirements.networkIO.utilization,
  );

  let recommendation = "";

  if (highestUtilization < 0.5) {
    recommendation =
      "Current resource allocation is sufficient; no scaling needed.";
  } else if (highestUtilization < 0.7) {
    if (idealCollectorCount > currentResources.statsdInstances) {
      recommendation = `Consider increasing collector instances to ${idealCollectorCount} for better load distribution (${Math.round(collectorEfficiencyGain)}% efficiency gain).`;
    } else if (idealProcessorCount > currentResources.carbonInstances) {
      recommendation = `Consider increasing processor instances to ${idealProcessorCount} for better I/O performance (${Math.round(processorEfficiencyGain)}% efficiency gain).`;
    } else {
      recommendation = "Current instance counts are optimal for this workload.";
    }
  } else if (highestUtilization < 0.9) {
    if (baseResult.requirements.networkIO.utilization >= 0.7) {
      recommendation = `Scale up collector instances to ${idealCollectorCount} to distribute network load (${Math.round(collectorEfficiencyGain)}% improvement).`;
    } else if (baseResult.requirements.diskIO.utilization >= 0.7) {
      recommendation = `Increase processor instances to ${idealProcessorCount} to reduce I/O pressure (${Math.round(processorEfficiencyGain)}% improvement).`;
    } else {
      recommendation = `Scale up both collector (${idealCollectorCount}) and processor (${idealProcessorCount}) instances for balanced performance.`;
    }
  } else {
    // Critical utilization
    recommendation = `Urgent: Increase both hardware capacity and instance counts (${Math.max(idealCollectorCount, 2)} collectors, ${Math.max(idealProcessorCount, 2)} processors).`;
  }

  results.analysis.combinedScalingRecommendation = recommendation;

  return results;
}
