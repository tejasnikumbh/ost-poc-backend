const queryString = require('query-string');
const crypto = require('crypto');

var generateQueryString = (endpoint, inputParams, apiKey, requestTimestamp) => {
  inputParams["api_key"] = apiKey;
  inputParams["request_timestamp"] = requestTimestamp;
  const queryParamsString = queryString.stringify(inputParams,
    {arrayFormat: 'bracket'}).replace(/%20/g, '+');
  const stringToSign = endpoint + '?' + queryParamsString;
  return stringToSign;
}


var generateApiSignature = (stringToSign, apiSecret) => {
  var buff = new Buffer.from(apiSecret, 'utf8');
  var hmac = crypto.createHmac('sha256', buff);
  hmac.update(stringToSign);
  return hmac.digest('hex');
}

var secondsSinceEpoch = () => {
   return Math.floor( Date.now() / 1000 );
}

module.exports = {
  generateQueryString,
  generateApiSignature,
  secondsSinceEpoch
}
