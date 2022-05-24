import app from './server.js'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config();

const port = process.env.PORT || 3000;

const CERT_CONTENT = process.env.CERT_CONTENT;
const CERT_LOCATION = process.env.CERT;

fs.writeFileSync(CERT_LOCATION, CERT_CONTENT);

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
