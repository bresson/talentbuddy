var express = require('express'),
    router = express.Router(),
    ensureAuthentication = require('../../middleware/ensureAuthentication');


router.post('/login', function(req, res, next) {
    console.log(req.body.username, req.body.password)
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return res.sendStatus(500)
        }
        if (!user) {
            return res.sendStatus(403)
        }
        req.login(user, function(err) {
            if (err) {
                return res.sendStatus(500)
            }
            return res.send({
                user: user
            })
        })
    })(req, res)
});

router.post('/logout', function(req, res) {
    req.logout();
    res.sendStatus(200);
});

module.exports = router;