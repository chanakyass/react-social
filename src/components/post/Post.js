import cookie from "react-cookies";
import history from "../../app-history";
import React, { useEffect, useState, useRef } from "react";
import { likeUnlikeCUD } from "./post-service";
import { loadComments, commentsCUD } from "../comments/comment-services";
import cleanEmpty from "../utility/cleanup-objects";
import {
  Card,
  Button,
  Accordion,
  Form
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faCommentDots, faReply } from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp as faRegularThumbsUp } from "@fortawesome/free-regular-svg-icons";
import { RestMethod } from "../../enums";
import { UserDetailsPopup } from '../UserDetailsPopup'
import { Comment } from '../comments/Comment'

export const Post = React.memo(({ post, setPosts }) => {
  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");

  const [comments, setComments] = useState({});

  const commentsRef = useRef(null)
  commentsRef.current = comments

  const [commentContent, setCommentContent] = useState("");
  const [postContent, setPostContent] = useState("");

  let [noOfComments, setNoOfComments] = useState(post.noOfComments);

  const reactionBarRef = useRef(null)
  const replyBarRef = useRef(null)
  const commentsDotRef = useRef(null)

  const deleteNestedComments = (commentId, listOfNestedComments) => {
    listOfNestedComments.push(commentId);
    if (commentsRef.current[`comment${commentId}`])
    {
      commentsRef.current[`comment${commentId}`].dataList.forEach((comment) => {
          
          deleteNestedComments(comment.id)
        })
    }
  }

  const handleCommentCUD = async (e, method, commentObj) => {

    let postId = commentObj.postId;
    let itemId = commentObj.commentId;
    let commentContent = commentObj.commentContent;

    const postProp = `post${postId}`.trim();

    e.preventDefault();

    switch (method) {
      case RestMethod.POST:
      case RestMethod.PUT:
        {
           
          
          if (commentContent === '') {
            //raise error
          } else {
                const responseBody = await commentsCUD(
                  method,
                  null,
                  postId,
                  itemId,
                  commentContent
                );
            if ("error" in responseBody) {
              const { error } = responseBody;
              console.log(error);
              history.push("/error");
            } else {

              const { data } = responseBody

                if (comments && comments[postProp]){
                
                  let newComment = {
                    id: data.resourceId,
                    commentedOn: { id: postId },
                    commentedAtTime: new Date().toISOString,
                    commentContent: commentContent,
                    owner: currentUser,
                    commentLikedByCurrentUser: false,
                    noOfLikes: 0,
                    noOfReplies: 0,
                  };

                let newDataList = (method === RestMethod.POST) ?
                  [...comments[postProp].dataList, newComment]
                  : comments[postProp].dataList.map((comment) => {
                    if (comment.id === itemId)
                      return newComment
                    else return comment
                  });
                
                setComments({
                  ...comments, [postProp]: {
                    ...comments[postProp],
                    dataList: newDataList
                  }
                });
              }

                replyBarRef.current.style.display = "none";
                reactionBarRef.current.style.display = "inline-block";
                //setNoOfReplies((noOfReplies) => noOfReplies + 1);
              if (method === RestMethod.POST)
                setNoOfComments(noOfComments => noOfComments + 1)
              
              if (!comments || !comments[postProp]) {
                commentsDotRef.current.focus()
              }
   
            }
          }
        }
        break;

      case RestMethod.DELETE: {
            const responseBody = await commentsCUD(
              method,
              null,
              postId,
              itemId,
              null
            );
        if ("error" in responseBody) {
          const { error } = responseBody;
          console.log(error);
          history.push("/error");
        } else {

            setComments({
              ...comments,
              [postProp]: {
                ...comments[`post${postId}`],
                dataList: comments[`post${postId}`].dataList.filter(
                  (comment) => comment.id !== itemId
                ),
              },
            });

          
          setNoOfComments((noOfComments) => noOfComments - 1);
          
        }
      }
    }
  };

  const handleGetComments = async (e, postId, pageNo) => {
    const postProp = `post${postId}`.trim();


    if (
      postId &&
        (!comments[postProp] ||
          (comments[postProp] && comments[postProp].currentPageNo !== pageNo))) {
      const responseBody = await loadComments(
        postId,
        null,
        pageNo
      );
      if ("error" in responseBody) {
        const { error } = responseBody;
        console.log("/error");
        history.push("/error");
      } else {

        setComments({ ...comments, [postProp]: responseBody });
        
        
      }
    }
  };

  const handleLikeUnlikePost = async (e, post, action) => {
    const responseBody = await likeUnlikeCUD(post, action);
    if ("error" in responseBody) {
      const { error } = responseBody;
      console.log(error);
      history.push("/error");
    } else {
      const postLikedByCurrentUser = action === "like" ? true : false;

      setPosts((posts) => {
        let dataList = posts.dataList.map((iterPost) => {
          if (iterPost.id === post.id) {
            return { ...iterPost, postLikedByCurrentUser };
          } else {
            return iterPost;
          }
        });

        return { ...posts, dataList: dataList };
      });
    }
  };
  return (
    <div>
      <Card className="mt-5" style={{ maxWidth: "80%", borderBottom: "none" }}>
        {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
        {console.log(post.id)}

        <Card.Body>
          <Card.Title>{post.postHeading}</Card.Title>
          <Card.Subtitle>
            <UserDetailsPopup owner={post.owner} />
          </Card.Subtitle>
          <Card.Text>{post.postBody}</Card.Text>
        </Card.Body>
      </Card>
      <Accordion>
        <Card style={{ maxWidth: "80%", borderTop: "none" }}>
          <Card.Header
            style={{
              background: "none",
              border: "none",
              margin: "none",
              textDecoration: "underline",
              color: "dodgerblue",
            }}
          >
            <div ref={reactionBarRef} style={{ display: "inline-block" }}>
              {post.postLikedByCurrentUser === false ? (
                <FontAwesomeIcon
                  onClick={(e) => handleLikeUnlikePost(e, post, "like")}
                  icon={faRegularThumbsUp}
                  style={{
                    marginLeft: "1rem",
                    marginRight: "1rem",
                    cursor: "pointer",
                  }}
                ></FontAwesomeIcon>
              ) : (
                <FontAwesomeIcon
                  onClick={(e) => handleLikeUnlikePost(e, post, "unlike")}
                  icon={faThumbsUp}
                  style={{
                    marginLeft: "1rem",
                    marginRight: "1rem",
                    cursor: "pointer",
                  }}
                ></FontAwesomeIcon>
              )}
              {noOfComments > 0 && (
                <>
                  <Accordion.Toggle
                    as={Button}
                    variant="link"
                    eventKey={`post${post.id}`}
                    onClick={(e) => handleGetComments(e, post.id, 0)}
                    ref = {commentsDotRef}
                  >
                    <FontAwesomeIcon
                      icon={faCommentDots}
                      style={{
                        marginLeft: "1rem",
                        marginRight: "1rem",
                      }}
                    ></FontAwesomeIcon>
                  </Accordion.Toggle>
                </>
              )}
              <FontAwesomeIcon
                onClick={(e) => {
                  replyBarRef.current.style.display = "inline-block";
                  reactionBarRef.current.style.display = "none";
                }}
                icon={faReply}
                style={{
                  marginLeft: "1rem",
                  marginRight: "1rem",
                  cursor: "pointer",
                }}
              ></FontAwesomeIcon>
            </div>
            <div ref={replyBarRef} style={{ display: "none" }}>
              <Form.Group controlId={`commentBoxFor${post.id}`}>
                <Form.Control
                  as="textarea"
                  rows={3}
                  cols={100}
                  id={`commentOn${post.id}`}
                  name={`commentOn${post.id}`}
                  onChange={(e) => setCommentContent(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId={`replyBoxFor${post.id}`}>
                <Button
                  type="submit"
                  id={`submitCommentOn${post.id}`}
                  name={`submitCommentOn${post.id}`}
                  onClick={(e) =>
                    handleCommentCUD(e, RestMethod.POST, {commentId: null, postId: post.id, commentContent: commentContent} )
                  }
                >
                  reply
                </Button>
              </Form.Group>
            </div>
          </Card.Header>

          {noOfComments > 0 && (
            <Accordion.Collapse eventKey={`post${post.id}`}>
              <Card.Body>
                {comments[`post${post.id}`.trim()] &&
                  comments[`post${post.id}`].dataList.map((comment, index2) => {
                    return (
                      //postId, parentCommentId, comment, handleCommentCUD, setParentComments, setCommentContent, commentContent, setNoOfRepliesInParent
                      <Comment
                        key={`comment${comment.id}`}
                        postId={post.id}
                        parentCommentId={null}
                        comment={{ ...comment }}
                        handleCommentCUD={handleCommentCUD}
                        setParentComments={setComments}
                        setNoOfRepliesInParent={null}
                      />
                    );
                  })}
              </Card.Body>
            </Accordion.Collapse>
          )}
        </Card>
      </Accordion>
    </div>
  );
});
