const express = require("express");
const bodyParser = require("body-parser");
const app = express(); // 產生 express application 物件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// socket.io
const socket = require('socket.io');

// Utility
const request = require("request");

// mysql
const mysql = require('mysql');

// MySQL command
const SELECT_ALL_test_tbl_QUERY = 'SELECT * FROM test_tbl';

// connnect mysql
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'ec2server',
	database: 'TEST1',
	insecureAuthL: true
});

connection.connect(err => {
	if(err) {
		return err;
	}
});

connection.query(SELECT_ALL_test_tbl_QUERY, (err, results) => {
	if(err) {
			console.log(err);
		} else {
			console.log({
				data: results
			});
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
			return res.send(err);
		} else {
			return res.json({
				data: results
			});
		}
	});
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