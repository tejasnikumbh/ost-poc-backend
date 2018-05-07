const {ObjectID} = require('mongodb');
const {User} = require('./../../models/user');
const {Quiz} = require('./../../models/quiz');
const {Question} = require('./../../models/question');
const {authSecret} = require('./../../keys/keys');
const jwt = require('jsonwebtoken');

const userOneObject = new ObjectID();
const userTwoObject = new ObjectID();

const quizObject = new ObjectID();

const users = [{
  _id: userOneObject,
  ost_id: "SomeIDFirst",
  uuid: "SomeUUIDFirst",
  total_airdropped_tokens: 0,
  token_balance: 0,
  name: "Tejas Nikumbh",
  age: 25,
  email: "tejnikumbh@gmail.com",
  password: "userOnePass",
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneObject, access: 'auth'}, authSecret)
  }]
},{
  _id: userTwoObject,
  ost_id: "SomeIDSecond",
  uuid: "SomeUUIDSecond",
  total_airdropped_tokens: 0,
  token_balance: 0,
  name: "Tejas Chaudhari",
  age: 26,
  email: "tejastalk@gmail.com",
  password: "userTwoPass",
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoObject, access: 'auth'}, authSecret)
  }]
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
