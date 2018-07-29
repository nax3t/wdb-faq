const Solution = require('../models/solution');
// define escapeRegex function for search feature
const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = {
	// GET - Index
	async indexSolutions(req, res, next) {
		let query = [];
		let keywords;
		let search;
		if(req.query.search) {
			search = new RegExp(escapeRegex(req.query.search), 'gi');
			query.push({ 
				$or: [
					{ title: search },
					{ 
						keywords: {
							$in: search
						} 
					}
				]
			});
		}
		query = query.length ? { $and: query } : {};
		let solutions = await Solution.find(query);
		res.render('solutions/index', { solutions });
	},
	// GET - New
	newSolution(req, res, next) {
		res.render('solutions/new');
	},
	// POST - Create
	async createSolution(req, res, next) {
		req.body.solution.keywords = req.body.solution.keywords.split(',');
		await Solution.create(req.body.solution);
		req.flash('success', 'Solution created successfully!');
		res.redirect('/solutions')
	},
	// // GET - Show
	// async showSolution(req, res, next) {
	// 	let solution = await Solution.findById(req.params.id);
	// 	res.render('solutions/show', { solution });
	// },
	// GET - Edit
	async editSolution(req, res, next) {
		let solution = await Solution.findById(req.params.id);
		res.render('solutions/edit', { solution });
	},
	// PUT - Update
	async updateSolution(req, res, next) {
		req.body.solution.keywords = req.body.solution.keywords.split(',');
		await Solution.findByIdAndUpdate(req.params.id, req.body.solution);
		req.flash('success', 'Solution updated successfully!');
		res.redirect('/solutions');
	},
	// DELETE - Destroy
	async destroySolution(req, res, next) {
		await Solution.findByIdAndRemove(req.params.id);
		req.flash('success', 'Solution destroyed successfully!');
		res.redirect('/solutions');
	}
}