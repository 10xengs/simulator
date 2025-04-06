import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LazyResourceExplanations from "../../components/LazyResourceExplanations";

// Mock ResourceExplanations to prevent loading
jest.mock("../../components/ResourceExplanations", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="resource-explanations">Resource Explanations Content</div>
  ),
}));

// Mock React.lazy to control its behavior
jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    lazy: () => {
      const Component = () => (
        <div data-testid="lazy-loaded">Lazy Loaded Content</div>
      );
      Component.displayName = "LazyLoadedComponent";
      return Component;
    },
    Suspense: ({ children, fallback }) => (
      <div data-testid="suspense-wrapper">
        <div data-testid="suspense-fallback">{fallback}</div>
        <div data-testid="suspense-children">{children}</div>
      </div>
    ),
  };
});

describe("LazyResourceExplanations", () => {
  // Test approach based on Andrew Clark's component structure testing
  test("uses React.Suspense with appropriate fallback UI", () => {
    render(<LazyResourceExplanations />);

    // Check Suspense is used
    const suspense = screen.getByTestId("suspense-wrapper");
    expect(suspense).toBeInTheDocument();

    // Check fallback content structure
    const fallback = screen.getByTestId("suspense-fallback");
    expect(fallback).toBeInTheDocument();
    expect(fallback.innerHTML).toContain("animate-pulse");
    expect(fallback.innerHTML).toContain("bg-white");
    expect(fallback.innerHTML).toContain("rounded-lg");
    expect(fallback.innerHTML).toContain("border-gray-200");
  });

  test("fallback UI contains proper skeleton structure", () => {
    render(<LazyResourceExplanations />);

    const fallback = screen.getByTestId("suspense-fallback");

    // Check if it contains the main skeletal elements
    expect(fallback.innerHTML).toContain("h-4");
    expect(fallback.innerHTML).toContain("h-3");
    expect(fallback.innerHTML).toContain("space-y-3");
    expect(fallback.innerHTML).toMatch(/w-1\/4/); // Header width
    expect(fallback.innerHTML).toMatch(/w-3\/4/); // First content line
    expect(fallback.innerHTML).toMatch(/w-5\/6/); // Second content line
    expect(fallback.innerHTML).toMatch(/w-2\/3/); // Third content line
  });

  test("renders ResourceExplanations as children", () => {
    render(<LazyResourceExplanations />);

    // Check that the ResourceExplanations component is rendered within Suspense
    const suspenseChildren = screen.getByTestId("suspense-children");
    expect(suspenseChildren).toBeInTheDocument();
    expect(suspenseChildren.innerHTML).toContain("Lazy Loaded Content");
  });
});
