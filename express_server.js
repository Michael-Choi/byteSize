//setting up setup variables
const mongo = require("mongodb");
const mongoose = require("mongoose");
const assert = require("assert");
const express = require("express");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

//importing router routes for / and /urls
const home = require("./routes/home/home");
const urls = require("./routes/urls/urls");

const db = require("./config/keys").mongoURI;
const app = express();
app.set("view engine", "ejs");

//Middleware to parse cookies and body
//! The program deletes session cookies on redirects without cookieParser
app.use(cookieParser());
app.use(
  cookieSession({
    name: "userId",
    keys: ["id"]
  })
);
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

//connect to mongo
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("mongoDB connects"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 8080; // default port 8080

//all routes that start with /urls get handled here
app.use("/urls", urls);
app.use("/", home);

/** --URL Database format--

urlDatabase={
  shortURL:{
    longURL:'asdf.ca', 
    userID:"qwer"
  }
}

--Users database format--

users={
  user2: {
    id: "user2",
    email: "user2@gmail.com",
    password: "password"
  }
}
*/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
