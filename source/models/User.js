require('./../config/config');
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {authSecret} = require('./../keys/keys');

const UserSchema = mongoose.Schema({
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
  performance: {
    quizzes: [{
      _id: { type: mongoose.Schema.Types.ObjectId },
      score: { type: Number, default: 0 },
      time : { type : Date, default: Date.now }
    }]
  },
  tokens: [{
      access: { type: String, required: true },
      token: { type: String, required: true }
  }],
  ost_details: {
    ost_id: {
      type: String,
      default: null,
      index: {
        unique: true,
        partialFilterExpression: {ost_id: {$type: 'string'}}
      } // allows null value duplicates
    },
    uuid: {
      type: String,
      default: null,
      index: {
        unique: true,
        partialFilterExpression: {uuid: {$type: 'string'}}
      } // allows null value duplicates
    },
    total_airdropped_tokens: {
      type: Number,
      default: 0
    },
    token_balance: {
      type: Number,
      default: 0
    }
  }
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
  'ost_details']);
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

UserSchema.methods.updateScore = function(quizId, score) {
    var user = this;
    var data = {
      _id: quizId,
      score
    };
    user.performance.quizzes.push(data);

    return user.save().then(() => {
        return user;
    });
};
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

// OST Related Statics - Used in User Client
UserSchema.static('findByIdAndUpdateWithOSTDetails', function(user) {
  // Finds by user._id and updates name to user.name
  var options = { new: true };
  var ost_details = {
    ost_id: user.id,
    uuid: user.uuid,
    token_balance: user.token_balance,
    total_airdropped_tokens: user.total_airdropped_tokens
  }

  return User.findOneAndUpdate(
    {_id: user._id},
    {name: user.name, ost_details},
    options);
});

UserSchema.static('findByUuidAndUpdateWithOSTDetails', function(user) {
  // Finds by user._id and updates name to user.name
  var options = { new: true };
  var ost_details = {
    ost_id: user.id,
    uuid: user.uuid,
    token_balance: user.token_balance,
    total_airdropped_tokens: user.total_airdropped_tokens
  }
  return User.findOneAndUpdate(
    { 'ost_details.uuid': user.uuid },
    { name: user.name, ost_details },
    options);
});

// Relevant and Used in Transaction Client
UserSchema.static('updateUserTokenBalanceInDatabase', function(uuid, increment) {
  var options = { new: true };
  return User.findOne({'ost_details.uuid': uuid}).then((user) => {
    var newBalance = user.ost_details.token_balance + increment;
    // Guard against -ve balance
    if(newBalance < 0) { return Promise.reject('Not enough balance')}
    user.ost_details.token_balance = newBalance;
    return user.save();
  }).then((updatedUser) => {
    return Promise.resolve(updatedUser);
  }).catch((e) => {
    return Promise.reject(e)
  });
});

// User model creation
const User = mongoose.model('User', UserSchema);

module.exports = {User};
