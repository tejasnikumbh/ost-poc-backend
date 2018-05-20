require('./../../config/config')
const {Question} = require('./../../models/question');
const {Quiz} = require('./../../models/quiz');
const {mongoose} = require('./../../db/mongoose');
const _ = require('lodash');
const constants = require('./../../utils/constants');
const quizData = new Quiz({
  title: "Blockchain Quiz 1.0",
  participation_fee: constants.competitionStakeTransaction.value,
  reward_amount: constants.cRTransactionStageFour.value,
  percentage_rewarded: 0.90,
  questions: [
    new Question({
      title: "What is a good application for smart contracts?",
      choices: [
        "Housing ownership contracts",
        "Credits in a game",
        "Social network",
        "Healthcare database"
      ],
      correct_choice: 0
    }),
    new Question({
      title: "What is a good application for smart contracts?",
      choices: [
        "Housing ownership contracts",
        "Credits in a game",
        "Social network",
        "Healthcare database"
      ],
      correct_choice: 0
    }),
    new Question({
      title: "What is a good application for smart contracts?",
      choices: [
        "Housing ownership contracts",
        "Credits in a game",
        "Social network",
        "Healthcare database"
      ],
      correct_choice: 0
    }),
    new Question({
      title: "What is a good application for smart contracts?",
      choices: [
        "Housing ownership contracts",
        "Credits in a game",
        "Social network",
        "Healthcare database"
      ],
      correct_choice: 0
    }),
    new Question({
      title: "Which of the following is a smart contract development ecosystem?",
      choices: [
        "Ethereum",
        "Litecoin",
        "Bitcoin",
        "NEO Coin"
      ],
      correct_choice: 0
    })
  ]
});

const fetchQuiz = () => {
  return Quiz.findOne({title: quizData.title}).then((quiz) => {
    if(_.isEmpty(quiz)) {
      console.log("Returned new quiz");
      return quizData.save();
    } else {
      console.log("Returned existing quiz");
      return quiz;
    }
  }).catch((e) => {
    console.log("Error while searching");
    return Promise.reject(e);
  });
}

module.exports = {quizData, fetchQuiz};
