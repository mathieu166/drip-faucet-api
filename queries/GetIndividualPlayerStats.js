export default (address) => {
    var pipeline = [
        { 
            "$match" : { 
                "addr" : address.toLowerCase()
            }
        }, 
        { 
            "$facet" : { 
                "actualDeposit" : [
                    { 
                        "$match" : { 
                            "method" : "deposit"
                        }
                    }, 
                    { 
                        "$group" : { 
                            "_id" : "$addr", 
                            "count" : { 
                                "$sum" : 1.0
                            }, 
                            "value" : { 
                                "$sum" : "$amount"
                            }
                        }
                    }
                ], 
                "firstDepositDate": [
                    {"$match": {"method": "deposit"}},
                    {
                       "$group": {
                            _id: "$addr",
                            "value": {"$first":"$blockTimestamp"}
                       }
                    }
               ],
                "actualClaim" : [
                    { 
                        "$match" : { 
                            "method" : "claim"
                        }
                    }, 
                    { 
                        "$group" : { 
                            "_id" : "$addr", 
                            "count" : { 
                                "$sum" : 1.0
                            }, 
                            "value" : { 
                                "$sum" : "$amount"
                            }
                        }
                    }
                ], 
                "actualAirdropToDownline" : [
                    { 
                        "$match" : { 
                            "method" : "airdrop", 
                            "toDownline" : true
                        }
                    }, 
                    { 
                        "$group" : { 
                            "_id" : "$addr", 
                            "count" : { 
                                "$sum" : 1.0
                            }, 
                            "value" : { 
                                "$sum" : "$amount"
                            }
                        }
                    }
                ], 
                "actualAirdrop" : [
                    { 
                        "$match" : { 
                            "method" : "airdrop"
                        }
                    }, 
                    { 
                        "$group" : { 
                            "_id" : "$addr", 
                            "count" : { 
                                "$sum" : 1.0
                            }, 
                            "value" : { 
                                "$sum" : "$amount"
                            }
                        }
                    }
                ]
            }
        }
    ]
    
    return pipeline
}