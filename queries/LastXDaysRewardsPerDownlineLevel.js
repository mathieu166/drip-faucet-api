export default (address, timestamp) =>{
    return [
        {
            "$match": {
                "addr": address.toLowerCase(),
                "$or": [
                    {
                        "event": "MatchPayout"
                    },
                    {
                        "event": "DirectPayout"
                    }
                ],
                "blockTimestamp": {
                    "$gte": timestamp
                }
            }
        }, 
        {
            "$lookup": {
                "from": "DripFaucetPlayerHierarchy",
                "let": {
                    "upline": "$addr",
                    "downline": "$from"
                },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {
                                        "$eq": [
                                            "$upline",
                                            "$$upline"
                                        ]
                                    },
                                    {
                                        "$eq": [
                                            "$address",
                                            "$$downline"
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        "$project": {
                            "level": 1
                        }
                    }
                ],
                "as": "downline"
            }
        }, 
        {
            "$match": {
                "downline": {
                    "$ne": []
                }
            }
        }, 
        {
            "$set": {
                "downline_level": {
                    "$first": "$downline.level"
                }
            }
        }, 
        {
            "$group": {
                "_id": {
                    "date": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": {
                                "$toDate": {
                                    "$multiply": [
                                        1000,
                                        "$blockTimestamp"
                                    ]
                                }
                            }
                        }
                    },
                    "level": "$downline_level"
                },
                "min_timestamp": {
                    "$min": "$blockTimestamp"
                },
                "sum_amount": {
                    "$sum": "$amount"
                }
            }
        }, 
        {
            "$sort": {
                "_id.date": -1,
                "_id.level": 1.
            }
        }
    ];
}