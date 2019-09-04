//setting up setup variables
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

//Middleware to parse cookies and body
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const bcrypt = require("bcrypt");

//urlDatabase={shortURL:{longURL:'asdf.ca', userID:"asdfasdf"}}

// b2xVn2: "http://www.lighthouselabs.ca",
// "9sm5xK": "http://www.google.com"
const urlDatabase = {};

const users = {
  user1: {
    id: "user1",
    email: "user1@gmail.com",
    password: "abcd1234"
  },

  user2: {
    id: "user2",
    email: "user2@gmail.com",
    password: "password"
  }
};

app.post("/login", (req, res) => {
  console.log(req.body);
  for (user in users) {
    if (req.body.email === users[user].email) {
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
        res.cookie("user_id", users[user].id);
        res.cookie("email", users[user].email);
        res.redirect("/urls");
        console.log("username and password matched");
      }
    }
  }
});

app.get("/login", (req, res) => {
  console.log(req.body);
  let templateVars = {
    username: req.cookies.email || ""
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies.email
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  //TODO add email/password empty routing
  //TODO add email exists routing
  console.log(req.body);

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("email address or password empty");
  }
  for (user in users) {
    if (req.body.email == users[user].email) {
      return res.status(400).send("email already exists in database");
    }
  }
  let temp = generateRandomString();
  users[temp] = {
    id: temp,
    email: req.body.email,
    password: hashedPassword
  };

  res.cookie("user_id", temp);
  res.cookie("email", users[temp].email);
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.email) {
    console.log("no email cookie");
    return res.redirect("/login");
  }
  let templateVars = {
    username: req.cookies.email
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let temp = generateRandomString();
  urlDatabase[temp] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
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
    username: req.cookies.email
  };
  res.render("urls_show", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("email");
  res.clearCookie("user_id");
  res.redirect("/urls/");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.cookies.user_id),
    username: req.cookies.email
  };
  console.log(users);
  if (!req.cookies.email) {
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

function generateRandomString() {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}

let urlsForUser = ID => {
  let userUrls = {};
  for (short in urlDatabase) {
    if (urlDatabase[short].userID === ID) {
      userUrls[short] = urlDatabase[short].longURL;
    }
  }
  return userUrls;
};
