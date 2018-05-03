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

const executeLearnReward = (userUuid) => {
  executeTransaction(constants.learnRewardTransaction,
  constants.companyUuid, userUuid).then((res) => {
    if(!(res.data.success)) {
      throw new Error("Problem in updating OST User using OST API");
    };
    User.updateUserTokenBalanceInDatabase(userUuid,
      constants.learnRewardTransaction.value);
  }).catch((err) => {
    console.log(`Error: ${err}`);
  });
}

const executeCompetitionReward = (userUuid) => {
  executeTransaction(constants.competitionRewardTransaction,
  constants.companyUuid, userUuid).then((res) => {
    if(!(res.data.success)) {
      throw new Error("Problem in updating OST User using OST API");
    };
    User.updateUserTokenBalanceInDatabase(userUuid,
      constants.competitionRewardTransaction.value);
  }).catch((err) => {
    console.log(`Error: ${err}`);
  });
}

const executeLearnStake = (userUuid) => {
  executeTransaction(constants.learnStakeTransaction,
  userUuid, constants.companyUuid).then((res) => {
    if(!(res.data.success)) {
      throw new Error("Problem in updating OST User using OST API");
    };
    User.updateUserTokenBalanceInDatabase(userUuid,
      -1 * constants.learnStakeTransaction.value);
  }).catch((err) => {
    console.log(`Error: ${err}`);
  });
}

const executeCompetitionStake = (userUuid) => {
  executeTransaction(constants.competitionStakeTransaction,
  userUuid, constants.companyUuid).then((res) => {
    if(!(res.data.success)) {
      throw new Error("Problem in updating OST User using OST API");
    };
    User.updateUserTokenBalanceInDatabase(userUuid,
      -1 * constants.competitionStakeTransaction.value);
  }).catch((err) => {
    console.log(`Error: ${err}`);
  });
}


const executeTransaction = (transactionType, fromUuid, toUuid) => {
  var endpoint = '/transaction-types/execute';
  var inputParams = {transaction_kind: transactionType.name,
     from_uuid: fromUuid, to_uuid: toUuid};
  var timestamp = ostUtils.secondsSinceEpoch();
  var signature = ostUtils.generateApiSignatureFromParams(
    endpoint, inputParams, timestamp);
  //console.log(url);
  return axios({
    method: 'post',
    url: `${constants.baseUrl}${endpoint}`,
    data: {
      api_key: keys.apiKey,
      transaction_kind: transactionType.name,
      from_uuid: fromUuid,
      to_uuid: toUuid,
      request_timestamp: timestamp,
      signature: signature
    }
  }); // end of axios post call
} // end of execute transaction call

module.exports = {
  executeLearnReward,
  executeLearnStake,
  executeCompetitionStake,
  executeCompetitionReward
}
