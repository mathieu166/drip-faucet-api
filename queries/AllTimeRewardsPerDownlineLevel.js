export default (address) =>{
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
                ]
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
                "_id": "$downline_level",
                "sum_amount": {
                    "$sum": "$amount"
                }
            }
        }, 
        {
            "$sort": {
                "_id": -1.0
            }
        }
    ];
}