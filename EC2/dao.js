// Data Access Object
const DAO = {
    accounts: {},
    trips: {}
};

// connect with MySQL
DAO.mysql = require('mysql');
DAO.db = DAO.mysql.createConnection({
    // host: 'localhost',
    host: 'mysql',
    port: 3306,
    user: 'root',
    password: 'ec2server',
    database: 'TripChat',
    insecureAuth: true
});

// console log err during connecting with MySQL
DAO.connect = DAO.db.connect(err => {
	if(err) {
		console.log(err);
	}
});

// checking is the email account exist
DAO.accounts.checkAccount = (scenario, input, callback) => {
    console.log(scenario);
    // signup then link to profile page
    let result, mysqlQuery;
    if(scenario === 'isAccountExist') {
        mysqlQuery = 
            `SELECT * FROM accounts
            WHERE 
            account_email = '${input.email}' AND
            provider = '${input.provider}'`;
    } else if (scenario === 'login') {
        mysqlQuery = 
            `SELECT * FROM accounts
            WHERE 
            account_email = '${input.email}' AND
            account_password = '${input.password}' AND
            provider = '${input.provider}'`;
    }
    DAO.db.query(mysqlQuery, (err, account) => {
        if(err) {
            result = {err: 'Something went wrong during check your email and password input: ' + err};
            callback(result);
        } else if(account.length === 0) {
            result = {err: '帳號或密碼輸入錯誤。'};
            callback(result);
        } else {
            result = {account: account};
            callback(result);
        }
    });
};

// create a account and response with login state
DAO.accounts.signup = (input, callback) => {
    let result;
    let isExistAccount = 
        `SELECT * FROM accounts
        WHERE account_email = '${input.email}'`;
    let INSERT_INTO_accounts = 
        `INSERT INTO accounts (account_name, account_email, account_password, create_date, provider) 
        VALUES 
        ('${input.name}', '${input.email}', '${input.password}', CURDATE(), '${input.provider}')`;

    DAO.db.beginTransaction((err) => {
        if(err) {
            result = {err: '系統忙碌中，請稍候再試。'};
            callback(result);
            console.log(err);
            return;
        }
        DAO.db.query(isExistAccount, (err, account) => {
            if(err) {
                result = {err: 'Something went wrong during check this email is exist: ' + err};
                callback(result);
            } else if(account.length !== 0) {
                result =  {err: '此信箱已被註冊。'};
                callback(result);
            } else {
                DAO.db.query(INSERT_INTO_accounts, (err, results) => {
                    if(err) {
                        DAO.db.rollback(() => {
                            result = {err: '系統忙碌中，請稍候再試。'};
                            callback(result);
                            console.log(err);
                        });
                    } else {
                        DAO.db.commit((err) => {
                            if(err) {
                                DAO.db.rollback(() => {
                                    result = {err: '系統忙碌中，請稍候再試。'};
                                    callback(result);
                                    console.log(err);
                                    return;
                                });
                            } else {
                                callback(results);
                            }
                        });
                    }
                });
            }
        });
    });
};

// update account's user name
DAO.accounts.editName = (input, callback) => {
    let result;
    let mysqlQuery = 
		`UPDATE accounts 
		SET ? WHERE account_id = ?`;
	
	DAO.db.query(mysqlQuery, [input.update_data, input.account_id], (err, results) => {
		if(err) {
            result =  {err: 'Something went wrong during update profile name: ' + err};
            callback(result);
		} else {
            callback(results);
		}
	});
};

// get user's trip lists
DAO.trips.getTripList = (input, callback) => {
    let result;
    let mysqlQuery = 
        `SELECT 
        ta.account_id, ta.trip_id, t.trip_id, t.trip_title, t.trip_date, t.trip_location 
        FROM 
        trip_to_account ta, trips t
        WHERE 
        ta.trip_id = t.trip_id AND
        account_id = '${input.account_id}'`; 
    DAO.db.query(mysqlQuery, (err, list) => {
        if(err) {
            result = {err: 'Something went wrong during join: ' + err};
            callback(result);
        } else {
            result = {list: list};
            callback(result);
        }
    });
};

// get a trip's member list
DAO.trips.getTripMember = (input, callback) => {
    let result;
    let mysqlQuery = 
        `SELECT 
        ta.trip_id, ta.account_id, a.account_id, a.account_email 
        FROM 
        trip_to_account ta, accounts a
        WHERE
        ta.account_id = a.account_id AND 
        trip_id = '${input.trip_id}'`;
    DAO.db.query(mysqlQuery, (err, list) => {
        if(err) {
            result = {err: 'Something went wrong during join: ' + err};
            callback(result);
        } else {
            result = {list: list};
            console.log(list);
            callback(result);
        }
    });
};

// insert a new trip into MySQL
DAO.trips.createNewTrip = (input, callback) => {
    let result;
    let createNewTrip = 
        `INSERT INTO trips 
        (trip_title, trip_date, trip_location) 
        VALUES 
        ('${input.trip_title}', '${input.trip_date}', '${input.trip_location}')`;
    let lastInsertID = 
        `SELECT LAST_INSERT_ID()`;
    DAO.db.beginTransaction((err) => {
        if(err) {
            result = {err: '系統忙碌中，請稍候再試。'};
            callback(result);
            console.log(err);
            return;
        }
        DAO.db.query(createNewTrip, (err, results) => {
            if(err) {
                result = {err: 'Something went wrong during add this trip into database: ' + err};
                callback(result);
            } else {
                DAO.db.query(lastInsertID, (err, newTrip) => {
                    if(err) {
                        DAO.db.rollback(() => {
                            result = {err: '系統忙碌中，請稍候再試。'};
                            callback(result);
                            console.log(err);
                        });
                    } else {
                        DAO.db.commit((err) => {
                            if(err) {
                                DAO.db.rollback(() => {
                                    result = {err: '系統忙碌中，請稍後再試。'};
                                    callback(result);
                                    console.log(err);
                                    return;
                                });
                            }
                            let new_trip_id = newTrip[0]['LAST_INSERT_ID()'];
                            result = {new_trip_id: new_trip_id};
                            callback(result);

                            let newTripBridgeTable = 
                                `INSERT INTO trip_to_account 
                                (trip_id, account_id) 
                                VALUES 
                                ('${new_trip_id}','${input.account_id}')`;
                            DAO.db.query(newTripBridgeTable, (err, resultMessage) => {
                                if(err) {
                                    console.log(err);
                                } else {
                                    console.log(resultMessage);
                                }
                            });
                        });
                    }
                });
            }
        });
    });
};

// get a trip's information and all markers on map
DAO.trips.getTripData = (input, callback) => {
    let result;
    let checkAuth =
		`SELECT * FROM trip_to_account
		WHERE trip_id = '${input.trip_id}'
		AND account_id = '${input.account_id}'`;
    let selectTrip = 
        `SELECT * FROM trips
        WHERE trip_id = '${input.trip_id}'`;
    let getMarkers = 
        `SELECT * FROM markers
        WHERE trip_id_FK = '${input.trip_id}'`;
	DAO.db.query(checkAuth, (err, results) => {
		if(err) {
            result = {err: 'Something went wrong during check account authentication: ' + err};
            callback(result);
		} else if(results.length === 0) {
            result = {notTripMember: true};
            callback(result);
		} else {
			DAO.db.query(selectTrip, (err, data) => {
				if(err) {
                    result = {err: 'Something went wrong during get trip data: ' + err};
                    callback(result);
				} else {
					DAO.db.query(getMarkers, (err, markersData) => {
						if(err) {
                            result = {err: 'Something went wrong during get markers: ' + err};
                            callback(result);
						} else {
                            result = {
                                data: data,
                                markersData: markersData
                            };
                            callback(result);
						}
					});
				}
			});
		}
	});
};

// insert a new marker's data
DAO.trips.addMarker = (input, callback) => {
    let result;
    let addMarker = 
		`INSERT INTO markers (trip_id_FK, lat, lng, content) 
		VALUES 
		('${input.trip_id}', '${input.lat}', '${input.lng}', '${input.content}')`;
    let lastInsertID = 
        `SELECT LAST_INSERT_ID()`;
	DAO.db.beginTransaction((err) => {
		if(err) {
            result = {err: '系統忙碌中，請稍候再試。'};
            callback(result);
            console.log(err);
            return;
		}
		DAO.db.query(addMarker, (err, done) => {
			if(err) {
                result = {err: 'Something went wrong during add marker into db: ' + err};
                callback(result);
			} else {	
				DAO.db.query(lastInsertID, (err, marker) => {
					if(err) {
						DAO.db.rollback(() => {
                            result = {err: '系統忙碌中，請稍候再試。'};
                            callback(result);
							console.log(err);
						});
					} else {
						DAO.db.commit((err) => {
							if(err) {
                                result = {err: '系統忙碌中，請稍候再試。'};
                                callback(result);
                                console.log(err);
                                return;
                            }
                            result = {marker_id: marker[0]['LAST_INSERT_ID()']};
                            callback(result);
						});
					}
				});
			}
		});
	});
};

// update a marker's content
DAO.trips.editMarker = (input, callback) => {
    let result;
    let updateMarker = 
		`UPDATE markers 
		SET ? WHERE marker_id = ?`;
	DAO.db.query(updateMarker, [input.update_data, input.marker_id], (err, results) => {
		if(err) {
            result = {err: 'Something went wrong during update marker content: ' + err};
            callback(result);
		} else {
            result = {results: results};
            callback(result);
		}
	});
};

// delete a marker
DAO.trips.deleteMarker = (input, callback) => {
    let result;
    let deleteMarker = 
		`DELETE FROM markers
		WHERE marker_id = ${input.marker_id}`;
	DAO.db.query(deleteMarker, (err, results) => {
		if(err) {
            result = {err: 'Something went wrong during delete marker: ' + err};
            callback(result);
		} else {
            result = {results};
            callback(result);
		}
	});
};

// update a title, date or location of a trip
DAO.trips.editTripInfo = (input, callback) => {
    let result;
    let mysqlQuery = 
        `UPDATE trips 
        SET ? WHERE trip_id = ?`;
    DAO.db.query(mysqlQuery, [input.update_data, input.trip_id], (err, results) => {
        if(err) {
            result = {err: 'Something went wrong during update trip title: ' + err};
            callback(result);
        } else {
            result = {results: results};
            callback(result);
        }
    });
};

// let a user be one of a trip's members 
DAO.trips.addNewMember = (input, callback) => {
    let result;
    let checkMember = 
		`SELECT * FROM accounts
		WHERE 
        account_email = '${input.member_email}'`;
    DAO.db.beginTransaction((err) => {
        if(err) {
            result = {err: '系統忙碌中，請稍候再試。'};
            callback(result);
            console.log(err);
            return;
        }
        DAO.db.query(checkMember, (err, account) => {
            if(err) {
                result = {err: 'Something went wrong during check member email: ' + err};
                callback(result);
            } else if(account.length === 0) {
                result = {err: '無此使用者。'};
                callback(result);
            } else {
                let member_id = account[0].account_id;
                let member_name = account[0].account_name;
                let newTripBridgeTable = 
                    `INSERT INTO trip_to_account 
                    (trip_id, account_id) 
                    VALUES 
                    ('${input.trip_id}','${member_id}')`;
                DAO.db.query(newTripBridgeTable, (err, results) => {
                    if(err) {
                        DAO.db.rollback(() => {
                            result = {err: '系統忙碌中，請稍候再試。'};
                            callback(result);
                            console.log(err);
                        });
                    } else {
                        DAO.db.commit((err) => {
                            if(err) {
                                result = {err: '系統忙碌中，請稍候再試。'};
                                callback(result);
                                console.log(err);
                                return;
                            }
                            result = {
                                results: results,
                                member_id: member_id,
                                member_name: member_name
                            };
                            callback(result);
                        });
                    }
                });
            }
        });
    });
};

// save chat logs
DAO.trips.saveMessage = (input, callback) => {
    let result;
    let saveMessage = 
		`INSERT INTO messages (trip_id, show_name, account_email, message) 
		VALUES 
        ('${input.trip_id}', '${input.show_name}', '${input.account_email}', '${input.message}')`;
    let lastInsertID = 
        `SELECT LAST_INSERT_ID()`;
    DAO.db.beginTransaction((err) => {
        if(err) {
            result = {err: '系統忙碌中，請稍候再試。'};
            callback(result);
            console.log(err);
            return;
        }
        DAO.db.query(saveMessage, (err, done) => {
            if(err) {
                result = {err: 'Something went wrong during save message into db: ' + err};
                callback(result);
            } else {
                DAO.db.query(lastInsertID, (err, message) => {
                    if(err) {
                        DAO.db.rollback(() => {
                            result = {err: '系統忙碌中，請稍候再試。'};
                            callback(result);
                            console.log(err);
                        });
                    } else {
                        DAO.db.commit((err) => {
                            if(err) {
                                result = {err: '系統忙碌中，請稍候再試。'};
                                callback(result);
                                console.log(err);
                                return;
                            }
                            result = {message_id: message[0]['LAST_INSERT_ID()']};
                            callback(result);
                        });
                    }
                });
            }
        });
    });
};

// get chat logs
DAO.trips.getChatLogs = (input, callback) => {
    let result;
    let getChatLogs =
		`SELECT * FROM messages
		WHERE trip_id = '${input.trip_id}'`;
	DAO.db.query(getChatLogs, (err, messages) => {
		// console.log(result);
		if(err) {
            result = {err: 'Something went wrong during get chat logs: ' + err};
            callback(result);
		} else if(messages.length === 0) {
            result = {no_chat_log: '尚無聊天記錄哦。'};
            callback(result);
		} else {
            result = {messages: messages};
            callback(result);
		}
	});
};

module.exports = DAO;