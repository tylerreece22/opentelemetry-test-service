//require('./zipkin-tracer')('node-service');

const express = require('express');
const axios = require('axios').default;
const requestCountMiddleware = require('./request-count-middleware')
const {tracer} = require('./tracer')('main-service')

const app = express();
const PORT = 8081;

app.use(requestCountMiddleware())

const getCrudController = () => {
  const router = express.Router();
  const resources = [];
  router.get('/', (req, res) => {
    tracer.track(resources)
    res.send(resources)
  });
  router.post('/', (req, res) => {
    resources.push(req.body);
    tracer.track(resources)
    return res.status(201).send(req.body);
  });
  return router;
};

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization && authorization.includes('secret_token')) {
    next();
  } else {
    res.sendStatus(401);
  }
};

app.use(express.json());
app.get('/health', async (req, res) => res.status(200).send("HEALTHY")); // endpoint that is called by framework/cluster
app.get('/run_test', async (req, res) => {
  // Calls another endpoint of the same API, somewhat mimicing an external API call
  const createdCat = await axios.post(`http://localhost:${PORT}/cats`, {
    name: 'Tom',
    friends: [
      'Jerry',
    ],
  }, {
    headers: {
      Authorization: 'secret_token',
    },
  });

  return res.status(201).send(createdCat.data);
});
app.use('/cats', authMiddleware, getCrudController());

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
