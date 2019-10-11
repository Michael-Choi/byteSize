const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { generateRandomString } = require("../../helperFunctions");
const User = require("../../models/User");
const URLdatabase = require("../../models/UrlDatabase");

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
// app.use(bodyParser.json());

router.post("/login", (req, res) => {
  let searchEmail = req.body.email;

  User.findOne({ email: searchEmail })
    .then(foundEmail => {
      console.log(req.body.password);
      if (bcrypt.compareSync(req.body.password, foundEmail.password)) {
        console.log("right and being redirected");
        req.session.user_id = foundEmail.id;
        req.session.email = foundEmail.email;
        return res.redirect("/urls");
      } else {
        req.session.wrongLogin = true;
        res.redirect("/login");
      }
    })
    .catch(err => {
      res.status(404).json(err);
    });
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
  const { email, password } = req.body;
  //if either parameter is empty, set cookie to equal blank so that .ejs file will present the text
  if (email === "" || password === "") {
    req.session.emailExists = "blank";
    return res.redirect("/register");
  }

  User.findOne({ email })
    .then(founduser => {
      //if User exists in the database
      if (founduser) {
        req.session.emailExists = "true";
        return res.redirect("/register");
      }
      //user doesn't exist
      //random string for user id
      let temp = generateRandomString();
      const id = temp;
      const user = new User({
        id,
        email,
        password: hashedPassword
      });

      req.session.user_id = temp;
      req.session.email = email;

      user
        .save()
        .then(res.redirect("/urls"))
        .catch(err => res.status(404));
    })
    .catch(err => {
      res.json(err);
    });
});

router.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/");
});

router.get("/u/:shortURL", (req, res) => {
  URLdatabase.findOne({ shortURL: req.params.shortURL })
    .then(foundURL => {
      longURL = foundURL.longURL;
      if (longURL.slice(0, 4) !== "http") {
        longURL = `https://${longURL}`;
      }
      res.redirect(longURL);
    })
    .catch(err => res.json(err));
});

router.get("/", (req, res) => {
  res.redirect("/urls");
});

module.exports = router;
