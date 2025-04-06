import {
  formatNumber,
  getScalingRecommendation,
  identifyBottleneck,
} from "../../lib/calculations";
import { ResourceRequirements } from "../../components/Simulator";

describe("formatNumber", () => {
  it("should format numbers correctly with commas", () => {
    // Test comma formatting
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1500)).toBe("1,500");
    expect(formatNumber(1000000)).toBe("1,000,000");
    expect(formatNumber(1500000)).toBe("1,500,000");
    expect(formatNumber(1000000000)).toBe("1,000,000,000");

    // Edge cases
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");

    // Confirm function doesn't throw with various inputs
    expect(() => formatNumber(12345)).not.toThrow();
    expect(() => formatNumber(0.1)).not.toThrow();
  });
});

describe("getScalingRecommendation", () => {
  it("should provide appropriate scaling recommendations based on resource utilization", () => {
    // Create test requirements with different utilization levels
    const lowUtilization: ResourceRequirements = {
      cpu: { value: 1, utilization: 0.3, status: "healthy", unit: "cores" },
      memory: { value: 2, utilization: 0.2, status: "healthy", unit: "GB" },
      diskIO: { value: 10, utilization: 0.1, status: "healthy", unit: "MB/s" },
      networkIO: {
        value: 20,
        utilization: 0.2,
        status: "healthy",
        unit: "Mbps",
      },
      storage: {
        value: 50,
        utilization: 0.4,
        status: "healthy",
        unit: "GB/day",
      },
    };

    const mediumUtilization: ResourceRequirements = {
      cpu: { value: 2, utilization: 0.6, status: "healthy", unit: "cores" },
      memory: { value: 4, utilization: 0.65, status: "healthy", unit: "GB" },
      diskIO: { value: 20, utilization: 0.4, status: "healthy", unit: "MB/s" },
      networkIO: {
        value: 40,
        utilization: 0.5,
        status: "healthy",
        unit: "Mbps",
      },
      storage: {
        value: 100,
        utilization: 0.5,
        status: "healthy",
        unit: "GB/day",
      },
    };

    const highUtilization: ResourceRequirements = {
      cpu: { value: 3, utilization: 0.75, status: "warning", unit: "cores" },
      memory: { value: 8, utilization: 0.85, status: "warning", unit: "GB" },
      diskIO: { value: 40, utilization: 0.6, status: "healthy", unit: "MB/s" },
      networkIO: {
        value: 80,
        utilization: 0.7,
        status: "warning",
        unit: "Mbps",
      },
      storage: {
        value: 200,
        utilization: 0.8,
        status: "warning",
        unit: "GB/day",
      },
    };

    const criticalUtilization: ResourceRequirements = {
      cpu: { value: 4, utilization: 0.95, status: "critical", unit: "cores" },
      memory: { value: 16, utilization: 0.92, status: "critical", unit: "GB" },
      diskIO: { value: 80, utilization: 0.85, status: "warning", unit: "MB/s" },
      networkIO: {
        value: 160,
        utilization: 0.9,
        status: "critical",
        unit: "Mbps",
      },
      storage: {
        value: 400,
        utilization: 0.9,
        status: "critical",
        unit: "GB/day",
      },
    };

    // Test recommendations match utilization levels
    expect(getScalingRecommendation(lowUtilization)).toMatch(
      /adequate.*room for growth/i,
    );
    expect(getScalingRecommendation(mediumUtilization)).toMatch(
      /adequate.*approaching capacity/i,
    );
    expect(getScalingRecommendation(highUtilization)).toMatch(
      /consider scaling.*soon/i,
    );
    expect(getScalingRecommendation(criticalUtilization)).toMatch(
      /immediate scaling/i,
    );
  });
});

describe("identifyBottleneck", () => {
  it("should identify resources with high utilization as bottlenecks", () => {
    const mockRequirements: ResourceRequirements = {
      cpu: { value: 2, utilization: 0.5, status: "healthy", unit: "cores" },
      memory: { value: 4, utilization: 0.8, status: "warning", unit: "GB" },
      diskIO: { value: 100, utilization: 0.3, status: "healthy", unit: "IOPS" },
      networkIO: {
        value: 200,
        utilization: 0.4,
        status: "healthy",
        unit: "Mbps",
      },
      storage: { value: 500, utilization: 0.6, status: "healthy", unit: "GB" },
    };

    // Memory is the bottleneck with 80% utilization
    const result = identifyBottleneck(mockRequirements);
    expect(result).toContain("Memory");
    expect(result).toContain("80%");
  });

  it("should indicate when no significant bottlenecks exist", () => {
    const mockRequirements: ResourceRequirements = {
      cpu: { value: 2, utilization: 0.5, status: "healthy", unit: "cores" },
      memory: { value: 4, utilization: 0.6, status: "healthy", unit: "GB" },
      diskIO: { value: 100, utilization: 0.3, status: "healthy", unit: "IOPS" },
      networkIO: {
        value: 200,
        utilization: 0.4,
        status: "healthy",
        unit: "Mbps",
      },
      storage: { value: 500, utilization: 0.6, status: "healthy", unit: "GB" },
    };

    const result = identifyBottleneck(mockRequirements);
    expect(result).toMatch(/no significant bottlenecks/i);
  });

  it("should identify the highest utilization resource as bottleneck", () => {
    const mockRequirements: ResourceRequirements = {
      cpu: { value: 2, utilization: 0.75, status: "warning", unit: "cores" },
      memory: { value: 4, utilization: 0.95, status: "critical", unit: "GB" },
      diskIO: {
        value: 100,
        utilization: 0.92,
        status: "critical",
        unit: "IOPS",
      },
      networkIO: {
        value: 200,
        utilization: 0.4,
        status: "healthy",
        unit: "Mbps",
      },
      storage: { value: 500, utilization: 0.6, status: "healthy", unit: "GB" },
    };

    // Memory has the highest utilization at 95%
    const result = identifyBottleneck(mockRequirements);
    expect(result).toContain("Memory");
    expect(result).toContain("95%");
  });
});
