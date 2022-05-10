import * as dripService from '../services/dripService.js'
import express from 'express'
const router = express.Router()

const DAY = 60 * 60 * 24

router.get('/faucetMonthlyNewAccounts', async function (req, res, next) {
  try {
    const response = await dripService.getDripFaucetMonthlyNewAccounts()
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /faucetMonthlyNewAccounts`, err.message);
    next(err);
  }
});

router.get('/faucetDailyNewAccounts', async function (req, res, next) {
  try {
    const response = await dripService.getDripFaucetDailyNewAccounts()
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /faucetDailyNewAccounts`, err.message);
    next(err);
  }
});

router.get('/faucetDailyMethod', async function (req, res, next) {
  try {
    const response = await dripService.getDripFaucetDailyMethod()
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /faucetDailyMethod`, err.message);
    next(err);
  }
});

router.get('/faucetPlayerDeposit', async function (req, res, next) {
  try {
    const response = await dripService.getDripFaucetPlayerDeposit()
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /faucetPlayerDeposit`, err.message);
    next(err);
  }
});

router.get('/faucetPlayerClaimByRange', async function (req, res, next) {
  try {
    const response = await dripService.getDripFaucetPlayerClaimByRange()
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /faucetPlayerClaimByRange`, err.message);
    next(err);
  }
});

router.get('/faucetAccountHistory', async function (req, res, next) {
  try {
    var address = req.query.address

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    var perPage = parseInt(req.query.perPage) || 10
    var page = parseInt(req.query.page) || 1
    var sortBy = req.query.sortBy || "block"
    var sortByDesc = req.query.sortByDesc || "1"

    var query = { addr: address.toLowerCase() }

    const response = await dripService.getDripAccountHistory2(query, perPage, (page - 1) * perPage, sortBy, sortByDesc)
    res.json({...response, page, perPage});
  } catch (err) {
    console.error(`Error while executing /faucetAccountHistory`, err.message);
    next(err);
  }
});

router.get('/faucetAccountAirdrops', async function (req, res, next) {
  try {
    var address = req.query.address

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    var perPage = parseInt(req.query.perPage) || 10
    var page = parseInt(req.query.page) || 1
    var sortBy = req.query.sortBy || "block"
    var sortByDesc = req.query.sortByDesc || "1"

    var query = { addrTo: address.toLowerCase() }

    const response = await dripService.getDripAccountHistory2(query, perPage, (page - 1) * perPage, sortBy, sortByDesc)
    res.json({...response, page, perPage});
  } catch (err) {
    console.error(`Error while executing /faucetAccountHistory`, err.message);
    next(err);
  }
});

router.get('/faucetAccountRewards', async function (req, res, next) {
  try {
    var address = req.query.address

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    var perPage = parseInt(req.query.perPage) || 10
    var page = parseInt(req.query.page) || 1
    var sortBy = req.query.sortBy || "blockTimestamp"
    var sortByDesc = req.query.sortByDesc || "1"
    var timestamp = req.query.timestamp

    if(!timestamp || timestamp.trim().length == 0){
      try{  
        timestamp = (Date.now() / 1000)
      }catch(e){}
    }

    perPage = Math.min(perPage, 20)

    var query = {
      addr: address.toLowerCase(), 
      "$or" : [ { "event" : 'DirectPayout' }, { "event" : 'MatchPayout' } ],
      blockTimestamp : { $lte : parseFloat(timestamp)},  
    }

    const response = await dripService.getDripFaucetEvents(address.toLowerCase(), timestamp, query, perPage, (page - 1) * perPage, sortBy, sortByDesc, 1000, true)
    res.json({...response, page, perPage});
  } catch (err) {
    console.error(`Error while executing /faucetAccountRewards`, err.message);
    next(err);
  }
});

router.get('/dailyRewardsPerDownlineLevel', async function (req, res, next) {
  try {
    var address = req.query.address

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    const response = await dripService.getDailyRewardsPerDownlineLevels(address.toLowerCase())
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /faucetAccountRewards`, err.message);
    next(err);
  }
});

router.get('/allTimeRewardsPerDownlineLevel', async function (req, res, next) {
  try {
    var address = req.query.address

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    const response = await dripService.getAllTimeRewardsPerDownlineLevels(address.toLowerCase())
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /allTimeRewardsPerDownlineLevel`, err.message);
    next(err);
  }
});

router.get('/getFaucetPlayerDownlineStats', async function (req, res, next) {
  try {
    var address = req.query.address

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    const response = await dripService.getRewardsPerDownlineLevel(address.toLowerCase())
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /getRewardsPerDownlineLevel`, err.message);
    next(err);
  }
});

router.get('/getFaucetPlayerDownlineActions', async function (req, res, next) {
  try {
    const NOW = new Date().getTime() / 1000

    var address = req.query.address
    var method = req.query.method

    var fromTimestamp = !isNaN(req.query.fromTimestamp) ? parseFloat(req.query.fromTimestamp) : NOW - (7 * DAY)
    var toTimestamp = !isNaN(req.query.toTimestamp) ? parseFloat(req.query.toTimestamp) : NOW + 10000

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    const response = await dripService.getDownlineActions(fromTimestamp, toTimestamp, address, method)
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /getFaucetPlayerDownlineActions`, err.message);
    next(err);
  }
});

export default router
