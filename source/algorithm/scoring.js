const {Quiz} = require('./../models/quiz');
const _ = require('lodash');

function computeScore(quizId, answers) {
  return Quiz.findById(quizId).then((quiz) => {
    var correct_answers = _.map(quiz.questions, (question, index) => {
      return question.correct_choice == Number(answers[index]) ? 1: 0;
    });
    var score = _.sum(correct_answers) * 100 / correct_answers.length;
    return Promise.resolve(score);
  }).catch((e) => {
    console.log(e);
    return Promise.reject(e);
  });
}

module.exports = {computeScore}
