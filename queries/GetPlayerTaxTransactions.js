export default (address) =>{
    return [
        {
            "$match" : {
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
                        "default" : "0"
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
                        "default" : "0"
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
                        "default" : "0"
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
                        "default" : "0"
                    }
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
                                            "isAirdropIn" : false
                                        }
                                    ]
                                },
                                "then" : "airdrop_out"
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
                                "then" : "airdrop_in"
                            }
                        ],
                        "default" : "$method"
                    }
                },
                "addr" : 1.0,
                "addrTo" : 1.0,
                "timestamp" : "$blockTimestamp",
                "bnbFiatValue" : 1.0,
                "cdexDripbnbRatio" : 1.0,
                "cdexDripPrice" : 1.0,
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
                "credit_deposit" : 1.0
            }
        }
    ];
}