// src/components/ResourceExplanations.tsx
import React from "react";

const ResourceExplanations: React.FC = () => {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-light mb-5 text-gray-800">
          System Architecture
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed max-w-4xl">
          StatsD and Graphite form a metrics pipeline where StatsD collects,
          aggregates, and sends metrics to Graphite&apos;s Carbon daemon, which
          then writes to Whisper files for storage and querying via the Graphite
          web interface.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-medium mb-4 text-gray-800 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                1
              </span>
              StatsD
            </h4>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Receives metrics over UDP (fire-and-forget)</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span>Aggregates metrics in memory</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <span>
                  Flushes aggregated metrics to Carbon at regular intervals
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Uses very little CPU except during flush</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Memory usage scales with number of unique metrics</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-medium mb-4 text-gray-800 flex items-center">
              <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                2
              </span>
              Carbon
            </h4>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <span>Receives metrics over TCP from StatsD</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span>Maintains in-memory cache of recent metrics</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span>Writes metrics to Whisper database files</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
                <span>CPU usage scales with metrics throughput</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>I/O bound when writing large volumes of metrics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-light mb-5 text-gray-800">
          Resource Scaling Characteristics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300">
            <h4 className="font-medium mb-4 text-gray-800">CPU</h4>
            <div className="text-gray-600 space-y-3">
              <div className="flex items-center">
                <span className="font-medium w-36">Primary Factors:</span>
                <span>Total metrics volume, calculation complexity</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-36">Scaling Pattern:</span>
                <span>Linear with metrics volume</span>
              </div>
              <p className="bg-gray-50 p-4 rounded-lg mt-2 text-sm leading-relaxed">
                StatsD uses minimal CPU for receiving metrics, but more during
                aggregation and flushing. Graphite&apos;s CPU usage increases
                with the complexity of queries and functions applied to the
                data. Carbon requires CPU for processing incoming metrics and
                managing file I/O.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300">
            <h4 className="font-medium mb-4 text-gray-800">Memory</h4>
            <div className="text-gray-600 space-y-3">
              <div className="flex items-center">
                <span className="font-medium w-36">Primary Factors:</span>
                <span>Unique metrics, flush interval</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-36">Scaling Pattern:</span>
                <span>Linear with unique metrics</span>
              </div>
              <p className="bg-gray-50 p-4 rounded-lg mt-2 text-sm leading-relaxed">
                StatsD keeps all active metrics in memory between flush
                intervals. Carbon caches metrics for fast access and to batch
                disk writes. Longer flush intervals increase memory needs as
                more metrics accumulate before writing.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300">
            <h4 className="font-medium mb-4 text-gray-800">Disk I/O</h4>
            <div className="text-gray-600 space-y-3">
              <div className="flex items-center">
                <span className="font-medium w-36">Primary Factors:</span>
                <span>Unique metrics/sec, write frequency</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-36">Scaling Pattern:</span>
                <span>Linear with write operations</span>
              </div>
              <p className="bg-gray-50 p-4 rounded-lg mt-2 text-sm leading-relaxed">
                Carbon writes metrics to Whisper files, which are fixed-size
                databases. Each metric update typically requires both read and
                write operations. High cardinality (many unique metrics) leads
                to many small I/O operations. SSD storage is strongly
                recommended for production deployments.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300">
            <h4 className="font-medium mb-4 text-gray-800">Network I/O</h4>
            <div className="text-gray-600 space-y-3">
              <div className="flex items-center">
                <span className="font-medium w-36">Primary Factors:</span>
                <span>Total metrics volume</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-36">Scaling Pattern:</span>
                <span>Linear with metrics volume</span>
              </div>
              <p className="bg-gray-50 p-4 rounded-lg mt-2 text-sm leading-relaxed">
                StatsD receives metrics over UDP, which is lightweight but
                unreliable. Carbon receives aggregated metrics from StatsD over
                TCP. Graphite web serves queries over HTTP. Network bandwidth is
                rarely the bottleneck except in very high-volume setups.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-light mb-5 text-gray-800">
          Common Bottlenecks & Solutions
        </h3>

        <div className="space-y-5">
          <div className="bg-white p-6 rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-medium mb-3 text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 text-yellow-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              StatsD Packet Drops
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
              <div>
                <span className="font-medium block mb-1">Signs:</span>
                <p className="text-sm">Missing metrics, inconsistent data</p>
              </div>
              <div>
                <span className="font-medium block mb-1">Cause:</span>
                <p className="text-sm">
                  Too many metrics overwhelming UDP processing
                </p>
              </div>
              <div>
                <span className="font-medium block mb-1">Solution:</span>
                <p className="text-sm">
                  Horizontal scaling with multiple StatsD instances behind a
                  load balancer, or switching to a more performant
                  implementation like statsd-c or StatsRelay
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-medium mb-3 text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 text-yellow-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Carbon Write Queue Growth
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
              <div>
                <span className="font-medium block mb-1">Signs:</span>
                <p className="text-sm">
                  Increasing memory usage, delayed metrics
                </p>
              </div>
              <div>
                <span className="font-medium block mb-1">Cause:</span>
                <p className="text-sm">
                  Carbon cannot write to disk fast enough
                </p>
              </div>
              <div>
                <span className="font-medium block mb-1">Solution:</span>
                <p className="text-sm">
                  Faster storage (SSD/NVMe), horizontal scaling with
                  carbon-relay, increasing cache-to-disk write batch size
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-medium mb-3 text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 text-yellow-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Whisper I/O Contention
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
              <div>
                <span className="font-medium block mb-1">Signs:</span>
                <p className="text-sm">High I/O wait times, slow queries</p>
              </div>
              <div>
                <span className="font-medium block mb-1">Cause:</span>
                <p className="text-sm">Too many small read/write operations</p>
              </div>
              <div>
                <span className="font-medium block mb-1">Solution:</span>
                <p className="text-sm">
                  Distributing metrics across multiple volumes, using faster
                  storage, implementing Graphite with alternative backends like
                  InfluxDB or Prometheus
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-light mb-5 text-gray-800">
          Scaling Strategies
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-medium mb-3 text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              Vertical Scaling
            </h4>
            <div className="text-gray-600">
              <p className="mb-2 font-medium">Best for:</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Small to medium workloads</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Up to ~50K metrics/second</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Simplicity of management</span>
                </li>
              </ul>
              <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm leading-relaxed">
                Increase CPU, memory, and use faster disks on a single instance.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-medium mb-3 text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 10h-3v3h3m0-3v-3m-3 0H7v7h7m3 0v-3m-3 3V7"
                />
              </svg>
              Horizontal Scaling
            </h4>
            <div className="text-gray-600">
              <p className="mb-2 font-medium">Best for:</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-blue-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Medium to large workloads</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-blue-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>50K-500K metrics/second</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-blue-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>High availability requirements</span>
                </li>
              </ul>
              <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm leading-relaxed">
                Multiple StatsD instances with load balancing, Carbon relays for
                consistent hashing.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-medium mb-3 text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 text-purple-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Alternative Solutions
            </h4>
            <div className="text-gray-600">
              <p className="mb-2 font-medium">Consider when:</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-purple-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Very high volume (&gt;500K metrics/sec)</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-purple-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Complex retention requirements</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-purple-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Advanced querying needs</span>
                </li>
              </ul>
              <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm leading-relaxed">
                Prometheus, InfluxDB, or cloud managed solutions like AWS
                CloudWatch, GCP Stackdriver.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceExplanations;
