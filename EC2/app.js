const express = require("express");
const bodyParser = require("body-parser");
const app = express(); // 產生 express application 物件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// socket.io
const socket = require('socket.io');

// Utility
const request = require("request");

// 寄信 nodemailer
// let nodemailer = require('nodemailer');

// mysql
const mysql = require('mysql');

// MySQL command
const SELECT_ALL_test_tbl_QUERY = 'SELECT * FROM test_tbl';

// connnect mysql
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'ec2server',
	database: 'TripChat',
	insecureAuthL: true
});

connection.connect(err => {
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
	connection.query(SELECT_ALL_test_tbl_QUERY, (err, results) => {
		if(err) {
			res.send(err);
		} else {
			res.json({
				data: results
			});
		}
	});
});

app.post('/exe/accounts/signup', (req, res) => {
  let data = req.body;
  if (!data.name || !data.email || !data.password) {
      res.send({ error: "Signup Error: Wrong Data Format" });
      return;
  }

  let name = data.name;
  let email = data.email;
  let password = data.password;
  let isExistAccount = 
  	`SELECT * FROM accounts
  	WHERE account_email = '${email}'`;
  let INSERT_INTO_accounts = 
  	`INSERT INTO accounts (account_name, account_email, account_password, create_date) 
  	VALUES 
  	('${name}', '${email}', '${password}', CURDATE())`;
	connection.query(isExistAccount, (err, account) => {
		if(err) {
			res.send( {err: 'Something went wrong during check this email is exist: ' + err} );
		} else if(account.length !== 0) {
			res.send( {err: 'This email has been used.'} );
		} else {
			connection.query(INSERT_INTO_accounts, (err, results) => {
		  	if(err) {
		  		res.send({err: 'Something went wrong during add this account into database: ' + err});
		  	} else {
		  		res.send({message: 'Successfully created a account!'});
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