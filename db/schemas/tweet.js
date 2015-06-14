var Schema = require('mongoose').Schema

var tweetSchema = new Schema ({
	userId: String, 
	created: Number, 
	text: String
});

tweetSchema.methods.toClient = function(cb) {
	console.log('=========toClient', this._id, this)
	return {
		id: this._id,
		text: this.text, 
		created: this.created, 
		userId: this.userId
	}
	//return this.model('Tweet').findOne({ _id: this._id}, 'text', cb)
}

module.exports = tweetSchema;