import * as dbService from './dbService.js'
import LastXDaysRewardsPerDownlineLevel from '../queries/LastXDaysRewardsPerDownlineLevel.js';
import AllTimeRewardsPerDownlineLevel from '../queries/AllTimeRewardsPerDownlineLevel.js';
import RewardsPerDownlineLevel from '../queries/RewardsPerDownlineLevel.js';
import NewPlayersPerDownlineLevel from '../queries/NewPlayersPerDownlineLevel.js';
import DownlineBehavior from '../queries/DownlineBehavior.js';
import DownlineActions from '../queries/DownlineActions.js';

const TRIAL_LIMIT = 5;
const DAY = (60 * 60 * 24)

const isDonator = async (address, dbo) => {
  // return false

  const website = await dbo.collection(dbService.DRIP_FAUCET_WEBSITE).findOne({_id: 'prod'})

  if(!website.donationRequired){
    return true
  }

  const donator = await dbo.collection(dbService.DRIP_FAUCET_DONATORS).findOne({_id: address.toLowerCase()})
  
  if(!donator){
    return false;
  }
  return donator.donatedBNB >= 0.04 || donator.donatedBUSD >= 15.0;
}

const MONTHLY_NEW_ACCOUNTS = 1;
const DAILY_NEW_ACCOUNTS = 2;
const USER_BEHAVIOR = 3;
const PLAYER_DEPOSITS = 4;
const PLAYER_CLAIM_BY_RANGE = 5;

const MINUTE = 60 * 1000
const INTERVAL_BETWEEN_REFRESH = 30 * MINUTE
var cache = new Map();

export async function getDripFaucetMonthlyNewAccounts() {
  var NOW = new Date().getTime()

  var cached = cache.get(MONTHLY_NEW_ACCOUNTS)

  //Refresh every 6 hours
  if(cached && cached.updated_on + (INTERVAL_BETWEEN_REFRESH * 12) > NOW){
    return cached.values
  }

  try {
    const dbo = await dbService.getConnectionPool()
    
    const values = await dbo.collection(dbService.DRIP_FAUCET_MONTHLY_NEW_ACCOUNTS).find().sort({_id: 1}).toArray()
    cache.set(MONTHLY_NEW_ACCOUNTS, {updated_on: NOW, values})

    return values
  } catch (e) {
    console.error('getDripFaucetMonthlyNewAccounts error: ' + e.message)
    throw e
  } 
}

const SEC_IN_A_MONTH = 60 * 60 * 24 * 30;
export async function getDripFaucetDailyNewAccounts() {
  var NOW = new Date().getTime()

  var cached = cache.get(DAILY_NEW_ACCOUNTS)
  
  //Refresh every 30 minutes
  if(cached && cached.updated_on + INTERVAL_BETWEEN_REFRESH > NOW){
    return cached.values
  }

  try {
    const dbo = await dbService.getConnectionPool()

    const lastEntry = await dbo.collection(dbService.DRIP_FAUCET_DAILY_NEW_ACCOUNTS).findOne({}, { sort: { start_timestamp: -1 }, limit: 1 })

    if(lastEntry){
      const values = await dbo.collection(dbService.DRIP_FAUCET_DAILY_NEW_ACCOUNTS).find({start_timestamp: {$gte: lastEntry.start_timestamp - SEC_IN_A_MONTH}}).toArray()
      cache.set(DAILY_NEW_ACCOUNTS, {updated_on: NOW, values})
      return values
    }

    return []
  } catch (e) {
    console.error('getDripFaucetDailyNewAccounts error: ' + e.message)
    throw e
  }
}


export async function getDripFaucetDailyMethod() {
  var NOW = new Date().getTime()

  var cached = cache.get(USER_BEHAVIOR)

  //Refresh every 30 minutes
  if(cached && cached.updated_on + INTERVAL_BETWEEN_REFRESH > NOW){
    return cached.values
  }

  try {
    const SEC_TO_GO_BACK_TO = 60 * 60 * 24 * 180;
    const dbo = await dbService.getConnectionPool()

    const lastEntry = await dbo.collection(dbService.DRIP_FAUCET_DAILY_METHOD).findOne({}, { sort: { start_timestamp: -1 }, limit: 1 })

    if(lastEntry){
      const values = await dbo.collection(dbService.DRIP_FAUCET_DAILY_METHOD).find({start_timestamp: {$gte: lastEntry.start_timestamp - SEC_TO_GO_BACK_TO}}).sort({start_timestamp: 1}).toArray()
      cache.set(USER_BEHAVIOR, {updated_on: NOW, values})
      return values
    }

    return []
  } catch (e) {
    console.error('getDripFaucetDailyMethod error: ' + e.message)
    throw e
  } 
}

export async function getDripFaucetPlayerDeposit() {
  var NOW = new Date().getTime()

  var cached = cache.get(PLAYER_DEPOSITS)

  //Refresh every 30 minutes
  if(cached && cached.updated_on + INTERVAL_BETWEEN_REFRESH > NOW){
    return cached.values
  }

  try {
    const dbo = await dbService.getConnectionPool()

    const values = await dbo.collection(dbService.DRIP_FAUCET_PLAYER_DEPOSIT).find().sort({index: 1}).toArray()

    cache.set(PLAYER_DEPOSITS, {updated_on: NOW, values})
    return values
  
  } catch (e) {
    console.error('getDripFaucetDailyMethod error: ' + e.message)
    throw e
  } 
}

export async function getDripFaucetPlayerClaimByRange() {
  var NOW = new Date().getTime()

  var cached = cache.get(PLAYER_CLAIM_BY_RANGE)

  //Refresh every 30 minutes
  // if(cached && cached.updated_on + INTERVAL_BETWEEN_REFRESH > NOW){
  //   return cached.values
  // }

  try {
    const dbo = await dbService.getConnectionPool()

    const values = await dbo.collection(dbService.DRIP_PLAYER_CLAIM_BY_RANGE).find().sort({index: 1}).toArray()

    cache.set(PLAYER_CLAIM_BY_RANGE, {updated_on: NOW, values})
    return values
  
  } catch (e) {
    console.error('getDripFaucetDailyMethod error: ' + e.message)
    throw e
  } 
}

export async function getDripAccountDailyRewards(accountAddress) {

  const pipeline = [
    { 
        "$match" : { 
            "$or" : [
                { 
                    "addr" : accountAddress.toLowerCase()
                }, 
                { 
                    "from" : accountAddress.toLowerCase()
                }, 
                { 
                    "to" : accountAddress.toLowerCase()
                }
            ]
        }
    },
    { 
      "$limit" : 1000
    },
    // { 
    //     "$sort" : { 
    //         "block" : 1.0, 
    //         "transactionHash" : 1.0, 
    //         "logIndex" : 1.0
    //     }
    // }, 
    { 
        "$group" : { 
            "_id" : { 
                "block": "$block",
                "transactionHash" : "$transactionHash"
            }, 
            "method" : { 
                "$max" : "$method"
            }, 
            "amount" : { 
                "$max" : "$amount"
            }, 
            "block" : { 
                "$max" : "$block"
            }, 
            "blockTimestamp" : { 
                "$max" : "$blockTimestamp"
            }, 
            "events" : { 
                "$push" : "$$ROOT"
            }
        }
    }, 
    // {
    //   "$project": {
    //     "transactionHash": 1
    //   }
    // },
    // { 
    //     "$sort" : { 
    //         "blockTimestamp" : -1.0
    //     }
    // }
]

  try {
    const dbo = await dbService.getConnectionPool()

    const start = new Date().getTime()
    const values = await dbo.collection(dbService.DRIP_FAUCET_EVENTS).aggregate(pipeline,
    {
      "allowDiskUse": true
    }).toArray()
    console.log('took', new Date().getTime() - start, values.length)
    // console.log(values)
    return values

  } catch (e) {
    console.error('getDripAccountHistory error: ' + e.message)
    throw e
  } 
}

export async function getDripAccountHistory2(query, limit, skip, sortBy, sortByDesc, uplineOnly) {

  try {
    const dbo = await dbService.getConnectionPool()

    const collection = dbo.collection(dbService.DRIP_FAUCET_EVENTS_BY_TX)
    const playerCollection = dbo.collection(dbService.DRIP_FAUCET_PLAYERS)
    const address = query.addr || query.addrTo

    const isAddressDonator = await isDonator(address, dbo);
    
    if(isAddressDonator && uplineOnly){
      const player = await playerCollection.findOne({_id: address.toLowerCase()})

      if(player && player.direct_upline){
        query.addr = player.direct_upline.toLowerCase()
      }
    }

    if(!isAddressDonator){
      delete query.blockTimestamp
      delete query.method
    }

    var count = await collection.countDocuments(query)

    var pipeline = []

    var sort = {}
    sort[sortBy] = parseInt(sortByDesc) * -1

    pipeline.push({ $match: query })

    pipeline.push({ $sort: sort })

    if(isAddressDonator){
      pipeline.push({ $skip: skip })
      pipeline.push({ $limit: limit })
    }else{
      pipeline.push({ $limit: TRIAL_LIMIT })
    }

    const results = await dbo.collection(dbService.DRIP_FAUCET_EVENTS_BY_TX).aggregate(pipeline,
    {
      "allowDiskUse": true
    }).toArray()

    // console.log(results)

    return { total: count, results, isDonator: isAddressDonator }
  } catch (e) {
    console.error('getDripAccountHistory error: ' + e.message)
    throw e
  } 
}

export async function getDripAccountAirdrops(query, limit, skip, sortBy, sortByDesc) {
  try {
    const dbo = await dbService.getConnectionPool()

    const collection = dbo.collection(dbService.DRIP_FAUCET_EVENTS_BY_TX)

    var count = await collection.find(query).count()

    var pipeline = []

    var sort = {}
    sort[sortBy] = parseInt(sortByDesc) * -1

    pipeline.push({ $match: query })

    pipeline.push({ $sort: sort })
    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: limit })

    const results = await collection.aggregate(pipeline,
    {
      "allowDiskUse": true
    }).toArray()

    // console.log(results)

    return { total: count, results }
  } catch (e) {
    console.error('getDripAccountHistory error: ' + e.message)
    throw e
  } 
}

export async function getDripFaucetEvents(address, query, limit, skip, checkDonator) {
  try {
    const dbo = await dbService.getConnectionPool()
    const isAddressDonator = !checkDonator || await isDonator(query.addr, dbo);
    
    let hasMore = false
    let results = []
    const isMainDevWallet = address.toLowerCase() === '0xe8e9720e39e13854657c165cf4eb10b2dfe33570'
    if(isAddressDonator && !isMainDevWallet){
      const collection = dbo.collection(dbService.DRIP_FAUCET_EVENTS)
      var count = await collection.countDocuments(query)
      var sort = {blockTimestamp: -1}
      
      var pipeline = []
      pipeline.push({ $match: query })
      pipeline.push({ $sort: sort })
      pipeline.push({ $skip: skip })
      pipeline.push({ $limit: limit })
      
      results = await collection.aggregate(pipeline,
      {
        "allowDiskUse": true
      }).toArray()
    }

    return { total: count, results, hasMore, isDonator:isAddressDonator}
  } catch (e) {
    console.error('getDripFaucetEvents error: ' + e.message)
    throw e
  } 
}

export async function getDailyRewardsPerDownlineLevels(address) {
  try {
    const dbo = await dbService.getConnectionPool()

    const isAddressDonator = await isDonator(address, dbo);

    const isMainDevWallet = address.toLowerCase() === '0xe8e9720e39e13854657c165cf4eb10b2dfe33570'
    let results = []
    if(!isAddressDonator && !isMainDevWallet){
      var timestamp = (Date.now() / 1000) - (isAddressDonator? 7 * DAY: 1 * DAY)
      //Get the beginning of the day.
      timestamp = timestamp - ( timestamp % 86400)    
      
      var pipeline = LastXDaysRewardsPerDownlineLevel(address, timestamp)
      
      results = await dbo.collection(dbService.DRIP_FAUCET_EVENTS).aggregate(pipeline,
        {
          "allowDiskUse": true
        }).toArray()
    }

    return { results, isDonator:isAddressDonator}
  } catch (e) {
    console.error('getRewardsPerDownlineLevels error: ' + e.message)
    throw e
  } 
}

export async function getAllTimeRewardsPerDownlineLevels(address) {
  try {
    const dbo = await dbService.getConnectionPool()

    const isAddressDonator = await isDonator(address, dbo);
    const isMainDevWallet = address.toLowerCase() === '0xe8e9720e39e13854657c165cf4eb10b2dfe33570'
    let results = []
    if(isAddressDonator && !isMainDevWallet){
      var pipeline = AllTimeRewardsPerDownlineLevel(address)
  
      results = await dbo.collection(dbService.DRIP_FAUCET_EVENTS).aggregate(pipeline,
      {
        "allowDiskUse": true
      }).toArray()
    }

    return { results, isDonator:isAddressDonator}
  } catch (e) {
    console.error('getRewardsPerDownlineLevels error: ' + e.message)
    throw e
  } 
}

const rewardsPerDownlineCache = new Map()
export async function getRewardsPerDownlineLevel(address) {

  const cached = rewardsPerDownlineCache.get(address)
  const NOW = new Date().getTime()
  if(cached && cached.timestamp > (NOW - (1 * MINUTE))){
    return cached.value
  }

  try {
    const dbo = await dbService.getConnectionPool()
    const isAddressDonator = await isDonator(address, dbo);
    const isMainDevWallet = address.toLowerCase() === '0xe8e9720e39e13854657c165cf4eb10b2dfe33570'
    var results = []
    if(isAddressDonator && !isMainDevWallet){
      const NOW = Date.now()

      //REWARDS
      var values24h = await dbo.collection(dbService.DRIP_FAUCET_EVENTS).aggregate(RewardsPerDownlineLevel(address, (NOW / 1000) -  DAY),
      {
        "allowDiskUse": true
      }).toArray()

      var values7d = await dbo.collection(dbService.DRIP_FAUCET_EVENTS).aggregate(RewardsPerDownlineLevel(address, (NOW / 1000) -  (7 * DAY)),
      {
        "allowDiskUse": true
      }).toArray()

      var value24h = values24h.find(p => p._id === 1)
      var value7d = values7d.find(p => p._id === 1)

      results.push({name:'direct-rewards', '24h': value24h?value24h.sum_amount:0, '7davg': value7d?value7d.sum_amount/7.0:0})

      value24h = values24h.reduce((accumulator, object) => {
        return accumulator + object.sum_amount;
      }, 0);

      value7d = values7d.reduce((accumulator, object) => {
        return accumulator + object.sum_amount;
      }, 0);
      
      results.push({name:'all-rewards', '24h': value24h?value24h:0, '7davg': value7d/7.0})

      //NEW PLAYERS
      values24h = await dbo.collection(dbService.DRIP_FAUCET_PLAYER_HIERARCHY).aggregate(NewPlayersPerDownlineLevel(address, (NOW / 1000) -  DAY),
      {
        "allowDiskUse": true
      }).toArray()
      
      values7d = await dbo.collection(dbService.DRIP_FAUCET_PLAYER_HIERARCHY).aggregate(NewPlayersPerDownlineLevel(address, (NOW / 1000) -  (7 * DAY)),
      {
        "allowDiskUse": true
      }).toArray()

      value24h = values24h.find(p => p._id === 1)
      value7d = values7d.find(p => p._id === 1)

      results.push({name:'direct-newplayers', '24h': value24h?value24h.count:0, '7davg': value7d?value7d.count/7.0:0})

      value24h = values24h.reduce((accumulator, object) => {
        return accumulator + object.count;
      }, 0);

      value7d = values7d.reduce((accumulator, object) => {
        return accumulator + object.count;
      }, 0);
      
      results.push({name:'all-newplayers', '24h': value24h?value24h:0, '7davg': value7d/7.0})
    } 

    const toReturn = { results, isDonator:isAddressDonator}

    rewardsPerDownlineCache.set(address,  { timestamp: NOW, value: toReturn})

    return toReturn
  } catch (e) {
    console.error('getRewardsPerDownlineLevels error: ' + e.message)
    throw e
  } 
}


export async function getDownlineActions(from, to, upline, method, directOnly) {
  try {
    const dbo = await dbService.getConnectionPool()

    const isAddressDonator = await isDonator(upline, dbo);
    const isMainDevWallet = upline.toLowerCase() === '0xe8e9720e39e13854657c165cf4eb10b2dfe33570'
    let results = []
    if(isAddressDonator && !isMainDevWallet){
      var pipeline = DownlineActions(from, to, upline, method, directOnly)
      results = await dbo.collection(dbService.DRIP_FAUCET_EVENTS_BY_TX).aggregate(pipeline,
      {
        "allowDiskUse": true
      }).toArray()
    }

    return { results, isDonator:isAddressDonator}
  } catch (e) {
    console.error('getDownlineActions error: ' + e.message)
    throw e
  } 
}

export async function getDownlineDetailActions(from, to, upline, method, limit, skip) {
  try {
    const dbo = await dbService.getConnectionPool()

    const isAddressDonator = await isDonator(upline, dbo);
    const isMainDevWallet = upline.toLowerCase() === '0xe8e9720e39e13854657c165cf4eb10b2dfe33570'
    let results = []
    let total = 0
    if(isAddressDonator && !isMainDevWallet){
      const query = {upline: upline, blockTimestamp: {$gte: from, $lte: to}}

      if(method){
        query.method = method
      }
      
      total = await dbo.collection(dbService.DRIP_FAUCET_EVENTS_BY_TX).count(query)
      
      var pipeline = []
      
      var sort = {blockTimestamp: -1}
      const project = {
        addr: 1,
        method: 1,
        blockTimestamp: 1,
        amount: 1,
        transactionHash: 1
      }

      pipeline.push({ $match: query })
      pipeline.push({ $sort: sort })
      pipeline.push({ $project: project})
      pipeline.push({ $skip: skip })
      pipeline.push({ $limit: limit })
      results = await dbo.collection(dbService.DRIP_FAUCET_EVENTS_BY_TX).aggregate(pipeline,
        {
          "allowDiskUse": true
        }).toArray()
        
    }
    return {total,  results, isDonator:isAddressDonator}
  } catch (e) {
    console.error('getDownlineDetailActions error: ' + e.message)
    throw e
  } 
}

export async function getDownlineBehavior(from, to, upline, directOnly) {
  try {
    const dbo = await dbService.getConnectionPool()

    const isAddressDonator = await isDonator(upline, dbo);
    const isMainDevWallet = upline.toLowerCase() === '0xe8e9720e39e13854657c165cf4eb10b2dfe33570'
    let results = []
    if(isAddressDonator && !isMainDevWallet){
      const pipeline = DownlineBehavior(from, to, upline, directOnly)

      results = await dbo.collection(dbService.DRIP_FAUCET_EVENTS_BY_TX).aggregate(pipeline,
        {
          "allowDiskUse": true
        }).toArray()
        
    }
    return {results, isDonator:isAddressDonator}
  } catch (e) {
    console.error('getDownlineDetailActions error: ' + e.message)
    throw e
  } 
}