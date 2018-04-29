require('./../config/config');
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    minLength: 1,
    trim: true
  },
  uuid: {
    type: String,
    required: true
  },
  total_airdropped_tokens: {
    type: Number,
    required: true,
    min: 0
  },
  token_balance: {
    type: Number,
    required: true,
    min: 0
  }
});

// Saves an array of User objects to database
UserSchema.static('saveToDatabase', function (users) {
  var promises = [];
  users.forEach((user) => {
    promises.push(
      user.save().then((user) => {
        console.log(`Saved user with id ${user.id} to database`);
      }).catch((e) => {
        console.log(`Error in saving users to database: ${e}`);
      })
    );
  });

  Promise.all(promises).then(() => {
    console.log(`Sucessfully saved users to database`);
  }).catch((e) => {
    console.log(`Error in saving users - ${e}`);
  });
});

// Updates a user object's name in database
UserSchema.static('editUserNameInDatabase', function(user) {
  // Finds by user.uuid and updates name to user.name
  var options = { new: true };
  User.findOneAndUpdate({uuid: user.uuid}, {name: user.name}, options)
  .then((user) => {
    console.log(`Updated User: ${user}`);
  }).catch((err) => {
    console.log(`Error updating user with uuid ${user.uuid}: ${err}`);
  });
});

UserSchema.static('updateTokenBalanceInDatabase', function(uuid, increment) {
  var options = { new: true };
  User.findOne({uuid: uuid}).then((user) => {
    user.token_balance = user.token_balance + increment;
    return user.save();
  }).then((updatedUser) => {
    console.log(`New token balance for user with ${updatedUser.uuid} is ${updatedUser.token_balance}`);
  }).catch((e) => {
    console.log(`Error updating token balance for user ${uuid} in database`);
  });
});

const User = mongoose.model('User', UserSchema);

module.exports = {User};
