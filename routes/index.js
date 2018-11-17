const express = require('express');
const router = express.Router();
const { errorHandler } = require('../middleware');
const { 
	getHome
} = require('../controllers');

/* GET home page. */
router.get('/', getHome);

module.exports = router;
