const express = require("express");
const router = express.Router();

const User = require("../../models/User");
const UrlDatabase = require("../../models/UrlDatabase");

router.post("/login", (req, res) => {
  for (user in users) {
    if (req.body.email === users[user].email) {
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
        req.session.user_id = users[user].id;
        req.session.email = users[user].email;
        return res.redirect("/urls");
      }
    }
  }
  req.session.wrongLogin = true;
  res.redirect("/login");
});

router.get("/login", (req, res) => {
  if (req.session.email) {
    return res.redirect("/urls");
  }
  let templateVars = {
    username: req.session.email || "",
    wrongPassword: req.session.wrongLogin
  };
  res.render("login", templateVars);
});

router.get("/register", (req, res) => {
  if (req.session.email) {
    return res.redirect("/urls");
  }
  let templateVars = {
    username: req.session.email,
    emailExists: req.session.emailExists
  };
  res.render("register", templateVars);
});

router.post("/register", (req, res) => {
  //Hashes password
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  //if either parameter is empty, set cookie to equal blank so that .ejs file will present the text
  if (req.body.email === "" || req.body.password === "") {
    req.session.emailExists = "blank";
    return res.redirect("/register");
  }

  if (getUserByEmail(req.body.email, users)) {
    req.session.emailExists = "true";
    return res.redirect("/register");
  }

  //random string for user id
  let temp = generateRandomString();
  const id = temp;
  temp = {
    id,
    email: req.body.email,
    password: hashedPassword
  };

  req.session.user_id = temp.id;
  req.session.email = temp.email;
  res.redirect("/urls");
});

router.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/");
});

router.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  if (longURL.slice(0, 4) !== "http") {
    longURL = "https://" + longURL;
  }
  res.redirect(longURL);
});

router.get("/", (req, res) => {
  res.redirect("/urls");
});
module.exports = router;
