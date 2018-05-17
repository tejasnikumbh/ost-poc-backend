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

const executeRequestGrant = (userUuid) => {
  return executeTransaction(constants.requestGrantTransaction,
  constants.companyUuid, userUuid).then((res) => {
    if(!(res.data.success)) {
      throw new Error("Problem in updating OST User using OST API");
    };
    return User.updateUserTokenBalanceInDatabase(userUuid,
      constants.requestGrantTransaction.value).then(() => {
        return Promise.resolve();
      }).catch((e) => Promise.reject());;
  });
}

const executeLearnReward = (userUuid) => {
  return executeTransaction(constants.learnRewardTransaction,
  constants.companyUuid, userUuid).then((res) => {
    if(!(res.data.success)) {
      throw new Error("Problem in updating OST User using OST API");
    };
    return User.updateUserTokenBalanceInDatabase(userUuid,
      constants.learnRewardTransaction.value).then(() => {
        return Promise.resolve();
      }).catch((e) => Promise.reject());;
  });
}

const executeCompetitionReward = (userUuid) => {
  return executeTransaction(constants.competitionRewardTransaction,
  constants.companyUuid, userUuid).then((res) => {
    if(!(res.data.success)) {
      throw new Error("Problem in updating OST User using OST API");
    };
    return User.updateUserTokenBalanceInDatabase(userUuid,
      constants.competitionRewardTransaction.value).then(() => {
        return Promise.resolve();
      }).catch((e) => Promise.reject());;
  });
}

const executeLearnStake = (userUuid) => {
  return executeTransaction(constants.learnStakeTransaction,
  userUuid, constants.companyUuid).then((res) => {
    if(!(res.data.success)) {
      throw new Error("Problem in updating OST User using OST API");
    };
    return User.updateUserTokenBalanceInDatabase(userUuid,
      -1 * constants.learnStakeTransaction.value).then(() => {
        return Promise.resolve();
      }).catch((e) => Promise.reject());;
  });
}

const executeCompetitionStake = (userUuid) => {
  return executeTransaction(constants.competitionStakeTransaction,
  userUuid, constants.companyUuid).then((res) => {
    if(!(res.data.success)) {
      return Promise.reject("Problem in updating OST User using OST API");
    };
    return User.updateUserTokenBalanceInDatabase(userUuid,
      -1 * constants.competitionStakeTransaction.value).then(() => {
        return Promise.resolve('Succesfully updated user token balance');
      }).catch((e) => Promise.reject('Unable to update user token balance'));
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
  executeRequestGrant,
  executeLearnReward,
  executeLearnStake,
  executeCompetitionStake,
  executeCompetitionReward,
}
