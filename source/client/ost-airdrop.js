// Coniguration - First
require('./../config/config');
// Self created modules
const mongoose = require('./../db/mongoose');
const {Airdrop} = require('./../models/airdrop');
// Requiring constants
const keys = require('./../keys/keys.js');
const ostUtils = require('./../utils/ost-utils');
const constants = require('./../utils/constants');

// Independent third party modules
const axios = require('axios');

// List type is either of all or never_airdropped
// Meaning airdrop to all or the ones that have never been airdropped
const dropTokens = (amount, listType) => {
  var endpoint = '/users/airdrop/drop';
  var inputParams = { "amount": amount, "list_type": listType};
  var timestamp = ostUtils.secondsSinceEpoch();
  var signature = ostUtils.generateApiSignatureFromParams(
    endpoint, inputParams, timestamp);
  axios({
    method: 'post',
    url: `${constants.baseUrl}${endpoint}`,
    data: {
      api_key: keys.apiKey, amount: amount, list_type: listType,
      request_timestamp: timestamp, signature: signature
    }
  }).then((res) => {
    console.log('************************************************************');
    console.log('OST Response: Created airdrop request...');
    console.log(`Company UUID is:- ${constants.companyUuid}`);
    console.log('Response data:-');
    console.log(res.data);
    if(!(res.data.success)) {
      throw new Error("Error in airdropping tokens using OST API");
    }
    var airdrop_uuid = res.data.data.airdrop_uuid;
    var airdrop = Airdrop.createAirdrop(amount, airdrop_uuid);
    airdrop.saveToDatabase();
  }).catch((err) => {
    console.log(err);
    console.log(`Error saving Airdrop to database:- ${err.message}`);
  }); // end of axios post call
}; // end of airdropTokens function


const checkStatus = (airdrop_uuid) => {
  var endpoint = '/users/airdrop/status';
  var inputParams = { "airdrop_uuid": airdrop_uuid };
  var url = ostUtils.generateUrlString(endpoint, inputParams);

  axios({
    method: 'get',
    url: url,
    data: {}
  }).then((res) => {
    console.log('************************************************************');
    console.log('OST Response: Checking airdrop status');
    console.log(`Company UUID is:- ${constants.companyUuid}`);
    console.log('Response data:-');
    console.log(res.data);
    if(!(res.data.success)) {
      throw new Error("Error in receiving airdrop status from OST API");
    }
    var airdrop_uuid = res.data.data.airdrop_uuid;
    var status = res.data.data.current_status;
    Airdrop.updateStatusInDatabase(airdrop_uuid, status);
  }).catch((err) => {
    console.log(`Error updating airdrop status in database:- ${err}`);
  }); // end of axios get call
} // end of airdrop status method

module.exports = {
  dropTokens,
  checkStatus
}
