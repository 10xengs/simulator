import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserResourceConfig from "../../components/UserResourceConfig";

// Test values
const DEFAULT_RESOURCES = {
  cpu: 2,
  memory: 4,
  diskIO: 50,
  networkIO: 100,
  storage: 100,
  statsdInstances: 1,
  carbonInstances: 1,
};

describe("UserResourceConfig", () => {
  test("renders with correct default values", () => {
    const mockSetUserResources = jest.fn();

    render(
      <UserResourceConfig
        userResources={DEFAULT_RESOURCES}
        setUserResources={mockSetUserResources}
      />,
    );

    // Check for slider labels
    expect(screen.getByText("CPU Cores")).toBeInTheDocument();
    expect(screen.getByText("Memory (GB)")).toBeInTheDocument();
    expect(screen.getByText("Storage (GB)")).toBeInTheDocument();
    expect(screen.getByText("Collector Instances")).toBeInTheDocument();
    expect(screen.getByText("Processor Instances")).toBeInTheDocument();

    // Check values using aria-label to avoid ambiguous matches
    expect(
      screen.getByLabelText(`CPU Cores: ${DEFAULT_RESOURCES.cpu}`),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(`Memory: ${DEFAULT_RESOURCES.memory} GB`),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(`Storage: ${DEFAULT_RESOURCES.storage} GB`),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        `Collector Instances: ${DEFAULT_RESOURCES.statsdInstances}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        `Processor Instances: ${DEFAULT_RESOURCES.carbonInstances}`,
      ),
    ).toBeInTheDocument();
  });

  test("updates state when CPU slider changes", () => {
    const mockSetUserResources = jest.fn();

    render(
      <UserResourceConfig
        userResources={DEFAULT_RESOURCES}
        setUserResources={mockSetUserResources}
      />,
    );

    // Find CPU slider by aria-label
    const cpuSlider = screen.getByLabelText(
      `CPU Cores: ${DEFAULT_RESOURCES.cpu}`,
    );
    fireEvent.change(cpuSlider, { target: { value: "4" } });

    // Verify the updater function was called
    expect(mockSetUserResources).toHaveBeenCalled();

    // Since we're using a functional update, we need to manually call the updater
    const updaterFunction = mockSetUserResources.mock.calls[0][0];
    const result = updaterFunction(DEFAULT_RESOURCES);
    expect(result.cpu).toBe(4);
  });

  test("updates state when memory slider changes", () => {
    const mockSetUserResources = jest.fn();

    render(
      <UserResourceConfig
        userResources={DEFAULT_RESOURCES}
        setUserResources={mockSetUserResources}
      />,
    );

    // Find memory slider by aria-label
    const memorySlider = screen.getByLabelText(
      `Memory: ${DEFAULT_RESOURCES.memory} GB`,
    );
    fireEvent.change(memorySlider, { target: { value: "8" } });

    // Verify the updater function was called
    expect(mockSetUserResources).toHaveBeenCalled();

    // Check the result of the updater function
    const updaterFunction = mockSetUserResources.mock.calls[0][0];
    const result = updaterFunction(DEFAULT_RESOURCES);
    expect(result.memory).toBe(8);
  });

  test("updates state when storage and instances sliders change", () => {
    const mockSetUserResources = jest.fn();

    render(
      <UserResourceConfig
        userResources={DEFAULT_RESOURCES}
        setUserResources={mockSetUserResources}
      />,
    );

    // Find sliders by aria-label
    const storageSlider = screen.getByLabelText(
      `Storage: ${DEFAULT_RESOURCES.storage} GB`,
    );
    fireEvent.change(storageSlider, { target: { value: "500" } });

    // Verify updater function was called and check result
    expect(mockSetUserResources).toHaveBeenCalled();
    let updaterFunction = mockSetUserResources.mock.calls[0][0];
    let result = updaterFunction(DEFAULT_RESOURCES);
    expect(result.storage).toBe(500);

    // Reset the mock counter to track next call
    mockSetUserResources.mockClear();

    // StatsD instances slider
    const statsdSlider = screen.getByLabelText(
      `Collector Instances: ${DEFAULT_RESOURCES.statsdInstances}`,
    );
    fireEvent.change(statsdSlider, { target: { value: "3" } });

    // Verify updater function was called and check result
    expect(mockSetUserResources).toHaveBeenCalled();
    updaterFunction = mockSetUserResources.mock.calls[0][0];
    result = updaterFunction(DEFAULT_RESOURCES);
    expect(result.statsdInstances).toBe(3);

    // Reset the mock counter to track next call
    mockSetUserResources.mockClear();

    // Carbon instances slider
    const carbonSlider = screen.getByLabelText(
      `Processor Instances: ${DEFAULT_RESOURCES.carbonInstances}`,
    );
    fireEvent.change(carbonSlider, { target: { value: "2" } });

    // Verify updater function was called and check result
    expect(mockSetUserResources).toHaveBeenCalled();
    updaterFunction = mockSetUserResources.mock.calls[0][0];
    result = updaterFunction(DEFAULT_RESOURCES);
    expect(result.carbonInstances).toBe(2);
  });

  test("shows and hides advanced options", () => {
    render(
      <UserResourceConfig
        userResources={DEFAULT_RESOURCES}
        setUserResources={jest.fn()}
      />,
    );

    // Advanced options should initially be hidden
    expect(screen.queryByText("Disk I/O (MB/s)")).not.toBeInTheDocument();
    expect(screen.queryByText("Network I/O (Mbps)")).not.toBeInTheDocument();

    // Find and click the toggle button
    const showAdvancedButton = screen.getByText("Show advanced options");
    fireEvent.click(showAdvancedButton);

    // Advanced section should now be visible
    expect(screen.getByText("Disk I/O (MB/s)")).toBeInTheDocument();
    expect(screen.getByText("Network I/O (Mbps)")).toBeInTheDocument();

    // Should be a hide button now
    const hideAdvancedButton = screen.getByText("Hide advanced options");
    fireEvent.click(hideAdvancedButton);

    // Advanced section should be hidden again
    expect(screen.queryByText("Disk I/O (MB/s)")).not.toBeInTheDocument();
    expect(screen.queryByText("Network I/O (Mbps)")).not.toBeInTheDocument();
  });

  test("updates state when advanced sliders change", () => {
    const mockSetUserResources = jest.fn();

    render(
      <UserResourceConfig
        userResources={DEFAULT_RESOURCES}
        setUserResources={mockSetUserResources}
      />,
    );

    // Expand advanced options
    const showAdvancedButton = screen.getByText("Show advanced options");
    fireEvent.click(showAdvancedButton);

    // Find disk and network IO sliders by aria-label
    const diskIOSlider = screen.getByLabelText(
      `Disk I/O: ${DEFAULT_RESOURCES.diskIO} MB/s`,
    );
    const networkIOSlider = screen.getByLabelText(
      `Network I/O: ${DEFAULT_RESOURCES.networkIO} Mbps`,
    );

    // Change DiskIO slider
    fireEvent.change(diskIOSlider, { target: { value: "150" } });

    // Verify updater function was called and check result
    expect(mockSetUserResources).toHaveBeenCalled();
    let updaterFunction = mockSetUserResources.mock.calls[0][0];
    let result = updaterFunction(DEFAULT_RESOURCES);
    expect(result.diskIO).toBe(150);

    // Reset the mock counter to track next call
    mockSetUserResources.mockClear();

    // Change NetworkIO slider
    fireEvent.change(networkIOSlider, { target: { value: "250" } });

    // Verify updater function was called and check result
    expect(mockSetUserResources).toHaveBeenCalled();
    updaterFunction = mockSetUserResources.mock.calls[0][0];
    result = updaterFunction(DEFAULT_RESOURCES);
    expect(result.networkIO).toBe(250);
  });

  test("handles large values correctly", () => {
    // Test with high values
    const highResources = {
      cpu: 16,
      memory: 32,
      diskIO: 500,
      networkIO: 1000,
      storage: 1000,
      statsdInstances: 10,
      carbonInstances: 10,
    };

    render(
      <UserResourceConfig
        userResources={highResources}
        setUserResources={jest.fn()}
      />,
    );

    // Check that high values are displayed correctly using aria-labels
    expect(screen.getByLabelText("CPU Cores: 16")).toBeInTheDocument();
    expect(screen.getByLabelText("Memory: 32 GB")).toBeInTheDocument();
    expect(screen.getByLabelText("Storage: 1000 GB")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Collector Instances: 10"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Processor Instances: 10"),
    ).toBeInTheDocument();
  });

  test("handles undefined values by using defaults", () => {
    const incompleteResources = {
      cpu: undefined,
      memory: undefined,
    } as {
      cpu?: number;
      memory?: number;
      diskIO?: number;
      networkIO?: number;
      storage?: number;
      statsdInstances?: number;
      carbonInstances?: number;
    };

    render(
      <UserResourceConfig
        userResources={incompleteResources}
        setUserResources={jest.fn()}
      />,
    );

    // Should fall back to defaults
    expect(screen.getByLabelText("CPU Cores: 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Memory: 4 GB")).toBeInTheDocument();
  });
});
