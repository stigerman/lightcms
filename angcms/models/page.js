var mongoose = require('mongoose');
var pageSchema = mongoose.Schema({
    title: String,
    url: {type:String, index:{unique:true}},
    content: String,
    menuIndex: Number,
    date: Date   
});
module.exports = mongoose.model('Page', pageSchema);
