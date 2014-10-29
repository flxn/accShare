var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AccountSchema   = new Schema({
	site: { type: String, required: true },
	user: { type: String, required: true },
    password: { type: String, required: true },
    comment: { type: String },
    downvotes: { type: Number },
	favicon: { type: String },
	added: { type: Date }
});

module.exports = mongoose.model('Account', AccountSchema);
