require('dotenv').config();
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getAllPosts);
router.get(`/${process.env.ADMIN}`, postController.getAllPostsAdmin);
router.get('/tag', postController.getPostByTag);
router.get('/hotPosts', postController.getHotPosts)
router.get('/update/:id', postController.getPostForUpdate);
router.get('/:id', postController.getPost);
router.post('/', postController.createPost);
router.post('/uploadImgFolder', postController.uploadImages);
router.put('/:id', postController.updatePost);
router.post('/:id/increaseView', postController.increaseView);
router.delete('/:id', postController.deletePost);

module.exports = router;