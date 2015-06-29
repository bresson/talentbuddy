var express = require('express'),
    fixtures = require('./fixtures'),
    shortId = require('shortid'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('./auth'),
    bodyParser = require('body-parser'),
    conn = require('./db'),
    ensureAuthentication = require('./middleware/ensureAuthentication'),
    config = require('./config'),
    app = express();

var ObjectId = require('mongoose').Types.ObjectId;

require('./middleware')(app);

console.log('MAIN JS');
require('./router')(app);
console.log('what next')



// function ensureAuthentication(req, res, next) {

//     if (!req.isAuthenticated()) {
//         return res.sendStatus(403);
//     }
//     return next();
// }

var server = app.listen(config.get('server:port'), config.get('server:host'));




module.exports = server;