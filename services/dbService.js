import Mongo from 'mongodb'
export const DRIP_FAUCET_EVENTS = 'DripFaucetEvents'
export const DRIP_FAUCET_EVENTS_BY_TX = 'DripFaucetEventsByTx'
export const DRIP_FAUCET_MONTHLY_NEW_ACCOUNTS = 'DripFaucetMonthlyNewAccounts'
export const DRIP_FAUCET_DAILY_NEW_ACCOUNTS = 'DripFaucetDailyNewAccounts'
export const DRIP_FAUCET_DAILY_METHOD = 'DripFaucetDailyMethod'
export const DRIP_FAUCET_PLAYER_DEPOSIT = 'DripFaucetPlayerDeposit'
export const DRIP_FAUCET_DONATORS = 'DripFaucetDonators'
export const DRIP_PLAYER_CLAIM_BY_RANGE = 'DripPlayerClaimByRange'
export const DRIP_FAUCET_WEBSITE = 'DripFaucetWebsite'
export const DRIP_FAUCET_PLAYER_HIERARCHY = 'DripFaucetPlayerHierarchy'

var connectionPool;

export async function getConnectionPool() {
  if(connectionPool){
    return connectionPool
  }
  var replacements = { "%DB_USER%": process.env.DB_USER, "%DB_PASSWORD%": process.env.DB_PASSWORD, "%DB_HOST%": process.env.DB_HOST, "%DB_NAME%": process.env.DB_NAME, "%CERT%": process.env.CERT }
  var uri = 'mongodb+srv://%DB_USER%:%DB_PASSWORD%@%DB_HOST%/%DB_NAME%?maxPoolSize=200&authSource=admin&replicaSet=db-mongodb-nyc3-87401&tls=true&tlsCAFile=%CERT%' 
  uri = uri.replace(/%\w+%/g, function (all) {
    return replacements[all] || all;
  });

  const client = new Mongo.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  connectionPool = (await client.connect()).db(process.env.DB_NAME)
  return connectionPool
}