const { assert } = require("chai");
const { getUserByEmail } = require("../helperFunctions");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });

  it("should return undefined with not valid email", function() {
    const user = getUserByEmail("6767user@example.com", testUsers);
    // Write your assert statement here
    assert.notExists(user);
  });
});
