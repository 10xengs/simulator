import { calculateResourceRequirements } from "../../lib/calculations";
import { WorkloadParams, UserResources } from "../../components/Simulator";

// Test workload representing a moderate-sized application
const TEST_WORKLOAD: WorkloadParams = {
  requestsPerSecond: 2000,
  metricsPerRequest: 100,
  uniqueMetricsRatio: 0.25,
  calculationComplexity: 3,
  flushIntervalSeconds: 10,
  retentionPeriodDays: 30,
};

// Base resources with a single instance
const BASE_RESOURCES: UserResources = {
  cpu: 8,
  memory: 16,
  diskIO: 200,
  networkIO: 1000,
  storage: 1000,
  statsdInstances: 1,
  carbonInstances: 1,
};

describe("Horizontal Scaling Tests", () => {
  // Test horizontal scaling of collector instances (statsdInstances)
  it("should reduce resource pressure when scaling StatsD collectors horizontally", () => {
    // Calculate with 1 collector instance
    const singleCollectorResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      BASE_RESOURCES,
    );

    // Calculate with 4 collector instances
    const multiCollectorResources = {
      ...BASE_RESOURCES,
      statsdInstances: 4, // Scale to 4 instances
    };
    const multiCollectorResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      multiCollectorResources,
    );

    // Per-instance metrics should decrease proportionally
    expect(multiCollectorResult.flowMetrics.metricsPerInstance).toBeLessThan(
      singleCollectorResult.flowMetrics.metricsPerInstance,
    );

    // MOST IMPORTANT TEST: Verify that resource pressure is REDUCED with horizontal scaling
    // CPU requirements should not increase more than ~20% even with 4x instances
    // (small overhead for coordination is acceptable)
    const maxAcceptableOverhead = 1.2; // 20% overhead is acceptable
    const cpuRatio =
      multiCollectorResult.requirements.cpu.value /
      singleCollectorResult.requirements.cpu.value;
    expect(cpuRatio).toBeLessThan(maxAcceptableOverhead);

    // Memory might have per-instance overhead, but should still grow sub-linearly
    const memoryRatio =
      multiCollectorResult.requirements.memory.value /
      singleCollectorResult.requirements.memory.value;
    expect(memoryRatio).toBeLessThan(2.0); // Should not double with 4x instances

    // Network I/O should be roughly similar or even better with more instances
    const networkRatio =
      multiCollectorResult.requirements.networkIO.value /
      singleCollectorResult.requirements.networkIO.value;
    expect(networkRatio).toBeLessThan(1.5);

    // Utilization should decrease when adding more instances
    expect(multiCollectorResult.requirements.cpu.utilization).toBeLessThan(
      singleCollectorResult.requirements.cpu.utilization,
    );
  });

  // Test horizontal scaling of processor instances (carbonInstances)
  it("should reduce resource pressure when scaling Carbon processors horizontally", () => {
    // Calculate with 1 processor instance
    const singleProcessorResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      BASE_RESOURCES,
    );

    // Calculate with 4 processor instances
    const multiProcessorResources = {
      ...BASE_RESOURCES,
      carbonInstances: 4, // Scale to 4 instances
    };
    const multiProcessorResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      multiProcessorResources,
    );

    // Per-instance writes should decrease proportionally
    expect(multiProcessorResult.flowMetrics.writesPerInstance).toBeLessThan(
      singleProcessorResult.flowMetrics.writesPerInstance,
    );

    // Disk I/O should improve significantly (near-linear scaling)
    // This is the key benefit of Carbon horizontal scaling
    const diskIORatio =
      multiProcessorResult.requirements.diskIO.value /
      singleProcessorResult.requirements.diskIO.value;
    expect(diskIORatio).toBeLessThan(0.5); // Should be at least 50% better with 4x instances

    // CPU requirements should not increase significantly
    const cpuRatio =
      multiProcessorResult.requirements.cpu.value /
      singleProcessorResult.requirements.cpu.value;
    expect(cpuRatio).toBeLessThan(1.2); // 20% overhead is acceptable

    // Memory has per-instance overhead but should still be sub-linear
    const memoryRatio =
      multiProcessorResult.requirements.memory.value /
      singleProcessorResult.requirements.memory.value;
    expect(memoryRatio).toBeLessThan(2.0); // Should not double with 4x instances

    // Utilization should decrease for the main bottleneck (disk I/O) when adding more instances
    expect(multiProcessorResult.requirements.diskIO.utilization).toBeLessThan(
      singleProcessorResult.requirements.diskIO.utilization,
    );
  });

  // Test horizontal scaling of both components together
  it("should optimize resource usage when scaling both collectors and processors", () => {
    // Calculate with 1 instance of each
    const singleInstanceResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      BASE_RESOURCES,
    );

    // Calculate with 4 instances of each
    const multiInstanceResources = {
      ...BASE_RESOURCES,
      statsdInstances: 4,
      carbonInstances: 4,
    };
    const multiInstanceResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      multiInstanceResources,
    );

    // Per-instance metrics should decrease proportionally
    expect(multiInstanceResult.flowMetrics.metricsPerInstance).toBeLessThan(
      singleInstanceResult.flowMetrics.metricsPerInstance,
    );
    expect(multiInstanceResult.flowMetrics.writesPerInstance).toBeLessThan(
      singleInstanceResult.flowMetrics.writesPerInstance,
    );

    // Network I/O should be modestly affected (slight overhead for coordination)
    const networkRatio =
      multiInstanceResult.requirements.networkIO.value /
      singleInstanceResult.requirements.networkIO.value;
    expect(networkRatio).toBeLessThan(1.5);

    // High-level validation: overall resource efficiency should be better
    // Calculate a composite "efficiency score" based on CPU, memory, and I/O utilization
    const singleInstanceEfficiency =
      singleInstanceResult.requirements.cpu.utilization +
      singleInstanceResult.requirements.memory.utilization +
      singleInstanceResult.requirements.diskIO.utilization;

    const multiInstanceEfficiency =
      multiInstanceResult.requirements.cpu.utilization +
      multiInstanceResult.requirements.memory.utilization +
      multiInstanceResult.requirements.diskIO.utilization;

    // Overall resource efficiency should be better with multiple instances
    expect(multiInstanceEfficiency).toBeLessThan(singleInstanceEfficiency);
  });

  // Test extreme horizontal scaling (many instances)
  it("should handle high instance counts gracefully", () => {
    // Calculate with 1 instance of each
    const singleInstanceResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      BASE_RESOURCES,
    );

    // Calculate with 16 instances of each (extreme case)
    const extremeScalingResources = {
      ...BASE_RESOURCES,
      statsdInstances: 16,
      carbonInstances: 16,
    };
    const extremeScalingResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      extremeScalingResources,
    );

    // Coordination overhead increases, but total requirements still shouldn't explode
    // CPU should be at most 2x the single instance (otherwise scaling is broken)
    const cpuRatio =
      extremeScalingResult.requirements.cpu.value /
      singleInstanceResult.requirements.cpu.value;
    expect(cpuRatio).toBeLessThan(2.0);

    // Disk I/O should still be much better than single instance
    const diskIORatio =
      extremeScalingResult.requirements.diskIO.value /
      singleInstanceResult.requirements.diskIO.value;
    expect(diskIORatio).toBeLessThan(0.4); // At least 60% reduction in I/O

    // Very high instance counts should still have valid values
    expect(extremeScalingResult.requirements.cpu.value).toBeGreaterThan(0);
    expect(extremeScalingResult.requirements.memory.value).toBeGreaterThan(0);
    expect(extremeScalingResult.requirements.diskIO.value).toBeGreaterThan(0);
    expect(extremeScalingResult.requirements.networkIO.value).toBeGreaterThan(
      0,
    );
  });
});
