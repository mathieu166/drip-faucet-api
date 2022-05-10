export default (from, to, upline, method) => {
    var pipeline = [
        {
            "$match": {
                "upline": upline,
                "method": method,
                "blockTimestamp": {
                    "$gte": from,
                    "$lte": to
                }
            }
        }, 
        {
            "$group": {
                "_id": "$addr",
                "count": {
                    "$sum": 1.0
                },
                "sum_amount": {
                    "$sum": "$amount"
                }
            }
        }, 
        {
            "$sort": {
                "sum_amount": -1.0
            }
        }
    ]

    return pipeline
}