const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getAllSubCategories);
router.post('/', categoryController.createSubCategory);
router.delete('/:id', categoryController.deleteSubCategory);

module.exports = router;