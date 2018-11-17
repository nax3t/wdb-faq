module.exports = {
	// Async/Await Error handler
	asyncErrorHandler: (fn) =>
		(req, res, next) => {
			Promise.resolve(fn(req, res, next))
						 .catch(next);
		},
	// isAdmin checker
	isAdmin(req, res, next) {
		if(req.isAuthenticated() && req.user.isAdmin) {
			return next();
		}
		req.flash('error', 'You don\'t have the privileges to do that, now scram!');
		res.redirect('/')
	}
}