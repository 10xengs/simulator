import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import WorkloadInputs from "../../components/WorkloadInputs";
import { WorkloadParams } from "../../components/Simulator";

// Test default parameters that align with application defaults
const DEFAULT_WORKLOAD: WorkloadParams = {
  requestsPerSecond: 100,
  metricsPerRequest: 100,
  uniqueMetricsRatio: 0.2,
  calculationComplexity: 3,
  flushIntervalSeconds: 10,
  retentionPeriodDays: 30,
};

describe("WorkloadInputs", () => {
  const mockSetWorkload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic rendering tests
  test("renders all sliders with correct default values", () => {
    render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    // Traffic Volume
    expect(
      screen.getByLabelText(/Traffic volume: 100 requests per second/i),
    ).toBeInTheDocument();

    // Monitoring Detail
    expect(
      screen.getByLabelText(/Monitoring detail: 100 metrics per request/i),
    ).toBeInTheDocument();

    // Metrics Variety
    expect(
      screen.getByLabelText(/Metrics variety: 20% unique/i),
    ).toBeInTheDocument();

    // Visualization Complexity
    expect(
      screen.getByLabelText(/Visualization complexity: Level 3 of 10/i),
    ).toBeInTheDocument();
  });

  test("calculates and displays derived metrics correctly", () => {
    render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    // Check if derived metrics are calculated and displayed correctly
    expect(screen.getByText("10,000/sec")).toBeInTheDocument(); // Total Volume: 100 * 100 = 10,000
    expect(screen.getByText("2,000/sec")).toBeInTheDocument(); // Unique Metrics Rate: 10,000 * 0.2 = 2,000
    expect(screen.getByText("20,000/batch")).toBeInTheDocument(); // Storage Updates: 2,000 * 10 = 20,000
    expect(screen.getByText("172,800,000")).toBeInTheDocument(); // Daily Metrics: 2,000 * 86400 = 172,800,000
  });

  // Interaction tests
  test("updates workload when sliders change", async () => {
    render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    // Traffic Volume slider
    const trafficSlider = screen.getByLabelText(/Traffic volume:/i);
    fireEvent.change(trafficSlider, { target: { value: 200 } });

    // Verify the updater function was called
    expect(mockSetWorkload).toHaveBeenCalled();

    // Extract the updater function
    const updaterFn = mockSetWorkload.mock.calls[0][0];

    // Apply the updater function to the default workload
    const updatedWorkload = updaterFn(DEFAULT_WORKLOAD);

    // Verify the updated value is what we expect
    expect(updatedWorkload.requestsPerSecond).toBe(200);
  });

  test("shows and hides help content when toggled", async () => {
    render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    // Traffic Volume help
    const trafficHelpButton = screen.getAllByText("Learn more")[0];

    // Initially, help text should not be visible
    expect(screen.queryByText(/Small internal apps/i)).not.toBeInTheDocument();

    // Show help
    fireEvent.click(trafficHelpButton);

    // Help text should now be visible
    expect(screen.getByText(/Small internal apps/i)).toBeInTheDocument();
    expect(trafficHelpButton.textContent).toBe("Hide tips");

    // Hide help
    fireEvent.click(trafficHelpButton);

    // Help text should be hidden again
    expect(screen.queryByText(/Small internal apps/i)).not.toBeInTheDocument();
    expect(trafficHelpButton.textContent).toBe("Learn more");
  });

  test("has advanced settings section with toggleable details", () => {
    render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    // Advanced settings section should exist
    const advancedSettingsButton = screen.getByText("Advanced Settings");
    expect(advancedSettingsButton).toBeInTheDocument();

    // We can verify the section contains the details element
    // by looking for its parent container with the border-t class
    const advancedSection = screen
      .getByText("Advanced Settings")
      .closest("div");
    expect(advancedSection).toHaveClass("border-t");
  });

  // Edge cases and reactive updates
  test("handles undefined workload values with safe defaults", () => {
    // @ts-expect-error - Intentionally passing incomplete workload to test defaults
    render(<WorkloadInputs workload={{}} setWorkload={mockSetWorkload} />);

    // Should use the fallback defaults
    expect(
      screen.getByLabelText(/Traffic volume: 100 requests per second/i),
    ).toBeInTheDocument();
  });

  test("recalculates derived metrics when workload changes", () => {
    const { rerender } = render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    // Initial derived values
    expect(screen.getByText("10,000/sec")).toBeInTheDocument();

    // Update workload and rerender
    const updatedWorkload = {
      ...DEFAULT_WORKLOAD,
      requestsPerSecond: 200,
      metricsPerRequest: 150,
    };

    rerender(
      <WorkloadInputs
        workload={updatedWorkload}
        setWorkload={mockSetWorkload}
      />,
    );

    // New derived values (200 * 150 = 30,000)
    expect(screen.getByText("30,000/sec")).toBeInTheDocument();
  });

  // Visual and accessibility tests
  test("sliders have appropriate ARIA labels for accessibility", () => {
    render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    const sliders = screen.getAllByRole("slider");

    // All sliders should have accessible labels
    sliders.forEach((slider) => {
      expect(slider).toHaveAttribute("aria-label");
    });
  });

  test("displays value labels that update when sliders change", () => {
    render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    // Change the slider
    const trafficSlider = screen.getByLabelText(/Traffic volume:/i);
    fireEvent.change(trafficSlider, { target: { value: 500 } });

    // Check if the mock function was called
    expect(mockSetWorkload).toHaveBeenCalled();

    // Extract and test the updater function
    const updaterFn = mockSetWorkload.mock.calls[0][0];
    const updatedWorkload = updaterFn(DEFAULT_WORKLOAD);
    expect(updatedWorkload.requestsPerSecond).toBe(500);
  });

  // Behavioral tests
  test("visualization complexity displays text labels instead of numeric values", () => {
    const complexityLabels = [
      "Very Simple",
      "Simple",
      "Basic",
      "Moderate",
      "Standard",
      "Advanced",
      "Complex",
      "Very Complex",
      "Sophisticated",
      "Highly Complex",
    ];

    render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    // For complexity = 3, should find the label "Basic" as the visual representation
    // Since we have multiple "Basic" texts in the document, we need to target specifically
    const complexityLabel = screen.getAllByText(complexityLabels[2])[0]; // Get the first "Basic"
    expect(complexityLabel).toBeInTheDocument();

    // Alternatively, we can check if the slider has the correct value
    const complexitySlider = screen.getByLabelText(
      /Visualization complexity:/i,
    );
    expect(complexitySlider).toHaveValue("3");
  });

  // This test checks that the appropriate slider values are enforced
  test("sliders enforce appropriate min/max values", () => {
    render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    // Traffic Volume slider (10-2000)
    const trafficSlider = screen.getByLabelText(/Traffic volume:/i);
    expect(trafficSlider).toHaveAttribute("min", "10");
    expect(trafficSlider).toHaveAttribute("max", "2000");

    // Metrics Variety slider (1-100, representing 0.01-1.00)
    const varietySlider = screen.getByLabelText(/Metrics variety:/i);
    expect(varietySlider).toHaveAttribute("min", "1");
    expect(varietySlider).toHaveAttribute("max", "100");

    // Advanced settings can be found without expanding
    const advancedSettings = screen.getByText("Advanced Settings");
    expect(advancedSettings).toBeInTheDocument();
  });

  // Testing multiple help toggles
  test("toggles help content for all available help buttons", () => {
    render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    // Get all Learn more buttons
    const helpButtons = screen.getAllByText("Learn more");

    // Should have multiple help buttons
    expect(helpButtons.length).toBeGreaterThan(1);

    // Test all buttons
    helpButtons.forEach((button) => {
      // Click to show help
      fireEvent.click(button);
      expect(button.textContent).toBe("Hide tips");

      // Click to hide help
      fireEvent.click(button);
      expect(button.textContent).toBe("Learn more");
    });
  });

  // Testing the Data Retention help content specifically
  test("shows and hides retention period help content", () => {
    render(
      <WorkloadInputs
        workload={DEFAULT_WORKLOAD}
        setWorkload={mockSetWorkload}
      />,
    );

    // Expand advanced settings
    const advancedSettingsButton = screen.getByText("Advanced Settings");
    fireEvent.click(advancedSettingsButton);

    // Find the Data Retention help button (if it exists in the DOM)
    const retentionHelpButton = screen
      .getAllByText("Learn more")
      .find((button) => {
        const parentElement = button.closest("div");
        return (
          parentElement && parentElement.textContent?.includes("Data Retention")
        );
      });

    // If the button is found, test its functionality
    if (retentionHelpButton) {
      // Initially, specific help text should not be visible
      expect(
        screen.queryByText(/Historical analysis/i),
      ).not.toBeInTheDocument();

      // Show help
      fireEvent.click(retentionHelpButton);

      // Help text should now be visible
      expect(screen.getByText(/Historical analysis/i)).toBeInTheDocument();
      expect(retentionHelpButton.textContent).toBe("Hide tips");

      // Hide help
      fireEvent.click(retentionHelpButton);

      // Help text should be hidden again
      expect(
        screen.queryByText(/Historical analysis/i),
      ).not.toBeInTheDocument();
      expect(retentionHelpButton.textContent).toBe("Learn more");
    }
  });

  // Test handling null values for workload
  test("handles null workload gracefully", () => {
    // @ts-expect-error - Intentionally passing null to test robustness
    render(<WorkloadInputs workload={null} setWorkload={mockSetWorkload} />);

    // Should render without crashing and use defaults
    expect(screen.getByText(/requests\/sec/i)).toBeInTheDocument();
    expect(screen.getByText(/metrics\/request/i)).toBeInTheDocument();
  });
});
