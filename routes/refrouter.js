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

router.get('/getReferrals', async function (req, res, next) {
  try {
    const { s, address } = req.query
    const referrer = await dripService.getReferrer(address)
    if(!referrer){
      res.json({status: 0})
      return;
    }

    const response = await dripService.getReferrals(referrer._id)
    
    res.json({status: 1, referrer, referrals: response});
  } catch (err) {
    console.error(`Error while executing /getReferrals`, err.message);
    next(err);
  }
});


export default router
