require('./../../config/config')
const {Question} = require('./../../models/question');
const {Quiz} = require('./../../models/quiz');
const {mongoose} = require('./../../db/mongoose');
const _ = require('lodash');

const quizData = new Quiz({
  title: "Blockchain Quiz 1.0",
  participation_fee: 10,
  reward_amount: 100,
  percentage_rewarded: 0.25,
  questions: [
    new Question({
      title: "What is a good application for smart contracts?",
      choices: [
        "Housing ownership contracts",
        "Credits in a game",
        "Social network",
        "Healthcare database"
      ],
      correct_choice: 4
    }),
    new Question({
      title: "Which of the following is a smart contract development ecosystem?",
      choices: [
        "Ethereum",
        "Litecoin",
        "Bitcoin",
        "NEO Coin"
      ],
      correct_choice: 1
    })
  ]
});

const createQuiz = () => {
  return quizData.save();
}

module.exports = {quizData, createQuiz};
