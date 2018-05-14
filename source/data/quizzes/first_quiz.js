require('./../../config/config')
const {Question} = require('./../../models/question');
const {Quiz} = require('./../../models/quiz');
const {mongoose} = require('./../../db/mongoose');

const quizData = new Quiz({
  title: "Blockchain Quiz 1.0",
  participation_fee: 10,
  reward_amount: 100,
  percentage_rewarded: 0.25,
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
