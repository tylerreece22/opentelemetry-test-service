const { MeterProvider, ConsoleMetricExporter } = require('@opentelemetry/sdk-metrics-base');
const {OTLPTraceExporter} = require("@opentelemetry/exporter-trace-otlp-http");
const {meter} = require('./tracer')

// const meter = new MeterProvider({
//   exporter: new OTLPTraceExporter({
//     url: 'http://localhost:8080/metrics-int',
//     headers: {'Authorization': 'Basic lkjqheglhg'},
//   }),
//   interval: 1000,
// }).getMeter('request-count-meter');

const requestCount = meter.createCounter("requests", {
  description: "Count all incoming requests"
});

const boundInstruments = new Map();

module.exports = () => {
  return (req, res, next) => {
    if (!boundInstruments.has(req.path)) {
      const labels = { route: req.path };
      const boundCounter = requestCount.bind(labels);
      boundInstruments.set(req.path, boundCounter);
    }

    boundInstruments.get(req.path).add(1);
    next();
  };
};
