# Simple Token (OST) POC
Repository for POC for OST Developer KIT alpha
# Backend Architecture
![alt text](https://github.com/tejasnikumbh/ost-poc/blob/master/resources/backend_architecture.png)
# Installation Instructions
After cloning the repository, make sure you have node installed.Then follow the steps

- Run the following command to setup all dependencies
```javascript
npm install
```

- Add config/keys.js with the following
```javascript
var ostAPIKey = "<Your OST Developer KIT API Key>";
var ostSecret = "<Your OST Developer KIT Secret>";

module.exports = {
  apiKey: ostAPIKey,
  secret: ostSecret
}
```

# Todo
- Complete REST Auth Server
- Build Front End using ReactJS
