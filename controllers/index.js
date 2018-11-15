const User = require('../models/user');
const passport = require('passport');

module.exports = {
	// GET Home
	getHome(req, res, next) {
		res.redirect('/solutions')
	},
}