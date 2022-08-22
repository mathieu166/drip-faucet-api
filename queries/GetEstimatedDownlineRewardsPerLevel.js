export default (address) =>{
    return [
        {
            "$match" : {
                "uplines" : {
                    "$elemMatch" : {
                        "upline" : address.toLowerCase(),
                    }
                }
            }
        }, 
        {
            "$addFields" : {
                "rr_count" : {
                    "$ifNull" : [
                        "$rr_count",
                        {
                            "$divide" : [
                                {
                                    "$size" : "$uplines"
                                },
                                2.0
                            ]
                        }
                    ]
                },
                "daily_estimated_upline_reward" : {
                    "$divide" : [
                        {
                            "$multiply" : [
                                "$total_deposits",
                                0.00035625
                            ]
                        },
                        {
                            "$ifNull" : [
                                "$rr_count",
                                {
                                    "$divide" : [
                                        {
                                            "$size" : "$uplines"
                                        },
                                        2.0
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        }, 
        {
            "$project" : {
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
                                                    address.toLowerCase()
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
                "estimated_daily_reward" : {
                    "$switch" : {
                        "branches" : [
                            {
                                "case" : {
                                    "$gte" : [
                                        "$total_claim",
                                        100000.0
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$daily_estimated_upline_reward",
                                        0.5
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$gte" : [
                                        "$total_claim",
                                        90000.0
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$daily_estimated_upline_reward",
                                        0.45
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$gte" : [
                                        "$total_claim",
                                        80000.0
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$daily_estimated_upline_reward",
                                        0.4
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$gte" : [
                                        "$total_claim",
                                        70000.0
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$daily_estimated_upline_reward",
                                        0.35
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$gte" : [
                                        "$total_claim",
                                        60000.0
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$daily_estimated_upline_reward",
                                        0.3
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$gte" : [
                                        "$total_claim",
                                        50000.0
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$daily_estimated_upline_reward",
                                        0.25
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$gte" : [
                                        "$total_claim",
                                        40000.0
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$daily_estimated_upline_reward",
                                        0.2
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$gte" : [
                                        "$total_claim",
                                        30000.0
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$daily_estimated_upline_reward",
                                        0.15
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$gte" : [
                                        "$total_claim",
                                        20000.0
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$daily_estimated_upline_reward",
                                        0.1
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$gte" : [
                                        "$total_claim",
                                        10000.0
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$daily_estimated_upline_reward",
                                        0.05
                                    ]
                                }
                            }
                        ],
                        "default" : "$daily_estimated_upline_reward"
                    }
                },
                "total_deposits" : 1.0
            }
        }, 
        {
            "$group" : {
                "_id" : "$downlineLevel",
                "sum_total_deposits" : {
                    "$sum" : "$total_deposits"
                },
                "sum_estimated_daily_reward" : {
                    "$sum" : "$estimated_daily_reward"
                }
            }
        }, 
        {
            "$sort" : {
                "_id" : 1.0
            }
        }
    ];
}