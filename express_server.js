let {
  generateRandomString,
  urlsForUser,
  getUserByEmail
} = require("./helperFunctions");

//setting up setup variables
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

//Middleware to parse cookies and body

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "asdf",
    keys: ["id"]
  })
);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const bcrypt = require("bcrypt");

/** URL Database format
urlDatabase={
  shortURL:{
    longURL:'asdf.ca', 
    userID:"asdfasdf"
  }
} */

const urlDatabase = {};

const users = {
  // user1: {
  //   id: "user1",
  //   email: "user1@gmail.com",
  //   password: "abcd1234"
  // },

  user2: {
    id: "user2",
    email: "user2@gmail.com",
    password: "password"
  }
};

app.post("/login", (req, res) => {
  console.log("body inside /login");
  console.log(req.body);

  for (user in users) {
    if (req.body.email === users[user].email) {
      console.log("email found");
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
        req.session.user_id = users[user].id;
        req.session.email = users[user].email;
        console.log(req.session.email);
        console.log("username and password matched");
        return res.redirect("/urls");
      }
    }
  }
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  console.log("the cookies inside /login");
  console.log(req.session);
  let templateVars = {
    username: req.session.email || ""
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    username: req.session.email
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  //TODO add email/password empty routing
  //TODO add email exists routing
  console.log(users);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("email address or password empty");
  }
  console.log(req.body);
  if (getUserByEmail(req.body.email, users)) {
    console.log(getUserByEmail(req.body.email, users));
    console.log("already exists");
    console.log(users);
    return res.status(400).send("email already exists in database");
  }

  let temp = generateRandomString();
  users[temp] = {
    id: temp,
    email: req.body.email,
    password: hashedPassword
  };

  console.log(users[temp].email);
  req.session.user_id = temp;
  req.session.email = users[temp].email;
  console.log(`the cookies inside /register is:`);
  console.log(req.session);

  res.redirect("/urls");
  res.end();
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.email) {
    console.log("no email cookie");
    return res.redirect("/login");
  }
  let templateVars = {
    username: req.session.email
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let temp = generateRandomString();
  urlDatabase[temp] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${temp}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.session.email
  };
  res.render("urls_show", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/urls/");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    username: req.session.email
  };
  console.log("cookies inside /urls are:");
  console.log(req.session);
  if (!req.session.email) {
    return res.redirect("/login");
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
