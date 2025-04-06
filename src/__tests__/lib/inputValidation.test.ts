import { calculateResourceRequirements } from "../../lib/calculations";
import { WorkloadParams, UserResources } from "../../components/Simulator";

describe("Input Validation", () => {
  // Test for handling of empty/undefined inputs
  test("Handles missing or undefined inputs gracefully", () => {
    // @ts-expect-error - Intentionally passing incomplete params to test handling
    const result = calculateResourceRequirements({}, {});

    // Should not crash and return some reasonable default values
    expect(result).toBeDefined();
    expect(result.requirements).toBeDefined();
    expect(result.flowMetrics).toBeDefined();
  });

  // Test for handling of negative values
  test("Handles negative input values correctly", () => {
    const workload: WorkloadParams = {
      requestsPerSecond: -100,
      metricsPerRequest: -10,
      uniqueMetricsRatio: -0.5,
      calculationComplexity: -2,
      flushIntervalSeconds: -5,
      retentionPeriodDays: -30,
    };

    const resources: UserResources = {
      cpu: -2,
      memory: -4,
      diskIO: -50,
      networkIO: -100,
      storage: -100,
      statsdInstances: -2,
      carbonInstances: -2,
    };

    const result = calculateResourceRequirements(workload, resources);

    // Should handle negative values by using their absolute value or setting to reasonable defaults
    expect(result.flowMetrics.totalMetricsPerSecond).toBeGreaterThanOrEqual(0);
    expect(result.flowMetrics.uniqueMetricsPerSecond).toBeGreaterThanOrEqual(0);
    expect(result.requirements.cpu.value).toBeGreaterThanOrEqual(0);
    expect(result.requirements.memory.value).toBeGreaterThanOrEqual(0);
  });

  // Test for handling of zero values
  test("Handles zero input values correctly", () => {
    const workload: WorkloadParams = {
      requestsPerSecond: 0,
      metricsPerRequest: 0,
      uniqueMetricsRatio: 0,
      calculationComplexity: 0,
      flushIntervalSeconds: 0,
      retentionPeriodDays: 0,
    };

    const resources: UserResources = {
      cpu: 0,
      memory: 0,
      diskIO: 0,
      networkIO: 0,
      storage: 0,
      statsdInstances: 0,
      carbonInstances: 0,
    };

    const result = calculateResourceRequirements(workload, resources);

    // Should handle zero values without crashing
    expect(result).toBeDefined();
    expect(result.requirements).toBeDefined();
    expect(result.flowMetrics).toBeDefined();
  });

  // Test for handling extremely large values
  test("Handles extremely large input values", () => {
    const workload: WorkloadParams = {
      requestsPerSecond: 1000000,
      metricsPerRequest: 10000,
      uniqueMetricsRatio: 1,
      calculationComplexity: 100,
      flushIntervalSeconds: 3600,
      retentionPeriodDays: 3650,
    };

    const resources: UserResources = {
      cpu: 1000,
      memory: 1000,
      diskIO: 10000,
      networkIO: 100000,
      storage: 1000000,
      statsdInstances: 1000,
      carbonInstances: 1000,
    };

    const result = calculateResourceRequirements(workload, resources);

    // Should handle very large values without overflow or precision issues
    expect(result).toBeDefined();
    expect(Number.isFinite(result.requirements.cpu.value)).toBe(true);
    expect(Number.isFinite(result.requirements.memory.value)).toBe(true);
    expect(Number.isFinite(result.requirements.diskIO.value)).toBe(true);
    expect(Number.isFinite(result.requirements.networkIO.value)).toBe(true);
    expect(Number.isFinite(result.requirements.storage.value)).toBe(true);
  });

  // Test that uniqueMetricsRatio is properly constrained between 0 and 1
  test("Constrains uniqueMetricsRatio to valid range (0-1)", () => {
    const workloadTooHigh: WorkloadParams = {
      ...standardWorkload,
      uniqueMetricsRatio: 1.5, // Greater than 1
    };

    const workloadTooLow: WorkloadParams = {
      ...standardWorkload,
      uniqueMetricsRatio: -0.5, // Less than 0
    };

    const resultHigh = calculateResourceRequirements(
      workloadTooHigh,
      standardResources,
    );
    const resultLow = calculateResourceRequirements(
      workloadTooLow,
      standardResources,
    );

    // Should constrain values to valid range
    expect(
      resultHigh.flowMetrics.uniqueMetricsPerSecond /
        resultHigh.flowMetrics.totalMetricsPerSecond,
    ).toBeLessThanOrEqual(1);
    expect(resultLow.flowMetrics.uniqueMetricsPerSecond).toBeGreaterThanOrEqual(
      0,
    );
  });

  // Test consistent behavior across different instance distributions
  test("Distributes load correctly across different instance counts", () => {
    const workload: WorkloadParams = {
      requestsPerSecond: 1000,
      metricsPerRequest: 100,
      uniqueMetricsRatio: 0.2,
      calculationComplexity: 3,
      flushIntervalSeconds: 10,
      retentionPeriodDays: 30,
    };

    const singleInstance: UserResources = {
      ...standardResources,
      statsdInstances: 1,
      carbonInstances: 1,
    };

    const multiInstance: UserResources = {
      ...standardResources,
      statsdInstances: 4,
      carbonInstances: 4,
    };

    const singleResult = calculateResourceRequirements(
      workload,
      singleInstance,
    );
    const multiResult = calculateResourceRequirements(workload, multiInstance);

    // Total metrics should be the same
    expect(singleResult.flowMetrics.totalMetricsPerSecond).toBe(
      multiResult.flowMetrics.totalMetricsPerSecond,
    );

    // Per-instance metrics should be scaled by instance count
    expect(multiResult.flowMetrics.metricsPerInstance).toBe(
      singleResult.flowMetrics.metricsPerInstance / 4,
    );
  });
});

// Standard test values for reuse
const standardWorkload: WorkloadParams = {
  requestsPerSecond: 100,
  metricsPerRequest: 100,
  uniqueMetricsRatio: 0.2,
  calculationComplexity: 3,
  flushIntervalSeconds: 10,
  retentionPeriodDays: 30,
};

const standardResources: UserResources = {
  cpu: 2,
  memory: 4,
  diskIO: 50,
  networkIO: 100,
  storage: 100,
  statsdInstances: 1,
  carbonInstances: 1,
};
