//setting up setup variables
const mongo = require("mongodb");
const mongoose = require("mongoose");
const assert = require("assert");
const express = require("express");

const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const dotenv = require("dotenv").config();
//importing router routes for / and /urls
const home = require("./routes/home/home");
const urls = require("./routes/urls/urls");

const app = express();
app.set("view engine", "ejs");

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

//Middleware to parse cookies and body
//! The program deletes session cookies on redirects without cookieParser
app.use(cookieParser());
app.use(
  cookieSession({
    name: "userId",
    keys: ["id"]
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//connect to mongo

mongoose
  .connect(process.env.MONGOURI, { useNewUrlParser: true })
  .then(() => console.log("mongoDB connects"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 8080; // default port 8080

//all routes that start with /urls get handled here
app.use("/urls", urls);
app.use("/", home);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
