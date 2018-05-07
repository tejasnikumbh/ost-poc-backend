require('./../config/config');
const mongoose = require('mongoose');
const Question = require('./question');
const _ = require('lodash');

const QuizSchema = mongoose.Schema({
  questions: [{type:mongoose.Schema.Types.ObjectId, ref: 'Question'}]
});

QuizSchema.methods.toJSON = function() {
  var quiz = this;
  return _.pick(quiz, ['_id', 'questions']);
}

const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = {Quiz};
