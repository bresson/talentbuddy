var express = require('express')
  , app = express()
  , config = require('./config')

require('./middleware')(app)
require('./router')(app)

require('./middleware')(app)
require('./router')(app)


// function ensureAuthentication(req, res, next) {

//     if (!req.isAuthenticated()) {
//         return res.sendStatus(403);
//     }
//     return next();
// }

var server = app.listen(config.get('server:port'), config.get('server:host'));




module.exports = server;