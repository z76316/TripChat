let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

let ajax = (method, src, args, callback) => {
	let req = new XMLHttpRequest();
	if(method.toLowerCase() === 'post'){ 
		// post through json args
		req.open(method, src);
		req.setRequestHeader('Content-Type', 'application/json');
		req.onload = function(){
			callback(this);
		};
		req.send(JSON.stringify(args));
	}else{ 
		// get through http args
		req.open(method, src+'?'+args);
		req.onload = function(){
			callback(this);
		};
		req.send();
	}
};

module.exports = ajax;