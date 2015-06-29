
 var cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('../auth'),
    bodyParser = require('body-parser');

 module.exports = function(app) {
	console.log('app1', app)
	app.use(bodyParser.json());
	app.use(cookieParser());
	app.use(session({
	    secret: 'keyboard cat',
	    resave: false,
	    saveUninitialized: true
	}));

app.use(passport.initialize());
app.use(passport.session());
}