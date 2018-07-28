const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SolutionSchema = new Schema({
	title: String,
	url: String,
	keywords: [ String ]
});

module.exports = mongoose.model('Solution', SolutionSchema);