require('dotenv').config();
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const requireAuth = require('../middlewares/authMiddleware');

router.get('/', postController.getAllPosts);
router.get(`/${process.env.ADMIN}`, requireAuth, postController.getAllPostsAdmin);
router.get('/tag', postController.getPostByTag);
router.get('/hotPosts', postController.getHotPosts)
router.get('/update/:id', requireAuth, postController.getPostForUpdate);
router.get('/:id', postController.getPost);
router.post('/', requireAuth, postController.createPost);
router.post('/uploadImgFolder', requireAuth, postController.uploadImages);
router.put('/:id', requireAuth, postController.updatePost);
router.post('/:id/increaseView', postController.increaseView);
router.delete('/:id', requireAuth, postController.deletePost);

module.exports = router;