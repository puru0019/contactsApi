var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/contacts");
mongoose.connection.once("open", function() {
	console.log("Database successfully connected");
}).on("error", function() {
	console.log("Error is connection to db");
});