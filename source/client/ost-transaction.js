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
    console.log('************************************************************');
    console.log('OST Response: Executed requestGrant transaction...');
    console.log(`Company UUID is:- ${constants.companyUuid}`);
    console.log('Response data:-');
    console.log(res.data);
    if(!(res.data.success)) {
      throw new Error("Problem in updating OST User using OST API");
    };
    return User.updateUserTokenBalanceInDatabase(userUuid,
      constants.requestGrantTransaction.value).then(() => {
        return Promise.resolve();
      }).catch((e) => Promise.reject());;
  });
}


const executeCompetitionStake = (userUuid) => {
  return executeTransaction(constants.competitionStakeTransaction,
  userUuid, constants.companyUuid).then((res) => {
    console.log('************************************************************');
    console.log('OST Response: Executed competitionStake transaction...');
    console.log(`Company UUID is:- ${constants.companyUuid}`);
    console.log('Response data:-');
    console.log(res.data);
    if(!(res.data.success)) {
      return Promise.reject("Problem in updating OST User using OST API");
    };
    return User.updateUserTokenBalanceInDatabase(userUuid,
      -1 * constants.competitionStakeTransaction.value).then(() => {
        return Promise.resolve('Succesfully updated user token balance');
      }).catch((e) => Promise.reject('Unable to update user token balance'));
  });
}

const executeCompetitionReward = (userUuid, earning) => {
  var transaction = null;
  if(earning == 0) { return; }
  else if(earning == 1) { transaction = constants.cRTransactionStageOne; }
  else if(earning == 2) { transaction = constants.cRTransactionStageTwo; }
  else if(earning == 3) { transaction = constants.cRTransactionStageThree; }
  else if(earning == 5) { transaction = constants.cRTransactionStageFour; }
  else { return; }

  return executeTransaction(transaction, constants.companyUuid,
    userUuid).then((res) => {
    console.log('************************************************************');
    console.log(`OST Response: Executed ${transaction.name} transaction...`);
    console.log(`Company UUID is:- ${constants.companyUuid}`);
    console.log('Response data:-');
    console.log(res.data);
    if(!(res.data.success)) {
      throw new Error("Problem in updating OST User using OST API");
    };
    return User.updateUserTokenBalanceInDatabase(userUuid,
      transaction.value).then(() => {
        return Promise.resolve();
      }).catch((e) => Promise.reject());;
  });
}

const executeTransaction = (transactionType, fromUuid, toUuid) => {
  console.log("BOLLA");
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
  executeCompetitionStake,
  executeCompetitionReward
}
