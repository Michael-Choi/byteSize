const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const URLdatabaseSchema = new Schema({
  shortURL: {
    type: String,
    required: true
  },
  longURL: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true
  }
});

module.exports = URLdatabase = mongoose.model("URLdatabase", URLdatabaseSchema);
