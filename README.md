# Simple Token (OST) POC
Repository for POC for OST Developer KIT alpha
# Backend Architecture
![alt text](https://github.com/tejasnikumbh/ost-poc-backend/blob/master/resources/backend_architecture.png)
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
- [x] Complete REST Auth Server
- [x] Complete Quiz API on the REST Server
- [ ] Bridge REST server and OST client
- [ ] Build Front End using ReactJS
- [ ] Write tests for OST Client

# Author
- Tejas Nikumbh
  - Email: tejnikumbh@gmail.com
  - Skype: tjnikumbh
