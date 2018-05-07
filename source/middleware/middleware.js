const {ObjectID} = require('mongodb');

const {User} = require('./../models/user');
const {Quiz} = require('./../models/quiz');

const isLoggedIn = (req, res, next) => {
  var token = req.header('x-auth');
  User.findByToken(token).then((user) => {
    if(!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send(e);
  });
};

const hasPaidParticipationFee = (req, res, next) => {
//   var quizToken = req.header('x-auth-quiz');
//   User.findByQuizToken(req.token).then((user) => {
//     if(!user) {
//       return Promise.reject();
//     }
//     req.user = user;
//     req.token = token;
//     next();
//   }).catch((e) => {
//     res.status(401).send(e);
//   });
  next();
}

const validateQuizSubmission = (req, res, next) => {
  if(!req.body._id || !req.body.answers) {
    return res.status(400).send();
  }
  // Each answer should only be [0,3] closed range
  // This is because there are only 4 choices for any question
  req.body.answers.map((ans) => {
    if(ans < 0 || ans > 3) {
      return res.status(400).send();
    }
  });

  var id = new ObjectID(req.body._id);
  Quiz.findById(id).then((quiz) => {
    if(quiz.questions.length !== req.body.answers.length) {
      return Promise.reject();
    }
    req.quiz = {
      _id: id,
      answers: req.body.answers
    }
    next();
  }).catch((e) => {
    res.status(400).send();
  });
};

module.exports = {isLoggedIn, hasPaidParticipationFee, validateQuizSubmission};
