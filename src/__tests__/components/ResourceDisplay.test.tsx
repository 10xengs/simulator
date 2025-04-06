import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ResourceDisplay from "../../components/ResourceDisplay";
import {
  ResourceRequirements,
  UserResources,
} from "../../components/Simulator";

/**
 * Resource Display Test Suite
 * Written in the style of Andrew Clark
 *
 * Testing patterns:
 * - Testing behavior, not implementation
 * - Focus on user interactions and accessibility
 * - Minimal test setup, clear assertions
 * - Group related behaviors in test blocks
 */

// Mock resource data - used across tests
const mockHealthyRequirements: ResourceRequirements = {
  cpu: {
    value: 2,
    unit: "cores",
    explanation: "CPU cores needed for processing metrics",
    status: "healthy",
    utilization: 0.5,
  },
  memory: {
    value: 4,
    unit: "GB",
    explanation: "Memory required for caching metrics",
    status: "healthy",
    utilization: 0.5,
  },
  storage: {
    value: 200,
    unit: "GB",
    explanation: "Storage needed for metrics retention",
    status: "healthy",
    utilization: 0.5,
  },
  diskIO: {
    value: 50,
    unit: "MB/s",
    explanation: "Disk I/O speed required",
    status: "healthy",
    utilization: 0.5,
  },
  networkIO: {
    value: 100,
    unit: "Mbps",
    explanation: "Network bandwidth needed",
    status: "healthy",
    utilization: 0.5,
  },
};

// Resource data with warnings
const mockWarningRequirements: ResourceRequirements = {
  ...mockHealthyRequirements,
  memory: {
    ...mockHealthyRequirements.memory,
    status: "warning",
    utilization: 0.75,
    explanation: "Memory is approaching capacity limits",
  },
};

// Resource data with critical issues
const mockCriticalRequirements: ResourceRequirements = {
  ...mockWarningRequirements,
  storage: {
    ...mockHealthyRequirements.storage,
    status: "critical",
    utilization: 0.95,
    explanation: "Storage capacity is nearly exhausted",
  },
};

const mockUserResources: UserResources = {
  cpu: 2,
  memory: 4,
  diskIO: 50,
  networkIO: 100,
  storage: 100,
  statsdInstances: 1,
  carbonInstances: 1,
};

describe("ResourceDisplay", () => {
  // Basic rendering tests
  describe("rendering", () => {
    test("renders all resource sections with correct values", () => {
      render(
        <ResourceDisplay
          requirements={mockHealthyRequirements}
          userResources={mockUserResources}
        />,
      );

      // All resource sections should be present
      expect(screen.getByText("CPU Cores")).toBeInTheDocument();
      expect(screen.getByText("Memory")).toBeInTheDocument();
      expect(screen.getByText("Storage")).toBeInTheDocument();
      expect(screen.getByText("Disk I/O")).toBeInTheDocument();
      expect(screen.getByText("Network I/O")).toBeInTheDocument();

      // Check displayed values - use getAllByText since there may be multiple elements with the same text
      const allocatedValues = screen.getAllByText("2 cores")[0];
      expect(allocatedValues).toBeInTheDocument();
      expect(screen.getAllByText("4 GB")[0]).toBeInTheDocument();
      expect(screen.getAllByText("100 GB")[0]).toBeInTheDocument();
      expect(screen.getAllByText("50 MB/s")[0]).toBeInTheDocument();
      expect(screen.getAllByText("100 Mbps")[0]).toBeInTheDocument();
    });

    test("renders optimization tips section", () => {
      render(
        <ResourceDisplay
          requirements={mockHealthyRequirements}
          userResources={mockUserResources}
        />,
      );

      expect(screen.getByText("Optimization Strategies")).toBeInTheDocument();
      expect(
        screen.getByText(/Consider aggregating metrics/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Balance your metrics retention/i),
      ).toBeInTheDocument();
    });

    test("does not render status alert when all resources are healthy", () => {
      render(
        <ResourceDisplay
          requirements={mockHealthyRequirements}
          userResources={mockUserResources}
        />,
      );

      expect(
        screen.queryByText("All resources are optimally allocated"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Resource allocations need attention"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Show All Details")).not.toBeInTheDocument();
    });

    test("handles undefined user resources by using defaults", () => {
      render(<ResourceDisplay requirements={mockHealthyRequirements} />);

      // Should render with default values
      expect(screen.getByText("CPU Cores")).toBeInTheDocument();
      expect(screen.getByText("Memory")).toBeInTheDocument();
      expect(screen.getByText("1 cores")).toBeInTheDocument();
      expect(screen.getByText("1 GB")).toBeInTheDocument();
    });
  });

  // Status indicator tests
  describe("status indicators", () => {
    test("displays appropriate status labels for different resource states", () => {
      render(
        <ResourceDisplay
          requirements={mockCriticalRequirements}
          userResources={mockUserResources}
        />,
      );

      // Should show different status indicators
      const optimal = screen.getAllByText("Optimal");
      const attentionNeeded = screen.getByText("Attention Needed");
      const insufficient = screen.getByText("Insufficient");

      expect(optimal.length).toBe(3); // CPU, diskIO, networkIO
      expect(attentionNeeded).toBeInTheDocument(); // Memory
      expect(insufficient).toBeInTheDocument(); // Storage
    });

    test("displays system status alert with proper status when resources have issues", () => {
      render(
        <ResourceDisplay
          requirements={mockCriticalRequirements}
          userResources={mockUserResources}
        />,
      );

      // System status should show critical due to storage
      expect(
        screen.getByText("Resource allocations need attention"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Primary constraint: Storage/i),
      ).toBeInTheDocument();
    });

    test("displays warning status alert when only warnings are present", () => {
      render(
        <ResourceDisplay
          requirements={mockWarningRequirements}
          userResources={mockUserResources}
        />,
      );

      expect(
        screen.getByText("Some resources may need adjustment"),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Primary constraint/i)).toBeInTheDocument();
    });

    test("gauge percentages reflect utilization values", () => {
      const { container } = render(
        <ResourceDisplay
          requirements={mockCriticalRequirements}
          userResources={mockUserResources}
        />,
      );

      // Look for SVG text elements with the percentages
      const percentages = Array.from(container.querySelectorAll("text"))
        .filter((el) => el.textContent?.includes("%"))
        .map((el) => el.textContent?.replace("%", ""));

      expect(percentages).toContain("50"); // CPU utilization
      expect(percentages).toContain("75"); // Memory utilization
      expect(percentages).toContain("95"); // Storage utilization
    });
  });

  // Interactive features tests
  describe("interaction behavior", () => {
    test("toggles resource details when Learn More button is clicked", async () => {
      render(
        <ResourceDisplay
          requirements={mockHealthyRequirements}
          userResources={mockUserResources}
        />,
      );

      // Initially no details visible
      expect(
        screen.queryByText("CPU cores needed for processing metrics"),
      ).not.toBeInTheDocument();

      // Click the first Learn More button (CPU)
      const learnMoreButtons = screen.getAllByText("Learn More");
      await userEvent.click(learnMoreButtons[0]);

      // Now CPU details should be visible
      expect(
        screen.getByText("CPU cores needed for processing metrics"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Impact:/i)).toBeInTheDocument();

      // Other resource details should still be hidden
      expect(
        screen.queryByText("Memory required for caching metrics"),
      ).not.toBeInTheDocument();

      // Button text should change
      const hideDetailsButtons = screen.getAllByText("Hide Details");
      expect(hideDetailsButtons.length).toBe(1);

      // Click again to hide details
      await userEvent.click(hideDetailsButtons[0]);
      expect(
        screen.queryByText("CPU cores needed for processing metrics"),
      ).not.toBeInTheDocument();
    });

    test("toggles all details when Show All Details button is clicked", async () => {
      render(
        <ResourceDisplay
          requirements={mockCriticalRequirements}
          userResources={mockUserResources}
        />,
      );

      // Initially no explanations visible
      expect(
        screen.queryByText("CPU cores needed for processing metrics"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Memory is approaching capacity limits"),
      ).not.toBeInTheDocument();

      // Click Show All Details
      await userEvent.click(screen.getByText("Show All Details"));

      // All explanations should now be visible
      expect(
        screen.getByText("CPU cores needed for processing metrics"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Memory is approaching capacity limits"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Storage capacity is nearly exhausted"),
      ).toBeInTheDocument();

      // Button text should change
      expect(screen.getByText("Hide All Details")).toBeInTheDocument();

      // Click again to hide all details
      await userEvent.click(screen.getByText("Hide All Details"));

      // All explanations should be hidden again
      expect(
        screen.queryByText("CPU cores needed for processing metrics"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Memory is approaching capacity limits"),
      ).not.toBeInTheDocument();
    });

    test("only one resource detail section can be open at a time", async () => {
      render(
        <ResourceDisplay
          requirements={mockHealthyRequirements}
          userResources={mockUserResources}
        />,
      );

      const learnMoreButtons = screen.getAllByText("Learn More");

      // Open CPU details
      await userEvent.click(learnMoreButtons[0]);
      expect(
        screen.getByText("CPU cores needed for processing metrics"),
      ).toBeInTheDocument();

      // Open Memory details
      await userEvent.click(learnMoreButtons[1]);

      // Memory details should be visible
      expect(
        screen.getByText("Memory required for caching metrics"),
      ).toBeInTheDocument();

      // CPU details should be hidden
      expect(
        screen.queryByText("CPU cores needed for processing metrics"),
      ).not.toBeInTheDocument();
    });
  });

  // Sorting and prioritization tests
  describe("resource prioritization", () => {
    test("sorts resources by criticality (critical > warning > healthy)", () => {
      const { container } = render(
        <ResourceDisplay
          requirements={mockCriticalRequirements}
          userResources={mockUserResources}
        />,
      );

      // Get all resource sections by their role
      const resourceSections = container.querySelectorAll('[role="region"]');

      // First should be Storage (critical)
      expect(resourceSections[0]).toHaveTextContent("Storage");

      // Second should be Memory (warning)
      expect(resourceSections[1]).toHaveTextContent("Memory");

      // Remaining should be healthy resources
      const healthyResources = ["CPU Cores", "Disk I/O", "Network I/O"];
      for (let i = 2; i < resourceSections.length; i++) {
        expect(
          healthyResources.some((resource) =>
            resourceSections[i].textContent?.includes(resource),
          ),
        ).toBe(true);
      }
    });

    test("identifies primary bottleneck in system status", () => {
      render(
        <ResourceDisplay
          requirements={mockCriticalRequirements}
          userResources={mockUserResources}
        />,
      );

      expect(
        screen.getByText(/Primary constraint: Storage/i),
      ).toBeInTheDocument();

      // With only warning, memory should be primary bottleneck
      render(
        <ResourceDisplay
          requirements={mockWarningRequirements}
          userResources={mockUserResources}
        />,
      );
      expect(
        screen.getByText(/Primary constraint: Memory/i),
      ).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe("accessibility", () => {
    test("resource gauges have appropriate ARIA labels", () => {
      render(
        <ResourceDisplay
          requirements={mockHealthyRequirements}
          userResources={mockUserResources}
        />,
      );

      // Check for aria-labels on gauge elements
      const cpuGauge = screen.getByRole("img", {
        name: /CPU Cores usage: 50%/i,
      });
      const memoryGauge = screen.getByRole("img", {
        name: /Memory usage: 50%/i,
      });

      expect(cpuGauge).toBeInTheDocument();
      expect(memoryGauge).toBeInTheDocument();
    });

    test("detail toggle buttons have appropriate ARIA attributes", () => {
      render(
        <ResourceDisplay
          requirements={mockHealthyRequirements}
          userResources={mockUserResources}
        />,
      );

      // Get all Learn More buttons
      const learnMoreButtons = screen.getAllByText("Learn More");

      // Each button should have aria-expanded and aria-controls
      learnMoreButtons.forEach((button) => {
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).toHaveAttribute("aria-controls");
      });

      // After clicking, aria-expanded should change
      fireEvent.click(learnMoreButtons[0]);
      expect(learnMoreButtons[0]).toHaveAttribute("aria-expanded", "true");
    });

    test('system status alert has role="alert"', () => {
      render(
        <ResourceDisplay
          requirements={mockCriticalRequirements}
          userResources={mockUserResources}
        />,
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Resource allocations need attention");
    });
  });

  // Edge cases
  describe("edge cases", () => {
    test("formats large values correctly", () => {
      const largeRequirements: ResourceRequirements = {
        ...mockHealthyRequirements,
        storage: {
          ...mockHealthyRequirements.storage,
          value: 1500, // 1.5TB
          unit: "GB",
        },
      };

      render(
        <ResourceDisplay
          requirements={largeRequirements}
          userResources={mockUserResources}
        />,
      );

      // Should format as TB
      expect(screen.getByText("1.5 TB")).toBeInTheDocument();
    });

    test("handles zero utilization gracefully", () => {
      const zeroUtilizationRequirements: ResourceRequirements = {
        ...mockHealthyRequirements,
        diskIO: {
          ...mockHealthyRequirements.diskIO,
          utilization: 0,
        },
      };

      const { container } = render(
        <ResourceDisplay
          requirements={zeroUtilizationRequirements}
          userResources={mockUserResources}
        />,
      );

      // The diskIO gauge should still render
      const diskIOSection = Array.from(
        container.querySelectorAll('[role="region"]'),
      ).find((el) => el.textContent?.includes("Disk I/O"));

      expect(diskIOSection).toBeInTheDocument();

      // Should show 0%
      const percentages = Array.from(diskIOSection!.querySelectorAll("text"))
        .filter((el) => el.textContent?.includes("%"))
        .map((el) => el.textContent);

      expect(percentages).toContain("0%");
    });
  });
});
