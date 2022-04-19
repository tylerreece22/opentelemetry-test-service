const http = require('http');
const express = require('express');
const {meter, tracer} = require('tracer')('user-service')

const app = express();
const port = 8080

app.use((req, res, next) => {
    meter.createCounter('http-requests')
    next()
})

app.post('/user', (req, res) => {
    console.log('received request')
    const user = {name: 'person', age: 123}
    tracer.track(user)
    return res.status(200).send(user)
})

const httpServer = http.createServer(app);

httpServer.listen(port, () => {
    console.log(`metrics-int listening on ${port}`)
});
