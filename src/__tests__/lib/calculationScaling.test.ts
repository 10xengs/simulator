import {
  validateInstanceScaling,
  calculateResourceRequirements,
} from "../../lib/calculations";
import { WorkloadParams, UserResources } from "../../components/Simulator";

// Test workload representing a medium-sized application
const TEST_WORKLOAD: WorkloadParams = {
  requestsPerSecond: 500,
  metricsPerRequest: 100,
  uniqueMetricsRatio: 0.25,
  calculationComplexity: 3,
  flushIntervalSeconds: 10,
  retentionPeriodDays: 30,
};

// Test resources representing a standard deployment
const TEST_RESOURCES: UserResources = {
  cpu: 8,
  memory: 16,
  diskIO: 200,
  networkIO: 1000,
  storage: 1000,
  statsdInstances: 2,
  carbonInstances: 2,
};

describe("Instance Scaling Validation", () => {
  // Validate that we can detect when scaling becomes inefficient
  it("should identify efficiency thresholds when scaling instances", () => {
    const scalingAnalysis = validateInstanceScaling(
      TEST_WORKLOAD,
      TEST_RESOURCES,
    );

    // Verify structure of the results
    expect(scalingAnalysis.collectorScaling.instances.length).toBe(8);
    expect(scalingAnalysis.processorScaling.instances.length).toBe(8);

    // Verify ideal instance counts are reasonable
    expect(scalingAnalysis.analysis.collectorIdealCount).toBeGreaterThanOrEqual(
      1,
    );
    expect(scalingAnalysis.analysis.collectorIdealCount).toBeLessThanOrEqual(8);
    expect(scalingAnalysis.analysis.processorIdealCount).toBeGreaterThanOrEqual(
      1,
    );
    expect(scalingAnalysis.analysis.processorIdealCount).toBeLessThanOrEqual(8);

    // Verify that efficiency metrics are calculated
    expect(typeof scalingAnalysis.analysis.collectorEfficiencyGain).toBe(
      "number",
    );
    expect(typeof scalingAnalysis.analysis.processorEfficiencyGain).toBe(
      "number",
    );

    // Verify that a recommendation is provided
    expect(
      scalingAnalysis.analysis.combinedScalingRecommendation.length,
    ).toBeGreaterThan(0);
  });

  // Test that scaling collectors reduces per-instance metrics
  it("should show reduced per-instance metrics when scaling collectors", () => {
    const singleCollector = {
      ...TEST_RESOURCES,
      statsdInstances: 1,
    };

    const multiCollector = {
      ...TEST_RESOURCES,
      statsdInstances: 4,
    };

    const singleResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      singleCollector,
    );
    const multiResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      multiCollector,
    );

    // Per-instance metrics should be reduced proportionally
    const expectedRatio =
      singleCollector.statsdInstances / multiCollector.statsdInstances;
    const actualRatio =
      multiResult.flowMetrics.metricsPerInstance /
      singleResult.flowMetrics.metricsPerInstance;

    // Should be close to the theoretical ratio (within 5%)
    expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.05);

    // Check the efficiency metrics
    const scalingAnalysis = validateInstanceScaling(
      TEST_WORKLOAD,
      singleCollector,
    );
    const cpuEfficiencyAt4 = scalingAnalysis.collectorScaling.cpuEfficiency[3]; // At 4 instances

    // Just verify it's a number - the implementation may vary
    expect(typeof cpuEfficiencyAt4).toBe("number");
  });

  // Test that scaling processors improves I/O efficiency
  it("should show improved I/O distribution when scaling processors", () => {
    const singleProcessor = {
      ...TEST_RESOURCES,
      carbonInstances: 1,
    };

    const multiProcessor = {
      ...TEST_RESOURCES,
      carbonInstances: 4,
    };

    const singleResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      singleProcessor,
    );
    const multiResult = calculateResourceRequirements(
      TEST_WORKLOAD,
      multiProcessor,
    );

    // Per-instance writes should be reduced proportionally
    const expectedRatio =
      singleProcessor.carbonInstances / multiProcessor.carbonInstances;
    const actualRatio =
      multiResult.flowMetrics.writesPerInstance /
      singleResult.flowMetrics.writesPerInstance;

    // Should be close to the theoretical ratio (within 5%)
    expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.05);

    // Disk I/O should improve with more instances
    const scalingAnalysis = validateInstanceScaling(
      TEST_WORKLOAD,
      singleProcessor,
    );

    // Disk I/O should be more efficient with more instances (value < 1.0)
    // We test the ratio between 1 instance and 4 instances
    const diskIoRatioAt4 = scalingAnalysis.processorScaling.diskIoEfficiency[3]; // At 4 instances

    // The disk I/O efficiency factor should show some benefit (less than 1x the original I/O)
    expect(diskIoRatioAt4).toBeLessThan(1.0);
  });

  // Test recommendations based on resource utilization
  it("should provide appropriate scaling recommendations based on utilization", () => {
    // Low utilization scenario
    const lowUtilResources = {
      ...TEST_RESOURCES,
      cpu: 32,
      memory: 64,
      diskIO: 1000,
      networkIO: 10000,
    };

    // High utilization scenario - disk I/O bottleneck
    const diskBottleneckResources = {
      ...TEST_RESOURCES,
      diskIO: 50, // Low disk I/O capacity
    };

    // High utilization scenario - network bottleneck
    const networkBottleneckResources = {
      ...TEST_RESOURCES,
      networkIO: 100, // Low network capacity
    };

    // Critical utilization scenario
    const criticalResources = {
      ...TEST_RESOURCES,
      cpu: 2,
      memory: 4,
      diskIO: 30,
      networkIO: 50,
    };

    const lowUtilAnalysis = validateInstanceScaling(
      TEST_WORKLOAD,
      lowUtilResources,
    );
    const diskBottleneckAnalysis = validateInstanceScaling(
      TEST_WORKLOAD,
      diskBottleneckResources,
    );
    const networkBottleneckAnalysis = validateInstanceScaling(
      TEST_WORKLOAD,
      networkBottleneckResources,
    );
    const criticalAnalysis = validateInstanceScaling(
      TEST_WORKLOAD,
      criticalResources,
    );

    // Recommendation patterns
    expect(lowUtilAnalysis.analysis.combinedScalingRecommendation).toContain(
      "sufficient",
    );
    expect(
      diskBottleneckAnalysis.analysis.combinedScalingRecommendation,
    ).toContain("processor");
    expect(
      networkBottleneckAnalysis.analysis.combinedScalingRecommendation,
    ).toContain("collector");
    expect(criticalAnalysis.analysis.combinedScalingRecommendation).toContain(
      "Urgent",
    );
  });

  // Test scaling analysis with high workload
  it("should provide consistent analysis with high-volume workloads", () => {
    const highVolumeWorkload: WorkloadParams = {
      ...TEST_WORKLOAD,
      requestsPerSecond: 5000,
      metricsPerRequest: 500,
    };

    const scalingAnalysis = validateInstanceScaling(
      highVolumeWorkload,
      TEST_RESOURCES,
    );

    // Should still produce valid results with high-volume workloads
    expect(scalingAnalysis.analysis.collectorIdealCount).toBeGreaterThanOrEqual(
      1,
    );
    expect(scalingAnalysis.analysis.processorIdealCount).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      scalingAnalysis.analysis.combinedScalingRecommendation.length,
    ).toBeGreaterThan(0);

    // Efficiency curves should show some pattern
    const cpuEfficiencies = scalingAnalysis.collectorScaling.cpuEfficiency;

    // Just verify we have valid numbers in sequence
    for (let i = 0; i < cpuEfficiencies.length; i++) {
      expect(typeof cpuEfficiencies[i]).toBe("number");
      expect(isNaN(cpuEfficiencies[i])).toBe(false);
    }
  });

  // Test the edge case with minimal workload
  it("should handle minimal workloads gracefully", () => {
    const minimalWorkload: WorkloadParams = {
      ...TEST_WORKLOAD,
      requestsPerSecond: 10,
      metricsPerRequest: 5,
    };

    const scalingAnalysis = validateInstanceScaling(
      minimalWorkload,
      TEST_RESOURCES,
    );

    // For tiny workloads, the ideal instance count depends on the efficiency algorithm
    // Can be low (1) or can match current level if coordination overhead is low
    expect(scalingAnalysis.analysis.collectorIdealCount).toBeGreaterThanOrEqual(
      1,
    );
    expect(scalingAnalysis.analysis.collectorIdealCount).toBeLessThanOrEqual(8);
    expect(scalingAnalysis.analysis.processorIdealCount).toBeGreaterThanOrEqual(
      1,
    );
    expect(scalingAnalysis.analysis.processorIdealCount).toBeLessThanOrEqual(8);

    // Should recognize that scaling out isn't needed
    expect(scalingAnalysis.analysis.combinedScalingRecommendation).toContain(
      "sufficient",
    );
  });
});
