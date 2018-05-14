// Sets up the configuration
require('./../config/config.js');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./../db/mongoose');
const {User} = require('./../models/user');
const {Quiz} = require('./../models/quiz');

const {isLoggedIn, validateQuizSubmission} =
require('./../middleware/middleware');

const ostUser = require('./../client/ost-user');
const ostTransactions = require('./../client/ost-transaction');

const {quizData} = require('./../data/quizzes/first_quiz');

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
    // console.log("Error", e);
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
    res.status(400).send();
  });
})

// GET /users/me - Private route used for getting user information
app.get('/users/profile', isLoggedIn, (req, res) => {
  var user = req.user;
  res.send({
    user,
    quiz: {
      id: 1,
      title: "Blockchain Sample Quiz",
      participation_fee: 10,
      reward_amount: 100,
      percentage_rewarded: 0.25
    }
  });
})

// DELETE /users/logout - Used for log out
app.delete('/users/logout', isLoggedIn, (req, res) => {
  req.user.removeToken(req.token).then((user) => {
    res.status(200).send();
  }).catch((e) => {
    res.status(401).send();
  })
})

// GET /quiz - Getting a Quiz
app.get('/quiz', isLoggedIn, (req, res) => {
  var user = req.user;
  if(!user.ost_details) { return res.status(400).send(); }
  ostTransactions.executeCompetitionStake(user.ost_details.uuid).then(() => {
    res.status(200).send(quizData);
  }).catch((e) => {
    res.status(400).send({message: "Unable to stake. Check token balance."});
  });
});

app.post('/quiz', isLoggedIn, validateQuizSubmission, (req, res) => {
  var user = req.user;
  var quiz = req.quiz;
  Quiz.computeScore(quiz._id, quiz.answers).then((score) => {
    return User.findOneAndUpdate(
      {_id: user._id},
      {quiz_id: quiz._id, quiz_score: score},
      {new: true})
  }).then((user) => {
    res.status(200).send();
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Started listening on port ${port}`);
})

module.exports = {app}
