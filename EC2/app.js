const express = require("express");
const bodyParser = require("body-parser");
const app = express(); // 產生 express application 物件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路徑開頭若為 "/exe/" , server 端就允許這個 cross domain control 的行為
app.use("/exe/", function(req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.set("Access-Control-Allow-Credentials", "true");
    next();
});

// Utility
const request = require("request");

// Test
app.get('/exe/test',function(req, res) {
	let data = 'Testing';
	res.send({ data: data });
});

var port = 9000;
app.listen(port, function() {
	console.log('Server is running on port', port);
});