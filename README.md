# Simple Token (OST) POC
Repository for POC for OST Developer KIT alpha
# Backend Architecture
![alt text](https://github.com/tejasnikumbh/ost-poc/blob/master/resources/backend_architecture.png)
# Installation Instructions
After cloning the repository, make sure you have node installed.

Run the following commands to setup all node_modules
```javascript
npm install
```

Add config/keys.js with the following
```javascript
var ostAPIKey = "<Your OST Developer KIT API Key>";
var ostSecret = "<Your OST Developer KIT Secret>";
var ostCompanyUUID = "<Your OST Company uuid>";

module.exports = {
  apiKey: ostAPIKey,
  secret: ostSecret,
  companyUUID: ostCompanyUUID
}
```

