import {Parser} from 'json2csv'
import * as dripService from '../services/dripService.js'
import express from 'express'
const router = express.Router()

router.post('/createAccount', async function (req, res, next) {
  try {
    const { s, address, upline_id} = req.body
    const referrer = await dripService.getReferrer(address)
   
    if(referrer){
      next(new Error('Account already exist'))
      return
    }

    const result = await dripService.createReferrerAccount(address, upline_id)
    
    res.json(result);
  } catch (err) {
    console.error(`Error while executing /createAccount`, err.message);
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

    const referrals = await dripService.getReferrals(referrer._id)
    const transactionsStats = await dripService.getReferrerTransactionsStats(referrer._id)

    res.json({status: 1, referrer, referrals, transactionsStats});
  } catch (err) {
    console.error(`Error while executing /getReferrals`, err.message);
    next(err);
  }
});


export default router
