// Coniguration - First
require('./../config/config');
// Self created modules
const mongoose = require('./../db/mongoose');
const {User} = require('./../models/user');

// Requiring constants
const keys = require('./../keys/keys');
const ostUtils = require('./../utils/ost-utils');
const constants = require('./../utils/constants');

// Independent third party modules
const axios = require('axios');

const createOSTUser = (_id) => {
  var endpoint = '/users/create';

  return User.findById(_id).then((user) => {
    var name = user.name;
    var inputParams = { "name": name};
    var timestamp = ostUtils.secondsSinceEpoch();
    var signature = ostUtils.generateApiSignatureFromParams(
      endpoint, inputParams, timestamp);
    return axios({
      method: 'post',
      url: `${constants.baseUrl}${endpoint}`,
      data: {
        api_key: keys.apiKey,
        name: name,
        request_timestamp: timestamp,
        signature: signature
      }
    });
  }).then((res) => {
    console.log('************************************************************');
    console.log('Signing up user...');
    console.log('OST Repsonse: Details for new user...');
    console.log('Response data:-');
    console.log(res.data);
    console.log('Economy user:-');
    console.log(res.data.data.economy_users[0]);
    if(!(res.data.success)) {
      return Promise.reject("Error in creating user using OST API");
    }
    var user = (res.data.data.economy_users[0]);
    user._id = _id;
    return User.findByIdAndUpdateWithOSTDetails(user);
  }).catch((err) => {
    return Promise.reject(`Error while creating ost user - ${err}`);
  }); // end of axios post call lineup
}; // end of createOSTUser

const editOSTUser = (_id, newName) => {
  var endpoint = '/users/edit';

  return User.findById(_id).then((user) => {
    var uuid = user.ost_details.uuid;
    var inputParams = {uuid: uuid, name: newName};
    var timestamp = ostUtils.secondsSinceEpoch();
    var signature = ostUtils.generateApiSignatureFromParams(
      endpoint, inputParams, timestamp);
    return axios({
        method: 'post',
        url: `${constants.baseUrl}${endpoint}`,
        data: {
          api_key: keys.apiKey,
          uuid: uuid,
          name: newName,
          request_timestamp: timestamp,
          signature: signature
        }
      })
  }).then((res) => {
    if(!(res.data.success)) {
      return Promise.reject("Problem in updating OST User using OST API");
    };
    var user = res.data.data.economy_users[0];
    user._id = _id;
    return User.findByIdAndUpdateWithOSTDetails(user);
  }).catch((err) => {
    return Promise.reject(`Error: ${err}`);;
  }); // end of axios post call
} // end of editOSTUser

// Fetches a particular user based on Uuid
const getOSTUser = (_id) => {
  return User.findById(_id).then((user) => {
    var uuid = user.ost_details.uuid;
    var endpoint = `/users/${uuid}`;
    var inputParams = {api_key: keys.apiKey};
    var timestamp = ostUtils.secondsSinceEpoch();
    var signature = ostUtils.generateApiSignatureFromParams(
      endpoint, inputParams, timestamp);
    var url = ostUtils.generateUrlString(endpoint, inputParams);
    url = url.replace(`${constants.baseUrl}`,`https://sandboxapi.ost.com/v1`);
    return axios({
        method: 'get',
        url,
        data: {}
      })
  }).then((res) => {
    console.log('************************************************************');
    console.log('Fetching details for existing user...');
    console.log('OST Repsonse: Details for existing user...');
    console.log('Response data (Logged in user):-');
    console.log(res.data);
    if(!(res.data.success)) {
      return Promise.reject("Problem in fetching OST User using OST API");
    };
    var user = res.data.data.user;
    var updatedUser = {
      id:user.id,
      uuid:user.id,
      token_balance:user.token_balance,
      total_airdropped_tokens:user.airdropped_tokens
    }
    updatedUser._id = _id;
    return User.findByIdAndUpdateWithOSTDetails(updatedUser);
  }).catch((err) => {
    return Promise.reject(`Error: ${err}`);;
  });
}// end of getOST User

const getOSTUserDetails = (pageNumber) => {
  // Specifying params for request
  var endpoint = '/users/list';
  var inputParams = {page_no: pageNumber, order_by: "name", order: "asc"};
  var url = ostUtils.generateUrlString(endpoint, inputParams);

  // axios get call to get ost users
  return axios({
    method: 'get',
    url: url,
    data: {}
  }).then((res) => {
    if(!(res.data.success)) {
      return Promise.reject("Error in fetching users from OST API");
    }
    var users = res.data.data.economy_users;
    // console.log(users);
    return Promise.resolve(users);
  }).catch((err) => {
    return Promise.reject(`Error in response - ${err}`);
  }); // end of axios get call
} // end of getOSTUserDetails

const updateOSTUserDetails = function (pageNumber) {
  getOSTUserDetails(pageNumber).then((users) => {
    var actions = users.map(User.findByUuidAndUpdateWithOSTDetails);
    var results = Promise.all(actions);
    results.then((data) => {
      console.log(data);
    }).catch((e) => {
      console.log(e);
    });
    console.log(users);
  }).catch((e) => {
    console.log(e);
  })
}


module.exports = {
  createOSTUser,
  editOSTUser,
  getOSTUser,
  getOSTUserDetails,
  updateOSTUserDetails
}
