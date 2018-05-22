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

const {isLoggedIn, validateIfQuizAlreadyTaken, validateQuizSubmission} =
require('./../middleware/middleware');

const ostUser = require('./../client/ost-user');
const ostTransactions = require('./../client/ost-transaction');

const {quizData, fetchQuiz} = require('./../data/quizzes/first_quiz');
const {computeScore} = require('./../algorithm/scoring');
const app = express();

const port = process.env.PORT;

// Add headers for access control. Middleware
app.use(function (req, res, next) {
    const allowedOrigins = [
    'http://ost-alpha-frontend.herokuapp.com',
    'https://ost-alpha-frontend.herokuapp.com',
    'http://localhost:8080'];
    const origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
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
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);
  var i = body.email.indexOf("@")
  user.name = body.email.slice(0,i);
  user.save().then(() => {
    return ostUser.createOSTUser(user._id);
  }).then((updatedUserWithOSTDetails) => {
    user = updatedUserWithOSTDetails
    return user.generateAuthToken();
  }).then((token) => {
    // console.log('New user created...');
    // console.log(user);
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
      // console.log('Logged in user details...');
      // console.log(user);
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
  var fetchedUser = null;
  ostUser.getOSTUser(user._id).then((u) => {
    fetchedUser = u;
    return fetchQuiz();
  }).then((quiz) => {
    res.send({
      user: fetchedUser,
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

app.post('/quiz/:id',
isLoggedIn,
validateIfQuizAlreadyTaken,
validateQuizSubmission, (req, res) => {
  var user = req.user;
  var quiz = req.quiz;
  var userScore = 0;
  //var quizId = req.query.id;
  computeScore(quiz._id, quiz.answers)
  .then((score) => {
    // console.log(score);
    userScore = score;
    return user.updateScore(quiz._id, score);
  }).then((updatedUser) => {
    // console.log(updatedUser);
    const currentQuiz = updatedUser.performance.quizzes.filter((object) => {
      return object._id == quiz._id;
    })[0];
    return ostTransactions.executeCompetitionReward(
      updatedUser.ost_details.uuid, currentQuiz.earning);
  }).then(() => {
    const currentQuiz = user.performance.quizzes.filter((object) => {
      return object._id == quiz._id;
    })[0];
    res.status(200).send({
      message:"Succesfully submitted quiz",
      quiz: currentQuiz,
      alreadyTaken: false
    });
  }).catch((e) => {
    console.log(e);
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Started listening on port ${port}`);
})

module.exports = {app}
