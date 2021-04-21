import cookie from "react-cookies";
import moment from 'moment';
import React, {  useState, useRef, useCallback } from "react";

import { commentsCUD, likeUnlikeCommentCUD, loadComments } from './comment-services'

import { Card, Button, Accordion, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faReply, faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp as faRegularThumbsUp, faEdit, faWindowClose } from "@fortawesome/free-regular-svg-icons";
import { RestMethod } from "../../enums";
import { UserDetailsPopup } from "../UserDetailsPopup";
import { LikesModal } from '../likes/LikesModal'
import { convertDateToReadableFormat } from '../utility/handle-dates';
import { CustomToggle } from '../utility/CustomToggle';
import { handleError } from "../error/error-handling";


export const Comment = React.memo(
  ({
    postId,
    parentCommentId,
    comment,
    setParentComments,
    adjustRepliesInHeirarchy,
    adjustNoOfCommentsInParentPost,
  }) => {
    const currentUser = cookie.load("current_user");

    const [replies, setReplies] = useState({});
    const [replyContent, setReplyContent] = useState("");
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [showGetRepliesLoad, setShowGetRepliesLoad] = useState(false);
    const [repliesAccordionOpen, setRepliesAccordionOpen] = useState(false);

    let replyBarRef = useRef(null);
    let reactionBarRef = useRef(null);
    let updateCommentRef = useRef(null);
    let commentContentRef = useRef(null);
    let repliesDotRef = useRef(null);
    let replyInputRef = useRef(null);
    let updateInputRef = useRef(null);
    let paginationRef = useRef(null);

    const adjustNoOfReplies = useCallback(
      (method, childReplyId, noOfRepliesAffected) => {
        const commentProp = `comment${parentCommentId}`;
        const postProp = `post${comment.commentedOn.id}`;
        let prop = null;
        if (parentCommentId !== null) {
          prop = commentProp;
        } else {
          prop = postProp;
        }

        if (RestMethod.POST === method) {
          setParentComments((comments) => {
            let newDataList = comments[prop].dataList.map((childReply) => {
              if (childReply.id === childReplyId) {
                return {
                  ...childReply,
                  noOfReplies: childReply.noOfReplies + noOfRepliesAffected,
                };
              }
              return childReply;
            });
            return {
              ...comments,
              [prop]: {
                ...comments[prop],
                dataList: newDataList,
              },
            };
          });

          if (adjustRepliesInHeirarchy)
            adjustRepliesInHeirarchy(
              method,
              parentCommentId,
              noOfRepliesAffected
            );
        } else {
          setParentComments((comments) => {
            let newDataList = comments[prop].dataList.map((childReply) => {
              if (childReply.id === childReplyId) {
                return {
                  ...childReply,
                  noOfReplies: childReply.noOfReplies - noOfRepliesAffected,
                };
              }
              return childReply;
            });

            return {
              ...comments,
              [prop]: {
                ...comments[prop],
                dataList: newDataList,
              },
            };
          });

          if (adjustRepliesInHeirarchy)
            adjustRepliesInHeirarchy(
              method,
              parentCommentId,
              noOfRepliesAffected
            );
        }
      },
      [adjustRepliesInHeirarchy, comment, setParentComments, parentCommentId]
    );

    const handleCommentCUD = useCallback(
      async (e, method, commentObj) => {
        let postId = commentObj.postId;
        let itemId = commentObj.commentId;
        let commentContent = commentObj.commentContent;

        const postProp = `post${postId}`.trim();

        e.preventDefault();

        switch (method) {
          case RestMethod.PUT:
            if (commentContent === "") {
              updateCommentRef.current.focus();
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
                handleError({ error });
              } else {
                const { data } = responseBody;

                //if (comments && comments[postProp]) {
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
                  modifiedAtTime: moment.utc().toISOString(),
                };

                setParentComments((comments) => {
                  let newDataList =
                    method === RestMethod.POST
                      ? [...comments[postProp].dataList, newComment]
                      : comments[postProp].dataList.map((comment) => {
                          if (comment.id === itemId) return newComment;
                          else return comment;
                        });
                  return {
                    ...comments,
                    [postProp]: {
                      ...comments[postProp],
                      dataList: newDataList,
                    },
                  };
                });
              }
            }

            break;

          case RestMethod.DELETE:
            const responseBody = await commentsCUD(
              method,
              null,
              postId,
              itemId,
              null
            );
            if ("error" in responseBody) {
              const { error } = responseBody;
              handleError({ error });
            } else {
              setParentComments((comments) => {
                return {
                  ...comments,
                  [postProp]: {
                    ...comments[`post${postId}`],
                    dataList: comments[`post${postId}`].dataList.filter(
                      (comment) => comment.id !== itemId
                    ),
                  },
                };
              });

              adjustNoOfCommentsInParentPost(RestMethod.DELETE, comment.noOfReplies + 1);

            }

            break;
          //can do something more here
          default:
            alert("Wrong rest method");
        }
        setReplyContent("");
      },
      [
        currentUser,
        setParentComments,
        adjustNoOfCommentsInParentPost,
        comment.noOfReplies,
      ]
    );

    const handleReplyCUD = useCallback(
      async (e, method, replyObj) => {
        let commentId = replyObj.parentCommentId;
        let postId = replyObj.postId;
        let itemId = replyObj.commentId;

        let replyContent = replyObj.replyContent;

        const commentProp = `comment${commentId}`.trim();

        e.preventDefault();

        switch (method) {
          case RestMethod.POST:
            if (
              !replyContent ||
              replyContent === undefined ||
              replyContent === ""
            ) {
              replyInputRef.current.focus();
            } else {
              const responseBody = await commentsCUD(
                method,
                commentId,
                postId,
                itemId,
                replyContent
              );
              if ("error" in responseBody) {
                const { error } = responseBody;
                handleError({ error });
              } else {
                const { data } = responseBody;

                if (replies && replies[commentProp]) {
                  let newComment = {
                    id: data.resourceId,
                    commentedOn: { id: postId },
                    parentComment: { id: commentId },
                    commentedAtTime: moment.utc().toISOString(),
                    commentContent: replyContent,
                    owner: currentUser,
                    commentLikedByCurrentUser: false,
                    noOfLikes: 0,
                    noOfReplies: 0,
                  };

                  let newDataList = [
                    newComment,
                    ...replies[commentProp].dataList,
                  ];
                  setReplies({
                    ...replies,
                    [commentProp]: {
                      ...replies[commentProp],
                      dataList: newDataList,
                    },
                  });
                }
                adjustNoOfCommentsInParentPost(RestMethod.POST, 1);
                adjustNoOfReplies(method, commentId, 1);
              }
            }

            break;
          case RestMethod.PUT:
            if (
              replyContent === "" ||
              replyContent === undefined ||
              replyContent === null
            ) {
              updateInputRef.current.focus();
            } else {
              const responseBody = await commentsCUD(
                method,
                commentId,
                postId,
                itemId,
                replyContent
              );
              if ("error" in responseBody) {
                let { error } = responseBody;
                handleError({ error });
              } else {
                setParentComments((comments) => {
                  return {
                    ...comments,
                    [commentProp]: {
                      ...comments[commentProp],
                      dataList: comments[commentProp].dataList.map((reply) => {
                        if (reply.id === itemId)
                          return {
                            ...reply,
                            commentContent: replyContent,
                            modifiedAtTime: moment.utc().toISOString(),
                          };
                        else return reply;
                      }),
                    },
                  };
                });
              }
            }

            break;

          case RestMethod.DELETE:
            const responseBody = await commentsCUD(
              method,
              commentId,
              postId,
              itemId,
              replyContent
            );
            if ("error" in responseBody) {
              const { error } = responseBody;
              handleError({ error });
            } else {
              setParentComments((comments) => {
                return {
                  ...comments,
                  [commentProp]: {
                    ...comments[`comment${commentId}`],
                    dataList: comments[`comment${commentId}`].dataList.filter(
                      (comment) => comment.id !== itemId
                    ),
                  },
                };
              });

              adjustNoOfCommentsInParentPost(RestMethod.DELETE, comment.noOfReplies + 1);
              adjustRepliesInHeirarchy(
                method,
                commentId,
                comment.noOfReplies + 1
              );
            }
            break;

          default:
            alert("Only Post, Update or delete");
        }
        setReplyContent("");
      },
      [
        replies,
        currentUser,
        setParentComments,
        adjustNoOfCommentsInParentPost,
        adjustNoOfReplies,
        adjustRepliesInHeirarchy,
        comment.noOfReplies,
      ]
    );

    const handleLikeUnlikeComment = async (e, comment, action) => {
      const responseBody = await likeUnlikeCommentCUD(comment, action);
      let prop = null;

      if (comment.parentComment !== null) {
        prop = `comment${comment.parentComment.id}`;
      } else {
        prop = `post${comment.commentedOn.id}`;
      }

      if ("error" in responseBody) {
        const { error } = responseBody;
        handleError({ error });
      } else {
        //const commentLikedByCurrentUser = action === "like" ? true : false;

        setParentComments((comments) => {
          console.log(comments);
          console.log(comment);
          let newDataList = comments[prop].dataList.map((childReply) => {
            if (childReply.id === comment.id) {
              return {
                ...childReply,
                noOfLikes:
                  action === "like"
                    ? childReply.noOfLikes + 1
                    : childReply.noOfLikes - 1,
                commentLikedByCurrentUser: action === "like",
              };
            }
            return childReply;
          });
          return {
            ...comments,
            [prop]: {
              ...comments[prop],
              dataList: newDataList,
            },
          };
        });

        //setIsCommentLiked(commentLikedByCurrentUser)
        //setNoOfLikes((action === 'like') ? noOfLikes + 1 : noOfLikes - 1);
      }
    };

    const handleGetReplies = useCallback(
      async (e, commentId, pageNo) => {
        const commentProp = `comment${commentId}`.trim();
        const responseBody = await loadComments(null, commentId, pageNo);
        if ("error" in responseBody) {
          const { error } = responseBody;
          handleError({ error });
        } else {
          if (!replies[commentProp]) {
            setReplies({ ...replies, [commentProp]: responseBody });
          } else if (replies[commentProp].currentPageNo !== pageNo) {
            setReplies({
              ...replies,
              [commentProp]: {
                currentPageNo: responseBody.currentPageNo,
                noOfPages: responseBody.noOfPages,
                dataList: [
                  ...replies[commentProp].dataList,
                  ...responseBody.dataList,
                ],
              },
            });
          }
        }
      },
      [replies]
    );

    const handleReplyPaginationMovingParts = useCallback(
      async (e) => {
        if (paginationRef.current) {
          paginationRef.current.children[0].style.display = "none";
          paginationRef.current.children[1].style.display = "block";
        }
        await handleGetReplies(
          e,
          comment.id,
          replies[`comment${comment.id}`].currentPageNo + 1
        );
        if (paginationRef.current) {
          paginationRef.current.children[1].style.display = "none";
          paginationRef.current.children[0].style.display = "block";
        }
      },
      [handleGetReplies, comment.id, replies]
    );

    const handleMovingPartsOnClick = (e, action) => {
      switch (action) {
        case "REPLY":
          replyBarRef.current.style.display = "block";
          reactionBarRef.current.style.display = "none";
          replyInputRef.current.value = "";
          replyInputRef.current.focus();

          break;
        case "REPLY_SUBMIT":
          replyBarRef.current.style.display = "none";
          reactionBarRef.current.style.display = "block";

          break;

        case "UPDATE":
          commentContentRef.current.style.display = "none";
          updateCommentRef.current.style.display = "block";
          updateInputRef.current.focus();
          reactionBarRef.current.style.display = "none";

          break;

        case "UPDATE_SUBMIT":
          commentContentRef.current.style.display = "block";
          updateCommentRef.current.style.display = "none";
          reactionBarRef.current.style.display = "block";
          break;
        default:
          console.log("method not supported");
      }
    };

    const handleMovingPartsForKeys = (e, action) => {
      switch (action) {
        case "REPLY_SUBMIT":
          if (e.key === "Escape") {
            replyBarRef.current.style.display = "none";
            reactionBarRef.current.style.display = "inline-block";
          }

          break;

        case "UPDATE_SUBMIT":
          if (e.key === "Escape") {
            updateCommentRef.current.style.display = "none";
            commentContentRef.current.style.display = "inline-block";
            reactionBarRef.current.style.display = "inline-block";
          }
          break;

        default:
          console.log("action not supported");
      }
    };

    const replyOnComment = (e, replyObj) => {
      setShowGetRepliesLoad(true);
      handleMovingPartsOnClick(e, "REPLY_SUBMIT");
      handleReplyCUD(e, RestMethod.POST, replyObj)
        .then(() => {
          setShowGetRepliesLoad(false);
          
          if (repliesAccordionOpen === false) {
            repliesDotRef.current.click();
          }
        })
        .catch((error) => {
          handleError({ error });
        });
    };

    const getRepliesOnComment = (e, commentId) => {
      setShowGetRepliesLoad(true);
      handleGetReplies(e, commentId, 0)
        .then(() => {
          setShowGetRepliesLoad(false);
        })
        .catch((error) => {
          console.log(error);
          handleError({ error });
        });
    };

    return (
      <>
        <div className={(parentCommentId ? "pl-4 " : " ") + "bg-light"}>
          <div
            className={
              parentCommentId ? "p-2 m-0 border-left" : "p-2 border-bottom"
            }
          >
            {showLikesModal === true && (
              <LikesModal
                itemId={comment.id}
                itemType="COMMENT"
                setShow={setShowLikesModal}
                show={showLikesModal}
              />
            )}
            <Card
              id={`commentCard${comment.id}`}
              style={{ maxWidth: "100%", border: "none" }}
              bg="light"
            >
              <Card.Body>
                <Card.Subtitle>
                  <div className="pb-4">
                    <UserDetailsPopup owner={comment.owner} />
                    <div className="my-1">
                      <button className="link-button">
                        <small>
                          {(!comment.modifiedAtTime
                            ? "Posted: "
                            : "Modified: ") +
                            `${convertDateToReadableFormat(
                              !comment.modifiedAtTime
                                ? comment.commentedAtTime
                                : comment.modifiedAtTime
                            )}`}
                        </small>
                      </button>
                    </div>
                  </div>
                </Card.Subtitle>
                <Card.Text ref={commentContentRef} style={{ display: "block" }}>
                  {comment.commentContent}
                </Card.Text>
                <div ref={updateCommentRef} style={{ display: "none" }}>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      cols={100}
                      id={`updateOn${comment.id}`}
                      name={`updateOn${comment.id}`}
                      onChange={(e) => setReplyContent(e.target.value)}
                      ref={updateInputRef}
                      value={replyContent}
                      onKeyDown={(e) =>
                        handleMovingPartsForKeys(e, "UPDATE_SUBMIT")
                      }
                    />
                  </Form.Group>
                  <Form.Group>
                    <Button
                      type="button"
                      id={`submitUpdateOn${comment.id}`}
                      name={`submitUpdateOn${comment.id}`}
                      onClick={(e) => {
                        !parentCommentId
                          ? handleCommentCUD(e, RestMethod.PUT, {
                              postId: postId,
                              commentId: comment.id,
                              commentContent: replyContent,
                            })
                          : handleReplyCUD(e, RestMethod.PUT, {
                              parentCommentId: parentCommentId,
                              postId: postId,
                              commentId: comment.id,
                              replyContent: replyContent,
                            });
                        handleMovingPartsOnClick(e, "UPDATE_SUBMIT");
                      }}
                    >
                      update
                    </Button>
                  </Form.Group>
                </div>
                {/* </Card.Text> */}
              </Card.Body>
            </Card>
            <Accordion>
              <Card style={{ maxWidth: "100%", border: "none" }}>
                <Card.Header
                  className="bg-light"
                  style={{
                    border: "none",
                  }}
                >
                  <div
                    ref={reactionBarRef}
                    className="row pl-3"
                    style={{ display: "block" }}
                  >
                    <div>
                      {comment.noOfLikes > 0 && (
                        <div className="mb-3">
                          <button
                            className="link-button"
                            onClick={(e) => {
                              setShowLikesModal(true);
                            }}
                          >
                            <small>View likes</small>
                          </button>
                        </div>
                      )}
                      {comment.commentLikedByCurrentUser === undefined ||
                      comment.commentLikedByCurrentUser === null ||
                      comment.commentLikedByCurrentUser === false ? (
                        <span style={{ marginRight: "1rem" }}>
                          <FontAwesomeIcon
                            onClick={(e) =>
                              comment.owner.id !== currentUser.id &&
                              handleLikeUnlikeComment(e, comment, "like")
                            }
                            icon={faRegularThumbsUp}
                            style={
                              comment.owner.id !== currentUser.id
                                ? {
                                    marginRight: "0.4rem",
                                    cursor: "pointer",
                                  }
                                : {
                                    marginRight: "0.4rem",

                                    opacity: 0.4,
                                  }
                            }
                            size="sm"
                          ></FontAwesomeIcon>
                          <span style={{ color: "grey" }}>
                            {comment.noOfLikes}
                          </span>
                        </span>
                      ) : (
                        <span style={{ marginRight: "1rem" }}>
                          <FontAwesomeIcon
                            onClick={(e) =>
                              handleLikeUnlikeComment(e, comment, "unlike")
                            }
                            icon={faThumbsUp}
                            style={{
                              marginRight: "0.4rem",
                              cursor: "pointer",
                            }}
                            size="sm"
                          ></FontAwesomeIcon>
                          <span style={{ color: "grey" }}>
                            {comment.noOfLikes}
                          </span>
                        </span>
                      )}

                      <FontAwesomeIcon
                        onClick={(e) => {
                          handleMovingPartsOnClick(e, "REPLY");
                        }}
                        icon={faReply}
                        size="sm"
                        style={{
                          marginLeft: "1rem",
                          marginRight: "1rem",
                          cursor: "pointer",
                        }}
                      ></FontAwesomeIcon>
                      {comment.owner.id === currentUser.id && (
                        <FontAwesomeIcon
                          icon={faEdit}
                          size="sm"
                          style={{
                            marginLeft: "1rem",
                            marginRight: "1rem",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            setReplyContent(comment.commentContent);
                            handleMovingPartsOnClick(e, "UPDATE");
                          }}
                        ></FontAwesomeIcon>
                      )}
                      {comment.owner.id === currentUser.id && (
                        <FontAwesomeIcon
                          onClick={(e) => {
                            !parentCommentId
                              ? handleCommentCUD(e, RestMethod.DELETE, {
                                  postId: postId,
                                  commentId: comment.id,
                                })
                              : handleReplyCUD(e, RestMethod.DELETE, {
                                  parentCommentId: parentCommentId,
                                  postId: postId,
                                  commentId: comment.id,
                                });
                          }}
                          icon={faWindowClose}
                          size="sm"
                          style={{
                            marginLeft: "1rem",
                            marginRight: "1rem",
                            cursor: "pointer",
                          }}
                        ></FontAwesomeIcon>
                      )}
                    </div>
                    <div
                      className="row pl-2 pt-3"
                      hidden={comment.noOfReplies <= 0}
                    >
                      <button
                        className="toggle-button"
                        onClick={(e) => {
                          if (
                            (!replies || !replies[`comment${comment.id}`]) &&
                            comment.noOfReplies > 0
                          ) {
                            getRepliesOnComment(e, comment.id);
                          }
                          if (comment.noOfReplies > 0)
                            setRepliesAccordionOpen(
                              (repliesAccordionOpen) => !repliesAccordionOpen
                            );
                        }}
                      >
                        <CustomToggle
                          eventKey={`comment${comment.id}`}
                          attachRef={repliesDotRef}
                          allowToggle={comment.noOfReplies}
                        >
                          <FontAwesomeIcon
                            icon={faLongArrowAltRight}
                            size="sm"
                          ></FontAwesomeIcon>
                          <small>
                            {repliesAccordionOpen === false
                              ? `View ${comment.noOfReplies} replies`
                              : `Collapse`}
                          </small>
                        </CustomToggle>
                      </button>
                    </div>
                  </div>
                  <div ref={replyBarRef} style={{ display: "none" }}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        cols={100}
                        id={`replyOn${comment.id}`}
                        name={`replyOn${comment.id}`}
                        ref={replyInputRef}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={(e) =>
                          handleMovingPartsForKeys(e, "REPLY_SUBMIT")
                        }
                      />
                    </Form.Group>
                    <Form.Group>
                      <Button
                        type="submit"
                        id={`submitReplyOn${comment.id}`}
                        name={`submitReplyOn${comment.id}`}
                        onClick={(e) => {
                          replyOnComment(e, {
                            parentCommentId: comment.id,
                            postId: postId,
                            commentId: null,
                            replyContent: replyContent,
                          });
                        }}
                      >
                        reply
                      </Button>
                    </Form.Group>
                  </div>
                </Card.Header>

                {comment.noOfReplies > 0 ? (
                  <Accordion.Collapse eventKey={`comment${comment.id}`}>
                    <Card.Body className="p-0">
                      {showGetRepliesLoad === true && (
                        <div className="spinner bg-light">
                          <div className="bounce1"></div>
                          <div className="bounce2"></div>
                          <div className="bounce3"></div>
                        </div>
                      )}
                      {replies[`comment${comment.id}`.trim()] &&
                        replies[`comment${comment.id}`].dataList.map(
                          (reply, index2) => {
                            return (
                              <>
                                <Comment
                                  key={`reply${reply.id}`}
                                  postId={postId}
                                  parentCommentId={comment.id}
                                  comment={reply}
                                  setParentComments={setReplies}
                                  adjustRepliesInHeirarchy={adjustNoOfReplies}
                                  adjustNoOfCommentsInParentPost={
                                    adjustNoOfCommentsInParentPost
                                  }
                                />
                              </>
                            );
                          }
                        )}

                      {replies[`comment${comment.id}`.trim()] &&
                        replies[`comment${comment.id}`].currentPageNo <
                          replies[`comment${comment.id}`].noOfPages - 1 && (
                          <div
                            className="bg-light pl-4 pt-2"
                            ref={paginationRef}
                          >
                            <button
                              className="link-button"
                              onClick={handleReplyPaginationMovingParts}
                              style={{ display: "block" }}
                            >
                              load more replies
                            </button>
                            <div
                              className="spinner"
                              style={{ display: "none" }}
                            >
                              <div className="bounce1"></div>
                              <div className="bounce2"></div>
                              <div className="bounce3"></div>
                            </div>
                          </div>
                        )}
                    </Card.Body>
                  </Accordion.Collapse>
                ) : (
                  <></>
                )}
              </Card>
            </Accordion>
          </div>
        </div>
      </>
    );
  }
);
