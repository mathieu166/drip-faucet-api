export default (address, timestamp) =>{
    return [
        {
            "$match": {
                "upline": address,
                "timestamp": {
                    "$gte": timestamp
                }
            }
        }, 
        {
            "$group": {
                "_id": "$level",
                "count": {
                    "$sum": 1.0
                }
            }
        }, 
        {
            "$sort": {
                "_id": 1.0
            }
        }
    ];
}