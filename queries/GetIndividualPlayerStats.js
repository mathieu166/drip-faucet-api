const DAY = 86400
export default (address, timestamp) => {
    var pipeline = [
        {
            "$match": {
                "addr": address.toLowerCase()
            }
        },
        {
            "$facet": {
                "actualDeposit": [
                    {
                        "$match": {
                            "method": "deposit"
                        }
                    },
                    {
                        "$group": {
                            "_id": "$addr",
                            "count": {
                                "$sum": 1.0
                            },
                            "value": {
                                "$sum": "$amount"
                            }
                        }
                    }
                ],
                "firstDepositDate": [
                    { "$match": { "method": "deposit" } },
                    {
                        "$group": {
                            _id: "$addr",
                            "value": { "$first": "$blockTimestamp" }
                        }
                    }
                ],
                "actualClaim": [
                    {
                        "$match": {
                            "method": "claim"
                        }
                    },
                    {
                        "$group": {
                            "_id": "$addr",
                            "count": {
                                "$sum": 1.0
                            },
                            "value": {
                                "$sum": "$amount"
                            }
                        }
                    }
                ],
                "actualAirdropToDownline": [
                    {
                        "$match": {
                            "method": "airdrop",
                            "toDownline": true
                        }
                    },
                    {
                        "$group": {
                            "_id": "$addr",
                            "count": {
                                "$sum": 1.0
                            },
                            "value": {
                                "$sum": "$amount"
                            }
                        }
                    }
                ],
                "sevenDayActualAirdropToDownline": [
                    { "$match": { "method": "airdrop", "blockTimestamp": { $gte: timestamp - (7 * DAY) }, "toDownline": true } },
                    {
                        "$group": {
                            _id: "$addr",
                            "count": { "$sum": 1 },
                            "value": { "$sum": "$amount" }
                        }
                    }
                ],
                "fourteenDayActualAirdropToDownline": [
                    { "$match": { "method": "airdrop", "blockTimestamp": { $gte: timestamp - (14 * DAY) }, "toDownline": true } },
                    {
                        "$group": {
                            _id: "$addr",
                            "count": { "$sum": 1 },
                            "value": { "$sum": "$amount" }
                        }
                    }
                ],
                "twentyEightActualAirdropToDownline": [
                    { "$match": { "method": "airdrop", "blockTimestamp": { $gte: timestamp - (28 * DAY) }, "toDownline": true } },
                    {
                        "$group": {
                            _id: "$addr",
                            "count": { "$sum": 1 },
                            "value": { "$sum": "$amount" }
                        }
                    }
                ],
                "actualAirdrop": [
                    {
                        "$match": {
                            "method": "airdrop"
                        }
                    },
                    {
                        "$group": {
                            "_id": "$addr",
                            "count": {
                                "$sum": 1.0
                            },
                            "value": {
                                "$sum": "$amount"
                            }
                        }
                    }
                ]
            }
        }
    ]

    return pipeline
}