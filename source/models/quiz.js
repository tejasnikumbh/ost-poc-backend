require('./../config/config');
const mongoose = require('mongoose');
const Question = require('./question');
const _ = require('lodash');

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
  questions: [{type:mongoose.Schema.Types.ObjectId, ref: 'Question'}]
});

// QuizSchema.methods.toJSON = function() {
//   var quiz = this;
//   return _.pick(quiz, ['_id', 'questions']);
// }

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
