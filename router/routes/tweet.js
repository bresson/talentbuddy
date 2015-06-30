var express = require('express')
  , router = express.Router()
  , conn = require('../../db')
  , ensureAuthentication = require('../../middleware/ensureAuthentication')


router.post('/', ensureAuthentication, function(req, res) {
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

router.get('/', function(req, res) {
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

router.get('/:tweetId', function(req, res) {
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

router.delete('/:tweetId', ensureAuthentication, function(req, res) {
    var Tweet = conn.model('Tweet'),
        tweetId = req.params.tweetId

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

module.exports = router;