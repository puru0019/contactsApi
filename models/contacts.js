var mongoose = require("mongoose");
var Schema = mongoose.Schema;



var ContactSchema = new Schema({
	fname: {type: String, required: true, trim: true},
	lname: {type: String, required: true, trim: true},
	phone: {type: Number, required: true, trim: true},
	email: {type: String, required: true, trim: true}
});

var Contact = mongoose.model('contact', ContactSchema);

module.exports = Contact;