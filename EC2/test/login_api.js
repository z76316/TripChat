let ajax = require('./ajax.js');
// let Server_ip = 'http://52.89.137.222:9000';
let Server_ip = 'https://waitforit.tw';

let login_api = (login_data, callback) => {
    ajax('post', Server_ip+'/exe/accounts/login', login_data, (req) => {
        let result=JSON.parse(req.responseText);
        // console.log(result);
        if(result.err) {
            callback(result.err);
        } else {
            callback(result.message);
        }
    });
}

module.exports = login_api;
