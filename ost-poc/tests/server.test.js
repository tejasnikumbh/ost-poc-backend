// Setting the environment to test
const {app} = require('./../server/server');
const {User} = require('./../models/user');
const {users, populateUsers} = require('./seed/seed-data');

// Mocha is a framework so no need to require
// Assertions library useful for managing expectations and assertions
const {expect, assert, should } = require('chai');
// Useful for testing http requests
const request = require('supertest');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

// Setting up before running each it block
beforeEach(populateUsers);

describe('POST /users/signup', () => {
  it('should create a new user', (done) => {
    var body = _.pick(users[0], ['name', 'age', 'email', 'password']);
    body.name = "SomeName";
    body.email = "sampleEmail1@example.com"; //since it is unique
    request(app)
    .post('/users/signup')
    .send(body)
    .expect(200)
    .expect((res) => {
      // Expect things in response
      expect(res.headers['x-auth']).to.not.be.null;
      expect(res.body._id).to.not.be.null;
      expect(res.body.name).to.be.equal(body.name);
      expect(res.body.email).to.be.equal(body.email);
    })
    .end((err, res) => {
      if(err) { return done(err); }

      // Find by email since email is unique
      var email = body.email;
      User.findOne({email}).then((user) => {
        expect(user).to.not.be.null;
        expect(user.password).to.not.equal(body.password);
        return done();
      });
    });
  });

  // Test with wrong email or password format
  it('should not create a user with invalid credentials', (done) => {
    var body = _.pick(users[0], ['name', 'age', 'email', 'password',
    'uuid', 'token_balance', 'total_airdropped_tokens']);
    body.uuid = "SomeUUIDThird";
    body.email = "sampleEmail2@example.com"; //since it is unique
    body.password = "wrong";
    request(app)
    .post('/users/signup')
    .send(body)
    .expect(400)
    .expect((res) => {
      expect(res.body).to.be.empty;
    })
    .end(done);
  });

  it('should not create a user if email already exists', (done) => {
    var body = _.pick(users[0], ['name', 'age', 'email', 'password',
    'uuid', 'token_balance', 'total_airdropped_tokens']);
    body.uuid = "SomeUUIDThird"; //unique uuid so check only for email
    request(app)
    .post('/users/signup')
    .send(body)
    .expect(400)
    .expect((res) => {
      expect(res.body).to.be.empty;
    })
    .end(done);
  });

});

describe('POST /users/login', () => {
  it('should return user if credentials are valid', (done) => {
    request(app)
    .post('/users/login')
    .send({email: users[1].email, password: users[1].password})
    .expect(200)
    .expect((res) => {
      expect(res.headers['x-auth']).to.not.be.null;
      expect(res.body._id).to.not.be.null;
      expect(res.body._id).to.equal(users[1]._id.toHexString());
      expect(res.body.name).to.be.equal(users[1].name);
      expect(res.body.email).to.be.equal(users[1].email);
      expect(res.body.age).to.be.equal(users[1].age);
    })
    .end(done)
  });

  it('should return 400 if credentials not valid', (done) => {
    request(app)
    .post('/users/login')
    .send({email: users[1].email, password: "invalid"})
    .expect(400)
    .expect((res) => {
      expect(res.body).to.be.empty;
    })
    .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if auth is valid', (done) => {
    request(app)
    .get('/users/me')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body._id).to.not.be.null;
      expect(res.body._id).to.equal(users[0]._id.toHexString());
      expect(res.body.name).to.be.equal(users[0].name);
      expect(res.body.email).to.be.equal(users[0].email);
      expect(res.body.age).to.be.equal(users[0].age);
    })
    .end(done)
  });

  it('should return 401 if auth token not valid', (done) => {
    request(app)
    .get('/users/me')
    .set('x-auth', 'gibberish')
    .expect(401)
    .expect((res) => {
      expect(res.body).to.be.empty;
    })
    .end(done);
  });
});


describe('DELETE /users/me/token', () => {
  it('should delete the token for logout', (done) => {
    request(app)
    .delete('/users/me/token')
    .set('x-auth', users[0].tokens[0].token)
    .send()
    .expect(200)
    .end((err, res) => {
      User.findById(users[0]._id).then((user) => {
        expect(user.tokens).to.be.empty;
        done();
      }).catch((e) => done(e));
    });
  });
});
