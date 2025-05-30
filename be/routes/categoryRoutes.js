const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getAllCategories);
router.delete('/:id', categoryController.deleteCategory);
router.put('/:id/:name', categoryController.editCategory);

module.exports = router;