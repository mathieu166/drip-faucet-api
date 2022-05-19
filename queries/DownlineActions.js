export default (from, to, upline, method, directOnly) => {
    var pipeline = [
        {
            "$match": {
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

    if(directOnly){
        pipeline[0]["$match"]["upline"] = upline
    }else{
        pipeline[0]["$match"]["uplines.upline"] = upline
    }
    
    return pipeline
}