require('./../config/config');
const mongoose = require('mongoose');
const ostUtils = require('./../utils/ost-utils');

const AirdropSchema = mongoose.Schema({
  uuid: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    default: "pending"
  }
});

// Class Methods
AirdropSchema.static('createAirdrop', function(amount, uuid) {
  var airdrop = new Airdrop({ amount: amount, uuid: uuid,
    timestamp: ostUtils.secondsSinceEpoch()});
  return airdrop;
});

AirdropSchema.static('updateStatusInDatabase', function(airdrop_uuid, status) {
  var options = { new: true };
  Airdrop.findOneAndUpdate({uuid: airdrop_uuid}, {status: status},
    options).then((airdrop) => {
    console.log(`Updated Airdrop: ${airdrop.uuid}. New status - ${airdrop.status}`);
  }).catch((err) => {
    console.log(`Error updating airdrop with uuid ${airdrop_uuid}: ${err}`);
  });
});

// Instance Methods
AirdropSchema.methods.saveToDatabase = function () {
  this.save().then((airdrop) => {
    console.log(`Successfully saved airdrop object to database ${airdrop}`);
  }).catch((e) => {
    console.log(`Error in saving airdrop to database: ${e}`);
  })
};



const Airdrop = mongoose.model('Airdrop', AirdropSchema);

module.exports = {Airdrop};
