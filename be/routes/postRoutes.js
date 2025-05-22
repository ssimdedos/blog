const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPost)
router.post('/', postController.createPost);
router.post('/uploadImgFolder', postController.uploadImages);

module.exports = router;