// Sets up the configuration
require('./../config/config.js');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./../db/mongoose');
const {User} = require('./../models/user');
const {authenticate} = require('./../middleware/middleware');

const app = express();
const port = process.env.PORT;

// Express middleware to convert request body to json
app.use(bodyParser.json());

// POST /users/signup - Used for signups
app.post('/users/signup', (req, res) => {
  var body = _.pick(req.body, ['name', 'email', 'password']);
  var user = new User(body);
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send();
  });
})

// POST /users/login - Used for login
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
})

// GET /users/me - Private route used for getting user information
app.get('/users/me', authenticate, (req, res) => {
  var user = req.user;
  res.send(user);
})

// DELETE /users/me/token - Used for log out
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then((user) => {
    res.status(200).send();
  }).catch((e) => {
    res.status(401).send();
  })
})

app.listen(port, () => {
  console.log(`Started listening on port ${port}`);
})

module.exports = {app}
