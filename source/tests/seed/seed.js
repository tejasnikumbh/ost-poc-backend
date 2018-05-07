const {ObjectID} = require('mongodb');
const {User} = require('./../../models/user');
const {Quiz} = require('./../../models/quiz');
const {Question} = require('./../../models/question');
const {authSecret} = require('./../../keys/keys');
const ostUser = require('./../../client/ost-user');
const jwt = require('jsonwebtoken');

const userOneObject = new ObjectID();
const userTwoObject = new ObjectID();

const quizObject = new ObjectID();

const users = [{
  _id: userOneObject,
  name: "Zinga lala",
  age: 25,
  email: "zingolah@gmail.com",
  password: "userOnePass",
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneObject, access: 'auth'}, authSecret)
  }],
  ost_details : {
      "ost_id" : "6eb6fdec-4665-41b4-836f-a5344fb52595",
      "uuid" : "6eb6fdec-4665-41b4-836f-a5344fb52595"
  }
},{
  _id: userTwoObject,
  name: "Tejas Chaudhari",
  age: 26,
  email: "tejastalk@gmail.com",
  password: "userTwoPass",
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoObject, access: 'auth'}, authSecret)
  }],
  ost_details : {
      "ost_id" : "6af409c1-8811-4a19-b53e-974c662aa7f8",
      "uuid" : "6af409c1-8811-4a19-b53e-974c662aa7f8",
  }
}];

const quiz = {
  _id: quizObject,
  questions: [
    new Question({
      title: "What is 2 + 2?",
      choices: [
        "1", "2", "3", "4"
      ],
      correct_choice: 4
    }),
    new Question({
      title: "What is 1 + 2?",
      choices: [
        "3", "2", "1", "4"
      ],
      correct_choice: 1
    })
  ]
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    return User.find({});
  }).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();
    return Promise.all([userOne, userTwo]);
  }).then(() => {
    var ostUserOne = ostUser.editOSTUser(users[0]._id, users[0].name);
    var ostUserTwo = ostUser.editOSTUser(users[1]._id, users[1].name);
    return Promise.all([ostUserOne, ostUserTwo]);
  }).then(() => done())
  .catch((e) => done(e));
};

const populateQuiz = (done) => {
  Quiz.remove({}).then(() => {
      return new Quiz(quiz).save();
  }).then(() => done())
  .catch((e) => done(e));
};

module.exports = {users, populateUsers, quiz, populateQuiz};
