const should = require('should');
const request = require('supertest');
const app = require('../app.js');
const login_api = require('./login_api.js');

let Cookies;

describe('#login then get trip list', () => {
    // 從 client 端測試 login api
    // it('should return message', done => {
    //     let login_data = {
    //         email: 'z7631614@gmail.com',
    //         password: 'ec2server',
    //         provider: 'email'
    //     };
    //     login_api(login_data, (result) => {
    //         result.should.equal('Scott，歡迎回來!');
    //         done();
    //     });
    // })

    // login 失敗
    it('account password is wrong', function (done) {
        request(app)
            .post('/exe/accounts/login')
            .set('Accept','application/json')
            .send({"email": "z7631614@gmail.com", "password": "1qaz2wsx", provider: "email"})
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end( (err, res) => {
                res.body.err.should.equal('帳號或密碼輸入錯誤。');
                done();
        });
    });

    // 從 server 端測試 login api
    it('POST /exe/accounts/login', function (done) {
        request(app)
            .post('/exe/accounts/login')
            .set('Accept','application/json')
            .send({"email": "z7631614@gmail.com", "password": "ec2server", provider: "email"})
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end( (err, res) => {
                res.body.message.should.equal('Scott，歡迎回來!');
                // Save the cookie to use it later to retrieve the session
                Cookies = res.header['set-cookie'];
                done();
        });
    });

    // 登入後 get trip list
    it('GET /exe/trips/gettriplist', function (done) {
        let req = request(app).get('/exe/gettriplist');
        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end( (err, res) => {
            res.body[0].trip_title.should.equal('清水斷崖獨木舟');
            res.body[0].trip_id.should.equal(1);
            done();
        });
    });
})