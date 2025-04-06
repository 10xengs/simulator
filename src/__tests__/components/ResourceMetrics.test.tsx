import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ResourceMetrics from "../../components/ResourceMetrics";
import { Resource } from "../../types/metrics";

// Mock resource for testing
const mockResource: Resource = {
  value: 4,
  unit: "cores",
  status: "warning",
  utilization: 0.75,
  explanation: "Test explanation for resource usage",
};

describe("ResourceMetrics", () => {
  describe("Root component", () => {
    test("renders children correctly", () => {
      render(
        <ResourceMetrics>
          <div data-testid="child-component">Child content</div>
        </ResourceMetrics>,
      );

      expect(screen.getByTestId("child-component")).toBeInTheDocument();
      expect(screen.getByText("Child content")).toBeInTheDocument();
    });

    test("provides context to children", () => {
      const TestChild = () => {
        const context = React.useContext(
          // @ts-expect-error: Accessing private context for testing
          ResourceMetrics.__context,
        );
        return (
          <div data-testid="context-consumer">
            {context ? "Has context" : "No context"}
          </div>
        );
      };

      render(
        <ResourceMetrics>
          <TestChild />
        </ResourceMetrics>,
      );

      expect(screen.getByText("Has context")).toBeInTheDocument();
    });

    test("calls toggleAllDetails callback when status alert button clicked", () => {
      const handleToggle = jest.fn();

      render(
        <ResourceMetrics onToggleAllDetails={handleToggle}>
          <ResourceMetrics.StatusAlert
            status="warning"
            primaryBottleneck="CPU"
          />
        </ResourceMetrics>,
      );

      fireEvent.click(screen.getByText("Show All Details"));

      expect(handleToggle).toHaveBeenCalledWith(true);
    });
  });

  describe("Gauge component", () => {
    test("displays resource information properly", () => {
      render(
        <ResourceMetrics>
          <ResourceMetrics.Gauge
            resourceKey="cpu"
            resource={mockResource}
            currentValue={2}
            label="CPU Cores"
            description="Processing power"
          />
        </ResourceMetrics>,
      );

      expect(screen.getByText("CPU Cores")).toBeInTheDocument();
      expect(screen.getByText("Processing power")).toBeInTheDocument();
      expect(screen.getByText("Attention Needed")).toBeInTheDocument();
      expect(screen.getByText("2 cores")).toBeInTheDocument();
      expect(screen.getByText("4 cores")).toBeInTheDocument();
    });

    test("toggles expanded details when Learn More is clicked", () => {
      render(
        <ResourceMetrics>
          <ResourceMetrics.Gauge
            resourceKey="cpu"
            resource={mockResource}
            currentValue={2}
            label="CPU Cores"
            description="Processing power"
          />
        </ResourceMetrics>,
      );

      // Details should be hidden initially
      expect(
        screen.queryByText("Test explanation for resource usage"),
      ).not.toBeInTheDocument();

      // Click Learn More
      fireEvent.click(screen.getByText("Learn More"));

      // Details should be visible
      expect(
        screen.getByText("Test explanation for resource usage"),
      ).toBeInTheDocument();

      // Button text should change
      expect(screen.getByText("Hide Details")).toBeInTheDocument();

      // Click Hide Details
      fireEvent.click(screen.getByText("Hide Details"));

      // Details should be hidden again
      expect(
        screen.queryByText("Test explanation for resource usage"),
      ).not.toBeInTheDocument();
    });
  });

  describe("StatusAlert component", () => {
    test("renders appropriate status message for each status", () => {
      const { rerender } = render(
        <ResourceMetrics>
          <ResourceMetrics.StatusAlert
            status="healthy"
            primaryBottleneck={null}
          />
        </ResourceMetrics>,
      );

      expect(
        screen.getByText("All resources are optimally allocated"),
      ).toBeInTheDocument();

      rerender(
        <ResourceMetrics>
          <ResourceMetrics.StatusAlert
            status="warning"
            primaryBottleneck={null}
          />
        </ResourceMetrics>,
      );

      expect(
        screen.getByText("Some resources may need adjustment"),
      ).toBeInTheDocument();

      rerender(
        <ResourceMetrics>
          <ResourceMetrics.StatusAlert
            status="critical"
            primaryBottleneck={null}
          />
        </ResourceMetrics>,
      );

      expect(
        screen.getByText("Resource allocations need attention"),
      ).toBeInTheDocument();
    });

    test("shows primary bottleneck when provided", () => {
      render(
        <ResourceMetrics>
          <ResourceMetrics.StatusAlert
            status="critical"
            primaryBottleneck="Memory"
          />
        </ResourceMetrics>,
      );

      expect(
        screen.getByText("Primary constraint: Memory"),
      ).toBeInTheDocument();
    });
  });

  describe("Tips component", () => {
    test("renders general optimization tips", () => {
      render(
        <ResourceMetrics>
          <ResourceMetrics.Tips primaryBottleneck={null} />
        </ResourceMetrics>,
      );

      expect(screen.getByText("Optimization Strategies")).toBeInTheDocument();
      expect(
        screen.getByText(/Consider aggregating metrics/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Balance your metrics retention period/),
      ).toBeInTheDocument();
      expect(screen.getByText(/For large deployments/)).toBeInTheDocument();
    });

    test("includes specific advice for bottleneck when provided", () => {
      render(
        <ResourceMetrics>
          <ResourceMetrics.Tips primaryBottleneck="CPU" />
        </ResourceMetrics>,
      );

      expect(screen.getByText(/Specific advice/)).toBeInTheDocument();
      expect(screen.getByText(/Focus on improving CPU/)).toBeInTheDocument();
    });
  });

  describe("Detail component", () => {
    test("renders CPU-specific recommendations", () => {
      render(
        <ResourceMetrics>
          <ResourceMetrics.Detail
            resourceType="CPU Cores"
            resource={mockResource}
            currentValue={2}
          />
        </ResourceMetrics>,
      );

      expect(
        screen.getByText(/Affects how quickly your system/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Your CPU utilization is approaching capacity at 75%/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Allocate approximately 1 core per 100,000 metrics/),
      ).toBeInTheDocument();
    });
  });

  describe("Component integration", () => {
    test("shows all details when StatusAlert toggle is clicked", () => {
      render(
        <ResourceMetrics>
          <ResourceMetrics.StatusAlert
            status="warning"
            primaryBottleneck="CPU"
          />
          <ResourceMetrics.Gauge
            resourceKey="cpu"
            resource={mockResource}
            currentValue={2}
            label="CPU Cores"
            description="Processing power"
          />
          <ResourceMetrics.Gauge
            resourceKey="memory"
            resource={{ ...mockResource, status: "healthy" }}
            currentValue={8}
            label="Memory"
            description="RAM usage"
          />
        </ResourceMetrics>,
      );

      // Initially no details shown
      expect(
        screen.queryByText("Test explanation for resource usage"),
      ).not.toBeInTheDocument();

      // Toggle all details
      fireEvent.click(screen.getByText("Show All Details"));

      // All details should now be visible
      const explanations = screen.getAllByText(
        "Test explanation for resource usage",
      );
      expect(explanations.length).toBe(2);

      // Button text should have changed
      expect(screen.getByText("Hide All Details")).toBeInTheDocument();
    });
  });
});
