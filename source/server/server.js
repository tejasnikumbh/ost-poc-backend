// Sets up the configuration
require('./../config/config.js');

const constants = require('./../utils/constants');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./../db/mongoose');
const {User} = require('./../models/user');
const {Question} = require('./../models/question');
const {Quiz} = require('./../models/quiz');

const {isLoggedIn, validateQuizSubmission} =
require('./../middleware/middleware');

const ostUser = require('./../client/ost-user');
const ostTransactions = require('./../client/ost-transaction');

const {quizData, fetchQuiz} = require('./../data/quizzes/first_quiz');
const {computeScore} = require('./../algorithm/scoring');
const app = express();

const port = process.env.PORT;

// Add headers for access control. Middleware
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'x-auth, content-type');
    res.setHeader('Access-Control-Allow-Credentials', true); // for future cookies
    res.setHeader('Access-Control-Expose-Headers', 'x-auth');
    next();
});

// Express middleware to convert request body to json
app.use(bodyParser.json());

// POST /users/signup - Used for signups
app.post('/users/signup', (req, res) => {
  var body = _.pick(req.body, ['name', 'email', 'password']);
  var user = new User(body);
  user.save().then(() => {
    return ostUser.createOSTUser(user._id);
  }).then((updatedUserWithOSTDetails) => {
    user = updatedUserWithOSTDetails
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    console.log(e);
    res.status(400).send();
  });
})

// POST /users/login - Used for login
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    console.log(e);
    res.status(400).send();
  });
})

// POST /users/request_tokens - Used for requesting Tokens
app.post('/users/request_tokens', isLoggedIn, (req, res) => {
  var user = req.user;
  if(true) { // logic for executing grant
    user.ost_details.token_balance += constants.requestGrantTransaction.value;
    ostTransactions.executeRequestGrant(user.ost_details.uuid).then(()=>{
      return user.save();
    }).then((newUser) => {
      res.status(200).send(newUser);
    }).catch((e) => {
      console.log(e);
      res.status(400).send(e);
    });
  }
});

// GET /users/me - Private route used for getting user information
app.get('/users/profile', isLoggedIn, (req, res) => {
  var user = req.user;
  fetchQuiz().then((quiz) => {
    res.send({
      user,
      quiz: quiz.getMetaData()
    });
  }).catch((e) => {
    console.log(e);
    res.status(400).send(e);
  });
})

// DELETE /users/logout - Used for log out
app.delete('/users/logout', isLoggedIn, (req, res) => {
  req.user.removeToken(req.token).then((user) => {
    res.status(200).send();
  }).catch((e) => {
    console.log(e);
    res.status(401).send();
  })
})

// GET /quiz - Getting a Quiz
app.get('/quiz/:id', isLoggedIn, (req, res) => {
  var user = req.user;
  var quizId = req.params.id;
  if(!user.ost_details) { return res.status(400).send(); }
  ostTransactions.executeCompetitionStake(user.ost_details.uuid)
  .then(() => {
    return Quiz.findById(quizId);
  }).then((quiz) => {
    res.status(200).send(quiz);
  }).catch((e) => {
    console.log(e);
    res.status(400).send({message: "Unable to stake. Check token balance."});
  });
});

app.post('/quiz/:id', isLoggedIn, validateQuizSubmission, (req, res) => {
  var user = req.user;
  var quiz = req.quiz;
  //var quizId = req.query.id;
  computeScore(quiz._id, quiz.answers)
  .then((score) => {
    return user.updateScore(quiz._id, score);
  }).then(() => {
    return ostTransactions.executeCompetitionReward(user.ost_details.uuid);
  }).then((user) => {
    console.log(user);
    res.status(200).send(user);
  }).catch((e) => {
    console.log(e);
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Started listening on port ${port}`);
})

module.exports = {app}
