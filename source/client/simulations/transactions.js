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
    console.log(results);
    return Promise.resolve(results);
  }).catch((e) => {
    return Promise.reject(e);
  })
}

// Main Script for simulation
function runSimulationFor10Users(start) {
  return signupUsers(start).then((users) => {
    return loginUsers(users);
  }).then((headers) => {
    return requestTokensForUsers(headers);
  }).then((results) => {
    console.log(results);
    return Promise.resolve(results);
  }).catch((e) => {
    console.log(`Error`, e);
    return Promise.reject(e);
  });
}

async function runSimulations(n) {
  var start = 0;
  for(var i = 0 ;i < n; i++) {
    runSimulationFor10Users(start);
    await sleep(7500);
    start += 10;
  }
}

runSimulations(100);
