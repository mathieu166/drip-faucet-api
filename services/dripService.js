import * as dbService from './dbService.js'

export async function getDripFaucetMonthlyNewAccounts() {
  var client
  try {
    client = await dbService.client()
    await client.connect()
    var dbo = client.db(process.env.DB_NAME)
    
    return await dbo.collection(dbService.DRIP_FAUCET_MONTHLY_NEW_ACCOUNTS).find().sort({_id: 1}).toArray()
      
  } catch (e) {
    console.error('getDripFaucetMonthlyNewAccounts error: ' + e.message)
    throw e
  } finally {

    if(client){
      client.close()
    } 
  }
}

const SEC_IN_A_MONTH = 60 * 60 * 24 * 30;
export async function getDripFaucetDailyNewAccounts() {
  var client
  try {
    client = await dbService.client()
    await client.connect()
    var dbo = client.db(process.env.DB_NAME)

    const lastEntry = await dbo.collection(dbService.DRIP_FAUCET_DAILY_NEW_ACCOUNTS).findOne({}, { sort: { start_timestamp: -1 }, limit: 1 })

    if(lastEntry){
      return await dbo.collection(dbService.DRIP_FAUCET_DAILY_NEW_ACCOUNTS).find({start_timestamp: {$gte: lastEntry.start_timestamp - SEC_IN_A_MONTH}}).toArray()
    }

    return []
  } catch (e) {
    console.error('getDripFaucetDailyNewAccounts error: ' + e.message)
    throw e
  } finally {

    if(client){
      client.close()
    } 
  }
}

export async function getDripFaucetDailyMethod() {
  var client
  try {
    const SEC_TO_GO_BACK_TO = 60 * 60 * 24 * 90;
    client = await dbService.client()
    await client.connect()
    var dbo = client.db(process.env.DB_NAME)

    const lastEntry = await dbo.collection(dbService.DRIP_FAUCET_DAILY_METHOD).findOne({}, { sort: { start_timestamp: -1 }, limit: 1 })

    if(lastEntry){
      return await dbo.collection(dbService.DRIP_FAUCET_DAILY_METHOD).find({start_timestamp: {$gte: lastEntry.start_timestamp - SEC_TO_GO_BACK_TO}}).sort({start_timestamp: 1}).toArray()
    }

    return []
  } catch (e) {
    console.error('getDripFaucetDailyNewAccounts error: ' + e.message)
    throw e
  } finally {

    if(client){
      client.close()
    } 
  }
}