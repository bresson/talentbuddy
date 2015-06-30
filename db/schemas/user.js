var Schema = require('mongoose').Schema, 
	bcrypt = require('bcrypt');

console.log('user schema')
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
});

userSchema.statics.findByUserId = function(id, done) {
  this.findOne({ id: id }, done)
}

userSchema.methods.follow = function(userId, done) {
  var update = { $addToSet: { followingIds: userId } }
  this.model('User').findByIdAndUpdate(this._id, update, done)
}

userSchema.methods.toClient = function() {
  console.log('========= userSchema.toClient', this);
  return {
    id: this.id, 
    name: this.name
  }
}

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