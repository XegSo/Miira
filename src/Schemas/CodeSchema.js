const { Schema, model } = require('mongoose')
const vcode = new Schema({
  UserID: String,
  VerificationCode: String,
  OsuName: String,
  Verified: String,
})

module.exports = model("vcode", vcode)