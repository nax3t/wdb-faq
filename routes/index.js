const express = require('express');
const router = express.Router();
const { errorHandler } = require('../middleware');
const { 
	getHome,
	getRegister,
	postRegister,
	getLogin,
	postLogin,
	getLogout
} = require('../controllers');

/* GET home page. */
router.get('/', getHome);

/* GET register page. */
router.get('/register', getRegister);

/* POST register */
router.post('/register', errorHandler(postRegister));

/* GET login page. */
router.get('/login', getLogin);

/* POST login */
router.post('/login', errorHandler(postLogin));

/* GET logout */
router.post('/logout', errorHandler(getLogout));

module.exports = router;
