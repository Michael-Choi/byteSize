const express = require("express");
const router = express.Router({ mergeParams: true });
const { generateRandomString } = require("../../helperFunctions");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

router.use(cookieParser());
router.use(
  cookieSession({
    name: "userId",
    keys: ["id"]
  })
);
router.use(bodyParser.urlencoded({ extended: true }));

//database models
const User = require("../../models/User");
const URLdatabase = require("../../models/UrlDatabase");

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
  URLdatabase.findOne({ shortURL: req.params.shortURL }).then(link =>
    link
      .remove()
      .then(res.redirect("/urls/"))
      .catch(err => res.json(err))
  );
});

router.put("/:shortURL/", (req, res) => {
  URLdatabase.findOne({ shortURL: req.params.shortURL }).then(foundURL => {
    if (req.session.user_id === foundURL.userID) {
      URLdatabase.findOneAndUpdate(
        { shortURL: req.params.shortURL },
        { longURL: req.body.longURL }
      ).then(res.redirect(`/urls/${req.params.shortURL}`));
    }
  });
});

router.get("/:shortURL", (req, res) => {
  URLdatabase.findOne({ shortURL: req.params.shortURL })
    .then(foundURL => {
      //! this sometimes returns null for somereason???
      console.log("found url", foundURL);
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: foundURL.longURL,
        username: req.session.email
      };
      return res.render("urls_show", templateVars);
    })
    .catch(err => res.json(err));
});

router.get("/", (req, res) => {
  if (!req.session.email) {
    console.log("being redirected to login");
    return res.redirect("/login");
  }
  let searchID = req.session.user_id;
  console.log("session uid", req.session.user_id);
  URLdatabase.find({ userID: searchID })
    .then(url => {
      //pass in key:value pair object of short:long to result then pass that object into template
      let result = {};
      for (key in url) {
        result[url[key].shortURL] = url[key].longURL;
      }
      let templateVars = {
        urls: result,
        username: req.session.email
      };
      res.render("urls_index", templateVars);
    })
    .catch(err => res.json(err));
});

router.post("/", (req, res) => {
  let randomString = generateRandomString();
  req.session.longURL = req.body.longURL;
  const urlSet = new URLdatabase({
    shortURL: randomString,
    longURL: req.body.longURL,
    userID: req.session.user_id
  });
  urlSet
    .save()
    .then(res.redirect(`/urls/${randomString}`))
    .catch(err => res.status(404).json({ error: err }));
  //res.redirect(`/urls/${randomString}`);
});

module.exports = router;
