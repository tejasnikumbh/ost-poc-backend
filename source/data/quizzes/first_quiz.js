require('./../../config/config')
const {Question} = require('./../../models/question');
const {Quiz} = require('./../../models/quiz');
const {mongoose} = require('./../../db/mongoose');

const quizData = new Quiz({
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
});

module.exports = {quizData};
