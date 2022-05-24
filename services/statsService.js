import * as dbService from './dbService.js'
import Web3 from 'web3'

const addressesCache = new Map()
const options = { upsert: true };
export async function addNewFaucetAddress(address, ipaddress, source) {
  try {
    const NOW = new Date().getTime() / 1000
    const cached = addressesCache.get(address.toLowerCase() + source)

    if (!cached && Web3.utils.isAddress(address)) {
      const dbo = await dbService.getConnectionPool()
      const statsCollection = dbo.collection(dbService.DRIP_FAUCET_STATS_ADDRESSES)
      const playersCollection = dbo.collection(dbService.DRIP_FAUCET_PLAYERS)
  
      const player = await playersCollection.findOne({_id: address.toLowerCase()})
      const stats = await statsCollection.findOne({_id: address.toLowerCase()})
      let toUpdate = {}

      if(!stats){
        toUpdate.timestamp = NOW
        toUpdate.source = source
        toUpdate.address = address.toLowerCase()
        toUpdate.ipaddress = ipaddress
        
        if(player){
          toUpdate = { ...toUpdate, ...player}
        }
        toUpdate['_id'] = address.toLowerCase() + source
        await statsCollection.updateOne({_id: address.toLowerCase() + source}, {$set: toUpdate}, options);
      }
      addressesCache.set(address.toLowerCase() + source, '')
    }

  } catch (e) {
    console.error('addNewFaucetAddress error: ' + e.message)
    throw e
  } 
}
