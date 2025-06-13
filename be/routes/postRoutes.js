require('dotenv').config();
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getAllPosts);
router.get(`/${process.env.ADMIN}`, postController.getAllPostsAdmin);
router.get('/:id', postController.getPost)
router.post('/', postController.createPost);
router.post('/uploadImgFolder', postController.uploadImages);
router.put('/:id', postController.updatePost);
router.get('/update/:id', postController.getPostForUpdate);
router.post('/:id/increaseView', postController.increaseView);

module.exports = router;