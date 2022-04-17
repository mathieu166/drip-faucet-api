import * as dbService from './dbService.js'

const TRIAL_LIMIT = 5;

const isDonator = async (address, dbo) => {
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

const INTERVAL_BETWEEN_REFRESH = 30 * 60 * 1000
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

export async function getDripAccountHistory2(query, limit, skip, sortBy, sortByDesc) {

  try {
    const dbo = await dbService.getConnectionPool()

    const collection = dbo.collection(dbService.DRIP_FAUCET_EVENTS_BY_TX)
    const address = query.addr || query.addrTo

    const isAddressDonator = await isDonator(address, dbo);

    var start = new Date().getTime()
    var count = await collection.countDocuments(query)
    console.log('Count took ', new Date().getTime() - start, 'ms')

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

    const results = await dbo.collection(dbService.DRIP_FAUCET_EVENTS_BY_TX).aggregate(pipeline,
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


const countDocuments = async function(addr, timestamp, collection){

  var pipeline = [
      {
        "$match": {
          "addr": addr,
          "$or": [
              {
                  "event": "MatchPayout"
              },
              {
                  "event": "DirectPayout"
              }
          ],
          "blockTimestamp": {
              "$lt": timestamp
          }
      }
      }, 
      {
          "$group": {
              "_id": {},
              "COUNT(addr)": {
                  "$sum": 1
              }
          }
      }, 
      {
          "$project": {
              "count": "$COUNT(addr)",
              "_id": 0
          }
      }
  ];

  const results = await collection.aggregate(pipeline,
    {
      "allowDiskUse": true
    }).toArray()
  
  return results[0].count
}

const count_cache = new Map()
export async function getDripFaucetEvents(key, timestamp, query, limit, skip, sortBy, sortByDesc, maxResults, checkDonator) {
  try {
    const dbo = await dbService.getConnectionPool()

    const isAddressDonator = !checkDonator || await isDonator(query.addr, dbo);

    const collection = dbo.collection(dbService.DRIP_FAUCET_EVENTS)

    var start = new Date().getTime()

    console.log('Count took ', new Date().getTime() - start, 'ms')

    var pipeline = []

    if(!isAddressDonator){
      delete query.blockTimestamp
    }

    var sort = {}
    sort[sortBy] = parseInt(sortByDesc) * -1

    pipeline.push({ $match: query })
    pipeline.push({ $sort: sort })

    pipeline.push({ $limit: isAddressDonator?1001:TRIAL_LIMIT })

    start = new Date().getTime()
    const results = await dbo.collection(dbService.DRIP_FAUCET_EVENTS).aggregate(pipeline,
    {
      "allowDiskUse": true
    }).toArray()

    const hasMore = results.length > 1000

    console.log('Search took ', new Date().getTime() - start, 'ms')
    return { total: hasMore? 1000: results.length, results: isAddressDonator?results.slice(skip, skip + limit): results, hasMore, isDonator:isAddressDonator}
  } catch (e) {
    console.error('getDripAccountHistory error: ' + e.message)
    throw e
  } 
}