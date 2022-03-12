import * as dripService from '../services/dripService.js'
import express from 'express'
const router = express.Router()

router.get('/faucetMonthlyNewAccounts', async function (req, res, next) {
  try {
    // const limit = req.query.limit
    const response = await dripService.getDripFaucetMonthlyNewAccounts()
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /faucetMonthlyNewAccounts`, err.message);
    next(err);
  }
});

router.get('/faucetDailyNewAccounts', async function (req, res, next) {
  try {
    // const limit = req.query.limit
    const response = await dripService.getDripFaucetDailyNewAccounts()
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /faucetDailyNewAccounts`, err.message);
    next(err);
  }
});

router.get('/faucetDailyMethod', async function (req, res, next) {
  try {
    // const limit = req.query.limit
    const response = await dripService.getDripFaucetDailyMethod()
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /faucetDailyMethod`, err.message);
    next(err);
  }
});

export default router
