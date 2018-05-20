require('./../../config/config.js');
const {mongoose} = require('./../../db/mongoose');

const {User} = require('./../../models/user');
const axios = require('axios');

const password = `NUser123`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function signupUsers(start) {
  var signupPromises = [];
  for(var i = start; i<(start+10); i++) {
    var name = `NUser${i}`;
    var email = `NUser${i}@gmail.com`;
    signupPromises.push(
      axios.post('http://localhost:3000/users/signup', {
        name,
        email,
        password
      })
    );
    //await sleep(100);
  }

  return axios.all(signupPromises).then((results) => {
    var users = []
    results.forEach((result) => {
      users.push(result.data);
    })
    return Promise.resolve(users);
  }).catch((e) => {
    return Promise.reject(e);
  });
}

function loginUsers(users) {
  var loginPromises = [];

  users.forEach((user) => {
    loginPromises.push(axios.post('http://localhost:3000/users/login', {
        email: user.email,
        password
      })
    );
    //await sleep(100);
  })

  return axios.all(loginPromises).then((results) => {
    var headers = [];
    results.forEach((result) => {
      headers.push(result.headers['x-auth']);
    })
    return Promise.resolve(headers);
  }).catch((e) => {
    return Promise.reject(e);
  })
}

function requestTokensForUsers(tokens) {
  const body = {amount: 10}; // NO significance
  var requestTokensPromises = [];
  tokens.forEach((token) => {
    requestTokensPromises.push(
      axios.post('http://localhost:3000/users/request_tokens', body, {
        headers: {
          'x-auth': token
        }
      })
    );
    //await sleep(100);
  });

  return axios.all(requestTokensPromises).then((results) => {
    return Promise.resolve(results);
  }).catch((e) => {
    return Promise.reject(e);
  })
}

function fetchProfileForUsers(tokens) {
  var promises = []
  tokens.forEach((token) => {
    var request = axios.get('http://localhost:3000/users/profile', {
      headers: {
        'x-auth': token
      }
    }).then((data) => {
      return Promise.resolve(data);
    }).catch((err) => {
      return Promise.reject(err);
    });
    promises.push(request);
  });

  return axios.all(promises).then((results) => {
    return Promise.resolve(results);
  }).catch((e) => {
    return Promise.reject(e)
  })
}

function fetchQuizForUsers(tokens, data) {
  var promises = [];
  for(var i =0 ;i < tokens.length; i++) {
    var quizId = data[i].quiz._id
    const request = axios.get(`http://localhost:3000/quiz/${quizId}`, {
      headers: {
        'x-auth': tokens[i]
      }
    });
    promises.push(request);
  }

  return axios.all(promises).then((results) => {
    return Promise.resolve(results);
  }).catch((e) => {
    return Promise.reject(e);
  })
}

function submitQuizForUsers(tokens, quizIds) {
  var promises = [];
  for(var i =0 ;i < tokens.length; i++) {
    var quizId = quizIds[i];
    var body = {
      _id: quizId,
      answers: [
        0,0,0,0,0
      ]
    }
    const request = axios.post(`http://localhost:3000/quiz/${quizId}`, body, {
      headers: {
        'x-auth': tokens[i]
      }
    });
    promises.push(request);
  }

  return axios.all(promises).then((results) => {
    return Promise.resolve(results);
  }).catch((e) => {
    return Promise.reject(e);
  })
}
// Main Script for simulation
function runSignupSimulationFor10Users(start) {
  console.log(`Signing user number starting at ${start} upto ${start+10}...`);
  return signupUsers(start);
}

function runRequestTokenSimulationFor10Users() {
  console.log("Requesting 1 token each for first 10 users...");
  return User.find().limit(10).then((users) => {
    return loginUsers(users);
  }).then((tokens) => {
    return requestTokensForUsers(tokens);
  }).then((results) => {
    return Promise.resolve(results);
  }).catch((e) => {
    return Promise.reject(e);
  });
}

function runTakeQuizSimulationFor10Users() {
  var userTokens = [];
  console.log("Taking quiz by staking for first 10 users...");
  User.find().limit(10).then((users) => {
    return loginUsers(users);
  }).then((tokens) => {
    userTokens = tokens;
    return fetchProfileForUsers(tokens);
  }).then((results) => {
    var data = []
    results.forEach((result) => {
      data.push(result.data);
    })
    console.log(data);
    return fetchQuizForUsers(userTokens, data);
  }).then((results) => {
    console.log(results);
    return Promise.resolve(results);
  }).catch((e) => {
    console.log(`Error`, e);
    return Promise.reject(e);
  })
}

function runPostQuizSimulationFor10Users() {
  var userTokens = [];
  console.log("Taking quiz by staking for first 10 users...");
  User.find().limit(10).then((users) => {
    return loginUsers(users);
  }).then((tokens) => {
    userTokens = tokens;
    return fetchProfileForUsers(tokens);
  }).then((results) => {
    var data = []
    results.forEach((result) => {
      data.push(result.data);
    })
    console.log(data);
    return fetchQuizForUsers(userTokens, data);
  }).then((results) => {
    var quizIds = [];
    results.forEach((result) => {
      quizIds.push(result.data._id);
    })
    console.log(quizIds);
    return submitQuizForUsers(userTokens, quizIds);
  }).then((results) => {
    console.log(results);
    return Promise.resolve(results);
  }).catch((e) => {
    console.log(`Error`, e);
    return Promise.reject(e);
  })
}

async function runSignupSimulations(n) {
  var start = 0;
  for(var i = 0 ;i < n; i++) {
    runSignupSimulationFor10Users(start);
    await sleep(7500);
    start += 10;
  }
}

async function runRequestTokenSimulations(n) {
  var start = 0;
  for(var i = 0 ;i < n; i++) {
    runRequestTokenSimulationFor10Users();
    await sleep(7500);
    start += 10;
  }
}

//runSignupSimulations(5);
//runRequestTokenSimulations(1);
//runTakeQuizSimulationFor10Users();
runPostQuizSimulationFor10Users();
