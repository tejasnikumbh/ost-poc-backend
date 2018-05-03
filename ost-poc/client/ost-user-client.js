// Coniguration - First
require('./../config/config');
// Self created modules
const mongoose = require('./../db/mongoose');
const {User} = require('./../models/user');

// Requiring constants
const keys = require('./../keys/keys.js');
const ostUtils = require('./../utils/ost-utils');
const constants = require('./../utils/constants');

// Independent third party modules
const axios = require('axios');

const createOSTUser = (name, email = "") => {
  var endpoint = '/users/create';
  var inputParams = { "name": name};
  var timestamp = ostUtils.secondsSinceEpoch();
  var signature = ostUtils.generateApiSignatureFromParams(
    endpoint, inputParams, timestamp);
  axios({
    method: 'post',
    url: `${constants.baseUrl}${endpoint}`,
    data: {
      api_key: keys.apiKey,
      name: name,
      request_timestamp: timestamp,
      signature: signature
    }
  }).then((res) => {
    if(!(res.data.success)) {
      throw new Error("Error in creating user using OST API");
    }
    var user = (res.data.data.economy_users[0]);
    var dbUser = new User(user);
    User.saveToDatabase([dbUser]);
  }).catch((err) => {
    console.log(err);
  }); // end of axios post call
}; // end of createOSTUser

const editOSTUser = (uuid, newName) => {
  var endpoint = '/users/edit';
  var inputParams = {uuid: uuid, name: newName};
  var timestamp = ostUtils.secondsSinceEpoch();
  var signature = ostUtils.generateApiSignatureFromParams(
    endpoint, inputParams, timestamp);
  //console.log(url);
  axios({
    method: 'post',
    url: `${constants.baseUrl}${endpoint}`,
    data: {
      api_key: keys.apiKey,
      uuid: uuid,
      name: newName,
      request_timestamp: timestamp,
      signature: signature
    }
  }).then((res) => {
    if(!(res.data.success)) {
      throw new Error("Problem in updating OST User using OST API");
    };
    var user = res.data.data.economy_users[0];
    User.editUserNameInDatabase(new User(user));
  }).catch((err) => {
    console.log(`Error: ${err}`);
  }); // end of axios post call
} // end of editOSTUser

const getOSTUsers = (pageNumber) => {
  // Specifying params for request
  var endpoint = '/users/list';
  var inputParams = {page_no: pageNumber, order_by: "name", order: "asc"};
  var url = ostUtils.generateUrlString(endpoint, inputParams);

  // axios get call to get ost users
  axios({
    method: 'get',
    url: url,
    data: {}
  }).then((res) => {
    if(!(res.data.success)) {
      throw new Error("Error in fetching users from OST API");
    }
    var users = res.data.data.economy_users;
    var dbUsers = users.map((user) => new User(user));
    User.saveToDatabase(dbUsers);
  }).catch((err) => {
    console.log(`Error in response - ${err}`);
  }); // end of axios get call
} // end of getOSTUsers

module.exports = {
  createOSTUser,
  editOSTUser,
  getOSTUsers
}
