const express = require("express");
const router = express.Router({ mergeParams: true });
const { generateRandomString } = require("../../helperFunctions");

//database models
const User = require("../../models/User");
const URLdatabase = require("../../models/UrlDatabase");

//@Route        get request
//@description  get all users
//@access       public for now
// router.get("/", (req, res) => {
//   User.find().then(users => res.json(users));
// });

// router.post("/", (req, res) => {
//   User.find().then(users => res.json(users));
// });

router.get("/new", (req, res) => {
  if (!req.session.email) {
    return res.redirect("/login");
  }
  let templateVars = {
    username: req.session.email
  };
  res.render("urls_new", templateVars);
});

router.delete("/:shortURL/", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls/");
});

router.put("/:shortURL/", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.send("not authorized");
  }
});

router.get("/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: req.session.email
  };
  res.render("urls_show", templateVars);
});

router.get("/", (req, res) => {
  let templateVars = {
    //urlsforuser is urldatabase.filter something for only user's id
    urls: urlsForUser(req.session.user_id, urlDatabase),
    username: req.session.email
  };
  if (!req.session.email) {
    return res.redirect("/login");
  } else {
    res.render("urls_index", templateVars);
  }
});

router.post("/", (req, res) => {
  let randomString = generateRandomString();
  const urlSet = new URLdatabase({
    shortURL: randomString,
    longURL: req.body.longURL,
    userID: req.body.user_id
  });
  urlSet
    .save()
    .then(item => res.json(item))
    .catch(err => res.status(404).json({ error: err }));
  //res.redirect(`/urls/${randomString}`);
});

module.exports = router;
