module.exports = function(req, res, next) {
	console.log('ensureauthentication')
	if (!req.isAuthenticated()) {
        return res.sendStatus(403);
    }
    return next();
}