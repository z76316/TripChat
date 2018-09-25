var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 路徑開頭若為 "/exe/" , server 端就允許這個 cross domain control 的行為
router.use("/exe/", function(req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.set("Access-Control-Allow-Credentials", "true");
    next();
});

// Utility
const request = require("request");

// Test
router.get('/exe/test',function(req, res) {
	let data = 'Testing';
	res.send({ data: data });
});

module.exports = router;
