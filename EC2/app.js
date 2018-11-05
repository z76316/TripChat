const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// require dao object
const dao = require('./dao.js');

// mysql createConnection
dao.db;

// console log err during connecting with mysql
dao.connect;

// redis
const redis = require('redis');
const client = redis.createClient({
	host: 'redis'
});

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

// HTTPS
let fs = require('fs');
let https = require('https');
let credentials = {
	key: fs.readFileSync('./for_HTTPS/privkey.pem'),
	cert: fs.readFileSync('./for_HTTPS/cert.pem'),
	ca: fs.readFileSync('./for_HTTPS/chain.pem')
};
let httpsServer = https.createServer(credentials, app);
let port = 9000;
httpsServer.listen(port, function() {
	console.log('Server is running on port', port);
});

// App setup
// let port = 9000;
// let server = app.listen(port, function() {
// 	console.log('Server is running on port', port);
// });

// "/exe/": allow cross domain control
app.use("/exe/", function(req, res, next) {
    res.set("Access-Control-Allow-Origin", "http://waitforit.tw:9000");
    res.set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.set("Access-Control-Allow-Credentials", "true");
    next();
});

// Static files
app.use(express.static('../dist'));

// TripChat API
app.get('/exe/accounts/loginstate', function (req, res) {
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
	} else {
		let input = {
			email: email,
			provider: provider
		};
		dao.accounts.checkAccount('isAccountExist', input, (result) => {
			if(result.err) {
				res.send({err: result.err});
			} else {
				req.session.regenerate(function(err) {
					if(err) {
						res.send({err: 'Something went wrong during regenerate session: ' + err});
						return;
					}
				});
				req.session.account_id = result.account[0].account_id;
				let account_id = result.account[0].account_id;

				res.send({
					account_id: account_id,
					name: name,
					email: email,
					isLogin: isLogin
				});
			}
		});
	}	
});

app.post('/exe/accounts/login', (req, res) => {
	let data = req.body;
	if (!data.email || !data.password) {
		res.send({ error: "Login Error: Wrong Data Format" });
		return;
	}

	let input = {
		email: data.email,
		password: data.password,
		provider: data.provider
	};
	dao.accounts.checkAccount('login', input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}

		req.session.regenerate(function(err) {
			if(err) {
				res.send({err: 'Something went wrong during regenerate session: ' + err});
				return;
			}
		});
		req.session.account_id = result.account[0].account_id;
		req.session.name = result.account[0].account_name;
		req.session.email = result.account[0].account_email;
		req.session.provider = result.account[0].provider;
		req.session.isLogin = true;
		res.send({
			message: `${result.account[0].account_name}，歡迎回來!`
		});
	});
});

app.post('/exe/accounts/signup', (req, res) => {
	let data = req.body;
	if (!data.name || !data.email || !data.password) {
		res.send({ error: "Signup Error: Wrong Data Format" });
		return;
	}

	let input = {
		name: data.name,
		email: data.email,
		password: data.password,
		provider: data.provider
	};	
	dao.accounts.signup(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}
		req.session.regenerate(function(err) {
			if(err) {
				res.send({err: 'Something went wrong during regenerate session: ' + err});
				return;
			}
		});
		req.session.name = data.name;
		req.session.email = data.email;
		req.session.provider = data.provider;
		req.session.isLogin = true;
		res.send({message: '您已成功註冊帳戶!'});
	});	
});

app.get('/exe/accounts/logout', function(req, res) {
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
	let update_data = {
		account_name: new_name
	};

	// send original account name back when input is empty
	if(new_name.length < 1) {
		res.send({name: sess.name});
		return;
	}

	let input = {
		update_data: update_data,
		account_id: account_id
	};
	dao.accounts.editName(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}
		req.session.regenerate(function(err) {
			if(err) {
				res.send({err: 'Something went wrong during regenerate session: ' + err});
				return;
			}
		});
		req.session.name = new_name;
		res.send({
			name: req.session.name
		});
	});

});

app.get('/exe/trips/gettriplist', function(req,res) {
	let sess = req.session;
	let account_id = sess.account_id;
	client.get(`trip_list${account_id}`, (err, lists) => {
		if(err){
			res.send({err: '系統忙碌中，請稍候再試。'});
			console.log(err);
		} else if (lists) {
			let trip_list = JSON.parse(lists);
			res.send(trip_list);
			console.log('It is cache!');
		} else {
			let input = {account_id: account_id};
			dao.trips.getTripList(input, (result) => {
				if(result.err) {
					res.send({err: result.err});
					return;
				}
				let trip_list = [];
					for(let i = 0; i < result.list.length; i++) {
						trip_list.push(result.list[i]);
					}
					let trip_list_JSON = JSON.stringify(trip_list);
					client.set(`trip_list${account_id}`, trip_list_JSON);
					res.send(
						trip_list
					);
					console.log('database 少使用，多休息');
			});
		}
	});
});

app.post('/exe/trips/gettripmember', function(req,res) {
	let data = req.body;
	let trip_id = data.trip_id;
	client.get(`member_list${trip_id}`, (err, lists) => {
		if(err){
			res.send({err: '系統忙碌中，請稍候再試。'});
			console.log(err);
		} else if (lists) {
			let member_list = JSON.parse(lists);
			res.send(member_list);
			console.log('It is cache!');
		} else {
			let input = {trip_id: trip_id};
			dao.trips.getTripMember(input, (result) => {
				if(result.err) {
					res.send({err: result.err});
					return;
				}
				let member_list = [];
				for(let i = 0; i < result.list.length; i++) {
					member_list.push(result.list[i]);
				}
				let member_list_JSON = JSON.stringify(member_list);
				client.set(`member_list${trip_id}`, member_list_JSON);
				res.send(
					member_list
				);
				console.log('database 少使用，多休息');
			});
		}
	});
});

app.post('/exe/trips/createnewtrip', function(req,res) {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_title = data.tripTitle;
	let trip_date = data.tripDate;
	let trip_location = data.tripLocation;
	let input = {
		account_id: account_id,
		trip_title: trip_title,
		trip_date: trip_date,
		trip_location: trip_location
	};
	dao.trips.createNewTrip(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}
		res.send(result);

		// update => clear out trip_list${account_id} cache
		client.del(`trip_list${account_id}`);
		console.log('created a new trip then cleared out the cache of trip_list${account_id}');
	});

});

app.post('/exe/trips/getTripData', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	let input = {
		account_id: account_id,
		trip_id: trip_id
	};
	dao.trips.getTripData(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		} else if(result.notTripMember) {
			res.send({notTripMember: result.notTripMember});
			return;
		}
		let markers = [];
		let marker;
		for(let i = 0; i < result.markersData.length; i++) {
			marker = {
				marker_id: result.markersData[i].marker_id,
				location: {
					lat: result.markersData[i].lat,
					lng: result.markersData[i].lng
				},
				content: result.markersData[i].content
			};
			markers.push(marker);
		}
		res.send({
			trip_title: result.data[0].trip_title,
			trip_date: result.data[0].trip_date,
			trip_location: result.data[0].trip_location,
			markers: markers
		});
	});
});

app.post('/exe/trips/addmarker', (req, res) => {
	let data = req.body;
	let trip_id = data.trip_id;
	let lat = data.lat;
	let lng = data.lng;
	let content = data.content;
	let input = {
		trip_id: trip_id,
		lat: lat,
		lng: lng,
		content: content
	};
	dao.trips.addMarker(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}
		res.send({
			marker_id: result.marker_id,
			location: {
				lat: lat,
				lng: lng
			},
			content: content
		});
	});
});

app.post('/exe/trips/editmarker', (req, res) => {
	let data = req.body;
	let marker_id = data.marker_id;
	let content = data.content;
	let update_data = {
		content: content
	};
	let input = {
		marker_id: marker_id,
		update_data: update_data
	};
	dao.trips.editMarker(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}
		res.send({
			message: `Content of the marker id = ${marker_id} is updated.`
		});
	});
});

app.post('/exe/trips/deletemarker', (req, res) => {
	let data = req.body;
	let marker_id = data.marker_id;
	let input = {marker_id: marker_id};
	dao.trips.deleteMarker(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}
		res.send({message: `刪除成功。`});
	});
});

app.post('/exe/trips/edittitle', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	let new_title = data.new_title;
	let old_title = data.old_title;

	if(new_title.length < 1) {
		res.send({title: old_title});
		return;
	}
	
	let update_data = {
		trip_title: new_title
	};
	let input = {
		trip_id: trip_id,
		update_data: update_data
	};
	dao.trips.editTripInfo(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}
		res.send({
			title: new_title
		});

		// update => clear out trip_list${account_id} cache
		client.del(`trip_list${account_id}`);
		console.log('新增了 trip, 所以清空 trip_list${account_id} 的 cache');
	});
});

app.post('/exe/trips/editdate', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	let new_date = data.new_date;
	let old_date = data.old_date;
	
	if(new_date.length < 1) {
		res.send({date: old_date});
		return;
	}

	let update_data = {
		trip_date: new_date
	};
	let input = {
		trip_id: trip_id,
		update_data: update_data
	};
	dao.trips.editTripInfo(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}
		res.send({
			date: new_date
		});

		// update => clear out trip_list${account_id} cache
		client.del(`trip_list${account_id}`);
		console.log('新增了 trip, 所以清空 trip_list${account_id} 的 cache');
	});
});

app.post('/exe/trips/editlocation', (req, res) => {
	let sess = req.session;
	let account_id = sess.account_id;
	let data = req.body;
	let trip_id = data.trip_id;
	let new_location = data.new_location;
	let old_location = data.old_location;

	if(new_location.length < 1) {
		res.send({location: old_location});
		return;
	}

	let update_data = {
		trip_location: new_location
	};
	let input = {
		trip_id: trip_id,
		update_data: update_data
	};
	dao.trips.editTripInfo(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}
		res.send({
			location: new_location
		});

		// update => clear out trip_list${account_id} cache
		client.del(`trip_list${account_id}`);
		console.log('新增了 trip, 所以清空 trip_list${account_id} 的 cache');
	});
});

app.post('/exe/trips/addnewmember', (req, res) => {
	let data = req.body;
	let trip_id = data.trip_id;
	let member_email = data.member_email;
	
	let input = {
		trip_id: trip_id,
		member_email: member_email
	};
	dao.trips.addNewMember(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}
		res.send({
			message: `${result.member_name}(${member_email}) 已成為旅程夥伴。`
		});
		// update => clear out member_list${trip_id} cache
		client.del(`member_list${trip_id}`);
		console.log('新增了 member, 所以清空 member_list${trip_id} 的 cache');
	
		// update => clear out trip_list${account_id} cache
		client.del(`trip_list${result.member_id}`);
		console.log('新增了 member, 所以清空 trip_list${account_id} 的 cache');
	});

});


// Save messages into SQL
app.post('/exe/trips/savemessage', (req, res) => {
	let data = req.body;
	let trip_id = data.trip_id;
	let show_name = data.show_name;
	let account_email = data.account_email;
	let message = data.message;
	
	let input = {
		trip_id: trip_id,
		show_name: show_name,
		account_email: account_email,
		message: message
	};
	dao.trips.saveMessage(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		}
		res.send({
			message_id: result.message_id,
			done_message: '訊息已儲存。'
		});
	});
});

// Get chat logs
app.post('/exe/trips/getchatlogs', (req, res) => {
	let data = req.body;
	let trip_id = data.trip_id;

	let input = {trip_id: trip_id};
	dao.trips.getChatLogs(input, (result) => {
		if(result.err) {
			res.send({err: result.err});
			return;
		} else if(result.no_chat_log) {
			res.send({no_chat_log: result.no_chat_log});
			return;
		}
		let message;
		let chat_logs = [];
		for(let i = 0; i < result.messages.length; i++) {
			message = {
				who: result.messages[i].show_name,
				email: result.messages[i].account_email,
				content: result.messages[i].message
			};
			chat_logs.push(message);
		}
		res.send({
			chat_logs: chat_logs
		});
	});
});

// for unit tests of APIs
module.exports = app;


// Socket setup
let io = socket(httpsServer);

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