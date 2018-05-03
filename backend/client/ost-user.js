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

  User.findById(_id).then((user) => {
    return Promise.resolve(user);
  }).then((user) => {
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
    if(!(res.data.success)) {
      throw new Error("Error in creating user using OST API");
    }
    var user = (res.data.data.economy_users[0]);
    user._id = _id;
    User.findByIdAndUpdateWithOSTDetails(user);
  }).catch((err) => {
    return console.log(`Error ${err}`);
  }); // end of axios post call lineup
}; // end of createOSTUser

const editOSTUser = (_id, newName) => {
  var endpoint = '/users/edit';

  User.findById(_id).then((user) => {
    return Promise.resolve(user);
  }).then((user) => {
    var uuid = user.uuid;
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
      throw new Error("Problem in updating OST User using OST API");
    };
    var user = res.data.data.economy_users[0];
    user._id = _id;
    User.findByIdAndUpdateWithOSTDetails(user);
  }).catch((e) => {
    return console.log(`Error: ${err}`);;
  }); // end of axios post call
} // end of editOSTUser

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
    var dbUsers = users.map((user) => {
      var newUser = new User(user);
      newUser.ost_id = user.id;
      delete newUser.id;
      return newUser;
    });
    var actions = dbUsers.map(User.findByUuidAndUpdateWithOSTDetails);
    var results = Promise.all(actions);
    results.then((data) => {
      console.log(data);
    }).catch((e) => {
      console.log(e);
    });
    console.log(dbUsers);
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
