var express = require('express');
var router = express.Router();

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

// 路徑開頭若為 "/exe/" , server 端就允許這個 cross domain control 的行為
// router.use("/exe/", function(req, res, next) {
//     res.set("Access-Control-Allow-Origin", "*");
//     res.set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
//     res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
//     res.set("Access-Control-Allow-Credentials", "true");
//     next();
// });


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Test
router.get('/exe/test',function(req, res) {
	let data = 'Testing';
	res.send({ data: data });
});

router.get('/exe/mysql/test_tbl', function(req, res) {
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

router.get('/exe/mysql/test_tbl/add', function(req, res) {
	const {test_title, test_author} = req.query;
	if(!test_title || !test_author) {
		res.send('test_title or test_author is empty');
	} else {
		const INSERT_test_tbl_QUERY = 
			`INSERT INTO test_tbl (test_title, test_author, submission_date) 
			VALUES('${test_title}', '${test_author}', CURDATE())`;
		connection.query(INSERT_test_tbl_QUERY, (err, results) => {
			if(err) {
				res.send(err);
			} else {
				res.send('Successfully added list');
			}
		});
	}
});

module.exports = router;
