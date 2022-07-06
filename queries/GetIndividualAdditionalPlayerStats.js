const DAY = 86400
export default (address, timestamp) => {
    var pipeline = [
        {
            "$match" : {
                "upline" : address,
                "blockTimestamp" : {
                    "$gte" : timestamp - (28 * DAY)
                }
            }
        }, 
        {
            "$facet" : {
                "sevenDayNewDownlines" : [
                    {
                        "$match" : {
                            "events.event" : "Upline",
                            "blockTimestamp" : {
                                "$gte" : timestamp - (7 * DAY)
                            }
                        }
                    },
                    {
                        "$group" : {
                            "_id" : "$upline",
                            "value" : {
                                "$sum" : 1.0
                            },
                            "amount" : {
                                "$sum" : "$amount"
                            }
                        }
                    }
                ],
                "fourteenDayNewDownlines" : [
                    {
                        "$match" : {
                            "events.event" : "Upline",
                            "blockTimestamp" : {
                                "$gte" : timestamp - (14 * DAY)
                            }
                        }
                    },
                    {
                        "$group" : {
                            "_id" : "$upline",
                            "value" : {
                                "$sum" : 1.0
                            },
                            "amount" : {
                                "$sum" : "$amount"
                            }
                        }
                    }
                ],
                "twentyEightDayNewDownlines" : [
                    {
                        "$match" : {
                            "events.event" : "Upline",
                            "blockTimestamp" : {
                                "$gte" : timestamp - (28 * DAY)
                            }
                        }
                    },
                    {
                        "$group" : {
                            "_id" : "$upline",
                            "value" : {
                                "$sum" : 1.0
                            },
                            "amount" : {
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