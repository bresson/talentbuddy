var Schema = require('mongoose').Schema, 
	bcrypt = require('bcrypt');

var userSchema = new Schema ({
	id: {type: String, unique: true}, 
	name: String, 
	email: {type: String, unique: true}, 
	password: String, 
	followingIds: {type: [String], default: [] }
});

userSchema.pre('save', function(next) {
  var _this = this

  bcrypt.hash(this.password, 10, function(err, passwordHash) {
    if (err) {
      return next(err)
    }
    _this.password = passwordHash
    next()
  })
})

// my solution - works
// but requires genSalt method 
// userSchema.pre('save', function(next) {
// 	var user = this;
// 	console.log('this', this, 'user', user);

// 	bcrypt.genSalt(10, function(err, salt) {
// 		if ( err ) {
// 			console.log('err')
// 			return next(err);
// 		}

// 	    bcrypt.hash(user.password, salt, function(err, hash) {
// 	        if (err ) {
// 	        	console.log('err')
// 	        	return next(err)
// 	        }

// 	        user.password = hash;
// 	        next();
// 	    });
// 	});
	
// })

module.exports = userSchema