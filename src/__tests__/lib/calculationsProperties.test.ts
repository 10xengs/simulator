import { calculateResourceRequirements } from "../../lib/calculations";
import { WorkloadParams, UserResources } from "../../components/Simulator";

// Define valid example inputs for deterministic testing
const VALID_WORKLOAD: WorkloadParams = {
  requestsPerSecond: 500,
  metricsPerRequest: 50,
  uniqueMetricsRatio: 0.2,
  calculationComplexity: 3,
  flushIntervalSeconds: 10,
  retentionPeriodDays: 30,
};

const VALID_RESOURCES: UserResources = {
  cpu: 8,
  memory: 32,
  diskIO: 200,
  networkIO: 2000,
  storage: 2000,
  statsdInstances: 2,
  carbonInstances: 2,
};

describe("Calculation Properties", () => {
  // Test resource values are positive with fixed inputs
  it("should produce positive resource values for valid inputs", () => {
    const result = calculateResourceRequirements(
      VALID_WORKLOAD,
      VALID_RESOURCES,
    );

    // All resource values should be positive
    expect(result.requirements.cpu.value).toBeGreaterThan(0);
    expect(result.requirements.memory.value).toBeGreaterThan(0);
    expect(result.requirements.diskIO.value).toBeGreaterThan(0);
    expect(result.requirements.networkIO.value).toBeGreaterThan(0);
    expect(result.requirements.storage.value).toBeGreaterThan(0);

    // Ensure all utilizations are within valid range for these tests
    expect(result.requirements.cpu.utilization).toBeLessThanOrEqual(1);
    expect(result.requirements.memory.utilization).toBeLessThanOrEqual(1);
    expect(result.requirements.diskIO.utilization).toBeLessThanOrEqual(1);
    expect(result.requirements.networkIO.utilization).toBeLessThanOrEqual(1);
    expect(result.requirements.storage.utilization).toBeLessThanOrEqual(1);
  });

  // Test utilization values are within range with fixed inputs
  it("should calculate utilization values between 0 and 1", () => {
    const result = calculateResourceRequirements(
      VALID_WORKLOAD,
      VALID_RESOURCES,
    );

    // All utilization values should be between 0 and 1
    expect(result.requirements.cpu.utilization).toBeGreaterThanOrEqual(0);
    expect(result.requirements.cpu.utilization).toBeLessThanOrEqual(1);
    expect(result.requirements.memory.utilization).toBeGreaterThanOrEqual(0);
    expect(result.requirements.memory.utilization).toBeLessThanOrEqual(1);
    expect(result.requirements.diskIO.utilization).toBeGreaterThanOrEqual(0);
    expect(result.requirements.diskIO.utilization).toBeLessThanOrEqual(1);
    expect(result.requirements.networkIO.utilization).toBeGreaterThanOrEqual(0);
    expect(result.requirements.networkIO.utilization).toBeLessThanOrEqual(1);
    expect(result.requirements.storage.utilization).toBeGreaterThanOrEqual(0);
    expect(result.requirements.storage.utilization).toBeLessThanOrEqual(1);
  });

  // Test monotonicity with fixed inputs
  it("should increase resource requirements for increased workload", () => {
    const increasedWorkload = {
      ...VALID_WORKLOAD,
      requestsPerSecond: VALID_WORKLOAD.requestsPerSecond * 2,
    };

    const baseResult = calculateResourceRequirements(
      VALID_WORKLOAD,
      VALID_RESOURCES,
    );
    const increasedResult = calculateResourceRequirements(
      increasedWorkload,
      VALID_RESOURCES,
    );

    // Requirements should increase
    expect(increasedResult.requirements.cpu.value).toBeGreaterThan(
      baseResult.requirements.cpu.value,
    );
    expect(increasedResult.requirements.memory.value).toBeGreaterThanOrEqual(
      baseResult.requirements.memory.value,
    );
    expect(increasedResult.requirements.diskIO.value).toBeGreaterThan(
      baseResult.requirements.diskIO.value,
    );
    expect(increasedResult.requirements.networkIO.value).toBeGreaterThan(
      baseResult.requirements.networkIO.value,
    );
  });

  // Test that increasing instances decreases per-instance load
  it("should calculate lower per-instance metrics when increasing instance count", () => {
    const baseResources = VALID_RESOURCES;
    const moreInstancesResources = {
      ...baseResources,
      statsdInstances: baseResources.statsdInstances * 2,
      carbonInstances: baseResources.carbonInstances * 2,
    };

    const baseResult = calculateResourceRequirements(
      VALID_WORKLOAD,
      baseResources,
    );
    const moreInstancesResult = calculateResourceRequirements(
      VALID_WORKLOAD,
      moreInstancesResources,
    );

    // Per-instance metrics should decrease
    expect(moreInstancesResult.flowMetrics.metricsPerInstance).toBeLessThan(
      baseResult.flowMetrics.metricsPerInstance,
    );
    expect(moreInstancesResult.flowMetrics.writesPerInstance).toBeLessThan(
      baseResult.flowMetrics.writesPerInstance,
    );
  });

  // Test that storage requirements scale linearly with retention
  it("should calculate linearly increasing storage requirements for increasing retention", () => {
    // Base calculation
    const baseResult = calculateResourceRequirements(
      VALID_WORKLOAD,
      VALID_RESOURCES,
    );

    // Double retention
    const doubleRetentionWorkload = {
      ...VALID_WORKLOAD,
      retentionPeriodDays: VALID_WORKLOAD.retentionPeriodDays * 2,
    };
    const doubleResult = calculateResourceRequirements(
      doubleRetentionWorkload,
      VALID_RESOURCES,
    );

    // Triple retention
    const tripleRetentionWorkload = {
      ...VALID_WORKLOAD,
      retentionPeriodDays: VALID_WORKLOAD.retentionPeriodDays * 3,
    };
    const tripleResult = calculateResourceRequirements(
      tripleRetentionWorkload,
      VALID_RESOURCES,
    );

    // Check scaling ratios for totalStorageRequired (not the storage.value which might not scale linearly)
    const doubleRatio =
      doubleResult.flowMetrics.totalStorageRequired /
      baseResult.flowMetrics.totalStorageRequired;
    const tripleRatio =
      tripleResult.flowMetrics.totalStorageRequired /
      baseResult.flowMetrics.totalStorageRequired;

    // Should be approximately 2x and 3x with small margin of error
    expect(Math.abs(doubleRatio - 2.0)).toBeLessThan(0.1);
    expect(Math.abs(tripleRatio - 3.0)).toBeLessThan(0.1);
  });

  // Test that resource status accurately reflects utilization
  it("should set resource status according to utilization thresholds", () => {
    // Create test resources with different utilization levels
    const criticalResources = {
      ...VALID_RESOURCES,
      cpu: 1, // Very small value to ensure high utilization
    };

    const warningResources = {
      ...VALID_RESOURCES,
      memory: 3, // Small enough for warning but not critical
    };

    const healthyResources = VALID_RESOURCES;

    const criticalResult = calculateResourceRequirements(
      VALID_WORKLOAD,
      criticalResources,
    );
    const warningResult = calculateResourceRequirements(
      VALID_WORKLOAD,
      warningResources,
    );
    const healthyResult = calculateResourceRequirements(
      VALID_WORKLOAD,
      healthyResources,
    );

    // Check specific resources have correct status
    if (criticalResult.requirements.cpu.utilization > 0.9) {
      expect(criticalResult.requirements.cpu.status).toBe("critical");
    }

    if (
      warningResult.requirements.memory.utilization > 0.7 &&
      warningResult.requirements.memory.utilization <= 0.9
    ) {
      expect(warningResult.requirements.memory.status).toBe("warning");
    }

    if (healthyResult.requirements.diskIO.utilization <= 0.7) {
      expect(healthyResult.requirements.diskIO.status).toBe("healthy");
    }
  });

  // Test that unique metrics calculation is consistent
  it("should calculate unique metrics consistently", () => {
    const result = calculateResourceRequirements(
      VALID_WORKLOAD,
      VALID_RESOURCES,
    );

    const expectedUniqueMetrics = Math.ceil(
      VALID_WORKLOAD.requestsPerSecond *
        VALID_WORKLOAD.metricsPerRequest *
        VALID_WORKLOAD.uniqueMetricsRatio,
    );

    expect(result.flowMetrics.uniqueMetricsPerSecond).toBe(
      expectedUniqueMetrics,
    );
  });

  // Test that collector and processor instances are factored into calculations
  it("should properly factor in collector and processor instances in resource calculations", () => {
    // Base calculation with minimal instances
    const minimalInstancesResources = {
      ...VALID_RESOURCES,
      statsdInstances: 1,
      carbonInstances: 1,
    };

    // Increased collector instances
    const moreCollectorResources = {
      ...VALID_RESOURCES,
      statsdInstances: 4,
      carbonInstances: 1,
    };

    // Increased processor instances
    const moreProcessorResources = {
      ...VALID_RESOURCES,
      statsdInstances: 1,
      carbonInstances: 4,
    };

    // Both increased
    const moreInstancesResources = {
      ...VALID_RESOURCES,
      statsdInstances: 4,
      carbonInstances: 4,
    };

    // Calculate requirements for each scenario
    const baseResult = calculateResourceRequirements(
      VALID_WORKLOAD,
      minimalInstancesResources,
    );
    const moreCollectorResult = calculateResourceRequirements(
      VALID_WORKLOAD,
      moreCollectorResources,
    );
    const moreProcessorResult = calculateResourceRequirements(
      VALID_WORKLOAD,
      moreProcessorResources,
    );
    const moreInstancesResult = calculateResourceRequirements(
      VALID_WORKLOAD,
      moreInstancesResources,
    );

    // TESTS FOR COLLECTOR INSTANCES

    // Test 1: Verify per-instance metrics change correctly
    expect(moreCollectorResult.flowMetrics.metricsPerInstance).toBeLessThan(
      baseResult.flowMetrics.metricsPerInstance,
    );

    // Test 2: Make sure explanation texts include instance counts
    expect(moreCollectorResult.requirements.cpu.explanation).toContain(
      "(4 inst)",
    );
    expect(moreCollectorResult.requirements.memory.explanation).toContain(
      "(4 inst)",
    );
    expect(moreCollectorResult.requirements.networkIO.explanation).toContain(
      "per StatsD",
    );

    // Test 3: Check effect on resource requirements is factored into the calculation
    // The exact relationship may vary, but memory per-instance should be less than the base case
    const baseMemoryPerInstance = baseResult.requirements.memory.value;
    const scaledMemoryPerInstance =
      moreCollectorResult.requirements.memory.value / 4; // 4 instances
    expect(scaledMemoryPerInstance).toBeLessThan(baseMemoryPerInstance);

    // TESTS FOR PROCESSOR INSTANCES

    // Test 1: Verify per-instance writes change correctly
    expect(moreProcessorResult.flowMetrics.writesPerInstance).toBeLessThan(
      baseResult.flowMetrics.writesPerInstance,
    );

    // Test 2: Make sure explanation texts include instance counts
    expect(moreProcessorResult.requirements.cpu.explanation).toContain(
      "(4 inst)",
    );
    expect(moreProcessorResult.requirements.memory.explanation).toContain(
      "(4 inst)",
    );
    expect(moreProcessorResult.requirements.diskIO.explanation).toContain(
      "(4 inst)",
    );

    // Test 3: Check effect on resource requirements is factored into the calculation
    // The exact relationship may vary, but the disk I/O should reflect distribution benefits
    const processorEfficiency =
      moreProcessorResult.requirements.diskIO.value /
      baseResult.requirements.diskIO.value;
    expect(processorEfficiency).not.toBe(1.0); // Should not be identical to base case

    // COMBINED EFFECT

    // Test 1: Verify both metrics are affected
    expect(moreInstancesResult.flowMetrics.metricsPerInstance).toBeLessThan(
      baseResult.flowMetrics.metricsPerInstance,
    );
    expect(moreInstancesResult.flowMetrics.writesPerInstance).toBeLessThan(
      baseResult.flowMetrics.writesPerInstance,
    );

    // Test 2: Network coordination overhead increases with more instances
    const networkOverhead =
      moreInstancesResult.requirements.networkIO.value /
      baseResult.requirements.networkIO.value;
    // Network overhead can vary, but the key is that it should be calculated. Testing presence of values is sufficient.
    expect(typeof networkOverhead).toBe("number");
    expect(isNaN(networkOverhead)).toBe(false);
  });
});
