const express = require('express');
const router = express.Router();
const { errorHandler, isAdmin } = require('../middleware');
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
router.get('/', errorHandler(indexSolutions));

// Protect routes
router.use(isAdmin);

/* GET New */
router.get('/new', newSolution);

/* POST Create */
router.post('/', errorHandler(createSolution));

// /* GET Show */
// router.get('/:id', errorHandler(showSolution));

/* GET Edit */
router.get('/:id/edit', errorHandler(editSolution));

/* PUT Update */
router.put('/:id', errorHandler(updateSolution));

/* DELETE Destroy */
router.delete('/:id', errorHandler(destroySolution));

module.exports = router;
