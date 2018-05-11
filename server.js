var express = require("express");
var logger = require("morgan");
var bodyParser = require('body-parser');
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var _ = require("underscore");
var db = require("./db");
var Contact = require("./models/contacts");
var User = require("./models/user");


var port = process.env.PORT || 4000;

var app = express();
app.use(logger());
app.use(bodyParser.json());

var middleware = {
	requireAuthentication: function(req, res, next) {
		if(!req.session.userId) {
			return res.status(403).send();
		} else {
			User.findById(req.session.userId).exec(function(error, user) {
				if(error) return res.status(404).send();
				next();
			});
		}
	}
}

app.use(session({
	secret: "This is secret message",
	resave: true,
	saveUninitialized: false,
	store: new MongoStore({
		mongooseConnection: db
	})
}));

//app.use(middleware.requireAuthentication);

app.get("/contacts", middleware.requireAuthentication, function(req, res) {
	Contact.find({}).exec(function(err,contacts) {
		if(err) return res.status(404).send();
		res.json(contacts);
	});
});

app.post("/contacts", middleware.requireAuthentication, function(req, res) {
	var contact = new Contact(req.body);
	contact.save(function(err,contact) {
		if(err) return res.status(404).send();
		res.status(201);
		res.json(contact);
	});
});

app.get("/contacts/:id", middleware.requireAuthentication, function(req, res) {
	Contact.findById(req.params.id).exec(function(err,contact) {
		if(err || contact === null) return res.status(404).send();
		res.json(contact);
	});
});

app.put("/contacts/:id", middleware.requireAuthentication, function(req, res) {
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

app.delete("/contacts/:id", middleware.requireAuthentication, function(req, res) {
	Contact.remove({_id:req.params.id}).exec(function(err) {
		if(err) return res.status(404).send();
		res.status(201).send();
	});
});

app.post("/register", function(req, res) {
	//console.log(req.body);
	if(req.body.email && req.body.name && req.body.password) {
		var user = new User(req.body);
		user.save(function(err,user) {
			if(err) return res.json(err);
			req.session.userId = user._id;
			res.json(user);
		});
	}
	else {
		return res.status(400).send();
	}
});

app.post("/login", function(req, res) {
	if(req.body.email && req.body.password) {
		User.authenticate(req.body.email, req.body.password, function(error, user) {
			if(error || !user) return res.status(401).send();
			req.session.userId = user._id;
			res.status(201).send();
		});
	} else {
		return res.status(401).send();
	}
});

app.get("/logout", function(req, res) {
	if(req.session) {
		req.session.destroy(function(err){
			if (err) return res.json(err);
			return res.status(200).send();
		});
	}
});

app.use(express.static(__dirname + '/public'));

app.listen(port, function() {
	console.log("Listening to port",port);
});