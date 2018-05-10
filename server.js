var express = require("express");
var logger = require("morgan");
var bodyParser = require('body-parser');
var _ = require("underscore");
var db = require("./db");
var Contact = require("./models/contacts");


var port = process.env.PORT || 3000;

var app = express();
app.use(logger());
app.use(bodyParser.json());

var middleware = {
	requireAuthentication: function(req, res, next) {
		console.log("hi");
		next();
	}
}

app.use(middleware.requireAuthentication);

app.get("/contacts", function(req, res) {
	Contact.find({}).exec(function(err,contacts) {
		if(err) return res.status(404).send();
		res.json(contacts);
	});
});

app.post("/contacts", function(req, res) {
	var contact = new Contact(req.body);
	contact.save(function(err,contact) {
		if(err) return res.status(404).send();
		res.status(201);
		res.json(contact);
	});
});

app.get("/contacts/:id", function(req, res) {
	Contact.findById(req.params.id).exec(function(err,contact) {
		if(err || contact === null) return res.status(404).send();
		res.json(contact);
	});
});

app.put("/contacts/:id", function(req, res) {
	var body = _.pick(req.body, "fname", "lname", "phone", "email");
	var attributes = {};

	if(body.hasOwnProperty("fname")) {
		attributes.fname = body.fname
	}

	if(body.hasOwnProperty("lname")) {
		attributes.lname = body.lname
	}

	if(body.hasOwnProperty("phone")) {
		attributes.phone = body.phone
	}

	if(body.hasOwnProperty("email")) {
		attributes.email = body.email
	}

	Contact.findByIdAndUpdate(req.params.id,attributes,{new:true}).exec(function(err,contact) {
		if(err || contact === null) return res.status(404).send();
		res.json(contact);
	});
});

app.delete("/contacts/:id", function(req, res) {
	Contact.remove({_id:req.params.id}).exec(function(err) {
		if(err) return res.status(404).send();
		res.status(201).send();
	});
});

app.use(express.static(__dirname + '/public'));

app.listen(port, function() {
	console.log("Listening to port",port);
});