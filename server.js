import express, { json, urlencoded } from 'express';
import rateLimit from 'express-rate-limit';
import router from './routes/router.js';
import cors from 'cors'

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 30 // limit each IP to 30 requests per windowMs
});

app.use(limiter);
app.use(cors())
app.use(json());
app.use(urlencoded());
app.options('*', cors())

app.use('/', router);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({'message': err.message});
  
  return;
});

export default app