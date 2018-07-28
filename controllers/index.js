const User = require('../models/user');

module.exports = {
	// GET Register
	getRegister(req, res, next) {
		res.render('register');
	},
	// POST Register
	async postRegister(req, res, next) {
		console.log('registering user');
		let newUser = await User.register(new User({username: req.body.username}), req.body.password);
	  // Check for isAdmin
		req.body.isAdmin === process.env.IS_ADMIN_CODE ? newUser.isAdmin = true ; newUser.isAdmin = false;
		newUser.save();
		console.log('user registered!');
		res.redirect('/');
	},
	// GET Login
	getLogin(req, res, next) {
		res.render('login');
	},
	// POST Login
	async postLogin(req, res, next) {
		await passport.authenticate('local')(req, res, next);
		res.redirect('/');
	}
}