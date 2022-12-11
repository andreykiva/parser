const { Schema, model } = require('mongoose');

const Log = new Schema({
	text: {
		type: String,
		required: true
	},
	user: {
		type: String,
		required: true
	},
});

module.exports = model('Log', Log);
