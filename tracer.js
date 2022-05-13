const {NodeTracerProvider} = require("@opentelemetry/node");
const {SimpleSpanProcessor, BatchSpanProcessor, ConsoleSpanExporter} = require("@opentelemetry/tracing");
const {diag, DiagConsoleLogger, DiagLogLevel, trace} = require('@opentelemetry/api');
const {registerInstrumentations} = require("@opentelemetry/instrumentation");
const {HttpInstrumentation} = require("@opentelemetry/instrumentation-http");
const {ExpressInstrumentation} = require("@opentelemetry/instrumentation-express");
const {JaegerExporter} = require("@opentelemetry/exporter-jaeger");
const {SemanticResourceAttributes} = require('@opentelemetry/semantic-conventions')
const {Resource} = require("@opentelemetry/resources");
const {serviceSyncDetector} = require('opentelemetry-resource-detector-service')
const {api} = require("@opentelemetry/sdk-node");
// Debug logger
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const init = (serviceName, metricsPort) => {

    // Define metrics
    // const metricsExporter = new PrometheusExporter({port: metricsPort},
    //     () => console.log(`prometheus scrape endpoint http://localhost:${metricsPort}${PrometheusExporter.DEFAULT_OPTIONS.endpoint}`))
    // const meter = new MeterProvider({
    //     exporter: metricsExporter,
    //     interval: 1000,
    // }).getMeter(serviceName)

    // Autodetects service info
    const serviceResource = serviceSyncDetector.detect()
    const customResources = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        'my-resource': 1
    })

    const provider = new NodeTracerProvider({
        resource: serviceResource.merge(customResources),
        // sampler: ,definitely possible and needed in high traffic applications
    })

    // Define traces
    provider.addSpanProcessor(new BatchSpanProcessor(new JaegerExporter(
        {endpoint: 'http://localhost:14268/api/traces'}
    )))
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
    // provider.addSpanProcessor(new BatchSpanProcessor(traceExporter, {
    //     scheduledDelayMillis: 7000 // Only send metrics every 7 seconds
    // }))
    provider.register()

    registerInstrumentations({
        instrumentations: [
            new ExpressInstrumentation(),
            new HttpInstrumentation(),
        ]
    })

    // const tracer = provider.getTracer(serviceName)

    return {
        // TODO: make this work
        tracer: {
            track: (eventObject = {}) => {
                const activeSpan = api.trace.getSpan(api.context.active())
                activeSpan.setAttributes(eventObject)
            },
        }
    }
}

module.exports = init
