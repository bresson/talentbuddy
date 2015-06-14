var express = require('express'),
    fixtures = require('./fixtures'),
    shortId = require('shortid'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('./auth'),
    bodyParser = require('body-parser'),
    conn = require('./db'),
    //User = connection.model('User'), // works with pattern 1
    //Tweet = connection.model("Tweet"), // works with pattern 1
    config = require('./config'),
    app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

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
    	userId : userId, 
    	created : Date.now() / 1000 | 0,
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

    // see mentor's solution

    // this works but not efficient at all
    // res.send({
     //    	tweet: _t.toClient(function(err, __t) {
     //    		if (err) {
     //    			console.log('error on tweet client')
     //    		}
     //    		console.log('success toClient', __t)
     //    		return __t
     //    	})
    	// });
    });

     // Tweet.create({text: tweet}, function(err, _t) {
     // 	if ( err ) {
     // 		console.log('err');
     // 		return res.sendStatus(500)
     // 	}

     // 	console.log('created!!!', _t);
     // 	Tweet.toClient(function(err, __t) {
     // 		console.log(__t)
     // 		if (err) {
     // 			console.log('err on toclient')
     // 		}
     // 		res.send({tweet: __t})
     // 	})
     // })

    // var tweet = req.body.tweet;
    // tweet.id = shortId.generate();
    // tweet.userId = req.user.id;
    // tweet.created = Date.now() / 1000 | 0;

    // fixtures.tweets.push(tweet);

});

// mentor solution
app.post('/api/users', function(req, res) {
    var user = req.body.user,
        User = conn.model('User')

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
//Example 1
// app.post('/api/users', function(req, res) {
// 	console.log(req.body);
// 	var newUser = req.body.user,
// 	isConflict = false;

// 	var user = new User({
// 		id: newUser.id,
// 		name: newUser.name,
// 		email: newUser.email,
// 		password: newUser.password
// 	});

// 	user.save(function(err) {
// 		if (err) {
// 			if (err.code === 11000) {
// 				res.sendStatus(409);
// 			} else {
// 				res.sendStatus(500);
// 			}
// 		} else {
// 			res.sendStatus(200);
// 		}
// 	})

// Early Example
// for (var i = 0; i < fixtures.users.length; i++) {
// 	if (fixtures.users[i].id === newUser.id) {
// 		console.log('reg conflict');
// 		isConflict = true;
// 	}
// }
// if (isConflict) {
// 	return res.sendStatus(409);
// } else {
// 	newUser.followingIds = [];
// 	fixtures.users.push(newUser);
// 	req.logIn(newUser, function(err) {
// 		return res.sendStatus(200)	
// 	})	
// }
// })

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
    var userId = req.query.userId, 
    Tweet = conn.model('Tweet');

    console.log('tweets get userId query ->', userId)

    if (!userId) {
        return res.sendStatus(400);
    }

    //console.log(Tweet)
    var _tweets = Tweet.find({userId: userId}, function(err, _t) {

    	if (  err ) {
    		console.log('err')
    	}

    	if ( !_t ) {
    		console.log('no _t')
    	}
    	console.log('_t -->', _t)
    	return _t
    });
    //var sortedT = _tweets.toClient();
    console.log(_tweets)

   //  Tweet.find({userId: userId}, function(err, _t) {

   //  	console.log('_t -->', _t )

   //  	if ( err ) {
   //  		console.log('err');
   //  		return res.sendStatus(500)
   //  	}

   //  	if ( !_t ) {
   //  		console.log('no data');
   //  		return res.sendStatus(500)
   //  	}

	  //   var sorted_t = _t.sort(function(t1, t2) {
	  //       if (t1.created > t2.created) {
	  //           return -1;
	  //       } else if (t1.created === t2.created) {
	  //           return 0;
	  //       } else {
	  //           return 1;
	  //       }
   //  	})

   //  	// _t is an array & not an object of conn //<------

   //  	console.log(Tweet)

	  //   res.send({
			// tweets: sorted_t.toClient.call(Tweet)
   //  	});
   //  });


});

app.get('/api/tweets/:tweetId', function(req, res) {
    var tweetId = req.params.tweetId, 
    	Tweet = conn.model('Tweet');

    	console.log('tweetId', tweetId)
    	Tweet.findById(tweetId, function(err, _t) {

    		console.log('_t', _t);

    		if ( err ) {
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

    // for (var i = 0; i < fixtures.tweets.length; i++) {
    //     if (fixtures.tweets[i].id === tweetId) {
    //         return res.send({
    //             tweet: fixtures.tweets[i]
    //         })
    //     }
    // }

    // return res.sendStatus(404);
});

app.delete('/api/tweets/:tweetId', ensureAuthentication, function(req, res) {
    var tweetId = req.params.tweetId;
    for (var i = 0; i < fixtures.tweets.length; i++) {
        if (fixtures.tweets[i].id == tweetId) {
            if (fixtures.tweets[i].userId === req.user.id) {
                fixtures.tweets.splice(i, 1);
                return res.sendStatus(200);
            } else {
                return res.sendStatus(403);
            }

        }
    }
    return res.sendStatus(404);
});

function ensureAuthentication(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.sendStatus(403);
    }
    return next();
}

var server = app.listen(config.get('server:port'), config.get('server:host'));




module.exports = server;