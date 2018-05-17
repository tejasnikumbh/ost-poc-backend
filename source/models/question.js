require('./../config/config');
const mongoose = require('mongoose');
const _ = require('lodash');

const QuestionSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  choices: [{
    type: String,
    required: true,
    trim: true,
  }],
  correct_choice: {
    type: Number,
    min: 0,
    max: 3,
    default: null
  }
});

QuestionSchema.methods.toJSON = function () {
  var question = this;
  return _.pick(question, ['_id', 'title', 'choices']);
}

const Question = mongoose.model('Question', QuestionSchema);

module.exports = {Question};
