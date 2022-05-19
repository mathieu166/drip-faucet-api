export default (from, to, upline, directOnly) => {
    var pipeline = [
        {
            "$match": {
                "blockTimestamp": {
                    "$gte": from,
                    "$lte": to
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
                                        1000.0,
                                        "$blockTimestamp"
                                    ]
                                }
                            }
                        }
                    },
                    "method": "$method"
                },
                "timestamp": {
                    $max: "$blockTimestamp"
                },
                "count": {
                    "$sum": 1
                },
                "sum_amount": {
                    "$sum": "$amount"
                }
            }
        }, 
        {
            "$sort": {
                "timestamp": 1
            }
        }
    ];

    if(directOnly){
        pipeline[0]["$match"]["upline"] = upline
    }else{
        pipeline[0]["$match"]["uplines.upline"] = upline
    }

    return pipeline
}