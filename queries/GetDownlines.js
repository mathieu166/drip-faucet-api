export default (upline, filters, sorts) => {
    var pipeline = [
        {
            "$match" : {
                "uplines" : {
                    "$elemMatch" : {
                        "upline" : upline.toLowerCase()
                    }
                }
            }
        }, 
        {
            "$project" : {
                "direct_upline" : 1.0,
                "last_airdrop" : 1.0,
                "max_payouts" : 1.0,
                "net_deposits" : 1.0,
                "referrals" : 1.0,
                "total_structure" : 1.0,
                "total_claim" : 1.0,
                "total_deposits" : 1.0,
                "total_hydrate" : 1.0,
                "total_rewards" : 1.0,
                "nextUplineRewarded" : 1.0,
                "join_timestamp": 1.0,
                "isNextRewarded" : {
                    "$eq" : [
                        upline.toLowerCase(),
                        "$nextUplineRewarded"
                    ]
                },
                "ref_claim_pos" : 1.0,
                "downlineLevel" : {
                    "$let" : {
                        "vars" : {
                            "uplineElem" : {
                                "$arrayElemAt" : [
                                    {
                                        "$filter" : {
                                            "input" : "$uplines",
                                            "as" : "upline",
                                            "cond" : {
                                                "$eq" : [
                                                    "$$upline.upline",
                                                    upline.toLowerCase()
                                                ]
                                            }
                                        }
                                    },
                                    0.0
                                ]
                            }
                        },
                        "in" : "$$uplineElem.level"
                    }
                },
                "name" : 1.0
            }
        },
        {
            "$match" : {}
        }, 
        {
            "$sort" : {
                "total_deposits" : -1.0
            }
        }, 
    ]

    if(filters){
        for(let filter of filters){
            if(!filter.type || filter.type === 'eq'){
                pipeline[2]["$match"][filter.key] = {$eq: filter.value}
            }else if(filter.type === 'range'){
                pipeline[2]["$match"][filter.key] = {$gte: filter.min, $lte: filter.max}
            }else if(filter.type === 'gte'){
                pipeline[2]["$match"][filter.key] = {$gte: filter.value}
            }else if(filter.type === 'lte'){
                pipeline[2]["$match"][filter.key] = {$lte: filter.value}
            }else if(filter.type === 'gt'){
                pipeline[2]["$match"][filter.key] = {$gt: filter.value}
            }else if(filter.type === 'lt'){
                pipeline[2]["$match"][filter.key] = {$lt: filter.value}
            }
        }
    }
    // if(level){
    //     pipeline[0]["$match"]["uplines"]["$elemMatch"].level = level
    // }
    
    if(sorts){
        //Delete default sort
        delete pipeline[3]["$sort"].total_deposits

        for(let sort of sorts){
            pipeline[3]["$sort"][sort.key] = sort.value 
        }
    }

    // if(showOnlyNextRewarded){
    //     pipeline[0]["$match"].nextUplineRewarded = upline.toLowerCase()
    // }
    
    return pipeline
}