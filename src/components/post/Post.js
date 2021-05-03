import cookie from "react-cookies";
import { handleError } from '../error/error-handling'
import React, {  useState, useRef, useCallback, useContext } from "react";
import { likeUnlikeCUD, postsCUD } from "./post-service";
import { loadComments, commentsCUD } from "../comments/comment-services";
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
import moment from 'moment';
import { convertDateToReadableFormat } from '../utility/handle-dates'
import  CustomToggle  from '../utility/CustomToggle';
import { debounced } from "../utility/debouncer";
import { AlertContext } from "../../App";

const Post = React.memo(({ post, setPosts, setNoOfDeletedPostsInSession }) => {
  const currentUser = cookie.load("current_user");

  const [comments, setComments] = useState({});

  const [showPostModal, setShowPostModal] = useState(false);

  const [commentContent, setCommentContent] = useState("");

  let [showLikesModal, setShowLikesModal] = useState(false);

  const [showGetRepliesLoad, setShowGetRepliesLoad] = useState(false);

  const [commentsAccordianOpen, setCommentsAccordianOpen] = useState(false);

  const [noOfCommentsDeletionsInSession, setNoOfCommentsDeletionsInSession] = useState(0);

  const [localLike, setLocalLike] = useState({
    postLikedByCurrentUser: post.postLikedByCurrentUser || false,
    noOfLikes: post.noOfLikes || 0,
  });

  const showAlertWithMessage = useContext(AlertContext);

  const replyBarRef = useRef(null);
  let reactionBarRef = useRef(null);
  const replyInputRef = useRef(null);
  const commentsDotRef = useRef(null);
  let paginationRef = useRef(null);
  let likeRef = useRef(post.postLikedByCurrentUser);

  const adjustNoOfCommentsInParentPost = useCallback(
    (method, noOfRepliesAffected) => {
      setPosts((posts) => {
        let newDataList = posts.dataList.map((iterPost) => {
          if (iterPost.id === post.id) {
            return {
              ...iterPost,
              noOfComments:
                method === "POST"
                  ? iterPost.noOfComments + noOfRepliesAffected
                  : iterPost.noOfComments - noOfRepliesAffected,
            };
          }
          return iterPost;
        });

        return {
          ...posts,
          dataList: newDataList,
        };
      });
    },
    [setPosts, post]
  );

  const handlePostDelete = useCallback(
    (e, postId) => {
      e.preventDefault();
      postsCUD(RestMethod.DELETE, postId, null, null).then(
        (res) => {
          const ok = res.ok;
          const error = res.error;
          if (!ok) {
            handleError({ error });
          } else {
            setNoOfDeletedPostsInSession(noOfDeletedPosts => noOfDeletedPosts + 1);
            setPosts((posts) => {
              return {
                ...posts,
                dataList: posts.dataList.filter(
                  (iterPost) => iterPost.id !== postId
                ),
              };
            });
          }
        }
      );
    },
    [setPosts, setNoOfDeletedPostsInSession]
  );

  const handleMovingPartsOnClick = useCallback(
    (e, action, details) => {
      const { pageNo } = details || {};
      switch (action) {
        case "REPLY":
          replyBarRef.current.style.display = "block";
          reactionBarRef.current.style.display = "none";
          replyInputRef.current.value = "";
          replyInputRef.current.focus();

          break;
        case "PRE_REPLY_SUBMIT":
          setShowGetRepliesLoad(true);
          replyBarRef.current.style.display = "none";
          reactionBarRef.current.style.display = "inline-block";
          break;

        case "POST_REPLY_SUBMIT":
          if (commentsAccordianOpen === false) {
            commentsDotRef.current.click();
          }

          setShowGetRepliesLoad(false);

          break;

        case "PRE_GET_COMMENTS":
          if (pageNo > 0) {
            if (paginationRef.current) {
              paginationRef.current.children[0].style.display = "none";
              paginationRef.current.children[1].style.display = "block";
            }
          } else {
            setShowGetRepliesLoad(true);
          }
          break;

        case "POST_GET_COMMENTS":
          if (pageNo > 0) {
            if (paginationRef.current) {
              paginationRef.current.children[1].style.display = "none";
              paginationRef.current.children[0].style.display = "block";
            }
          } else {
            setShowGetRepliesLoad(false);
          }
          break;

        case "DELETE_COMMENT":
          if (commentsAccordianOpen === true) {
            commentsDotRef.current.click();
            setCommentsAccordianOpen(false);
          }
          break;

        default:
          console.log("action not supported");
      }
    },
    [commentsAccordianOpen]
  );

  const handleCreateComment = useCallback(
    (e, commentObj) => {
      let postId = commentObj.postId;
      let commentContent = commentObj.commentContent;

      const postProp = `post${postId}`.trim();

      e.preventDefault();

      handleMovingPartsOnClick(e, "PRE_REPLY_SUBMIT");

      if (commentContent === "") {
        replyInputRef.current.focus();
      } else {
        commentsCUD(RestMethod.POST, null, postId, null, commentContent).then(
          ({ ok, responseBody, error }) => {
            if (!ok) {
              handleError({ error });
            } else {
              const { data } = responseBody;

              if (comments && comments[postProp]) {
                let newComment = {
                  id: data.resourceId,
                  commentedOn: { id: postId },
                  commentContent: commentContent,
                  owner: currentUser,
                  commentLikedByCurrentUser: false,
                  noOfLikes: 0,
                  noOfReplies: 0,
                };

                newComment = {
                  ...newComment,
                  commentedAtTime: moment.utc().toISOString(),
                  modifiedAtTime: null,
                };

                let newDataList = [newComment, ...comments[postProp].dataList];

                setComments({
                  ...comments,
                  [postProp]: {
                    ...comments[postProp],
                    dataList: newDataList,
                  },
                });
              }
              adjustNoOfCommentsInParentPost(RestMethod.POST, 1);
              handleMovingPartsOnClick(e, "POST_REPLY_SUBMIT");
            }
          }
        );
      }

      setCommentContent("");
    },
    [
      comments,
      currentUser,
      adjustNoOfCommentsInParentPost,
      handleMovingPartsOnClick,
    ]
  );

  const handleGetComments = useCallback(
    (e, postId, pageNo) => {
      const postProp = `post${postId}`.trim();

      if (postId) {
        handleMovingPartsOnClick(e, "PRE_GET_COMMENTS", { pageNo: pageNo });

        loadComments(postId, null, {
          pageNo: pageNo,
          noOfDeletions: noOfCommentsDeletionsInSession,
        }).then(({ ok, responseBody, error }) => {
          if (!ok) {
            handleError({ error });
          } else {
            if (!comments[postProp]) {
              setComments({ ...comments, [postProp]: responseBody });
            } else if (comments[postProp].currentPageNo !== pageNo) {
              setComments({
                ...comments,
                [postProp]: {
                  currentPageNo: responseBody.currentPageNo,
                  noOfPages: responseBody.noOfPages,
                  dataList: [
                    ...comments[postProp].dataList,
                    ...responseBody.dataList,
                  ],
                },
              });
            }
            handleMovingPartsOnClick(e, "POST_GET_COMMENTS", {
              pageNo: pageNo,
            });
          }
        });
      }
    },
    [comments, handleMovingPartsOnClick, noOfCommentsDeletionsInSession]
  );

  const handleLikeUnlikePost = (e, post, action) => {
    likeUnlikeCUD(post, action)
      .then(({ ok, responseBody, error }) => {
        if (!ok) {
          if (
            error.statusCode === 500 &&
            error.exceptionType === "API_SPECIFIC_EXCEPTION"
          ) {
            let str = error.message;
            showAlertWithMessage(str.concat(error.details));
          } else {
            throw error;
          }
        } else {
          const postLikedByCurrentUser = action === "like" ? true : false;

          setPosts((posts) => {
            let dataList = posts.dataList.map((iterPost) => {
              if (iterPost.id === post.id) {
                const noOfLikes =
                  action === "like"
                    ? iterPost.noOfLikes + 1
                    : iterPost.noOfLikes - 1;
                return { ...iterPost, postLikedByCurrentUser, noOfLikes };
              } else {
                return iterPost;
              }
            });

            return { ...posts, dataList: dataList };
          });
        }
      })
      .catch((error) => {
        handleError({ error });
      });
  };

  const handleMovingPartsForKeys = (e) => {
    if (e.key === "Escape") {
      replyBarRef.current.style.display = "none";
      reactionBarRef.current.style.display = "inline-block";
    }
  };

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
                      debounced(600, handleLikeUnlikePost, e, post, "like");
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
                      debounced(600, handleLikeUnlikePost, e, post, "unlike");
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
                  handleMovingPartsOnClick(e, "REPLY");
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
