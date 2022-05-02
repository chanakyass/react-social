import React from "react";
import { Card, Button, Accordion, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faReply, faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp as faRegularThumbsUp, faEdit, faWindowClose } from "@fortawesome/free-regular-svg-icons";
import { RestMethod } from "../../enums";
import  UserDetailsPopup  from "../utility/UserDetailsPopup";
import  LikesModal  from '../likes/LikesModal'
import { convertDateToReadableFormat } from '../utility/handle-dates';
import  CustomToggle  from '../utility/CustomToggle';
import { debounced } from "../utility/debouncer";
import useCommentState from "./useCommentState";


const Comment = React.memo(
  ({
    post,
    parentComment,
    comment,
    setParentComments,
    adjustRepliesInHeirarchy,
    adjustNoOfCommentsInParentPost,
    handleMovingPartsOnClickPost,
    handleMovingPartsOnClickParent,
    setNoOfCommentsDeletionsInSession,
    setNoOfRepliesDeletionsInSession
  }) => {
    const {stateInfo, funcs, refs} = useCommentState({
      post,
      parentComment,
      comment,
      setParentComments,
      adjustRepliesInHeirarchy,
      adjustNoOfCommentsInParentPost,
      handleMovingPartsOnClickPost,
      handleMovingPartsOnClickParent,
      setNoOfCommentsDeletionsInSession,
      setNoOfRepliesDeletionsInSession
    });
    const [currentUser, replies, setReplies, replyContent, setReplyContent, showLikesModal, setShowLikesModal,
      showGetRepliesLoad, repliesAccordionOpen, setRepliesAccordionOpen, localLike, setLocalLike, setNoOfCurrentRepliesDeletionInSession] = stateInfo;
    const [adjustNoOfReplies, handleMovingPartsOnClick, handleCommentCUD, handleReplyCUD, handleLikeUnlikeComment, handleGetReplies, handleMovingPartsForKeys] = funcs;
    const [replyBarRef, reactionBarRef, updateCommentRef, commentContentRef, repliesDotRef, 
      replyInputRef, updateInputRef, paginationRef, likeRef, commentHelperRef] = refs;

    const parentCommentId = parentComment ? parentComment.id : null;
    const postId = post.id;

    // const parentCommentRepliesCount = parentComment
    //   ? parentComment.noOfReplies
    //   : null;

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
                      variant="secondary"
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
                      {localLike.commentLikedByCurrentUser === false ? (
                        <span style={{ marginRight: "1rem" }}>
                          <FontAwesomeIcon
                            onClick={(e) => {
                              setLocalLike({
                                commentLikedByCurrentUser: true,
                                noOfLikes: localLike.noOfLikes + 1,
                              });
                              likeRef.current = true;
                              debounced(
                                500,
                                handleLikeUnlikeComment,
                                commentHelperRef.current,
                                e,
                                comment,
                                "like"
                              );
                            }}
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
                            {localLike.noOfLikes}
                          </span>
                        </span>
                      ) : (
                        <span style={{ marginRight: "1rem" }}>
                          <FontAwesomeIcon
                            onClick={(e) => {
                              setLocalLike({
                                commentLikedByCurrentUser: false,
                                noOfLikes: localLike.noOfLikes - 1,
                              });
                              likeRef.current = false;
                              debounced(
                                500,
                                handleLikeUnlikeComment,
                                commentHelperRef.current,
                                e,
                                comment,
                                "unlike"
                              );
                            }}
                            icon={faThumbsUp}
                            style={{
                              marginRight: "0.4rem",
                              cursor: "pointer",
                            }}
                            size="sm"
                          ></FontAwesomeIcon>
                          <span style={{ color: "grey" }}>
                            {localLike.noOfLikes}
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
                          if (comment.noOfReplies > 0)
                            setRepliesAccordionOpen(
                              (repliesAccordionOpen) => !repliesAccordionOpen
                            );
                          if (
                            (!replies || !replies[`comment${comment.id}`]) &&
                            comment.noOfReplies > 0
                          ) {
                            handleGetReplies(e, comment.id, 0);
                          }
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
                        variant="secondary"
                        id={`submitReplyOn${comment.id}`}
                        name={`submitReplyOn${comment.id}`}
                        onClick={(e) => {
                          handleReplyCUD(e, RestMethod.POST, {
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
                {showGetRepliesLoad === true && (
                  <div className="spinner bg-light ">
                    <div className="bounce1"></div>
                    <div className="bounce2"></div>
                    <div className="bounce3"></div>
                  </div>
                )}

                <Accordion.Collapse eventKey={`comment${comment.id}`}>
                  <Card.Body className="p-0">
                    {comment.noOfReplies > 0 &&
                      replies[`comment${comment.id}`.trim()] &&
                      replies[`comment${comment.id}`].dataList.map(
                        (reply, index2) => {
                          return (
                              <Comment
                                key={`reply${reply.id}`}
                                post={post}
                                parentComment={comment}
                                comment={reply}
                                setParentComments={setReplies}
                                adjustRepliesInHeirarchy={adjustNoOfReplies}
                                adjustNoOfCommentsInParentPost={
                                  adjustNoOfCommentsInParentPost
                                }
                                handleMovingPartsOnClickParent={
                                  handleMovingPartsOnClick
                                }
                                setNoOfRepliesDeletionsInSession={
                                  setNoOfCurrentRepliesDeletionInSession
                                }
                              />
                          );
                        }
                      )}

                    {replies[`comment${comment.id}`.trim()] &&
                      replies[`comment${comment.id}`].currentPageNo <
                        replies[`comment${comment.id}`].noOfPages - 1 && (
                        <div className="bg-light pl-4 pt-2" ref={paginationRef}>
                          <button
                            className="link-button"
                            onClick={(e) =>
                              handleGetReplies(
                                e,
                                comment.id,
                                replies[`comment${comment.id}`].currentPageNo +
                                  1
                              )
                            }
                            style={{ display: "block" }}
                          >
                            load more replies
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
              </Card>
            </Accordion>
          </div>
        </div>
      </>
    );
  }
);

export default Comment;
