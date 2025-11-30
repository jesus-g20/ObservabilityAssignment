const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { NodeSDK } = require('@opentelemetry/sdk-node');

const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

// NEW: OTLP trace exporter (Jaeger consumes OTLP)
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");

// NEW: OTLP metrics exporter
const {
  OTLPMetricExporter
} = require("@opentelemetry/exporter-metrics-otlp-http");

const {
  PeriodicExportingMetricReader
} = require("@opentelemetry/sdk-metrics");

// Instrumentations
const { ExpressInstrumentation } =
  require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } =
  require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } =
  require("@opentelemetry/instrumentation-http");

// Create OTLP exporters pointing to Jaeger (OTLP HTTP)
const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
});

const metricExporter = new OTLPMetricExporter({
  url: "http://localhost:4318/v1/metrics",
});

// OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "todo-service",
  }),

  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
  }),

  instrumentations: [
    getNodeAutoInstrumentations(),
    new ExpressInstrumentation(),
    new MongoDBInstrumentation(),
    new HttpInstrumentation(),
  ],
});

sdk.start();
