var express = require('express'),
    shortId = require('shortid'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('../auth'),
    bodyParser = require('body-parser'),
    conn = require('../db'),
    ensureAuthentication = require('../middleware/ensureAuthentication'),
    config = require('../config');

   var ObjectId = require('mongoose').Types.ObjectId;


    module.exports = function(app) {
		console.log('app', app)
		app.use('/api/users', require('./routes/users'))
		app.use('/api/tweets', require('./routes/tweet'))
		app.use('/api/auth', require('./routes/auth'))
}