const should = require('should');
const request = require('supertest');
const app = require('../app.js');

let Cookies;

describe('# Test check login state api', () => {
    // login
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

    // check login state
    it('GET /exe/checkloginstate', function (done) {
        let req = request(app).get('/exe/checkloginstate');
        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end( (err, res) => {
            res.body.email.should.equal('z7631614@gmail.com');
            res.body.account_id.should.equal(1);
            done();
        });
    });
})