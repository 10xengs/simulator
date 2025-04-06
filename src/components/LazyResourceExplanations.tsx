import React, { lazy, Suspense } from "react";

// Lazy load the ResourceExplanations component
const ResourceExplanations = lazy(() => import("./ResourceExplanations"));

/**
 * Lazy Resource Explanations Component
 *
 * This component lazily loads the resource explanations to reduce the initial bundle size.
 * This follows Andrew Clark's pattern of code-splitting to improve performance.
 */
function LazyResourceExplanations() {
  return (
    <Suspense
      fallback={
        <div className="p-6 bg-white rounded-lg border border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      }
    >
      <ResourceExplanations />
    </Suspense>
  );
}

export default LazyResourceExplanations;
