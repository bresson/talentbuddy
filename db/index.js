var mongoose = require('mongoose'),
    config = require('../config'),
    tweetSchema = require('./schemas/tweet'),
    userSchema = require('./schemas/user'),
    connection = mongoose.createConnection(
        config.get('database:host'),
        config.get('database:name'),
        config.get('database:port')
    );


console.log('config get ', config.get('database:name'))

connection.model('Tweet', tweetSchema),
connection.model('User', userSchema);

module.exports = connection;