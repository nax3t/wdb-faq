const User = require('../../models/user');
const passport = require('passport');

module.exports = {
	// GET Login
	getLogin(req, res, next) {
		res.render('auth/login');
	},
	// POST Login
	async postLogin(req, res, next) {
		await passport.authenticate('local', {
			successRedirect: '/',
			successFlash: true,
			failureRedirect: '/auth/login',
			failureFlash: true
		})(req, res, next);
	},
	// GET Logout
	async getLogout(req, res, next) {
	  await req.logout();
	  res.redirect('/');
	}
}