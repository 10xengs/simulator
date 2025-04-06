import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ErrorBoundary from "../../components/ErrorBoundary";

// Create a component that throws an error
const ErrorComponent = ({
  shouldThrow = true,
  errorMessage = "Test error",
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

// Mock console.error to prevent test output noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("ErrorBoundary", () => {
  // Andrew Clark approach: Testing component structure and behavior
  test("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  test("renders fallback UI when an error occurs", () => {
    // Using the error boundary with a component that will throw
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    // Fallback UI should be visible
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });

  test("handles errors with no error message", () => {
    // Create an error with no message property
    const NoMessageErrorComponent = () => {
      const error = new Error();
      error.message = "";
      throw error;
    };

    render(
      <ErrorBoundary>
        <NoMessageErrorComponent />
      </ErrorBoundary>,
    );

    // Fallback UI should indicate an unexpected error
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("An unexpected error occurred"),
    ).toBeInTheDocument();
  });

  test("uses custom fallback UI when provided", () => {
    const customFallback = <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  test("calls onReset callback when reset button is clicked", () => {
    const onResetMock = jest.fn();

    render(
      <ErrorBoundary onReset={onResetMock}>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    // Click the "Try again" button
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    // onReset should have been called
    expect(onResetMock).toHaveBeenCalledTimes(1);
  });

  test("resets error state when reset button is clicked", () => {
    // We'll need to control the error condition
    const TestCase = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);

      // Reset function to fix the error
      const handleReset = () => {
        setShouldThrow(false);
      };

      return (
        <ErrorBoundary onReset={handleReset}>
          <ErrorComponent shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    };

    render(<TestCase />);

    // Initially shows the error
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click try again
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    // Should now render the no-error state
    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  // Testing that componentDidCatch logs errors
  test("logs error to console when error occurs", () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
  });
});
