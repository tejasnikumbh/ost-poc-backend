require('./../config/config');
const mongoose = require('mongoose');
const {Question, QuestionSchema} = require('./question');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const QuizSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  reward_amount: {
    type: Number,
    required: true
  },
  participation_fee: {
    type: Number,
    required: true
  },
  percentage_rewarded: {
    type: Number,
    required: true
  },
  questions: [Question.schema]
});

QuizSchema.methods.toJSONAsync = function(callback) {
  var quiz = this.toObject();
  var tQuiz = _.pick(quiz, ['_id', 'title', 'participation_fee',
  'reward_amount', 'percentage_rewarded', 'questions']);
  console.log(tQuiz);

  Question.findById(tQuiz.questions[0]).then((question) => {
    tQuiz.questions = [question];
    console.log(question);
    callback(tQuiz);
  }).catch((e) => {
    console.log(e);
    callback(e);
  });
}

QuizSchema.methods.getMetaData = function() {
  var quiz = this;
  return _.pick(quiz, ['_id', 'title', 'participation_fee',
  'reward_amount', 'percentage_rewarded'])
}

QuizSchema.statics.computeScore = function(quizId, answers) {
  return Promise.resolve(10);
}

const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = {Quiz};
