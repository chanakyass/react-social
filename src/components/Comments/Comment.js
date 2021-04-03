import cookie from "react-cookies";
import history from "../../app-history";
import React, { useEffect, useState, useRef } from "react";
import { commentsCUD, likeUnlikeCommentCUD, loadComments } from '../comments/comment-services'
import cleanEmpty from "../utility/cleanup-objects";
import { Card, Button, Accordion, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faCommentDots, faReply } from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp as faRegularThumbsUp, faCommentDots as faRegularCommentDots, faEdit, faWindowClose } from "@fortawesome/free-regular-svg-icons";
import { RestMethod } from "../../enums";
import { UserDetailsPopup } from "../UserDetailsPopup";

export const Comment = React.memo(({ postId, parentCommentId, comment, handleCommentCUD, setParentComments, setNoOfRepliesInParent}) => {
  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");
  console.log('no of replies ',comment.noOfReplies);

  const [noOfReplies, setNoOfReplies] = useState(comment.noOfReplies);
  // const noOfRepliesRef = useRef(noOfReplies);
  // noOfRepliesRef.current = noOfReplies;
  const [isCommentLiked, setIsCommentLiked] = useState(comment.commentLikedByCurrentUser)
  const [replies, setReplies] = useState({})
  const repliesRef = useRef(null)
  repliesRef.current = replies
  const [replyContent, setReplyContent] = useState('')

  let reactionBarRef = useRef(null)
  let replyBarRef = useRef(null)

  const handleReplyCUD = async (e, method, commentId, postId, itemId) => {
    const commentProp = `comment${commentId}`.trim();


      const responseBody = await commentsCUD(
        method,
        commentId,
        postId,
        itemId,
        replyContent
      );

      switch (method) {
        case RestMethod.POST:
        case RestMethod.PUT:
          {
            
            if (replyContent === "") {
              //raise error
            } else {
              if ("error" in responseBody) {
                const { error } = responseBody;
                console.log(error);
                history.push("/error");
              } else {
                const { data } = responseBody;

              
                if (replies && replies[commentProp]) {
                
                  let newComment = {
                  id: data.id,
                  commentedOn: { id: postId },
                  parentComment: { id: commentId },
                  commentedAtTime: new Date().toISOString,
                  commentContent: replyContent,
                  owner: currentUser

                };

                let newDataList =
                  method === RestMethod.POST
                    ? [...replies[commentProp].dataList, newComment]
                    : replies[commentProp].dataList.map((reply) => {
                      if (reply.id === itemId) return newComment;
                      else return comment;
                    });
                  
                

                setReplies({
                  ...replies,
                  [commentProp]: {
                    ...replies[commentProp],
                    dataList: newDataList,
                  },
                });
                  


                }
                replyBarRef.current.style.display = "none";
                reactionBarRef.current.style.display = "inline-block";
                setNoOfReplies((noOfReplies) => noOfReplies + 1);
                
            }

            }
          }
          break;

        case RestMethod.DELETE: {
          if ("error" in responseBody) {
            const { error } = responseBody;
            console.log(error);
            history.push("/error");
          } else {
            // setReplies((replies) => {
            //   return {
            //     ...replies,
            //     [commentProp]: {
            //       ...replies[`comment${commentId}`],
            //       dataList: replies[`comment${commentId}`].dataList.filter(
            //         (reply) => reply.id !== itemId
            //       ),
            //     },
            //   }
            // });

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

  return (
    <div>
      <Card
        id={`commentCard${comment.id}`}
        style={{ maxWidth: "100%", border: "none" }}
        bg="light"
      >
        <Card.Header className="bg-transparent" style={{ border: "none" }}>
          {comment.owner.id === currentUser.id && (
            <button
              // data-dismiss="alert"
              // data-target={`#commentCardEdit${comment.id}`}
              type="button"
              className="close"
              aria-label="Edit"
              onClick={(e) => {
                !parentCommentId
                  ? handleCommentCUD(e, RestMethod.DELETE, postId, comment.id)
                  : handleReplyCUD(
                      e,
                      RestMethod.PUT,
                      parentCommentId,
                      postId,
                      comment.id
                    );
              }}
            >
              <span aria-hidden="true">
                <FontAwesomeIcon
                  onClick={(e) => handleLikeUnlikeComment(e, comment, "unlike")}
                  icon={faWindowClose}
                  style={{
                    marginLeft: "1rem",
                    marginRight: "1rem",
                    cursor: "pointer",
                  }}
                ></FontAwesomeIcon>
              </span>
            </button>
          )}
          {comment.owner.id === currentUser.id && (
            <button
              data-dismiss="alert"
              data-target={`#commentCardClose${comment.id}`}
              type="button"
              className="close"
              aria-label="Close"
              onClick={(e) => {
                !parentCommentId
                  ? handleCommentCUD(e, RestMethod.DELETE, postId, comment.id)
                  : handleReplyCUD(
                      e,
                      RestMethod.DELETE,
                      parentCommentId,
                      postId,
                      comment.id
                    );
              }}
            >
              <span aria-hidden="true">
                <FontAwesomeIcon
                  onClick={(e) => handleLikeUnlikeComment(e, comment, "unlike")}
                  icon={faEdit}
                  style={{
                    marginLeft: "1rem",
                    marginRight: "1rem",
                    cursor: "pointer",
                  }}
                ></FontAwesomeIcon>
              </span>
            </button>
          )}
        </Card.Header>
        <Card.Body>
          <Card.Subtitle>
            <UserDetailsPopup owner={comment.owner} />
          </Card.Subtitle>
          <Card.Text>{comment.commentContent}</Card.Text>
        </Card.Body>
      </Card>
      <Accordion>
        <Card style={{ maxWidth: "100%", border: "none" }}>
          <Card.Header
            style={
              {
                // background: "transparent",
                // border: "none",
                // margin: "none",
                // textDecoration: "underline",
                // color: "dodgerblue",
              }
            }
          >
            <div ref={reactionBarRef} style={{ display: "inline-block" }}>
              {!isCommentLiked || isCommentLiked === false ? (
                <FontAwesomeIcon
                  onClick={(e) => handleLikeUnlikeComment(e, comment, "like")}
                  icon={faRegularThumbsUp}
                  style={{
                    marginLeft: "1rem",
                    marginRight: "1rem",
                    cursor: "pointer",
                  }}
                ></FontAwesomeIcon>
              ) : (
                <FontAwesomeIcon
                  onClick={(e) => handleLikeUnlikeComment(e, comment, "unlike")}
                  icon={faThumbsUp}
                  style={{
                    marginLeft: "1rem",
                    marginRight: "1rem",
                    cursor: "pointer",
                  }}
                ></FontAwesomeIcon>
              )}
              {noOfReplies > 0 ? (
                <>
                  <Accordion.Toggle
                    as={Button}
                    variant="link"
                    eventKey={`comment${comment.id}`}
                    onClick={(e) => handleGetReplies(e, comment.id, 0)}
                  >
                    <FontAwesomeIcon
                      icon={faRegularCommentDots}
                      color={"black"}
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
              <Form.Group controlId={`replyBoxFor${comment.id}`}>
                <Form.Control
                  as="textarea"
                  rows={3}
                  cols={100}
                  id={`replyOn${comment.id}`}
                  name={`replyOn${comment.id}`}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId={`replyBoxFor${comment.id}`}>
                <Button
                  type="button"
                  id={`submitReplyOn${comment.id}`}
                  name={`submitReplyOn${comment.id}`}
                  onClick={(e) => {
                    handleReplyCUD(
                      e,
                      RestMethod.POST,
                      comment.id,
                      postId,
                      null
                    );
                  }}
                >
                  reply
                </Button>
              </Form.Group>
            </div>

            {/* <div ref={replyBarRef} style={{ display: "none" }}>
              <input
                type="textarea"
                id={`replyOn${comment.id}`}
                name={`replyOn${comment.id}`}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button
                id={`submitReplyOn${comment.id}`}
                name={`submitReplyOn${comment.id}`}
                onClick={(e) => {
                  handleReplyCUD(e, RestMethod.POST, comment.id, postId, null);
                }}
              >
                reply
              </button>
            </div> */}
          </Card.Header>

          {noOfReplies > 0 ? (
            <Accordion.Collapse eventKey={`comment${comment.id}`}>
              <Card.Body>
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
  );
});
