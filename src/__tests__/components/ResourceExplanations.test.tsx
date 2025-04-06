import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ResourceExplanations from "../../components/ResourceExplanations";

describe("ResourceExplanations", () => {
  // Guillermo Rauch approach: Focus on critical user needs and content accessibility
  test("renders all major section headings", () => {
    render(<ResourceExplanations />);

    expect(screen.getByText("System Architecture")).toBeInTheDocument();
    expect(
      screen.getByText("Resource Scaling Characteristics"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Common Bottlenecks & Solutions"),
    ).toBeInTheDocument();
    expect(screen.getByText("Scaling Strategies")).toBeInTheDocument();
  });

  test("displays key architecture components", () => {
    render(<ResourceExplanations />);

    expect(screen.getByText("StatsD")).toBeInTheDocument();
    expect(screen.getByText("Carbon")).toBeInTheDocument();
  });

  // Andrew Clark approach: Component structure and relationships
  test("renders nested information hierarchy correctly", () => {
    const { container } = render(<ResourceExplanations />);

    // Check that the component properly structures content with appropriate nesting
    const resourceSections = container.querySelectorAll("div > h3");
    expect(resourceSections.length).toBe(4);

    const gridLayouts = container.querySelectorAll(".grid");
    expect(gridLayouts.length).toBeGreaterThan(0);
  });

  test("displays all resource characteristics", () => {
    render(<ResourceExplanations />);

    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(screen.getByText("Memory")).toBeInTheDocument();
    expect(screen.getByText("Disk I/O")).toBeInTheDocument();
    expect(screen.getByText("Network I/O")).toBeInTheDocument();
  });

  // Jordan Walke approach: Core functionality and data representation
  test("contains essential bottleneck information", () => {
    render(<ResourceExplanations />);

    // Critical operational knowledge users need
    expect(screen.getByText("StatsD Packet Drops")).toBeInTheDocument();
    expect(screen.getByText("Carbon Write Queue Growth")).toBeInTheDocument();
    expect(screen.getByText("Whisper I/O Contention")).toBeInTheDocument();
  });

  test("presents accurate scaling strategies", () => {
    render(<ResourceExplanations />);

    const verticalScaling = screen.getByText("Vertical Scaling");
    const horizontalScaling = screen.getByText("Horizontal Scaling");
    const alternatives = screen.getByText("Alternative Solutions");

    expect(verticalScaling).toBeInTheDocument();
    expect(horizontalScaling).toBeInTheDocument();
    expect(alternatives).toBeInTheDocument();

    // Check for accurate descriptions
    expect(screen.getByText(/Small to medium workloads/i)).toBeInTheDocument();
    expect(screen.getByText(/Medium to large workloads/i)).toBeInTheDocument();
  });
});
