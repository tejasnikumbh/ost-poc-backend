require('./../config/config');
const mongoose = require('mongoose');

const QuestionSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique:true
  },
  choices: [{
    type: String,
    required: true,
    unique: true,
    trim: true,
  }],
  correct_choice: {
    type: Number,
    min: 1,
    max: 4,
    default: null
  }
});

const QuizSchema = mongoose.Schema({
  topic: {
    type: String,
    default: "Blockchain",
    required: true
  },
  questions: [QuestionSchema],
  time_limit: {
    type: Number,
    default: 900,
    required: true
  },
  max_score: {
    type: Number,
    default: 100
  }
});

const Question = mongoose.model('Question', QuestionSchema);
const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = {Quiz, Question};
