const queryString = require('query-string');
const crypto = require('crypto');
const {apiKey, secret} = require('./../keys/keys');
const constants = require('./constants');

var generateUrlString = (endpoint, inputParams) => {
  var timestamp = secondsSinceEpoch();
  var queryString = generateQueryString(
    endpoint, inputParams, timestamp);
  var signature = generateApiSignature(queryString);
  inputParams["signature"] = signature;
  var pathString = generateQueryString(
    endpoint, inputParams, timestamp);
  var url = `${constants.baseUrl}${pathString}`;
  return url;
}

var generateQueryString = (endpoint, inputParams, requestTimestamp) => {
  inputParams["api_key"] = apiKey;
  inputParams["request_timestamp"] = requestTimestamp;
  const queryParamsString = queryString.stringify(inputParams,
    {arrayFormat: 'bracket'}).replace(/%20/g, '+');
  const stringToSign = endpoint + '?' + queryParamsString;
  return stringToSign;
}

var generateApiSignatureFromParams = (endpoint, inputParams, requestTimestamp) => {
    var queryString = generateQueryString(endpoint, inputParams, requestTimestamp);
    return generateApiSignature(queryString);
}

var generateApiSignature = (stringToSign) => {
  var buff = new Buffer.from(secret, 'utf8');
  var hmac = crypto.createHmac('sha256', buff);
  hmac.update(stringToSign);
  return hmac.digest('hex');
}

var secondsSinceEpoch = () => {
   return Math.floor( Date.now() / 1000 );
}

module.exports = {
  generateUrlString,
  generateQueryString,
  generateApiSignature,
  generateApiSignatureFromParams,
  secondsSinceEpoch
}
