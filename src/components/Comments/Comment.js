import cookie from "react-cookies";
import history from "../../app-history";
import React, { useEffect, useState, useRef } from "react";
import { commentsCUD, likeUnlikeCommentCUD, loadComments } from './comment-services'
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
  let updateCommentRef = useRef(null)
  let commentContentRef = useRef(null)
  let repliesDotRef = useRef(null)

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

                if (replies && replies[commentProp]) {
                  let newComment = {
                    id: data.id,
                    commentedOn: { id: postId },
                    parentComment: { id: commentId },
                    commentedAtTime: new Date().toISOString,
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

                replyBarRef.current.style.display = "none";
                reactionBarRef.current.style.display = "inline-block";

                commentContentRef.current.style.display = "inline-block";
                updateCommentRef.current.style.display = "none";

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
                      if (reply.id === itemId) return {...reply, commentContent: replyContent, modifiedAtTime: new Date().toISOString};
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
        <Card.Header
          className="bg-transparent"
          style={{ border: "none" }}
        ></Card.Header>
        <Card.Body>
          <Card.Subtitle>
            <UserDetailsPopup owner={comment.owner} />
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
                  //value={(parentCommentId)?replyContent: commentContent}
                />
              </Form.Group>
              <Form.Group controlId={`updateCommentBoxFor${comment.id}`}>
                <Button
                  type="button"
                  id={`submitUpdateOn${comment.id}`}
                  name={`submitUpdateOn${comment.id}`}
                  onClick={(e) => {
                    !parentCommentId
                      ? handleCommentCUD(e, RestMethod.PUT, {postId: postId, commentId: comment.id, commentContent: replyContent} )
                      : handleReplyCUD(
                          e,
                          RestMethod.PUT,
                          {
                            parentCommentId: parentCommentId,
                            postId: postId,
                            commentId: comment.id,
                            replyContent: replyContent
                          }

                      );
                    updateCommentRef.current.style.display = 'none'
                    commentContentRef.current.style.display = 'inline-block'
                  }}
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
                    ref={ repliesDotRef }
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
              {comment.owner.id === currentUser.id && (
                <FontAwesomeIcon
                  icon={faEdit}
                  style={{
                    marginLeft: "1rem",
                    marginRight: "1rem",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    setReplyContent(comment.commentContent)
                    updateCommentRef.current.style.display = 'inline-block'
                    commentContentRef.current.style.display = 'none'
                  }}
                ></FontAwesomeIcon>
              )}
              {comment.owner.id === currentUser.id && (
                <FontAwesomeIcon
                  onClick={(e) => {
                    !parentCommentId
                      ? handleCommentCUD(
                          e,
                          RestMethod.DELETE,
                          {
                            postId: postId,
                            commentId: comment.id,
                          }
                        )
                      : handleReplyCUD(
                          e,
                          RestMethod.DELETE,
                          {
                            parentCommentId: parentCommentId,
                            postId: postId,
                            commentId: comment.id
                          }

                        );
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
                  onChange={(e) => setReplyContent(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId={`replyBoxFor${comment.id}`}>
                <Button
                  type="submit"
                  id={`submitReplyOn${comment.id}`}
                  name={`submitReplyOn${comment.id}`}
                  onClick={(e) => {
                    handleReplyCUD(
                      e,
                      RestMethod.POST,
                      {
                        parentCommentId: comment.id,
                        postId: postId,
                        commentId: null,
                        replyContent: replyContent
                      }

                    );
                  }}
                >
                  reply
                </Button>
                </Form.Group>
                
            </div>
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
