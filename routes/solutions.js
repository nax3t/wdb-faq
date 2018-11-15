const express = require('express');
const router = express.Router();
const { asyncErrorHandler, isAdmin } = require('../middleware');
const { 
	indexSolutions,
	newSolution,
	createSolution,
	// showSolution,
	editSolution,
	updateSolution,
	destroySolution
} = require('../controllers/solutions');


/* GET Index */
router.get('/', asyncErrorHandler(indexSolutions));

// Protect routes
router.use(isAdmin);

/* GET New */
router.get('/new', newSolution);

/* POST Create */
router.post('/', asyncErrorHandler(createSolution));

// /* GET Show */
// router.get('/:id', asyncErrorHandler(showSolution));

/* GET Edit */
router.get('/:id/edit', asyncErrorHandler(editSolution));

/* PUT Update */
router.put('/:id', asyncErrorHandler(updateSolution));

/* DELETE Destroy */
router.delete('/:id', asyncErrorHandler(destroySolution));

module.exports = router;
