const {apiKey, secret, companyUUID} = require('./keys/keys.js');
const ostUtils = require('./utils/ost-utils.js')

const axios = require('axios');

const baseUrl = "https://playgroundapi.ost.com"
const createOSTUser = () => {
  var user = {
    name: "Tejas Nikumbh"
  };
  var inputParams = { "name": user.name};
  var timestamp = ostUtils.secondsSinceEpoch();

  var queryString = ostUtils.generateQueryString(
    '/users/create', inputParams,
    apiKey, timestamp);
  var signature = ostUtils.generateApiSignature(queryString, secret);


  axios({
    method: 'post',
    url: `${baseUrl}/users/create`,
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

const getOSTUsers = () => {
  var inputParams = {page_no: 3, order_by: "name", order: "asc"};
  var timeStamp = ostUtils.secondsSinceEpoch();
  var queryString = ostUtils.generateQueryString(
    '/users/list', inputParams,
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
  getOSTUsers
}
