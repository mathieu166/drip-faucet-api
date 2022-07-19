export default (address) =>{
    return [
        {
            "$match" : {
                "blockTimestamp" : {
                    "$gte" : 1641013200
                },
                "$or" : [
                    {
                        "addr" : address
                    },
                    {
                        "addrTo" : address
                    }
                ]
            }
        }, 
        {
            "$sort" : {
                "blockTimestamp" : 1.0
            }
        }, 
        {
            "$lookup" : {
                "from" : "DripRatio",
                "let" : {
                    "block" : "$block"
                },
                "as" : "ratios",
                "pipeline" : [
                    {
                        "$match" : {
                            "$expr" : {
                                "$eq" : [
                                    "$_id",
                                    {
                                        "$round" : [
                                            "$$block",
                                            -2.0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        }, 
        {
            "$addFields" : {
                "kickbacked" : {
                    "$reduce" : {
                        "input" : "$events",
                        "initialValue" : false,
                        "in" : {
                            "$cond" : [
                                {
                                    "$eq" : [
                                        "$$this.event",
                                        "NewAirdrop"
                                    ]
                                },
                                true,
                                "$$value"
                            ]
                        }
                    }
                },
                "isAirdropIn" : {
                    "$not" : {
                        "$eq" : [
                            "$addr",
                            address
                        ]
                    }
                },
                "dripbnbRatio" : {
                    "$arrayElemAt" : [
                        "$ratios.ratio",
                        0.0
                    ]
                }
            }
        }, 
        {
            "$addFields" : {
                "debit_available" : {
                    "$switch" : {
                        "branches" : [
                            {
                                "case" : {
                                    "$eq" : [
                                        "$method",
                                        "roll"
                                    ]
                                },
                                "then" : "$amount"
                            },
                            {
                                "case" : {
                                    "$eq" : [
                                        "$method",
                                        "claim"
                                    ]
                                },
                                "then" : "$amount"
                            }
                        ],
                        "default" : 0.0
                    }
                },
                "debit_wallet" : {
                    "$switch" : {
                        "branches" : [
                            {
                                "case" : {
                                    "$and" : [
                                        {
                                            "$eq" : [
                                                "$method",
                                                "airdrop"
                                            ]
                                        },
                                        {
                                            "isAirdropIn" : false
                                        }
                                    ]
                                },
                                "then" : {
                                    "$divide" : [
                                        "$amount",
                                        0.9
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$eq" : [
                                        "$method",
                                        "deposit"
                                    ]
                                },
                                "then" : {
                                    "$divide" : [
                                        "$amount",
                                        0.9
                                    ]
                                }
                            }
                        ],
                        "default" : 0.0
                    }
                },
                "credit_wallet" : {
                    "$switch" : {
                        "branches" : [
                            {
                                "case" : {
                                    "$eq" : [
                                        "$method",
                                        "claim"
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$amount",
                                        0.9
                                    ]
                                }
                            }
                        ],
                        "default" : 0.0
                    }
                },
                "credit_deposit" : {
                    "$switch" : {
                        "branches" : [
                            {
                                "case" : {
                                    "$eq" : [
                                        "$method",
                                        "deposit"
                                    ]
                                },
                                "then" : "$amount"
                            },
                            {
                                "case" : {
                                    "$and" : [
                                        {
                                            "$eq" : [
                                                "$method",
                                                "roll"
                                            ]
                                        },
                                        {
                                            "kickbacked" : false
                                        }
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$amount",
                                        0.95
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$and" : [
                                        {
                                            "$eq" : [
                                                "$method",
                                                "roll"
                                            ]
                                        },
                                        {
                                            "kickbacked" : true
                                        }
                                    ]
                                },
                                "then" : {
                                    "$multiply" : [
                                        "$amount",
                                        0.961875
                                    ]
                                }
                            },
                            {
                                "case" : {
                                    "$and" : [
                                        {
                                            "$eq" : [
                                                "$method",
                                                "airdrop"
                                            ]
                                        },
                                        {
                                            "isAirdropIn" : true
                                        }
                                    ]
                                },
                                "then" : "$amount"
                            }
                        ],
                        "default" : 0.0
                    }
                },
                "dripFiatValue" : {
                    "$multiply" : [
                        "$dripbnbRatio",
                        "$bnbFiatValue"
                    ]
                },
                "date" : {
                    "$dateToString" : {
                        "format" : "%Y-%m-%d %H:%M:%S",
                        "date" : {
                            "$toDate" : {
                                "$multiply" : [
                                    1000.0,
                                    "$blockTimestamp"
                                ]
                            }
                        }
                    }
                }
            }
        }, 
        {
            "$addFields" : {
                "debit_available_fiat" : {
                    "$multiply" : [
                        "$debit_available",
                        "$dripFiatValue"
                    ]
                },
                "debit_wallet_fiat" : {
                    "$multiply" : [
                        "$debit_wallet",
                        "$dripFiatValue"
                    ]
                },
                "credit_wallet_fiat" : {
                    "$multiply" : [
                        "$credit_wallet",
                        "$dripFiatValue"
                    ]
                },
                "credit_deposit_fiat" : {
                    "$multiply" : [
                        "$credit_deposit",
                        "$dripFiatValue"
                    ]
                }
            }
        }, 
        {
            "$project" : {
                "action" : {
                    "$switch" : {
                        "branches" : [
                            {
                                "case" : {
                                    "$and" : [
                                        {
                                            "$eq" : [
                                                "$method",
                                                "airdrop"
                                            ]
                                        },
                                        {
                                            "$eq" : [
                                                "$isAirdropIn",
                                                true
                                            ]
                                        }
                                    ]
                                },
                                "then" : "airdrop_in"
                            },
                            {
                                "case" : {
                                    "$and" : [
                                        {
                                            "$eq" : [
                                                "$method",
                                                "airdrop"
                                            ]
                                        },
                                        {
                                            "$eq" : [
                                                "$isAirdropIn",
                                                false
                                            ]
                                        }
                                    ]
                                },
                                "then" : "airdrop_out"
                            }
                        ],
                        "default" : "$method"
                    }
                },
                "addr" : 1.0,
                "addrTo" : 1.0,
                "timestamp" : "$blockTimestamp",
                "bnbFiatValue" : 1.0,
                "transactionFeeBnb" : "$transactionCost",
                "transactionFeeFiat" : {
                    "$multiply" : [
                        {
                            "$toDouble" : "$transactionCost"
                        },
                        "$bnbFiatValue"
                    ]
                },
                "debit_available" : 1.0,
                "debit_wallet" : 1.0,
                "credit_wallet" : 1.0,
                "credit_deposit" : 1.0,
                "dripbnbRatio" : 1.0,
                "dripFiat" : 1.0,
                "dripFiatValue" : 1.0,
                "block" : 1.0,
                "date" : 1.0,
                "debit_available_fiat" : 1.0,
                "debit_wallet_fiat" : 1.0,
                "credit_wallet_fiat" : 1.0,
                "credit_deposit_fiat" : 1.0
            }
        }
    ];
}