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

const createOSTUser = (_id, name, email = "") => {
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
    user._id = _id;
    User.updateUserInDatabaseWithOSTDetails(user);
  }).catch((err) => {
    console.log(err);
  }); // end of axios post call
}; // end of createOSTUser

const editOSTUser = (_id, uuid, newName) => {
  var endpoint = '/users/edit';
  var inputParams = {uuid: uuid, name: newName};
  var timestamp = ostUtils.secondsSinceEpoch();
  var signature = ostUtils.generateApiSignatureFromParams(
    endpoint, inputParams, timestamp);
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
    user._id = _id;
    User.updateUserInDatabaseWithOSTDetails(user);
  }).catch((err) => {
    console.log(`Error: ${err}`);
  }); // end of axios post call
} // end of editOSTUser

const getOSTUserDetails = (pageNumber) => {
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
      return Promise.reject("Error in fetching users from OST API");
    }
    var users = res.data.data.economy_users;
    return Promise.resolve(users);
  }).catch((err) => {
    return Promise.reject(`Error in response - ${err}`);
  }); // end of axios get call
} // end of getOSTUserDetails

const updateOSTUserDetails = (pageNumber) => {
  getOSTUserDetails(1).then((users) => {
    console.log(users);
  }).catch((e) => {
    console.log(e);
  })
}


module.exports = {
  createOSTUser,
  editOSTUser,
  getOSTUserDetails,
  updateOSTUserDetails
}
