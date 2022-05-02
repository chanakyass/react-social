const express = require('express');
const router = express.Router();

const posts0 = require('../resources/mocked_post_0.json');
const posts1 = require('../resources/mocked_post_1.json');
const likesOnPost = require('../resources/mocked_likes_on_post.json');
const commentsOnPost = require('../resources/mocked_comments_on_post.json');
const repliesOnComment = require('../resources/mocked_replies_on_comment.json');
const postResponse = require('../resources/mock_create_post.json');

router.get('/resource/posts', (req,res) => {
    const pageNo = req.query['pageNo'];
    let response;
    if(pageNo == 0) {
     response = posts0;
    }
    else if (pageNo == 1){
        response = posts1;
    }
    response.dataList.forEach(item => {
        item.noOfLikes = likesOnPost.dataList.length;
        item.noOfComments = commentsOnPost.dataList.length + repliesOnComment.dataList.length;
        item.isPostLikedByCurrentUser = false;
        item.postLikedByCurrentUser = false;
    });
    res.json(response);
});

// router.get('/resource/posts?pageNo=1&adjustments=:adjustments([0-9]+)', (req,res) => {
//     const response = {ok: true, responseBody: posts1, error: null};
//     res.json(response);
// });

router.route('/resource/post')
      .post((req,res) => {
        postResponse.data.resourceId = (new Date()).getTime()/1000;
        res.json(postResponse);
    })
    .put((req,res) => {
        const postId = req.body.id;
        postResponse.data.resourceId = postId;
        res.json(postResponse);
    });

router.route('/resource/post/:id')
      .delete((req, res) => {
        const postId = req.params.id;
        postResponse.data.resourceId = postId;
        res.json(postResponse);
      });

router.post('/resource/post/:id/like', (req, res) => {
    const postId = req.params.id;
    postResponse.data.resourceId = postId;
    res.json(postResponse);
});

router.delete('/resource/post/:id/unlike', (req, res) => {
    const postId = req.params.id;
    postResponse.data.resourceId = postId;
    res.json(postResponse);
});

module.exports = router;
