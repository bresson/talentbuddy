module.exports = function(app) {
		console.log('app', app)
		app.use('/api/users', require('./routes/user'))
		app.use('/api/tweets', require('./routes/tweet'))
		app.use('/api/auth', require('./routes/auth'))
}