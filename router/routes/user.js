
var express = require('express'), 
	router = express.Router(), 
	conn = require('../../db'),
	ensureAuthentication = require('../../middleware/ensureAuthentication');


router.post('/:userId/follow', ensureAuthentication, function(req, res) {
  var User = conn.model('User')
    , userId = req.params.userId

  User.findByUserId(userId, function(err, user) {
    if (err) {
      return res.sendStatus(500)
    }
    if (!user) {
      return res.sendStatus(403)
    }
    req.user.follow(userId, function(err) {
      if (err) {
        return res.sendStatus(500)
      }
      res.sendStatus(200)
    })
  })
});

router.post('/', function(req, res) {
    console.log('post user')

    var user = req.body.user,
        User = conn.model('User')


    console.log('post user 2')
    User.create(user, function(err, user) {
        if (err) {
            var code = err.code === 11000 ? 409 : 500
            return res.sendStatus(code)
        }
        req.login(user, function(err) {
            if (err) {
                return res.sendStatus(500)
            }
            res.sendStatus(200)
        })
    })
})

router.put('/:userId', ensureAuthentication, function(req, res) {
    var un = req.params.userId,
        pw = req.body.password;
    console.log(un, pw)

    if (req.user.id !== req.params.userId) {
        return res.sendStatus(403);
    }

    conn.model('User').findOneAndUpdate({
        id: un
    }, {
        password: pw
    }, {}, function(err, user) {

        if (err) {
            console.log('err', err);
            res.sendStatus(500);
        }

        res.sendStatus(200);
    })
});

router.get('/:userId', function(req, res) {
    var userId = req.params.userId;

    conn.model('User').findOne({
        id: userId
    }, function(err, user) {
        if (err) {
            console.log('err');
            return res.sendStatus(404);
        }
        return res.send({
            user: user.toClient()
        })
    });

    //console.log(User)
    // for (var i = 0; i < fixtures.users.length; i++) {
    // 	console.log(fixtures.users[i])
    // 	if (fixtures.users[i].id === userId) {
    // 		user = fixtures.users[i];
    // 	}
    // }
    // console.log(user)
    // if (!user) {
    // 	console.log('no such user')
    // 	return res.sendStatus(404);
    // } else {
    // 	return res.send({user: user})
    // }
});

module.exports = router;