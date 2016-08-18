var mongoose = require('mongoose');
var adminuserSchema = mongoose.Schema({
  username: String,
  password: String
});
module.exports = mongoose.model('AdminUser', adminuserSchema);
