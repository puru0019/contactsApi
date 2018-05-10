var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ContactSchema = new Schema({
	fname: String,
	lname: String,
	phone: Number,
	email: String
});

var Contact = mongoose.model('contact', ContactSchema);

module.exports = Contact;