const express = require('express');
const router = express.Router();
const likesOnPost = require('../resources/mocked_likes_on_post.json');
const likesOnComment = require('../resources/mocked_likes_on_comment.json');

router.get('/resource/post/:id/likes', (req,res) => {
    const postId = req.params.id;
    likesOnPost.dataList = likesOnPost.dataList.map((likePost) => ({...likePost, likedPost: {id: postId}}));
    res.json(likesOnPost);
});

router.get('/resource/comment/:id/likes', (req,res) => {
    const commentId = req.params.id;
    likesOnComment.dataList = likesOnComment.dataList.map((likeComment) => ({...likeComment, likedComment: {id: commentId}}));
    res.json(likesOnComment);
});

module.exports = router;


