export default (currentReferrerId) =>{
    return [
        {
            "$sort" : {
                "timestamp" : -1.0
            }
        }, 
        {
            "$lookup" : {
                "from" : "DripFaucetReferrers",
                "localField" : "referrer_id",
                "foreignField" : "_id",
                "as" : "direct_referrers"
            }
        }, 
        {
            "$addFields" : {
                "direct_referrer" : {
                    "$first" : "$direct_referrers"
                }
            }
        }, 
        {
            "$lookup" : {
                "from" : "DripFaucetReferrers",
                "localField" : "direct_referrer.upline_id",
                "foreignField" : "_id",
                "as" : "top_referrers"
            }
        }, 
        {
            "$addFields" : {
                "top_referrer" : {
                    "$first" : "$top_referrers"
                },
                "isDirect" : {
                    "$cond" : [
                        {
                            "$eq" : [
                                "$direct_referrer._id",
                                currentReferrerId
                            ]
                        },
                        true,
                        false
                    ]
                }
            }
        }, 
        {
            "$match" : {
                "$or" : [
                    {
                        "direct_referrer._id" : currentReferrerId
                    },
                    {
                        "top_referrer._id" : currentReferrerId
                    }
                ],
                "is_excluded" : {
                    "$ne" : true
                }
            }
        }, 
        {
            "$addFields" : {
                "isRewardPaid" : {
                    "$cond" : [
                        "$isDirect",
                        "$direct_reward_paid",
                        "$top_reward_paid"
                    ]
                },
                "reward_paid_batch_id" : {
                    "$cond" : [
                        "$isDirect",
                        "$direct_reward_paid_batch_id",
                        "$top_reward_paid_batch_id"
                    ]
                },
                "busdToReward" : {
                    "$multiply" : [
                        {
                            "$cond" : [
                                "$isDirect",
                                0.2,
                                0.05
                            ]
                        },
                        {
                            "$cond" : [
                                {
                                    "$or" : [
                                        {
                                            "$ne" : [
                                                "$type",
                                                "busd"
                                            ]
                                        },
                                        {
                                            "$and" : [
                                                "$isDirect",
                                                "$direct_reward_paid"
                                            ]
                                        }
                                    ]
                                },
                                0.0,
                                "$value"
                            ]
                        }
                    ]
                },
                "totalBusdReward" : {
                    "$multiply" : [
                        {
                            "$cond" : [
                                "$isDirect",
                                0.2,
                                0.05
                            ]
                        },
                        {
                            "$cond" : [
                                {
                                    "$and" : [
                                        {
                                            "$eq" : [
                                                "$type",
                                                "busd"
                                            ]
                                        }
                                    ]
                                },
                                "$value",
                                0.0
                            ]
                        }
                    ]
                },
                "bnbToReward" : {
                    "$multiply" : [
                        {
                            "$cond" : [
                                "$isDirect",
                                0.2,
                                0.05
                            ]
                        },
                        {
                            "$cond" : [
                                {
                                    "$or" : [
                                        {
                                            "$ne" : [
                                                "$type",
                                                "bnb"
                                            ]
                                        },
                                        {
                                            "$and" : [
                                                "$isDirect",
                                                "$direct_reward_paid"
                                            ]
                                        }
                                    ]
                                },
                                0.0,
                                "$value"
                            ]
                        }
                    ]
                },
                "totalBnbReward" : {
                    "$multiply" : [
                        {
                            "$cond" : [
                                "$isDirect",
                                0.2,
                                0.05
                            ]
                        },
                        {
                            "$cond" : [
                                {
                                    "$and" : [
                                        {
                                            "$eq" : [
                                                "$type",
                                                "bnb"
                                            ]
                                        }
                                    ]
                                },
                                "$value",
                                0.0
                            ]
                        }
                    ]
                },
                "busd" : {
                    "$cond" : [
                        {
                            "$and" : [
                                {
                                    "$eq" : [
                                        "$type",
                                        "busd"
                                    ]
                                }
                            ]
                        },
                        "$value",
                        0.0
                    ]
                },
                "bnb" : {
                    "$cond" : [
                        {
                            "$and" : [
                                {
                                    "$eq" : [
                                        "$type",
                                        "bnb"
                                    ]
                                }
                            ]
                        },
                        "$value",
                        0.0
                    ]
                }
            }
        }, 
        {
            "$facet" : {
                "stat" : [
                    {
                        "$group" : {
                            "_id" : "",
                            "bnb" : {
                                "$sum" : "$bnb"
                            },
                            "busd" : {
                                "$sum" : "$busd"
                            },
                            "bnbToReward" : {
                                "$sum" : "$bnbToReward"
                            },
                            "busdToReward" : {
                                "$sum" : "$busdToReward"
                            },
                            "totalBusdReward" : {
                                "$sum" : "$totalBusdReward"
                            },
                            "totalBnbReward" : {
                                "$sum" : "$totalBnbReward"
                            },
                            "count" : {
                                "$sum" : 1.0
                            }
                        }
                    }
                ],
                "transactions" : [
                    {
                        "$project" : {
                            "_id" : 1.0,
                            "from" : 1.0,
                            "timestamp" : 1.0,
                            "isDirect" : 1.0,
                            "isRewardPaid" : 1.0,
                            "busdToReward" : 1.0,
                            "bnbToReward" : 1.0,
                            "busd" : 1.0,
                            "bnb" : 1.0
                        }
                    }
                ],
                "rewards" : [
                    {
                        "$match" : {
                            "isRewardPaid" : true
                        }
                    },
                    {
                        "$group" : {
                            "_id" : "$reward_paid_batch_id",
                            "busd" : {
                                "$sum" : "$totalBusdReward"
                            },
                            "bnb" : {
                                "$sum" : "$totalBnbReward"
                            }
                        }
                    }
                ]
            }
        }
    ];
}