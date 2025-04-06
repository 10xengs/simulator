import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import MetricsSimulator from "../../components/MetricsSimulator";
import { MetricsProvider } from "../../context/MetricsContext";
import { calculateResourceRequirements } from "../../lib/calculations";

/**
 * MetricsSimulator Test Suite
 * Written in the style of Andrew Clark
 *
 * Testing patterns:
 * - Testing behavior, not implementation
 * - Focus on user interactions and accessibility
 * - Minimal test setup, clear assertions
 * - Group related behaviors in test blocks
 */

// Declare interfaces for component props to use in mocks
interface WorkloadInputsProps {
  workload: {
    requestsPerSecond: number;
    metricsPerRequest: number;
    uniqueMetricsRatio: number;
    calculationComplexity: number;
  };
  setWorkload: (workload: WorkloadInputsProps["workload"]) => void;
}

interface UserResourceConfigProps {
  userResources: {
    cpu: number;
    memory: number;
    diskIO: number;
    networkIO: number;
  };
  setUserResources: (
    resources: UserResourceConfigProps["userResources"],
  ) => void;
}

interface ResourceProps {
  value: number;
  status: string;
  unit: string;
  utilization: number;
  explanation: string;
}

interface ResourceGaugeProps {
  resource: ResourceProps;
}

interface StatusAlertProps {
  status: string;
}

// Mock the calculations module
jest.mock("../../lib/calculations", () => {
  // Default mock implementation
  const mockRequirements = {
    cpu: {
      value: 1.2,
      status: "healthy",
      unit: "cores",
      utilization: 0.6,
      explanation: "CPU explanation",
    },
    memory: {
      value: 2.5,
      status: "healthy",
      unit: "GB",
      utilization: 0.6,
      explanation: "Memory explanation",
    },
    diskIO: {
      value: 25,
      status: "healthy",
      unit: "MB/s",
      utilization: 0.5,
      explanation: "Disk explanation",
    },
    networkIO: {
      value: 50,
      status: "healthy",
      unit: "Mbps",
      utilization: 0.5,
      explanation: "Network explanation",
    },
    storage: {
      value: 10,
      status: "healthy",
      unit: "GB/day",
      utilization: 0.1,
      explanation: "Storage explanation",
    },
  };

  const mockFlowMetrics = {
    totalMetricsPerSecond: 10000,
    uniqueMetricsPerSecond: 2000,
    writesPerSecond: 2000,
    storagePerDay: 10,
    metricsPerInstance: 10000,
    writesPerInstance: 2000,
    totalStorageRequired: 300,
  };

  // Create a mock function that will be used by our tests
  return {
    calculateResourceRequirements: jest
      .fn()
      .mockImplementation((workload, resources) => {
        // Small app preset
        if (workload.requestsPerSecond === 50) {
          return {
            requirements: {
              ...mockRequirements,
              cpu: { ...mockRequirements.cpu, value: 0.6 },
            },
            flowMetrics: {
              ...mockFlowMetrics,
              totalMetricsPerSecond: 5000,
            },
          };
        }

        // Medium app preset
        if (workload.requestsPerSecond === 200) {
          return {
            requirements: {
              ...mockRequirements,
              cpu: { ...mockRequirements.cpu, value: 1.5 },
            },
            flowMetrics: {
              ...mockFlowMetrics,
              totalMetricsPerSecond: 30000,
            },
          };
        }

        // Large app preset
        if (workload.requestsPerSecond === 500) {
          return {
            requirements: {
              ...mockRequirements,
              cpu: {
                ...mockRequirements.cpu,
                value: 3.0,
                status: "warning",
                utilization: 0.75,
              },
            },
            flowMetrics: {
              ...mockFlowMetrics,
              totalMetricsPerSecond: 100000,
            },
          };
        }

        // Resource presets - Medium (m5.xlarge)
        if (resources && resources.cpu === 4) {
          return {
            requirements: {
              ...mockRequirements,
              memory: { ...mockRequirements.memory, value: 8.0 },
            },
            flowMetrics: mockFlowMetrics,
          };
        }

        // Resource presets - Large (c5.2xlarge)
        if (resources && resources.cpu === 8) {
          return {
            requirements: {
              ...mockRequirements,
              memory: { ...mockRequirements.memory, value: 16.0 },
            },
            flowMetrics: mockFlowMetrics,
          };
        }

        // Critical status test
        if (resources && resources.cpu === 0.5) {
          return {
            requirements: {
              ...mockRequirements,
              cpu: {
                ...mockRequirements.cpu,
                status: "critical",
                utilization: 0.95,
              },
            },
            flowMetrics: mockFlowMetrics,
          };
        }

        // Default mock response
        return {
          requirements: mockRequirements,
          flowMetrics: mockFlowMetrics,
        };
      }),
  };
});

// Mock child components to isolate and focus on MetricsSimulator behavior
jest.mock("../../components/WorkloadInputs", () => {
  function MockWorkloadInputs({ workload, setWorkload }: WorkloadInputsProps) {
    return (
      <div data-testid="workload-inputs">
        <button
          data-testid="increase-rps"
          onClick={() =>
            setWorkload({
              ...workload,
              requestsPerSecond: workload.requestsPerSecond + 100,
            })
          }
        >
          Increase RPS
        </button>
        <div data-testid="current-rps">{workload.requestsPerSecond}</div>
      </div>
    );
  }
  MockWorkloadInputs.displayName = "MockWorkloadInputs";
  return MockWorkloadInputs;
});

jest.mock("../../components/ResourceMetrics", () => {
  // eslint-disable-next-line react/display-name
  const MockResourceMetrics = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="resource-metrics">{children}</div>
  );

  // eslint-disable-next-line react/display-name
  MockResourceMetrics.Gauge = ({ resource }: ResourceGaugeProps) => (
    <div data-testid="resource-gauge">
      {resource.value} {resource.unit}
    </div>
  );

  // eslint-disable-next-line react/display-name
  MockResourceMetrics.StatusAlert = ({ status }: StatusAlertProps) => (
    <div data-testid="status-alert">{status}</div>
  );

  // eslint-disable-next-line react/display-name
  MockResourceMetrics.Tips = () => <div data-testid="tips">Tips</div>;

  return MockResourceMetrics;
});

jest.mock("../../components/ErrorBoundary", () => {
  function MockErrorBoundary({ children }: { children: React.ReactNode }) {
    return <div data-testid="error-boundary">{children}</div>;
  }
  MockErrorBoundary.displayName = "MockErrorBoundary";
  return MockErrorBoundary;
});

jest.mock("../../components/UserResourceConfig", () => {
  return function MockUserResourceConfig({
    userResources,
    setUserResources,
  }: UserResourceConfigProps) {
    return (
      <div data-testid="user-resource-config">
        <button
          data-testid="increase-cpu"
          onClick={() =>
            setUserResources({
              ...userResources,
              cpu: userResources.cpu + 1,
            })
          }
        >
          Increase CPU
        </button>
        <div data-testid="current-cpu">{userResources.cpu}</div>
      </div>
    );
  };
});

jest.mock("../../components/LazyResourceExplanations", () => {
  return function MockLazyResourceExplanations() {
    return <div data-testid="resource-explanations">Resource Explanations</div>;
  };
});

// Setup and cleanup
beforeEach(() => {
  // Mock any browser APIs needed
  if (!HTMLDetailsElement.prototype.hasOwnProperty("open")) {
    Object.defineProperty(HTMLDetailsElement.prototype, "open", {
      configurable: true,
      get() {
        return this.hasAttribute("open");
      },
      set(v) {
        if (v) this.setAttribute("open", "");
        else this.removeAttribute("open");
      },
    });
  }

  jest.clearAllMocks();
});

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MetricsProvider>{ui}</MetricsProvider>);
};

describe("MetricsSimulator", () => {
  // Basic rendering tests
  describe("rendering", () => {
    test("renders with all main sections visible", () => {
      renderWithProvider(<MetricsSimulator />);

      // Check for main sections
      expect(
        screen.getByText("Metrics Infrastructure Simulator"),
      ).toBeInTheDocument();

      // Footer should be visible
      expect(
        screen.getByText(/Designed for infrastructure planning excellence/i),
      ).toBeInTheDocument();
    });

    test("renders intro section initially", () => {
      renderWithProvider(<MetricsSimulator />);

      expect(
        screen.getByText("Understanding Metrics Infrastructure"),
      ).toBeInTheDocument();
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });

    test("renders workload presets", () => {
      renderWithProvider(<MetricsSimulator />);

      // First get past the intro section
      fireEvent.click(screen.getByText("Get Started"));

      // Now check for presets
      expect(screen.getByText("Small App")).toBeInTheDocument();
      expect(screen.getByText("Medium App")).toBeInTheDocument();
      expect(screen.getByText("Large App")).toBeInTheDocument();
    });
  });

  // State management and interaction tests
  describe("state management", () => {
    test("hides intro section when Get Started is clicked", async () => {
      renderWithProvider(<MetricsSimulator />);

      expect(
        screen.getByText("Understanding Metrics Infrastructure"),
      ).toBeInTheDocument();

      await userEvent.click(screen.getByText("Get Started"));

      expect(
        screen.queryByText("Understanding Metrics Infrastructure"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Show Introduction")).toBeInTheDocument();
    });

    test("shows intro section when Show Introduction is clicked", async () => {
      renderWithProvider(<MetricsSimulator />);

      // First hide intro
      await userEvent.click(screen.getByText("Get Started"));
      expect(
        screen.queryByText("Understanding Metrics Infrastructure"),
      ).not.toBeInTheDocument();

      // Then show it again
      await userEvent.click(screen.getByText("Show Introduction"));
      expect(
        screen.getByText("Understanding Metrics Infrastructure"),
      ).toBeInTheDocument();
    });
  });

  // Preset application tests
  describe("workload presets", () => {
    test("applies small app preset when clicked", async () => {
      renderWithProvider(<MetricsSimulator />);

      // First get past the intro section
      await userEvent.click(screen.getByText("Get Started"));

      await userEvent.click(screen.getByText("Small App"));

      // Check that the calculation was called with correct parameters
      expect(calculateResourceRequirements).toHaveBeenCalledWith(
        expect.objectContaining({
          requestsPerSecond: 50,
          metricsPerRequest: 100,
          uniqueMetricsRatio: 0.2,
          calculationComplexity: 2,
        }),
        expect.anything(),
      );
    });
  });

  // Resource preset tests
  describe("resource presets", () => {
    test("applies small resource preset when clicked", async () => {
      renderWithProvider(<MetricsSimulator />);

      // First get past the intro section
      await userEvent.click(screen.getByText("Get Started"));

      await userEvent.click(screen.getByText("Small (t3.medium)"));

      // Check that the calculation was called with correct parameters
      expect(calculateResourceRequirements).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          cpu: 2,
          memory: 4,
          diskIO: 50,
          networkIO: 100,
        }),
      );
    });
  });

  // Component interaction tests
  describe("component interactions", () => {
    test("WorkloadInputs changes update the requirements", async () => {
      renderWithProvider(<MetricsSimulator />);

      // First get past the intro section
      await userEvent.click(screen.getByText("Get Started"));

      // Initially, calculation is called when the component mounts
      expect(calculateResourceRequirements).toHaveBeenCalled();
      jest.clearAllMocks();

      // Simulate changing workload in WorkloadInputs
      await userEvent.click(screen.getByTestId("increase-rps"));

      // Calculation should be called with updated workload
      expect(calculateResourceRequirements).toHaveBeenCalled();
    });

    test("UserResourceConfig changes update the requirements", async () => {
      renderWithProvider(<MetricsSimulator />);

      // First get past the intro section
      await userEvent.click(screen.getByText("Get Started"));

      // Clear initial calculation calls
      jest.clearAllMocks();

      // Simulate changing resources in UserResourceConfig
      await userEvent.click(screen.getByTestId("increase-cpu"));

      // Calculation should be called with updated resources
      expect(calculateResourceRequirements).toHaveBeenCalled();
    });
  });

  // Effect and calculation tests
  describe("effects and calculations", () => {
    test("initializes with default workload and resources", () => {
      renderWithProvider(<MetricsSimulator />);

      // calculateResourceRequirements should be called on mount with default values
      expect(calculateResourceRequirements).toHaveBeenCalled();
    });
  });
});
