import {Parser} from 'json2csv'
import * as dripService from '../services/dripService.js'
import * as statsService from '../services/statsService.js'
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
    const NOW = new Date().getTime() / 1000
    
    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    var perPage = parseInt(req.query.perPage) || 10
    var page = parseInt(req.query.page) || 1
    var sortBy = req.query.sortBy || "block"
    var sortByDesc = req.query.sortByDesc || "1"
    var method = ['claim', 'roll', 'airdrop', 'deposit'].find(p=>p ===req.query.method)

    var fromTimestamp = !isNaN(req.query.fromTimestamp) ? parseFloat(req.query.fromTimestamp) : undefined
    var toTimestamp = !isNaN(req.query.toTimestamp) ? parseFloat(req.query.toTimestamp) : NOW + 10000

    var query = { addr: address.toLowerCase() }

    if(method){
      query.method = method
    }

    if(fromTimestamp){
      query.blockTimestamp =  {
        "$gte": fromTimestamp,
        "$lte": toTimestamp
      }  
    }

    const response = await dripService.getDripAccountHistory2(query, perPage, (page - 1) * perPage, sortBy, sortByDesc, false)
    res.json({...response, page, perPage});
  } catch (err) {
    console.error(`Error while executing /faucetAccountHistory`, err.message);
    next(err);
  }
});

router.get('/faucetAccountAirdrops', async function (req, res, next) {
  try {
    var address = req.query.address
    var uplineOnly = req.query.uplineOnly === "1"

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    var perPage = parseInt(req.query.perPage) || 10
    var page = parseInt(req.query.page) || 1
    var sortBy = req.query.sortBy || "block"
    var sortByDesc = req.query.sortByDesc || "1"

    var query = { addrTo: address.toLowerCase() }

    const response = await dripService.getDripAccountHistory2(query, perPage, (page - 1) * perPage, sortBy, sortByDesc, uplineOnly)
    res.json({...response, page, perPage});
  } catch (err) {
    console.error(`Error while executing /faucetAccountHistory`, err.message);
    next(err);
  }
});

router.get('/faucetAccountRewards', async function (req, res, next) {
  try {
    var address = req.query.address
    const NOW = new Date().getTime() / 1000

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    var perPage = parseInt(req.query.perPage) || 10
    var page = parseInt(req.query.page) || 1
  
    var fromTimestamp = !isNaN(req.query.fromTimestamp) ? parseFloat(req.query.fromTimestamp) : NOW - (7 * DAY)
    var toTimestamp = !isNaN(req.query.toTimestamp) ? parseFloat(req.query.toTimestamp) : NOW + 10000

    perPage = Math.min(perPage, 20)

    var query = {
      addr: address.toLowerCase(), 
      "$or" : [ { "event" : 'DirectPayout' }, { "event" : 'MatchPayout' } ],
      blockTimestamp: {
        "$gte": fromTimestamp,
        "$lte": toTimestamp
      }  
    }

    const response = await dripService.getDripFaucetEvents(address.toLowerCase(), query, perPage, (page - 1) * perPage)
    res.json({...response, page, perPage});
  } catch (err) {
    console.error(`Error while executing /faucetAccountRewards`, err.message);
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

    var directOnly = !req.query.directOnly || req.query.directOnly === "1"

    var fromTimestamp = !isNaN(req.query.fromTimestamp) ? parseFloat(req.query.fromTimestamp) : NOW - (7 * DAY)
    var toTimestamp = !isNaN(req.query.toTimestamp) ? parseFloat(req.query.toTimestamp) : NOW + 10000

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    const response = await dripService.getDownlineActions(fromTimestamp, toTimestamp, address, method, directOnly)
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /getFaucetPlayerDownlineActions`, err.message);
    next(err);
  }
});

router.get('/getFaucetPlayerDownlineDetailActions', async function (req, res, next) {
  try {
    const NOW = new Date().getTime() / 1000

    var address = req.query.address
    var method = ['roll', 'claim', 'deposit', 'airdrop'].find(p=>p === req.query.method)
    var perPage = parseInt(req.query.perPage) || 10
    var page = parseInt(req.query.page) || 1

    var fromTimestamp = !isNaN(req.query.fromTimestamp) ? parseFloat(req.query.fromTimestamp) : NOW - (7 * DAY)
    var toTimestamp = !isNaN(req.query.toTimestamp) ? parseFloat(req.query.toTimestamp) : NOW + 10000

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    const response = await dripService.getDownlineDetailActions(fromTimestamp, toTimestamp, address, method, perPage, (page - 1) * perPage)
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /getFaucetPlayerDownlineActions`, err.message);
    next(err);
  }
});

router.get('/getFaucetPlayerDownlineBehavior', async function (req, res, next) {
  try {
    const NOW = new Date().getTime() / 1000

    var address = req.query.address
    var directOnly = !req.query.directOnly || req.query.directOnly === "1"

    var fromTimestamp = !isNaN(req.query.fromTimestamp) ? parseFloat(req.query.fromTimestamp) : NOW - (7 * DAY)
    var toTimestamp = !isNaN(req.query.toTimestamp) ? parseFloat(req.query.toTimestamp) : NOW + 10000

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    const response = await dripService.getDownlineBehavior(fromTimestamp, toTimestamp, address, directOnly)
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /getFaucetPlayerDownlineBehavior`, err.message);
    next(err);
  }
});

router.get('/getFaucetPlayerIndividualStats', async function (req, res, next) {
  try {
    var address = req.query.address
    
    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    const response = await dripService.getFaucetPlayerIndividualStats(address)
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /getFaucetPlayerIndividualStats`, err.message);
    next(err);
  }
});

router.get('/getFaucetPlayerAdditionalIndividualStats', async function (req, res, next) {
  try {
    var address = req.query.address

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    const response = await dripService.getFaucetPlayerAdditionalIndividualStats(address)
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /getFaucetPlayerIndividualStats`, err.message);
    next(err);
  }
});

const fields = [
  '_id',
  'timestamp',	
  'date',	
  'addr',	
  'addrTo',	
  'block',	
  'action',	
  'bnbFiatValue',	
  'dripFiatValue',
  'dripbnbRatio',	
  'transactionFeeBnb',	
  'transactionFeeFiat',
  'debit_available_drip',	
  'debit_wallet_drip',	
  'credit_wallet_drip',	
  'credit_deposit_drip',	
  'debit_available_fiat',	
  'debit_wallet_fiat',	
  'credit_wallet_fiat',	
  'credit_deposit_fiat',	
];

const parser = new Parser({fields})
router.get('/getFaucetPlayerTax', async function (req, res, next) {
  try {
    var address = req.query.address
    
    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    const response = await dripService.getFaucetPlayerTax(address)
    res.type('text/csv')
    res.send(parser.parse(response))
  } catch (err) {
    console.error(`Error while executing /getFaucetPlayerTax`, err.message);
    next(err);
  }
});

const sources = ['prod', 'beta']
router.post('/postAddAddress', async function (req, res, next) {
  try {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 

    if(req.body.address && req.body.source && sources.find(p=>p===req.body.source)){
      await statsService.addNewFaucetAddress(req.body.address, ip, req.body.source)
    }

    res.json({});
  } catch (err) {
    console.error(`Error while executing /faucetMonthlyNewAccounts`, err.message);
    next(err);
  }
});

const allowedIntervals = ['total_deposits','net_deposits','total_claim', 'total_hydrate', 'max_payouts', 'total_rewards', 'referrals', 'total_structure']
router.get('/getDownlines', async function (req, res, next) {
  try {
    var address = req.query.address

    if(!address || address.trim().length == 0){
      return res.status(500).json({message: 'Must provide faucet account address'})
    }

    var sortBy = req.query.sortBy && req.query.sortBy != 'null'? req.query.sortBy: undefined
    var sortDesc = req.query.sortDesc && req.query.sortDesc == 'true' ? true: false
    var perPage = parseInt(req.query.perPage) || 10
    var page = parseInt(req.query.page) || 1

    var minLevel = parseInt(req.query.minLevel)
    var maxLevel = parseInt(req.query.maxLevel)
    var isSingleDownlineLevel = req.query.isSingleDownlineLevel === 'true'
    
    var teamOnly = req.query.teamOnly == 'true'

    var intervals

    for(let int of allowedIntervals){
      var found = false
      var criteria = {key: int}
      if(req.query[`${int}-min`]){
        criteria.min = parseFloat(req.query[`${int}-min`])
        found = true
      }
      if(req.query[`${int}-max`]){
        criteria.max = parseFloat(req.query[`${int}-max`])
        found = true
      }

      if(found){
        if(!intervals){
          intervals = []
        }
        intervals.push(criteria)
      }
    }

    var criterias = {downline: {min: minLevel, max: maxLevel, isSingleDownlineLevel}, 
                      teamOnly,
                      intervals
                    }
   

    const response = await dripService.getDownlines(address, criterias, sortBy, sortDesc, perPage, (page - 1) * perPage)
    res.json({...response, page, perPage, sortBy, sortDesc});
  } catch (err) {
    console.error(`Error while executing /getDownlines`, err.message);
    next(err);
  }
});

export default router
