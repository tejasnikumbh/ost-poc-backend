const {apiKey, secret, companyUUID} = require('./keys/keys.js');
const ostUtils = require('./utils/ost-utils.js')

const axios = require('axios');

const baseUrl = "https://playgroundapi.ost.com"


const createOSTUser = (user) => {
  var endpoint = '/users/create';
  var inputParams = { "name": user.name};
  var timestamp = ostUtils.secondsSinceEpoch();

  var queryString = ostUtils.generateQueryString(
    endpoint, inputParams,
    apiKey, timestamp);
  var signature = ostUtils.generateApiSignature(queryString, secret);

  axios({
    method: 'post',
    url: `${baseUrl}${endpoint}`,
    data: {
      api_key: apiKey,
      name: user.name,
      request_timestamp: timestamp,
      signature: signature
    }
  }).then((res) => {
    console.log(res.data.data);
  }).catch((err) => {
    console.log(err);
  });

};

const editOSTUser = (newUser) => {
  var endpoint = '/users/edit';
  var inputParams = {uuid: newUser.id, name: newUser.name};
  var timeStamp = ostUtils.secondsSinceEpoch();
  var queryString = ostUtils.generateQueryString(
    endpoint, inputParams,
    apiKey, timeStamp);
  var signature = ostUtils.generateApiSignature(queryString, secret);
  console.log(queryString);
  console.log(signature);
  var url = `${baseUrl}/users/edit?api_key=${apiKey}&name=${newUser.name}&request_timestamp=${timeStamp}&signature=${signature}&uuid=${newUser.id}`;
  console.log(url);
  axios({
    method: 'post',
    url: url,
    data: {}
  }).then((res) => {
    console.log(`Success~!`);
    console.log(res.data.data);
  }).catch((err) => {
    console.log(`Error: ${err}`);
  });
}

const getOSTUsers = () => {
  var endpoint = '/users/list';
  var inputParams = {page_no: 1, order_by: "name", order: "asc"};
  var timeStamp = ostUtils.secondsSinceEpoch();
  var queryString = ostUtils.generateQueryString(
    endpoint, inputParams,
    apiKey, timeStamp);
  var signature = ostUtils.generateApiSignature(queryString, secret);

  var url = `${baseUrl}${queryString}&signature=${signature}`;
  axios({
    method: 'get',
    url: url,
    data: {}
  }).then((res) => {
    console.log(res.data.data.economy_users);
    console.log(res.data.data.economy_users.length);
  }).catch((err) => {
    console.log(err);
  });
}

module.exports = {
  createOSTUser,
  editOSTUser,
  getOSTUsers
}
