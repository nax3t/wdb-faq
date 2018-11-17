var express = require('express');
var router = express.Router();

const User = require('../models/user');

// Require Register Controller
const {
  userRegister,
  verifyUser, 
  setPassword
} = require('../controllers/auth/register');

const {getLogin, getLogout, postLogin} = require('../controllers/auth/index');
const {resendToken} = require('../controllers/auth/reset-token');

// Require middleware
const {asyncErrorHandler} = require('../middleware/');

/* GET register page */
router.get('/register', async function(req, res, next) {
  let adminSearch = await User.find({});
  console.log(adminSearch);
  res.render('auth/register', {
    title: "Register",
    adminSearch
  });
});

/* POST register page */
router.post('/register', asyncErrorHandler(userRegister));

/* GET validation page */
router.get('/verify', asyncErrorHandler(verifyUser));

/* GET token resend page */
router.get('/token-resend', (req, res) => {
  res.render('auth/resend-token');
})

router.post('/token-resend', asyncErrorHandler(resendToken));

/* GET password-set page */
router.get('/pw', (req, res) => {
  res.render('auth/password', { title: 'Express - Password' });
})
/* POST password-set */
router.post('/pw', asyncErrorHandler(setPassword));

/* GET login page */
router.get('/login', getLogin);

/* POST login page */
router.post('/login', asyncErrorHandler(postLogin));

/* GET login page */
router.get('/logout', asyncErrorHandler(getLogout));

module.exports = router;
