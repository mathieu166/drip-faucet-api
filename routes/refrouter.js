import {Parser} from 'json2csv'
import * as dripService from '../services/dripService.js'
import express from 'express'
const router = express.Router()

router.post('/createReferral', async function (req, res, next) {
  try {

    // const response = await dripService.getDripFaucetMonthlyNewAccounts()
    
    res.json({});
  } catch (err) {
    console.error(`Error while executing /createReferral`, err.message);
    next(err);
  }
});

export default router
