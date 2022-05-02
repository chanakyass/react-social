
import React from "react";
import Parser from "html-react-parser";
import {
  Card,
  Button,
  Accordion,
  Form
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faReply } from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp as faRegularThumbsUp, faEdit, faCommentDots, faWindowClose } from "@fortawesome/free-regular-svg-icons";
import { RestMethod } from "../../enums";
import  UserDetailsPopup  from '../utility/UserDetailsPopup'
import  Comment  from '../comments/Comment'
import  CreatePost  from "./CreatePost";
import  LikesModal  from "../likes/LikesModal";
import { convertDateToReadableFormat } from '../utility/handle-dates'
import  CustomToggle  from '../utility/CustomToggle';
import { debounced } from "../utility/debouncer";
import usePostState from "./usePostState";

const Post = React.memo(({ post, setPosts, setNoOfDeletedPostsInSession }) => {

  const {stateInfo, funcs, refs} = usePostState({ post, setPosts, setNoOfDeletedPostsInSession });
  
  const [currentUser, comments, setComments, showPostModal, setShowPostModal, commentContent, setCommentContent, showLikesModal, setShowLikesModal,
    showGetRepliesLoad, setCommentsAccordianOpen, setNoOfCommentsDeletionsInSession, localLike, setLocalLike] = stateInfo;
  const [adjustNoOfCommentsInParentPost, handlePostDelete, handleMovingPartsOnClick, handleCreateComment, handleGetComments,
    handleLikeUnlikePost, handleMovingPartsForKeys] = funcs;
  const [replyBarRef, reactionBarRef, replyInputRef, commentsDotRef, paginationRef, likeRef, postHelperRef] = refs;

  return (
    <div>
      {showPostModal === true && (
        <CreatePost
          setShow={setShowPostModal}
          show={showPostModal}
          method={RestMethod.PUT}
          setPosts={setPosts}
          post={post}
        />
      )}

      {showLikesModal === true && (
        <LikesModal
          itemId={post.id}
          itemType="POST"
          setShow={setShowLikesModal}
          show={showLikesModal}
        />
      )}

      <Card className="mt-2" style={{ maxWidth: "100%", borderBottom: "none" }}>
        {/* <Card.Img variant="top" src="holder.js/100px180" /> */}

        <Card.Body>
          <Card.Title className="border-bottom pb-3">
            {post.postHeading}
          </Card.Title>
          <Card.Subtitle>
            <div className="pb-4">
              <UserDetailsPopup owner={post.owner} />
              <div className="my-1">
                <button className="link-button">
                  <small>
                    {(!post.modifiedAtTime ? "Posted: " : "Modified: ") +
                      `${convertDateToReadableFormat(
                        !post.modifiedAtTime
                          ? post.postedAtTime
                          : post.modifiedAtTime
                      )}`}
                  </small>
                </button>
              </div>
            </div>
          </Card.Subtitle>
          <Card.Text>{Parser(post.postBody)}</Card.Text>
        </Card.Body>
      </Card>

      <Accordion>
        <Card className="card-accordion">
          <Card.Header
            style={{
              background: "none",
              border: "none",
              margin: "none",
            }}
          >
            <div
              ref={reactionBarRef}
              className="pl-2"
              style={{ display: "inline-block" }}
            >
              <div className="mb-3">
                {localLike.noOfLikes > 0 && (
                  <button
                    className="link-button mr-3 not-selectable"
                    onClick={(e) => {
                      setShowLikesModal(true);
                    }}
                  >
                    <small>View Likes</small>
                  </button>
                )}
              </div>
              {localLike.postLikedByCurrentUser === false ? (
                <span style={{ marginRight: "1rem", userSelect: "none" }}>
                  <FontAwesomeIcon
                    color="#4A4A4A"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLocalLike({
                        postLikedByCurrentUser: true,
                        noOfLikes: localLike.noOfLikes + 1,
                      });
                      likeRef.current = true;
                      debounced(600, handleLikeUnlikePost, postHelperRef.current, e, post, "like");
                    }}
                    icon={faRegularThumbsUp}
                    style={
                      post.owner.id !== currentUser.id
                        ? {
                            marginRight: "0.4rem",
                            cursor: "pointer",
                          }
                        : {
                            marginRight: "0.4rem",
                            opacity: 0.4,
                          }
                    }
                  ></FontAwesomeIcon>
                  <span style={{ color: "#4A4A4A", userSelect: "none" }}>
                    {localLike.noOfLikes}
                  </span>
                </span>
              ) : (
                <span style={{ marginRight: "1rem" }}>
                  <FontAwesomeIcon
                    color="#4A4A4A"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLocalLike({
                        postLikedByCurrentUser: false,
                        noOfLikes: localLike.noOfLikes - 1,
                      });
                      likeRef.current = true;
                      debounced(600, handleLikeUnlikePost, postHelperRef.current, e, post, "unlike");
                    }}
                    icon={faThumbsUp}
                    style={{
                      marginRight: "0.4rem",
                      cursor: "pointer",
                    }}
                  ></FontAwesomeIcon>
                  <span style={{ color: "grey", userSelect: "none" }}>
                    {localLike.noOfLikes}
                  </span>
                </span>
              )}

              <button
                className="toggle-button"
                onClick={(e) => {
                  if (
                    post.noOfComments > 0 &&
                    (!comments || !comments[`post${post.id}`])
                  ) {
                    handleGetComments(e, post.id, 0);
                  }
                  if (post.noOfComments > 0)
                    setCommentsAccordianOpen(
                      (commentsAccordianOpen) => !commentsAccordianOpen
                    );
                }}
              >
                <CustomToggle
                  eventKey={`post${post.id}`}
                  attachRef={commentsDotRef}
                  allowToggle={post.noOfComments}
                >
                  <FontAwesomeIcon icon={faCommentDots} color="#4A4A4A" />
                  {post.noOfComments !== 0 && (
                    <span style={{ color: "#4A4A4A", marginLeft: "0.4rem" }}>
                      {post.noOfComments}
                    </span>
                  )}
                </CustomToggle>
              </button>

              <FontAwesomeIcon
                onClick={(e) => {
                  handleMovingPartsOnClick(e, "REPLY", null);
                }}
                color="#4A4A4A"
                icon={faReply}
                style={{
                  marginLeft: "1rem",
                  marginRight: "1rem",
                  cursor: "pointer",
                }}
              ></FontAwesomeIcon>

              {post.owner.id === currentUser.id && (
                <FontAwesomeIcon
                  icon={faEdit}
                  color="#4A4A4A"
                  style={{
                    marginLeft: "1rem",
                    marginRight: "1rem",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    setShowPostModal(true);
                  }}
                ></FontAwesomeIcon>
              )}
              {post.owner.id === currentUser.id && (
                <FontAwesomeIcon
                onClick={(e) => {
                  handlePostDelete(e, post.id);
                }}
                  color="#4A4A4A"
                  icon={faWindowClose}
                  style={{
                    marginLeft: "1rem",
                    marginRight: "1rem",
                    cursor: "pointer",
                  }}
                ></FontAwesomeIcon>
              )}
            </div>
            <div ref={replyBarRef} style={{ display: "none" }}>
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  cols={90}
                  id={`commentOn${post.id}`}
                  name={`commentOn${post.id}`}
                  onChange={(e) => setCommentContent(e.target.value)}
                  ref={replyInputRef}
                  onKeyDown={(e) => {
                    handleMovingPartsForKeys(e);
                  }}
                />
              </Form.Group>
              <Form.Group>
                <Button
                  type="submit"
                  variant="secondary"
                  id={`submitCommentOn${post.id}`}
                  name={`submitCommentOn${post.id}`}
                  onClick={(e) =>
                    handleCreateComment(e, {
                      commentId: null,
                      postId: post.id,
                      commentContent: commentContent,
                    })
                  }
                >
                  reply
                </Button>
              </Form.Group>
            </div>
          </Card.Header>

          {showGetRepliesLoad === true && (
            <div className="bg-white spinner-container">
              <div className="spinner bg-light ">
                <div className="bounce1"></div>
                <div className="bounce2"></div>
                <div className="bounce3"></div>
              </div>
            </div>
          )}

          {
            <Accordion.Collapse eventKey={`post${post.id}`}>
              <Card.Body className="pt-0">
                {post.noOfComments > 0 &&
                  comments[`post${post.id}`.trim()] &&
                  comments[`post${post.id}`].dataList.map((comment, index2) => {
                    return (
                      <Comment
                        key={`comment${comment.id}`}
                        post={post}
                        parentComment={null}
                        comment={comment}
                        setParentComments={setComments}
                        adjustNoOfRepliesInHeirarchy={null}
                        adjustNoOfCommentsInParentPost={
                          adjustNoOfCommentsInParentPost
                        }
                        handleMovingPartsOnClickPost={handleMovingPartsOnClick}
                        setNoOfCommentsDeletionsInSession={
                          setNoOfCommentsDeletionsInSession
                        }
                      />
                    );
                  })}
                {comments[`post${post.id}`.trim()] &&
                  comments[`post${post.id}`].currentPageNo <
                    comments[`post${post.id}`].noOfPages - 1 && (
                    <div className="bg-light pl-1 pt-1" ref={paginationRef}>
                      <button
                        style={{ display: "block" }}
                        className="link-button"
                        onClick={(e) =>
                          handleGetComments(
                            e,
                            post.id,
                            comments[`post${post.id}`].currentPageNo + 1
                          )
                        }
                      >
                        load more comments
                      </button>
                      <div className="spinner" style={{ display: "none" }}>
                        <div className="bounce1"></div>
                        <div className="bounce2"></div>
                        <div className="bounce3"></div>
                      </div>
                    </div>
                  )}
              </Card.Body>
            </Accordion.Collapse>
          }
        </Card>
      </Accordion>
    </div>
  );
});

export default Post;
