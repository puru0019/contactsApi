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
	User.findById(req.session.userId).exec(function(err,user){
		if(err) return res.status(404).send();
	 	res.json(user.contacts);
	});
});

app.post("/contacts", middleware.requireAuthentication, function(req, res) {
	User.findById(req.session.userId).exec(function(err,user){
		if(err) return res.status(404).send();
		user.contacts.push(req.body);
		user.save(function(err,user){
			if(err) return res.status(404).json(err);
			res.status(201);
		 	res.json(user);
		});
	});
});

app.get("/contacts/:id", middleware.requireAuthentication, function(req, res) {
	User.findById(req.session.userId).exec(function(err,user){
		if(err) return res.status(404).json(err);
		user.contacts.forEach(function(contact){
			if(contact._id.toString() === req.params.id.toString()) {
				res.json(contact);
			}
		});
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

	User.findOneAndUpdate({"_id":req.session.userId,"contacts._id":req.params.id},{"$set":{"contacts.$":attributes}},{new:true}).exec(function(err,user){
		if(err || user === null) return res.status(404).send();
		res.json(user)
	});
});

app.delete("/contacts/:id", middleware.requireAuthentication, function(req, res) {
	User.findById(req.session.userId).exec(function(err,user) {
		if(err) return res.status(404).send();
		user.contacts.id(req.params.id).remove();
		user.save(function(err,user){
			if(err) return res.status(403).json(err);
			res.status(201).send();
		});
	});
});

app.post("/register", function(req, res) {
	//console.log(req.body);
	if(req.body.email && req.body.name && req.body.password) {
		var user = new User(req.body);
		user.save(function(err,user) {
			if(err) return res.status(400).json(err);
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