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

require('./middleware')(app)


app.post('/api/auth/login', function(req, res, next) {
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

app.post('/api/auth/logout', function(req, res) {
    req.logout();
    res.sendStatus(200);
});

app.post('/api/tweets', ensureAuthentication, function(req, res) {
    var tweet = req.body.tweet.text,
        userId = req.user.id,
        Tweet = conn.model('Tweet');

    console.log('post tweet', tweet);

    var nTweet = new Tweet({
        userId: userId,
        created: Date.now() / 1000 | 0,
        text: tweet
    })

    nTweet.save(function(err, _t) {
        //console.log('_t', _t)
        if (err) {
            console.log('saved ntweet')
        }

        //console.log('res send', nTweet)
        res.send({
            tweet: _t.toClient()
        })
    });

});

// mentor solution
app.post('/api/users', function(req, res) {
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

app.put('/api/users/:userId', ensureAuthentication, function(req, res) {
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

app.get('/api/users/:userId', function(req, res) {
    var userId = req.params.userId;

    conn.model('User').findOne({
        id: userId
    }, function(err, user) {
        if (err) {
            console.log('err');
            return res.sendStatus(404);
        }
        return res.send({
            user: user
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

app.get('/api/tweets', function(req, res) {
    if (!req.query.userId) {
        return res.sendStatus(400)
    }

    var Tweet = conn.model('Tweet'),
        query = {
            userId: req.query.userId
        },
        options = {
            sort: {
                created: -1
            }
        }

    Tweet.find(query, null, options, function(err, tweets) {
        if (err) {
            return res.sendStatus(500)
        }
        var responseTweets = tweets.map(function(tweet) {
            return tweet.toClient()
        })
        res.send({
            tweets: responseTweets
        })
    })
});

app.get('/api/tweets/:tweetId', function(req, res) {
    var tweetId = req.params.tweetId,
        Tweet = conn.model('Tweet');

    console.log('tweetId', tweetId);
    Tweet.findById(tweetId, function(err, _t) {

        console.log('_t', _t);

        if (err) {
            console.log(err || null)
            return res.sendStatus(500);
        }

        if (!_t) {
            console.log('null')
            return res.sendStatus(404);
        }

        res.send({
            tweet: _t.toClient()
        })
    })
});

app.delete('/api/tweets/:tweetId', ensureAuthentication, function(req, res) {
		var Tweet = conn.model('Tweet')
	    , tweetId = req.params.tweetId

	  if (!ObjectId.isValid(tweetId)) {
	    return res.sendStatus(400)
	  }

	  Tweet.findById(tweetId, function(err, tweet) {
	    if (err) {
	      return res.sendStatus(500)
	    }

	    if (!tweet) {
	      return res.sendStatus(404)
	    }

	    if (tweet.userId !== req.user.id) {
	      return res.sendStatus(403)
	    }

	    Tweet.findByIdAndRemove(tweet._id, function(err) {
	      if (err) {
	        return res.sendStatus(500)
	      }
	      res.sendStatus(200)
	    })
    });
});

// function ensureAuthentication(req, res, next) {

//     if (!req.isAuthenticated()) {
//         return res.sendStatus(403);
//     }
//     return next();
// }

var server = app.listen(config.get('server:port'), config.get('server:host'));




module.exports = server;