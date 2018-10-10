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

// 寄信 nodemailer
// let nodemailer = require('nodemailer');

// mysql
const mysql = require('mysql');

// connnect mysql
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'ec2server',
	database: 'TripChat',
	insecureAuthL: true
});

db.connect(err => {
	if(err) {
		return err;
	}
});

// App setup
let port = 9000;
let server = app.listen(port, function() {
	console.log('Server is running on port', port);
});

// 路徑開頭若為 "/exe/" , server 端就允許這個 cross domain control 的行為
app.use("/exe/", function(req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.set("Access-Control-Allow-Credentials", "true");
    next();
});

// Static files
app.use(express.static('../dist'));

// API Test
app.get('/exe/test',function(req, res) {
	let data = 'Testing';
	res.send({ data: data });
});

// MySQL API
app.get('/exe/mysql/test_tbl', function(req, res) {
	db.query(SELECT_ALL_test_tbl_QUERY, (err, results) => {
		if(err) {
			res.send(err);
		} else {
			res.json({
				data: results
			});
		}
	});
});


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

		console.log(`id = ${account_id}, name = ${name}, email = ${email}, isLogin = ${isLogin}`);
		console.log(sess);

	} else {
		// signup then link to profile page
		let checkAccount = 
			`SELECT * FROM accounts
			WHERE 
			account_email = '${email}' AND
			provider = '${provider}'`;
		console.log(checkAccount);
		db.query(checkAccount, (err, account) => {
			console.log(account);
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
				console.log(req.session);
				res.send({
					account_id: account_id,
					name: name,
					email: email,
					isLogin: isLogin
				});
				
				console.log(`id = ${account_id}, name = ${name}, email = ${email}, isLogin = ${isLogin}`);
				console.log(sess);

			}
		});
	}	
});

app.get('/exe/gettriplist', function(req,res) {
	let sess = req.session;
	let account_id = sess.account_id;
	let getTripList = 
		`SELECT * FROM trip_to_account
		WHERE 
		account_id = '${account_id}'`;
	db.query(getTripList, (err, list) => {
		if(err) {
			res.send( {err: 'Something went wrong during join: ' + err} );
		} else {
			let trip_list = [];
			for(let i = 0; i < list.length; i++) {
				console.log(list[i]);
				trip_list.push(list[i]);
			}
			res.send(
				trip_list
			);

		}
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
	console.log(checkAccount);
	db.query(checkAccount, (err, account) => {
		console.log(account);
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
			console.log('id在這裡啦' + account[0].account_id);
			console.log(account[0].account_name);
			console.log(account[0].account_email);
			console.log(account[0].provider);
			req.session.account_id = account[0].account_id;
			req.session.name = account[0].account_name;
			req.session.email = account[0].account_email;
			req.session.provider = account[0].provider;
			req.session.isLogin = true;
			console.log(req.session);
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
		db.query(isExistAccount, (err, account) => {
			if(err) {
				res.send( {err: 'Something went wrong during check this email is exist: ' + err} );
			} else if(account.length !== 0) {
				res.send( {err: '此信箱已被註冊。'} );
			} else {
				db.query(INSERT_INTO_accounts, (err, results) => {
				if(err) {
					res.send({err: 'Something went wrong during add this account into database: ' + err});
				} else {
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
				}
			});
			}
		});

  //宣告發信物件
  // let transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //         user: 'stylish.tmjs@gmail.com',
  //         pass: 'connectme'
  //     }
  // });

  // let TripChatURL = 'http://52.89.137.222:9000';
  // let options = {
  //     //寄件者
  //     from: 'stylish.tmjs@gmail.com',
  //     //收件者
  //     to: data.email,
  //     //主旨
  //     subject: '您剛剛在 TripChat 註冊了帳號 !', // Subject line
  //     //純文字
  //     text: '您剛剛在 TripChat 註冊了帳號 !', // plaintext body
  //     //嵌入 html 的內文
  //     html: `<h2>${data.name}您好，感謝您購買 STYLiSH 的商品！</h2> <p>由此開始使用 TripChat 與朋友一起規劃旅程：${TripChatURL}</p>`
  //     //附件檔案
  //     // attachments: [{
  //     //     filename: 'text01.txt',
  //     //     content: '睡飽飽吃好好！'
  //     // }]
  // };
});

// Socket setup
let io = socket(server);

io.on('connection', function(socket) {
	console.log('made socket connection', socket.id);
	
	socket.on('chat', function(data) {
		io.sockets.emit('chat', data);
	});

	socket.on('typing', function(typingState) {
		socket.broadcast.emit('typing', typingState);
	});
})