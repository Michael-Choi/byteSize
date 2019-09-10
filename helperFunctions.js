let generateRandomString = () => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 8; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
};

let urlsForUser = (ID, urlDatabase) => {
  let userUrls = {};
  for (short in urlDatabase) {
    if (urlDatabase[short].userID === ID) {
      userUrls[short] = urlDatabase[short].longURL;
    }
  }
  return userUrls;
};

let getUserByEmail = (target, database) => {
  for (user in database) {
    if (database[user].email === target) {
      console.log(user);
      return user;
    }
  }
  return undefined;
};
module.exports = { generateRandomString, urlsForUser, getUserByEmail };
