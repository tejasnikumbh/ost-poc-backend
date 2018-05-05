require('./../../config/config')
const {Quiz, Question} = require('./../../models/quiz');
const {mongoose} = require('./../../db/mongoose');

const quiz = {
  topic: "Blockchain",
  max_score: 100,
  time_limit: 3600,
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
};

const populateQuiz = () => {
  new Quiz(quiz).save();
}

module.exports = {quiz, populateQuiz};
