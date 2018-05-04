require('./../config/config');
const mongoose = require('mongoose');

const QuestionSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
    unique:true
  },
  correct_choice: {
    type: Number,
    min: 1,
    max: 4,
    default: null
  },
  choices: [{
    type: String,
    required: true,
    unique: true,
    trim: true,
  }]
});

const QuizSchema = mongoose.Schema({
  questions: [QuestionSchema],
  score: {
    type: Number,
    default: 0
  }
});

const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = {Quiz};
