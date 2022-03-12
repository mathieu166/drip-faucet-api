import dotenv from 'dotenv'
dotenv.config()

console.log(process.env.CERT_CONTENT)

// import * as dripService from './services/dripService.js'
// console.log(await dripService.getDripFaucetMonthlyNewAccounts())