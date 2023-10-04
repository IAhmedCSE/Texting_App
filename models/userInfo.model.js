const mongoose = require("mongoose");

const userInfo = mongoose.Schema({
  id: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  department: {
    type: String,
    require: true,
  },
  session: {
    type: String,
    require: true,
  },
  phone: {
    type: Number,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("userInfo", userInfo);