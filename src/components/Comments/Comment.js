import cookie from "react-cookies";
import history from "../../app-history";
import moment from 'moment';
import React, { useEffect, useState, useRef } from "react";
import Parser from "html-react-parser";
import { commentsCUD, likeUnlikeCommentCUD, loadComments } from './comment-services'
import cleanEmpty from "../utility/cleanup-objects";
import { Card, Button, Accordion, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faCommentDots, faReply } from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp as faRegularThumbsUp, faCommentDots as faRegularCommentDots, faEdit, faWindowClose } from "@fortawesome/free-regular-svg-icons";
import { RestMethod } from "../../enums";
import { UserDetailsPopup } from "../UserDetailsPopup";
import { LikesModal } from '../likes/LikesModal'
import { convertDateToReadableFormat } from '../utility/handle-dates';

export const Comment = React.memo(({ postId, parentCommentId, comment, handleCommentCUD, setParentComments, setNoOfRepliesInParent}) => {
  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");

  const [noOfLikes, setNoOfLikes] = useState(comment.noOfLikes);
  const [noOfReplies, setNoOfReplies] = useState(comment.noOfReplies);
  const [isCommentLiked, setIsCommentLiked] = useState(comment.commentLikedByCurrentUser)
  const [replies, setReplies] = useState({})
  const [replyContent, setReplyContent] = useState('')
  const [showLikesModal, setShowLikesModal] = useState(false);

  let replyBarRef = useRef(null)
  let reactionBarRef = useRef(null)
  let updateCommentRef = useRef(null)
  let commentContentRef = useRef(null)
  let repliesDotRef = useRef(null)
  let replyInputRef = useRef(null);

  const handleReplyCUD = async (e, method, replyObj) => {


    let commentId = replyObj.parentCommentId;
    let postId = replyObj.postId;
    let itemId = replyObj.commentId
    
    let replyContent = replyObj.replyContent;

    const commentProp = `comment${commentId}`.trim();

    e.preventDefault();

      switch (method) {
        case RestMethod.POST:
        
          {

            if (
              !replyContent ||
              replyContent === undefined ||
              replyContent === ""
            ) {
              //raise error
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
                console.log(error);
                history.push("/error");
              } else {
                const { data } = responseBody;

                console.log(currentUser)

                if (replies && replies[commentProp]) {
                  let newComment = {
                    id: data.id,
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
                    ...replies[commentProp].dataList,
                    newComment,
                  ];
                  setReplies({
                    ...replies,
                    [commentProp]: {
                      ...replies[commentProp],
                      dataList: newDataList,
                    },
                  });
                }

                setNoOfReplies(noOfReplies + 1);

                if (!replies || !replies[commentProp]) {
                  repliesDotRef.current.click();
                }
              }
            }
          }
          break;
        case RestMethod.PUT: {

          if (replyContent === '' || replyContent === undefined || replyContent === null) {
            alert('comment cant be empty');
          }
          else {
                  const responseBody = await commentsCUD(
                  method,
                  commentId,
                  postId,
                  itemId,
                  replyContent
                );
            if ('error' in responseBody) {
              let { error } = responseBody;
              console.log(error)
              history.push('/error')
            }
            else {
              setParentComments((comments) => {
                return {
                  ...comments,
                  [commentProp]: {
                    ...comments[commentProp],
                    dataList: comments[commentProp].dataList.map((reply) => {
                      if (reply.id === itemId) return {...reply, commentContent: replyContent, modifiedAtTime: moment.utc().toISOString()};
                      else return reply;
                    }),
                  },
                };
              });
            }
          }
        }
          break;

        case RestMethod.DELETE: {
                const responseBody = await commentsCUD(
                  method,
                  commentId,
                  postId,
                  itemId,
                  replyContent
                );
          if ("error" in responseBody) {
            const { error } = responseBody;
            console.log(error);
            history.push("/error");
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
              }
            });

            if(setNoOfRepliesInParent)
              setNoOfRepliesInParent((noOfReplies) => noOfReplies - 1);
          }
        }
    }
    setReplyContent('')

  };

    const handleLikeUnlikeComment = async (e, comment, action) => {
      const responseBody = await likeUnlikeCommentCUD(comment, action);
      if ("error" in responseBody) {
        const { error } = responseBody;
        console.log(error);
        history.push("/error");
      } else {
        const commentLikedByCurrentUser = action === "like" ? true : false;

        setIsCommentLiked(commentLikedByCurrentUser)
        setNoOfLikes((action === 'like') ? noOfLikes + 1 : noOfLikes - 1);
        
      }
  };
  
    const handleGetReplies = async (e, commentId, pageNo) => {
      const commentProp = `comment${commentId}`.trim();

      if (
        postId &&
        (!replies[commentProp] ||
          (replies[commentProp] &&
            replies[commentProp].currentPageNo !== pageNo))
      ) {
        const responseBody = await loadComments(null, commentId, pageNo);
        if ("error" in responseBody) {
          const { error } = responseBody;
          console.log("/error");
          history.push("/error");
        } else {
          setReplies({ ...replies, [commentProp]: responseBody });
          
        }
      }
  };

  const handleMovingPartsOnClick = (e, action) => {
    switch (action) {
      case "REPLY": {
        replyBarRef.current.style.display = 'block';
        reactionBarRef.current.style.display = 'none';
        replyInputRef.current.focus();
      }
        break;
      case "REPLY_SUBMIT": {

          replyBarRef.current.style.display = 'none';
          reactionBarRef.current.style.display = 'inline-block';
        
      }
        break;
      
      case "UPDATE": {
        commentContentRef.current.style.display = 'none';
        updateCommentRef.current.style.display = 'inline-block';
        replyInputRef.current.focus();
        reactionBarRef.current.style.display = 'none';

      }
        break;
      
      case "UPDATE_SUBMIT": {

          commentContentRef.current.style.display = 'inline-block';
          updateCommentRef.current.style.display = 'none';
          reactionBarRef.current.style.display = 'inline-block';
        }
      
        break;
    }
  }

  const handleMovingPartsForKeys = (e, action) => {
    switch (action) {
      case "REPLY_SUBMIT": {
        if (e.key === "Escape") {
          replyBarRef.current.style.display = "none";
          reactionBarRef.current.style.display = "inline-block";
        }
      }
        break;
      
      case "UPDATE_SUBMIT": {
        if (e.key === "Escape") {
          updateCommentRef.current.style.display = "none";
          commentContentRef.current.style.display = "inline-block";
          reactionBarRef.current.style.display = "inline-block";
        }
      }
    }
  }

  return (
    <div className={"" + (parentCommentId ? "pl-4 " : "") + " " + "bg-light"}>
      <div className={"" + (parentCommentId ? "p-0 m-0 border-left" : "")}>
        <LikesModal
          itemId={comment.id}
          itemType="COMMENT"
          setShow={setShowLikesModal}
          show={showLikesModal}
        />
        <Card
          id={`commentCard${comment.id}`}
          style={{ maxWidth: "100%", border: "none" }}
          bg="light"
        >
          {/* <Card.Header
            className="bg-transparent"
            style={{ border: "none" }}
          ></Card.Header> */}
          <Card.Body>
            <Card.Subtitle>
              {/* <UserDetailsPopup owner={comment.owner} /> */}
              <div className="pb-4">
                <UserDetailsPopup owner={comment.owner} />
                <div className="my-1">
                  <button className="link-button">
                    <small>
                      {(!comment.modifiedAtTime ? "Posted: " : "Modified: ") +
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
            <Card.Text>
              <div ref={commentContentRef} style={{ display: "inline-block" }}>
                {comment.commentContent}
              </div>
              <div ref={updateCommentRef} style={{ display: "none" }}>
                <Form.Group controlId={`updateCommentBoxFor${comment.id}`}>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    cols={100}
                    id={`updateOn${comment.id}`}
                    name={`updateOn${comment.id}`}
                    onChange={(e) => setReplyContent(e.target.value)}
                    ref={replyInputRef}
                  />
                </Form.Group>
                <Form.Group controlId={`updateCommentBoxFor${comment.id}`}>
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
                    onKeyDown={(e) =>
                      handleMovingPartsForKeys(e, "UPDATE_SUBMIT")
                    }
                  >
                    update
                  </Button>
                </Form.Group>
              </div>
            </Card.Text>
          </Card.Body>
        </Card>
        <Accordion>
          <Card style={{ maxWidth: "100%", border: "none" }}>
            <Card.Header
              style={{
                // background: "transparent",
                border: "none",
                // margin: "none",
                // textDecoration: "underline",
                // color: "dodgerblue",
              }}
            >
              <div ref={reactionBarRef} className='p-1' style={{ display: "block" }}>
                {noOfLikes > 0 && (
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
                {isCommentLiked === undefined ||
                isCommentLiked === null ||
                isCommentLiked === false ? (
                  <>
                    <FontAwesomeIcon
                      onClick={(e) =>
                        comment.owner.id !== currentUser.id &&
                        handleLikeUnlikeComment(e, comment, "like")
                      }
                      icon={faRegularThumbsUp}
                      style={
                        comment.owner.id !== currentUser.id
                          ? {
                              marginRight: "0.5rem",
                              cursor: "pointer",
                            }
                          : {
                              marginRight: "0.5rem",

                              opacity: 0.4,
                            }
                      }
                    ></FontAwesomeIcon>
                    <span style={{ color: "grey", marginRight: "1rem" }}>
                      {noOfLikes}
                    </span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon
                      onClick={(e) =>
                        handleLikeUnlikeComment(e, comment, "unlike")
                      }
                      icon={faThumbsUp}
                      style={{
                        marginRight: "0.5rem",
                        cursor: "pointer",
                      }}
                    ></FontAwesomeIcon>
                    <span style={{ color: "grey", marginRight: "1rem" }}>
                      {noOfLikes}
                    </span>
                  </>
                )}
                {noOfReplies > 0 ? (
                  <>
                    <Accordion.Toggle
                      as={Button}
                      variant="link"
                      eventKey={`comment${comment.id}`}
                      onClick={(e) => handleGetReplies(e, comment.id, 0)}
                      ref={repliesDotRef}
                      className="p-0 border-0"
                    >
                      <FontAwesomeIcon
                        icon={faRegularCommentDots}
                        color="black"
                        style={{
                          marginLeft: "1rem",
                          marginRight: "1rem",
                        }}
                      ></FontAwesomeIcon>
                    </Accordion.Toggle>
                  </>
                ) : (
                  <></>
                )}

                <FontAwesomeIcon
                  onClick={(e) => {
                    handleMovingPartsOnClick(e, "REPLY");
                  }}
                  icon={faReply}
                  style={{
                    marginLeft: "1rem",
                    marginRight: "1rem",
                    cursor: "pointer",
                  }}
                ></FontAwesomeIcon>
                {comment.owner.id === currentUser.id && (
                  <FontAwesomeIcon
                    icon={faEdit}
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
                    style={{
                      marginLeft: "1rem",
                      marginRight: "1rem",
                      cursor: "pointer",
                    }}
                  ></FontAwesomeIcon>
                )}
              </div>
              <div ref={replyBarRef} style={{ display: "none" }}>
                <Form.Group controlId={`replyBoxFor${comment.id}`}>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    cols={100}
                    id={`replyOn${comment.id}`}
                    name={`replyOn${comment.id}`}
                    ref={replyInputRef}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId={`replyBoxFor${comment.id}`}>
                  <Button
                    type="submit"
                    id={`submitReplyOn${comment.id}`}
                    name={`submitReplyOn${comment.id}`}
                    onClick={(e) => {
                      handleReplyCUD(e, RestMethod.POST, {
                        parentCommentId: comment.id,
                        postId: postId,
                        commentId: null,
                        replyContent: replyContent,
                      });
                      handleMovingPartsOnClick(e, "REPLY_SUBMIT");
                    }}
                    onKeyDown={(e) =>
                      handleMovingPartsForKeys(e, "REPLY_SUBMIT")
                    }
                  >
                    reply
                  </Button>
                </Form.Group>
              </div>
            </Card.Header>

            {noOfReplies > 0 ? (
              <Accordion.Collapse eventKey={`comment${comment.id}`}>
                <Card.Body className="p-0">
                  {replies[`comment${comment.id}`.trim()] &&
                    replies[`comment${comment.id}`].dataList.map(
                      (reply, index2) => {
                        return (
                          <Comment
                            key={`reply${reply.id}`}
                            postId={postId}
                            parentCommentId={comment.id}
                            comment={{ ...reply }}
                            handleCommentCUD={null}
                            setParentComments={setReplies}
                            setNoOfRepliesInParent={setNoOfReplies}
                          />
                        );
                      }
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
  );
});
