const express = require('express');
const router = express.Router();
const { errorHandler } = require('../middleware');
const { 
	getRegister,
	postRegister,
	getLogin,
	postLogin,

} = require('../controllers');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET register page. */
router.get('/register', getRegister);

/* POST register */
router.post('/register', errorHandler(postRegister));

/* GET login page. */
router.get('/login', getLogin);

/* POST login */
router.post('/login', errorHandler(postLogin));

module.exports = router;
