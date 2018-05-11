var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	password: {
		type: String,
		required: true
	}
});

UserSchema.statics.authenticate = function(email, password, callback) {
	User.findOne({email:email}).exec(function(error,user) {
		if(error || !user) return callback(error);
		//console.log(user);
		bcrypt.compare(password, user.password, function(error, result) {
			if(result === true) {
				return callback(null,user)
			} else {
				return callback();
			}
		});
	});
}

UserSchema.pre("save", function(next) {
	var user = this;
	bcrypt.hash(user.password, 10, function(err,hash) {
		if(err) return res.json(err);
		user.password = hash;
		next();
	});
});

var User = mongoose.model("User", UserSchema);

module.exports = User;