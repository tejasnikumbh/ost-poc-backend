// Setting the environment to test
const {app} = require('./../server/server');
const {User} = require('./../models/user');
const {users, populateUsers, quiz, populateQuiz} = require('./seed/seed');
// Mocha is a framework so no need to require
// Assertions library useful for managing expectations and assertions
const {expect, assert, should } = require('chai');
// Useful for testing http requests
const request = require('supertest');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

// Setting up before running each it block
beforeEach(populateUsers);
beforeEach(populateQuiz);

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
        expect(user.ost_details.uuid).to.not.be.null;
        return done();
      }).catch((e) => done(e));
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

describe('GET /users/profile', () => {
  it('should return user if auth is valid', (done) => {
    request(app)
    .get('/users/profile')
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
    .get('/users/profile')
    .set('x-auth', 'gibberish')
    .expect(401)
    .expect((res) => {
      expect(res.body).to.be.empty;
    })
    .end(done);
  });
});


describe('DELETE /users/logout', () => {
  it('should delete the token for logout', (done) => {
    request(app)
    .delete('/users/logout')
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

  it('should return 401 if token invalid', (done) => {
    request(app)
    .delete('/users/logout')
    .set('x-auth', 'gibberish')
    .send()
    .expect(401)
    .end((err, res) => {
      var promiseOne = User.findById(users[0]._id).then((user) => {
        expect(user.tokens).to.not.be.empty;
      });
      var promiseTwo = User.findById(users[1]._id).then((user) => {
        expect(user.tokens).to.not.be.empty;
      });
      Promise.all([promiseOne, promiseTwo]).then(() => {
        done();
      }).catch((e) => done(e));
    });
  });
});

describe('GET /quiz', () => {
  it('should return a valid quiz', (done) => {
    request(app)
    .get('/quiz')
    .set('x-auth', users[1].tokens[0].token)
    .send()
    .expect(200)
    .expect((res) => {
      expect(res).to.not.be.null;
      expect(res.body._id).to.not.be.null;
      expect(res.body.questions).to.not.be.empty;

      res.body.questions.map((question) => {
        expect(question.title).to.not.be.null;
        expect(question.title).to.not.be.empty;
        expect(question.choices.length).to.be.equal(4);

        question.choices.map((choice) => {
          expect(typeof choice).to.be.equal('string');
        });
      });
    }).end(done);
  });

  it('should return 400 if not enough token balance', (done) => {
    request(app)
    .get('/quiz')
    .set('x-auth', users[0].tokens[0].token)
    .send()
    .expect(400)
    .end(done);
  });

  it('should return 401 if auth not valid', (done) => {
    request(app)
    .get('/quiz')
    .set('x-auth', 'gibberish')
    .expect(401)
    .end(done);
  });
});

describe('POST /quiz', () => {
  it('should return 200 if auth valid', (done) => {
    request(app)
    .post('/quiz')
    .set('x-auth', users[0].tokens[0].token)
    .send({
      '_id': quiz._id,
      'answers': [0,1]
    })
    .expect(200)
    .end((err, res) => {
      if(err) { return done(err); }
      // Check if score stored for particular user in database
      User.findOne({_id: users[0]._id}).then((user) => {
        expect(user.quiz_score).to.not.be.null;
        expect(user.quiz_id.toHexString()).to.be.equal(quiz._id.toHexString());
        done();
      }).catch((e) => done(e));
    });
  });

  it('should return 401 if auth not valid', (done) => {
    request(app)
    .post('/quiz')
    .set('x-auth', 'gibberish')
    .send({
      '_id': quiz._id,
      'answers': [0,1]
    })
    .expect(401)
    .expect((res) => {
      expect(res.body).to.be.empty;
    })
    .end(done);
  });

  it('should return 400 if answer length or format is wrong', (done) => {
    request(app)
    .post('/quiz')
    .set('x-auth', users[0].tokens[0].token)
    .send({
      '_id': quiz._id,
      'answers': [0,1,2]
    })
    .expect(400)
    .expect((res) => {
      expect(res.body).to.be.empty;
    })
    .end((err, res) => {
      if(err) { return done(err); }
      // Changes in database - user score should not be updated
      done();
    });
  });

})
