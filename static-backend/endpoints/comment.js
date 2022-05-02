const express = require('express');
const router = express.Router();
const comments0 = require('../resources/mocked_comments_on_post.json');
const comments1 = require('../resources/mocked_replies_on_comment.json');
const likesOnComment = require('../resources/mocked_likes_on_comment.json');
const commentResponse = require('../resources/mocked_comment_response.json');

router.get('/resource/post/:id/comments', (req,res) => {
    const parentPostId = req.params.id;
    comments0.dataList.forEach(item => {
        item.isCommentLikedByCurrentUser =false;
        item.commentLikedByCurrentUser = false;
        item.noOfLikes = likesOnComment.dataList.length;
        item.noOfReplies = comments1.dataList.length;
        item.commentedOn = {
            id: parentPostId
        }
    });
    res.json(comments0);
});

router.get('/resource/comment/:id/replies', (req,res) => {
    const parentId = req.params.id;
    comments1.dataList.forEach(item => {
        item.commentLikedByCurrentUser = false;
        item.isCommentLikedByCurrentUser = false;
        item.noOfLikes = 0;
        item.noOfReplies = 0;
        item.parentComment = {
            id: parentId
        };
    });
    res.json(comments1);
});

router.post('/resource/comment', (req,res) => {
    commentResponse.data.resourceId = (new Date()).getTime()/1000;
    res.json(commentResponse);
});

router.put('/resource/comment', (req,res) => {
    const commentId = req.body.id;
    commentResponse.data.resourceId = commentId;
    res.json(commentResponse);
});

router.delete('/resource/comment/:id', (req, res) => {
    const commentId = req.params.id;
    commentResponse.data.resourceId = commentId;
    res.json(commentResponse);
});

router.post('/resource/comment/:id/like', (req, res) => {
    const commentId = req.params.id;
    commentResponse.data.resourceId = commentId;
    res.json(commentResponse);
});

router.delete('/resource/comment/:id/unlike', (req, res) => {
    const commentId = req.params.id;
    commentResponse.data.resourceId = commentId;
    res.json(commentResponse);
});

module.exports = router;


