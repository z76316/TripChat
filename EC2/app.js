const express = require("express");
const bodyParser = require("body-parser");
const app = express(); // 產生 express application 物件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// session
let session = require('express-session');
// let FileStore = require('session-file-store')(session);
app.use(session({
	name: 'identityKey',
	secret: 'suger daddy',
	// store: new FileStore(),
	saveUninitialized: false,
	resave: true,
	cookie: {
		maxAge: 1800 * 1000
	}
}));

// socket.io
const socket = require('socket.io');

// Utility
const request = require("request");

// mysql
const mysql = require('mysql');
const db = mysql.createConnection({
	host: 'mysql',
	port: 3306,
	user: 'root',
	password: 'ec2server',
	database: 'TripChat',
	insecureAuthL: true
});

db.connect(err => {
	if(err) {
		console.log(err);
		return err;
	}
});

// redis
const redis = require('redis');
const client = redis.createClient({
	host: 'redis'
});

// App setup
let port = 9000;
let server = app.listen(port, function() {
	console.log('Server is running on port', port);
});

// 路徑開頭若為 "/exe/" , server 端就允許這個 cross domain control 的行為
// app.use("/exe/", function(req, res, next) {
//     res.set("Access-Control-Allow-Origin", "*");
//     res.set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
//     res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
//     res.set("Access-Control-Allow-Credentials", "true");
//     next();
// });

// Static files
app.use(express.static('../dist'));

// TripChat API
app.get('/exe/checkloginstate', function (req, res) {
	let sess = req.session;
	let name = sess.name;
	let email = sess.email;
	let provider = sess.provider;
	let isLogin = !!email;

	if(sess.account_id) {
		// login
		let account_id = sess.account_id;
		res.send({
			account_id: account_id,
			name: name,
			email: email,
			isLogin: isLogin
		});

		// console.log(`id = ${account_id}, name = ${name}, email = ${email}, isLogin = ${isLogin}`);
		// console.log(sess);

	} else {
		// signup then link to profile page
		let checkAccount = 
			`SELECT * FROM accounts
			WHERE 
			account_email = '${email}' AND
			provider = '${provider}'`;
		// console.log(checkAccount);
		db.query(checkAccount, (err, account) => {
			// console.log(account);
			if(err) {
				res.send( {err: 'Something went wrong during check your email and password input: ' + err} );
			} else if(account.length === 0) {
				res.send( {err: '帳號或密碼輸入錯誤。'} );
			} else {
				req.session.regenerate(function(err) {
					if(err) {
						res.send({err: 'Something went wrong during regenerate session: ' + err});
						return;
					}
				});
				req.session.account_id = account[0].account_id;
				let account_id = account[0].account_id;
				// console.log(req.session);
				res.send({
					account_id: account_id,
					name: name,
					email: email,
					isLogin: isLogin
				});
				
				// console.log(`id = ${account_id}, name = ${name}, email = ${email}, isLogin = ${isLogin}`);
				// console.log(sess);

			}
		});
	}	
});

app.post('/exe/accounts/login', (req, res) => {
	let sess = req.session;
	let data = req.body;
	if (!data.email || !data.password) {
		res.send({ error: "Login Error: Wrong Data Format" });
		return;
	}

	let email = data.email;
	let password = data.password;
	let provider = data.provider;
	let checkAccount = 
		`SELECT * FROM accounts
		WHERE 
		account_email = '${email}' AND
		account_password = '${password}' AND
		provider = '${provider}'`;
	db.query(checkAccount, (err, account) => {
		// console.log(account);
		if(err) {
			res.send( {err: 'Something went wrong during check your email and password input: ' + err} );
		} else if(account.length === 0) {
			res.send( {err: '帳號或密碼輸入錯誤。'} );
		} else {
			req.session.regenerate(function(err) {
				if(err) {
					res.send({err: 'Something went wrong during regenerate session: ' + err});
					return;
				}
			});
			req.session.account_id = account[0].account_id;
			req.session.name = account[0].account_name;
			req.session.email = account[0].account_email;
			req.session.provider = account[0].provider;
			req.session.isLogin = true;
			// console.log(req.session);
			res.send({
				message: `${account[0].account_name}，歡迎回來!`
			});
		}
	});
});

app.post('/exe/accounts/signup', (req, res) => {
	let sess = req.session;
	let data = req.body;
	if (!data.name || !data.email || !data.password) {
		res.send({ error: "Signup Error: Wrong Data Format" });
		return;
	}

	let name = data.name;
	let email = data.email;
	let password = data.password;
	let provider = data.provider;
	let isExistAccount = 
		`SELECT * FROM accounts
		WHERE account_email = '${email}'`;
	let INSERT_INTO_accounts = 
		`INSERT INTO accounts (account_name, account_email, account_password, create_date, provider) 
		VALUES 
		('${name}', '${email}', '${password}', CURDATE(), '${provider}')`;
	
	db.beginTransaction((err) => {
		if(err) {
			res.send({err: '系統忙碌中，請稍候再試。'});
			console.log(err);
		}
		
		db.query(isExistAccount, (err, account) => {
			if(err) {
				res.send( {err: 'Something went wrong during check this email is exist: ' + err} );
			} else if(account.length !== 0) {
				res.send( {err: '此信箱已被註冊。'} );
			} else {
				db.query(INSERT_INTO_accounts, (err, results) => {
					if(err) {
						db.rollback(() => {
							res.send({err: '系統忙碌中，請稍候再試。'});
							console.log(err);
						});
					} else {
						db.commit((err) => {
							if(err) {
								db.rollback(() => {
									res.send({err: '系統忙碌中，請稍候再試。'});
									console.log(err);
								});
							}
							req.session.regenerate(function(err) {
								if(err) {
									res.send({err: 'Something went wrong during regenerate session: ' + err});
									return;
								}
							});
							req.session.name = name;
							req.session.email = email;
							req.session.provider = provider;
							req.session.isLogin = true;
							console.log(req.session);
							res.send({message: '您已成功註冊帳戶!'});
						});
					}
				});
			}
		});
	});
});

app.get('/exe/logout', function(req, res) {
	req.session.destroy(function(err) {
		if(err) {
			res.send({err: err});
			return;
		}
		res.clearCookie('identityKey');
		res.send({message: 'See ya!'});
	});
});

app.post('/exe/accounts/editname', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let new_name = req.body.new_name;
	let update_date = {
		account_name: new_name
	};
	let UpdateName = 
		`UPDATE accounts 
		SET ? WHERE account_id = ?`;
	if(new_name.length < 1) {
		res.send({name: sess.name});
		return;
	}
	db.query(UpdateName, [update_date, account_id], (err, result) => {
		console.log(result);
		if(err) {
			res.send( {err: 'Something went wrong during update profile name: ' + err} );
		} else {
			req.session.regenerate(function(err) {
				if(err) {
					res.send({err: 'Something went wrong during regenerate session: ' + err});
					return;
				}
			});
			req.session.name = new_name;
			console.log(req.session);
			res.send({
				name: req.session.name
			});
		}
	});
});

app.get('/exe/gettriplist', function(req,res) {
	let sess = req.session;
	let account_id = sess.account_id;
	client.get(`trip_list${account_id}`, (err, lists) => {
		if(err){
			res.send({err: '系統忙碌中，請稍候再試。'});
			console.log(err);
		} else if (lists) {
			let trip_list = JSON.parse(lists);
			res.send(trip_list);
			console.log('感恩 cache，讚嘆 cache!');
		} else {
			let getTripList = 
				`SELECT 
				ta.account_id, ta.trip_id, t.trip_id, t.trip_title, t.trip_date, t.trip_location 
				FROM 
				trip_to_account ta, trips t
				WHERE 
				ta.trip_id = t.trip_id AND
				account_id = '${account_id}'`; 
			db.query(getTripList, (err, list) => {
				if(err) {
					res.send( {err: 'Something went wrong during join: ' + err} );
				} else {
					let trip_list = [];
					for(let i = 0; i < list.length; i++) {
						// console.log(list[i]);
						trip_list.push(list[i]);
					}
					let trip_list_JSON = JSON.stringify(trip_list);
					client.set(`trip_list${account_id}`, trip_list_JSON);
					res.send(
						trip_list
					);
					console.log('database 少使用，多休息');
				}
			});
		}
	});
});

app.post('/exe/trip/gettripmember', function(req,res) {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	client.get(`member_list${trip_id}`, (err, lists) => {
		if(err){
			res.send({err: '系統忙碌中，請稍候再試。'});
			console.log(err);
		} else if (lists) {
			let member_list = JSON.parse(lists);
			res.send(member_list);
			console.log('感恩 cache，讚嘆 cache!');
		} else {
			let getTripMember = 
				`SELECT 
				ta.trip_id, ta.account_id, a.account_id, a.account_email 
				FROM 
				trip_to_account ta, accounts a
				WHERE
				ta.account_id = a.account_id AND 
				trip_id = '${trip_id}'`;
			db.query(getTripMember, (err, list) => {
				if(err) {
					res.send( {err: 'Something went wrong during join: ' + err} );
				} else {
					let member_list = [];
					for(let i = 0; i < list.length; i++) {
						member_list.push(list[i]);
					}
					let member_list_JSON = JSON.stringify(member_list);
					client.set(`member_list${trip_id}`, member_list_JSON);
					res.send(
						member_list
					);
					console.log('database 少使用，多休息');
				}
			});
		}
	});
});

app.post('/exe/createnewtrip', function(req,res) {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_title = data.tripTitle;
	let trip_date = data.tripDate;
	let trip_location = data.tripLocation;
	let CreateNewTrip = 
		`INSERT INTO trips 
		(trip_title, trip_date, trip_location) 
		VALUES 
		('${trip_title}', '${trip_date}', '${trip_location}')`;
	
	db.beginTransaction((err) => {
		if(err) {
			res.send({err: '系統忙碌中，請稍候再試。'});
			console.log(err);
		}
		db.query(CreateNewTrip, (err, result) => {
			if(err) {
				res.send({err: 'Something went wrong during add this trip into database: ' + err});
			} else {
				let LastInsertID = 
					`SELECT LAST_INSERT_ID()`;
				db.query(LastInsertID, (err, result) => {
					if(err) {
						db.rollback(() => {
							res.send({err: '系統忙碌中，請稍候再試。'});
							console.log(err);
						});
					} else {
						db.commit((err) => {
							if(err) {
								db.rollback(() => {
									res.send({err: '系統忙碌中，請稍後再試。'});
									console.log(err);
								});
							}
							// console.log(result);
							let new_trip_id = result[0]['LAST_INSERT_ID()'];
							// console.log(new_trip_id);
							res.send({new_trip_id: new_trip_id});

							// update => clear out trip_list${account_id} cache
							client.del(`trip_list${account_id}`);
							console.log('新增了 trip, 所以清空 trip_list${account_id} 的 cache');

							let NewTripBridgeTable = 
								`INSERT INTO trip_to_account 
								(trip_id, account_id) 
								VALUES 
								('${new_trip_id}','${account_id}')`;
							db.query(NewTripBridgeTable, (err, result) => {
								if(err) {
									console.log(err);
								} else {
									// console.log(result);
								}
							});
						});
					}
				});
			}
		});
		
	});

});

app.post('/exe/trip/getTripData', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	let checkAuth =
		`SELECT * FROM trip_to_account
		WHERE trip_id = '${trip_id}'
		AND account_id = '${account_id}'`;
	db.query(checkAuth, (err, result) => {
		if(err) {
			res.send( {err: 'Something went wrong during check account authentication: ' + err} );
		} else if(result.length === 0) {
			res.send({notTripMember: true});
		} else {
			let SelectTrip = 
				`SELECT * FROM trips
				WHERE trip_id = '${trip_id}'`;

			db.query(SelectTrip, (err, data) => {
				if(err) {
					res.send( {err: 'Something went wrong during get trip data: ' + err} );
				} else {
					let getMarkers = 
						`SELECT * FROM markers
						WHERE trip_id = '${trip_id}'`;
					db.query(getMarkers, (err, markersData) => {
						if(err) {
							res.send( {err: 'Something went wrong during get markers: ' + err} );
						} else {
							let markers = [];
							let marker;
							for(let i = 0; i < markersData.length; i++) {
								marker = {
									marker_id: markersData[i].marker_id,
									location: {
										lat: markersData[i].lat,
										lng: markersData[i].lng
									},
									content: markersData[i].content
								};
								markers.push(marker);
							}
							// console.log(markers);
							let trip_title = data[0].trip_title;
							let trip_date = data[0].trip_date;
							let trip_location = data[0].trip_location;
							res.send({
								trip_title: trip_title,
								trip_date: trip_date,
								trip_location: trip_location,
								markers: markers
							});
						}
					});
				}
			});
		}
	});
});

app.post('/exe/trip/addmarker', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	let lat = data.lat;
	let lng = data.lng;
	let content = data.content;
	let addMarker = 
		`INSERT INTO markers (trip_id, lat, lng, content) 
		VALUES 
		('${trip_id}', '${lat}', '${lng}', '${content}')`;

	db.beginTransaction((err) => {
		if(err) {
			res.send({err: '系統忙碌中，請稍候再試。'});
			console.log(err);
		}
		db.query(addMarker, (err, done) => {
			if(err) {
				res.send( {err: 'Something went wrong during add marker into db: ' + err} );
			} else {
				let LastInsertID = 
					`SELECT LAST_INSERT_ID()`;
				db.query(LastInsertID, (err, result) => {
					if(err) {
						db.rollback(() => {
							res.send({err: '系統忙碌中，請稍候再試。'});
							console.log(err);
						});
					} else {
						db.commit((err) => {
							if(err) {
								res.send({err: '系統忙碌中，請稍候再試。'});
								console.log(err);
							}
							// console.log(result);
							let marker_id = result[0]['LAST_INSERT_ID()'];
							// console.log(marker_id);
							res.send({
								marker_id: marker_id,
								location: {
									lat: lat,
									lng: lng
								},
								content: content
							});
						});
					}
				});
			}
		});
	});
});

app.post('/exe/trip/editmarker', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let marker_id = data.marker_id;
	let content = data.content;
	let update_date = {
		content: content
	};
	let UpdateMarker = 
		`UPDATE markers 
		SET ? WHERE marker_id = ?`;
	db.query(UpdateMarker, [update_date, marker_id], (err, result) => {
		// console.log('有 marker 的內容更新了');
		// console.log(result);
		if(err) {
			res.send( {err: 'Something went wrong during update marker content: ' + err} );
		} else {
			res.send({
				message: `Content of the marker id = ${marker_id} is updated.`
			});
		}
	});
});

app.post('/exe/trip/deletemarker', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let marker_id = data.marker_id;
	let DeleteMarker = 
		`DELETE FROM markers
		WHERE marker_id = ${marker_id}`;
	db.query(DeleteMarker, (err, result) => {
		// console.log('有 marker 被刪除了');
		// console.log(result);
		if(err) {
			res.send( {err: 'Something went wrong during delete marker: ' + err} );
		} else {
			res.send({
				message: `刪除成功。`
			});
		}
	});
});

app.post('/exe/trip/edittitle', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	let new_title = data.new_title;
	let old_title = data.old_title;
	let update_data = {
		trip_title: new_title
	};
	let UpdateTitle = 
		`UPDATE trips 
		SET ? WHERE trip_id = ?`;
	if(new_title.length < 1) {
		res.send({title: old_title});
		return;
	}
	db.query(UpdateTitle, [update_data, trip_id], (err, result) => {
		// console.log(result);
		if(err) {
			res.send( {err: 'Something went wrong during update trip title: ' + err} );
		} else {
			res.send({
				title: new_title
			});

			// update => clear out trip_list${account_id} cache
			client.del(`trip_list${account_id}`);
			console.log('新增了 trip, 所以清空 trip_list${account_id} 的 cache');
		}
	});
});

app.post('/exe/trip/editdate', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	let new_date = data.new_date;
	let old_date = data.old_date;
	let update_data = {
		trip_date: new_date
	};
	let UpdateDate = 
		`UPDATE trips 
		SET ? WHERE trip_id = ?`;
	if(new_date.length < 1) {
		res.send({date: old_date});
		return;
	}
	db.query(UpdateDate, [update_data, trip_id], (err, result) => {
		// console.log(result);
		if(err) {
			res.send( {err: 'Something went wrong during update trip date: ' + err} );
		} else {
			res.send({
				date: new_date
			});

			// update => clear out trip_list${account_id} cache
			client.del(`trip_list${account_id}`);
			console.log('新增了 trip, 所以清空 trip_list${account_id} 的 cache');
		}
	});
});

app.post('/exe/trip/editlocation', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	let new_location = data.new_location;
	let old_location = data.old_location;
	let update_data = {
		trip_location: new_location
	};
	let UpdateLocation = 
		`UPDATE trips 
		SET ? WHERE trip_id = ?`;
	if(new_location.length < 1) {
		res.send({location: old_location});
		return;
	}
	db.query(UpdateLocation, [update_data, trip_id], (err, result) => {
		// console.log(result);
		if(err) {
			res.send( {err: 'Something went wrong during update trip location: ' + err} );
		} else {
			res.send({
				location: new_location
			});

			// update => clear out trip_list${account_id} cache
			client.del(`trip_list${account_id}`);
			console.log('新增了 trip, 所以清空 trip_list${account_id} 的 cache');
		}
	});
});

app.post('/exe/trip/addnewmember', (req, res) => {
	let sess = req.session;
	let data = req.body;
	let trip_id = data.trip_id;
	let member_email = data.member_email;

	let checkMember = 
		`SELECT * FROM accounts
		WHERE 
		account_email = '${member_email}'`;
			
	db.beginTransaction((err) => {
		if(err) {
			res.send({err: '系統忙碌中，請稍候再試。'});
			console.log(err);
		}
		db.query(checkMember, (err, account) => {
			if(err) {
				res.send( {err: 'Something went wrong during check member email: ' + err} );
			} else if(account.length === 0) {
				res.send( {err: '無此使用者。'} );
			} else {
				// console.log(account[0].account_id);
				// console.log(account[0].account_name);
				let member_id = account[0].account_id;
				let member_name = account[0].account_name;

				let NewTripBridgeTable = 
					`INSERT INTO trip_to_account 
					(trip_id, account_id) 
					VALUES 
					('${trip_id}','${member_id}')`;
				db.query(NewTripBridgeTable, (err, result) => {
					if(err) {
						db.rollback(() => {
							res.send({err: '系統忙碌中，請稍候再試。'});
							console.log(err);
						});
					} else {
						// console.log(result);
						db.commit((err) => {
							if(err) {
								res.send({err: '系統忙碌中，請稍候再試。'});
								console.log(err);
							}
							res.send({
								message: `${member_name}(${member_email}) 已成為旅程夥伴。`
							});
						});

						// update => clear out member_list${trip_id} cache
						client.del(`member_list${trip_id}`);
						console.log('新增了 trip, 所以清空 member_list${trip_id} 的 cache');

						// update => clear out trip_list${account_id} cache
						client.del(`trip_list${member_id}`);
						console.log('新增了 trip, 所以清空 trip_list${account_id} 的 cache');
					}
				});
			}
		});
	});		
});


// Save messages into SQL
app.post('/exe/trip/savemessage', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	let show_name = data.show_name;
	let account_email = data.account_email;
	let message = data.message;
	let saveMessage = 
		`INSERT INTO messages (trip_id, show_name, account_email, message) 
		VALUES 
		('${trip_id}', '${show_name}', '${account_email}', '${message}')`;

	db.beginTransaction((err) => {
		if(err) {
			res.send({err: '系統忙碌中，請稍候再試。'})
			console.log(err);
		}
		db.query(saveMessage, (err, done) => {
			if(err) {
				res.send( {err: 'Something went wrong during save message into db: ' + err} );
			} else {
				let LastInsertID = 
					`SELECT LAST_INSERT_ID()`;
				db.query(LastInsertID, (err, result) => {
					if(err) {
						db.rollback(() => {
							res.send({err: '系統忙碌中，請稍候再試。'});
							console.log(err);
						});
					} else {
						db.commit((err) => {
							if(err) {
								res.send({err: '系統忙碌中，請稍候再試。'});
								console.log(err);
							}
							// console.log(result);
							let message_id = result[0]['LAST_INSERT_ID()'];
							// console.log(message_id);
							res.send({
								message_id: message_id,
								done_message: '訊息已儲存。'
							});
						});
					}
				});
			}
		});
	});
});

// Get chat logs
app.post('/exe/trip/getchatlogs', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	// console.log('trip_id!!!!!!!!!!!!!!!!!!! '+trip_id);
	let getChatLogs =
		`SELECT * FROM messages
		WHERE trip_id = '${trip_id}'`;
	db.query(getChatLogs, (err, result) => {
		// console.log(result);
		if(err) {
			res.send( {err: 'Something went wrong during get chat logs: ' + err} );
		} else if(result.length === 0) {
			res.send({no_chat_log: '尚無聊天記錄哦。'});
		}else {
			let message;
			let chat_logs = [];
			for(let i = 0; i < result.length; i++) {
				message = {
					who: result[i].show_name,
					email: result[i].account_email,
					content: result[i].message
				};
				chat_logs.push(message);
			}
			res.send({
				chat_logs: chat_logs
			});
		}
	});
});

module.exports = app;

// Socket setup
let io = socket(server);

io.on('connection', (socket) => {
	console.log('made socket connection', socket.id);
	
	// Chat messages
	socket.on('chat', (data) => {
		let trip_id = data.trip_id;
		io.sockets.emit(`chat${trip_id}`, data);
	});

	socket.on('typing', (typingState) => {
		let trip_id = typingState.trip_id;
		socket.broadcast.emit(`typing${trip_id}`, typingState);
	});

	// Map markers
	socket.on('addMarker', (newAddedMarker) => {
		let trip_id = newAddedMarker.trip_id;
		socket.broadcast.emit(`addMarker${trip_id}`, newAddedMarker);
	});

	socket.on('updateMarker', (update_marker) => {
		let trip_id = update_marker.trip_id;
		socket.broadcast.emit(`updateMarker${trip_id}`, update_marker);
	});

	socket.on('deleteMarker', (delete_marker) => {
		let trip_id = delete_marker.trip_id;
		socket.broadcast.emit(`deleteMarker${trip_id}`, delete_marker);
	});

	// Trip Location
	socket.on('updateLocation', (update_location) => {
		let trip_id = update_location.trip_id;
		socket.broadcast.emit(`updateLocation${trip_id}`, update_location);
	});
})