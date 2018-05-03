require('./../config/config');
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {authSecret} = require('./../keys/keys');

const UserSchema = mongoose.Schema({
  ost_id: {
    type: String,
    unique: true,
    default: null,
    sparse: true // allows null value duplicates
  },
  uuid: {
    type: String,
    unique: true,
    default: null,
    sparse: true // allows null value duplicates
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    min: 0,
    max: 200,
    default: 0
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 1,
    trim: true,
    validate: {
      validator:  validator.isEmail,
      message: `{VALUE} is not a valid E-mail`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  total_airdropped_tokens: {
    type: Number,
    default: 0
  },
  token_balance: {
    type: Number,
    default: 0
  },
  tokens: [{
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
  }]
});


// Instance Methods
UserSchema.pre('save', function (next) {
  var user = this;
  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
})

UserSchema.methods.toJSON = function () {
  var user = this;
  return _.pick(user, [
    '_id', 'name', 'age', 'email',
  'total_airdropped_tokens', 'token_balance']);
}

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var data = {
      _id: user._id.toHexString(),
      access
    };

    var token = jwt.sign(data, authSecret).toString();
    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;
  return user.update({
    $pull:{
      tokens:{token}
    }
  });
}

// Static methods
UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;
  try {
    decoded = jwt.verify(token, authSecret);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
     _id: decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    });
}

UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;
  return User.findOne({email}).then((user) => {
    if(!user) { return Promise.reject()}
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
}

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

// OST Related Statics
UserSchema.static('updateUserInDatabaseWithOSTDetails', function(user) {
  // Finds by user._id and updates name to user.name
  var options = { new: true };
  User.findOneAndUpdate({_id: user._id}, {
    uuid: user.uuid,
    name: user.name,
    token_balance: user.token_balance,
    total_airdropped_tokens: user.total_airdropped_tokens
  }, options)
  .then((user) => {
    console.log(`Updated User: ${user}`);
  }).catch((err) => {
    console.log(`Error updating user with uuid ${user.uuid}: ${err}`);
  });
});

UserSchema.static('updateUserTokenBalanceInDatabase', function(uuid, increment) {
  var options = { new: true };
  User.findOne({uuid}).then((user) => {
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
