import express, { json, urlencoded } from 'express';
import rateLimit from 'express-rate-limit';
import router from './routes/router.js';
import refrouter from './routes/refrouter.js';
import cors from 'cors'
import { ethers } from 'ethers'

const message = 'You signature is required to identify your registration plan.'
const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 60 // limit each IP to 30 requests per windowMs
});

const refLimiter = rateLimit({
  windowMs: 60 * 1000 * 60, // 1 hours
  max: 5 // limit each IP to 5 requests per windowMs
});


app.use(cors())
app.use(json());
app.use(urlencoded());
app.options('*', cors())

app.use('/ref', (req, res, next) => {
  const { s, address } = req.query
  if(!s || !address){
    return res.status(401).send('Unauthorized access.')
  }

  const verifiedAddress = ethers.utils.verifyMessage("www.dripnetwork.ca", s)
  if (address.toLocaleLowerCase() !== verifiedAddress.toLocaleLowerCase()) {
    return res.status(401).send('Unauthorized access.')
  }
  next();
})

app.use('/ref', refrouter)

app.use('/', limiter);
app.use('/', router);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({'message': err.message});
  
  return;
});

export default app