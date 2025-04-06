// src/lib/calculations.test.ts
import { calculateResourceRequirements } from "./calculations";
import { WorkloadParams, UserResources } from "../components/Simulator";

describe("Resource Calculation Logic", () => {
  // Test case for small workload
  test("Calculates resources for a small workload correctly", () => {
    const workload: WorkloadParams = {
      requestsPerSecond: 50,
      metricsPerRequest: 100,
      uniqueMetricsRatio: 0.2,
      calculationComplexity: 2,
      flushIntervalSeconds: 10,
      retentionPeriodDays: 30,
    };

    const userResources: UserResources = {
      cpu: 2,
      memory: 4,
      diskIO: 50,
      networkIO: 100,
      storage: 500,
      statsdInstances: 1,
      carbonInstances: 1,
    };

    const { requirements, flowMetrics } = calculateResourceRequirements(
      workload,
      userResources,
    );

    // Test flow metrics
    expect(flowMetrics.totalMetricsPerSecond).toBe(5000); // 50 RPS * 100 metrics per request
    expect(flowMetrics.uniqueMetricsPerSecond).toBe(1000); // 5000 * 0.2 unique ratio
    expect(flowMetrics.writesPerSecond).toBe(1000); // Same as unique metrics per second

    // Test resource requirements
    expect(requirements.cpu.value).toBeGreaterThan(0);
    expect(requirements.memory.value).toBeGreaterThan(0);
    expect(requirements.diskIO.value).toBeGreaterThan(0);
    expect(requirements.networkIO.value).toBeGreaterThan(0);

    // For a small workload, all resources should be healthy
    expect(requirements.cpu.status).toBe("healthy");
    expect(requirements.memory.status).toBe("healthy");
    expect(requirements.diskIO.status).toBe("healthy");
    expect(requirements.networkIO.status).toBe("healthy");
  });

  // Test case for a large workload
  test("Correctly identifies resource constraints for a large workload", () => {
    const workload: WorkloadParams = {
      requestsPerSecond: 1000,
      metricsPerRequest: 500,
      uniqueMetricsRatio: 0.3,
      calculationComplexity: 5,
      flushIntervalSeconds: 10,
    };

    const userResources: UserResources = {
      cpu: 2, // Deliberately small to test resource constraint
      memory: 4,
      diskIO: 50,
      networkIO: 100,
    };

    const { requirements } = calculateResourceRequirements(
      workload,
      userResources,
    );

    // With 500K metrics/sec and only 2 CPU cores, this should be critical
    expect(requirements.cpu.status).toBe("critical");
    expect(requirements.cpu.utilization).toBeGreaterThan(0.9);
  });

  // Test scaling patterns
  test("Resource requirements scale super-linearly with metrics volume", () => {
    const baseWorkload: WorkloadParams = {
      requestsPerSecond: 100,
      metricsPerRequest: 100,
      uniqueMetricsRatio: 0.2,
      calculationComplexity: 3,
      flushIntervalSeconds: 10,
    };

    const userResources: UserResources = {
      cpu: 10,
      memory: 16,
      diskIO: 200,
      networkIO: 1000,
    };

    const { requirements: baseRequirements } = calculateResourceRequirements(
      baseWorkload,
      userResources,
    );

    // Double the metrics volume
    const doubledWorkload = {
      ...baseWorkload,
      requestsPerSecond: 200,
    };

    const { requirements: doubledRequirements } = calculateResourceRequirements(
      doubledWorkload,
      userResources,
    );

    // CPU scales super-linearly due to coordination overhead (2.0x-2.2x for 2x load)
    expect(doubledRequirements.cpu.value).toBeGreaterThanOrEqual(
      baseRequirements.cpu.value * 2.0,
    );
    expect(doubledRequirements.cpu.value).toBeLessThanOrEqual(
      baseRequirements.cpu.value * 2.2,
    );

    // Network should scale roughly linearly
    expect(doubledRequirements.networkIO.value).toBeGreaterThanOrEqual(
      baseRequirements.networkIO.value * 1.9,
    );
    expect(doubledRequirements.networkIO.value).toBeLessThanOrEqual(
      baseRequirements.networkIO.value * 2.1,
    );
  });

  // Test impact of calculation complexity
  test("CPU and memory requirements scale non-linearly with complexity and volume", () => {
    const baseWorkload: WorkloadParams = {
      requestsPerSecond: 100,
      metricsPerRequest: 100,
      uniqueMetricsRatio: 0.2,
      calculationComplexity: 1,
      flushIntervalSeconds: 10,
    };

    const userResources: UserResources = {
      cpu: 10,
      memory: 16,
      diskIO: 200,
      networkIO: 1000,
    };

    const { requirements: baseRequirements } = calculateResourceRequirements(
      baseWorkload,
      userResources,
    );

    // Increase both complexity and volume
    const complexWorkload = {
      ...baseWorkload,
      calculationComplexity: 5,
      requestsPerSecond: 200,
    };

    const { requirements: complexRequirements } = calculateResourceRequirements(
      complexWorkload,
      userResources,
    );

    // Requirements should increase significantly but not explosively
    expect(complexRequirements.cpu.value).toBeGreaterThan(
      baseRequirements.cpu.value * 2.5,
    );
    expect(complexRequirements.cpu.value).toBeLessThan(
      baseRequirements.cpu.value * 4.0,
    );
    expect(complexRequirements.memory.value).toBeGreaterThan(
      baseRequirements.memory.value * 1.5,
    );
  });

  // Test impact of unique metrics ratio on disk I/O
  test("Disk I/O scales with unique metrics ratio", () => {
    const baseWorkload: WorkloadParams = {
      requestsPerSecond: 100,
      metricsPerRequest: 100,
      uniqueMetricsRatio: 0.1,
      calculationComplexity: 3,
      flushIntervalSeconds: 10,
    };

    const userResources: UserResources = {
      cpu: 10,
      memory: 16,
      diskIO: 200,
      networkIO: 1000,
    };

    const { requirements: baseRequirements } = calculateResourceRequirements(
      baseWorkload,
      userResources,
    );

    // Increase uniqueness
    const uniqueWorkload = {
      ...baseWorkload,
      uniqueMetricsRatio: 0.5,
    };

    const { requirements: uniqueRequirements } = calculateResourceRequirements(
      uniqueWorkload,
      userResources,
    );

    // Disk I/O should scale with uniqueness and include filesystem overhead
    const minScaling = 4.5; // Allow for some overhead reduction
    const maxScaling = 7.0; // Allow for additional overhead at scale due to random I/O
    expect(uniqueRequirements.diskIO.value).toBeGreaterThanOrEqual(
      baseRequirements.diskIO.value * minScaling,
    );
    expect(uniqueRequirements.diskIO.value).toBeLessThanOrEqual(
      baseRequirements.diskIO.value * maxScaling,
    );
  });
});
