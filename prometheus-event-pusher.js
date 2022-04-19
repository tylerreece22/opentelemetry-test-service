const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS;

const customExporter = new OTLPTraceExporter({
  url: 'http://localhost:8080/metrics-int',
  headers: {'Authorization': 'Basic lkjqheglhg'},
});

const exporter = new PrometheusExporter({}, () => {
  console.log(
    `prometheus scrape endpoint: http://localhost:${port}${endpoint}`,
  );
});

const meter = new MeterProvider({
  exporter: customExporter,
  interval: 1000,
}).getMeter('metrics-int');

const requestCounter = meter.createCounter('requests', {
  description: 'Example of a Counter',
});

const upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
  description: 'Example of a UpDownCounter',
});

const labels = { pid: process.pid, environment: 'staging' };

setInterval(() => {
  console.log('updating counters')
  requestCounter.add(1, labels);
  upDownCounter.add(Math.random() > 0.5 ? 1 : -1, labels);
}, 1000);
