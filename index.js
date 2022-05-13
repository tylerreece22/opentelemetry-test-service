const {tracer} = require('./tracer')('pivot-service')
const express = require('express');

const app = express();
const PORT = 8080;

// app.use(requestCountMiddleware())

const getCrudController = () => {
  const router = express.Router();
  const resources = [];
  router.get('/', (req, res) => {
    // tracer.track(resources)
    res.send(resources)
  });
  router.post('/', (req, res) => {
    resources.push(req.body);
    // tracer.track(resources)
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
//app.use('/cats', authMiddleware, getCrudController());
app.use('/cats', getCrudController());

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
