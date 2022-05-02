import { handleError } from "../error/error-handling";
import { commentService } from "./comment-services";
import moment from 'moment';
import { RestMethod } from '../../enums.js';

class CommentHelper {
    adjustNoOfReplies(method, childReplyId, noOfRepliesAffected, parentCommentId, parentPostId, stateInfo, funcs, refs) {
          const {setParentComments} = stateInfo;
          const {adjustRepliesInHeirarchy} = funcs;
          const commentProp = `comment${parentCommentId}`;
          //const postProp = `post${comment.commentedOn.id}`;
          const postProp = `post${parentPostId}`;
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
    }

    handleMovingPartsOnClick(e, action, details, stateInfo, funcs, refs) {
          const {setShowGetRepliesLoad, repliesAccordionOpen, setRepliesAccordionOpen} = stateInfo;
          const {replyBarRef, reactionBarRef, replyInputRef, repliesDotRef,
             commentContentRef, updateCommentRef, updateInputRef, paginationRef} = refs;
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
              reactionBarRef.current.style.display = "block";
              break;
  
            case "POST_REPLY_SUBMIT":
              if (repliesAccordionOpen === false) {
                repliesDotRef.current.click();
              }
  
              setShowGetRepliesLoad(false);
  
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
  
            case "PRE_GET_REPLIES":
              if (pageNo > 0) {
                if (paginationRef.current) {
                  paginationRef.current.children[0].style.display = "none";
                  paginationRef.current.children[1].style.display = "block";
                }
              } else {
                setShowGetRepliesLoad(true);
              }
              break;
  
            case "POST_GET_REPLIES":
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
              if (repliesAccordionOpen === true) {
                repliesDotRef.current.click();
                setRepliesAccordionOpen(false);
              }
              break;
  
            default:
              console.log("method not supported");
          }
    }

    handleCommentCUD(e, method, commentObj, noOfCommentsOnPost, noOfRepliesOnComment, stateInfo, funcs, refs) {
          const {setParentComments, setNoOfCommentsDeletionsInSession, setReplyContent} = stateInfo;
          const {handleMovingPartsOnClick, handleMovingPartsOnClickPost, adjustNoOfCommentsInParentPost} = funcs;
          const {updateCommentRef} = refs;
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
                setParentComments((comments) => {
                  let newDataList = comments[postProp].dataList.map((comment) => {
                    if (comment.id === itemId)
                      return {
                        ...comment,
                        commentContent: commentContent,
                        modifiedAtTime: moment.utc().toISOString(),
                      };
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
                handleMovingPartsOnClick(e, "UPDATE_SUBMIT");
                commentService.commentsCUD(method, null, postId, itemId, commentContent).then(
                  ({ ok, responseBody, error }) => {
                    if (!ok) {
                      handleError({ error });
                    }
                  }
                );
              }
  
              break;
  
            case RestMethod.DELETE:
              commentService.commentsCUD(method, null, postId, itemId, null).then(
                ({ ok, responseBody, error }) => {
                  if (!ok) {
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
  
                    if (noOfCommentsOnPost === (noOfRepliesOnComment + 1)) {
                      handleMovingPartsOnClickPost(e, "DELETE_COMMENT");
                    }
  
                    setNoOfCommentsDeletionsInSession(
                      (noOfDeletions) => noOfDeletions + 1
                    );
  
                    adjustNoOfCommentsInParentPost(
                      RestMethod.DELETE,
                      noOfRepliesOnComment + 1
                    );
                  }
                }
              );
  
              break;
            //can do something more here
            default:
              alert("Wrong rest method");
          }
          setReplyContent("");
    }

    handleReplyCUD(e, method, replyObj, currentUser, parentCommentRepliesCount, noOfRepliesOfComment, stateInfo, funcs, refs) {
          const {replies, setReplies, setParentComments, setNoOfRepliesDeletionsInSession, setReplyContent} = stateInfo;
          const {adjustNoOfCommentsInParentPost, adjustNoOfReplies, adjustRepliesInHeirarchy,
            handleMovingPartsOnClickParent, handleMovingPartsOnClick} = funcs;
          const {replyInputRef, updateInputRef} = refs;
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
                handleMovingPartsOnClick(e, "PRE_REPLY_SUBMIT");
                commentService.commentsCUD(method, commentId, postId, itemId, replyContent).then(
                  ({ ok, responseBody, error }) => {
                    if (!ok) {
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
                      handleMovingPartsOnClick(e, "POST_REPLY_SUBMIT");
                    }
                  }
                );
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
                handleMovingPartsOnClick(e, "UPDATE_SUBMIT");
                commentService.commentsCUD(method, commentId, postId, itemId, replyContent).then(
                  ({ ok, responseBody, error }) => {
                    if (!ok) {
                      handleError({ error });
                    }
                  }
                );
              }
  
              break;
  
            case RestMethod.DELETE:
              commentService.commentsCUD(method, commentId, postId, itemId, replyContent).then(
                ({ ok, responseBody, error }) => {
                  if (!ok) {
                    handleError({ error });
                  } else {
                    setParentComments((comments) => {
                      return {
                        ...comments,
                        [commentProp]: {
                          ...comments[`comment${commentId}`],
                          dataList: comments[
                            `comment${commentId}`
                          ].dataList.filter((comment) => comment.id !== itemId),
                        },
                      };
                    });
  
                    if (parentCommentRepliesCount === (noOfRepliesOfComment + 1)) {
                      handleMovingPartsOnClickParent(e, "DELETE_COMMENT");
                    }
  
                    adjustNoOfCommentsInParentPost(
                      RestMethod.DELETE,
                      noOfRepliesOfComment + 1
                    );
                    adjustRepliesInHeirarchy(
                      method,
                      commentId,
                      noOfRepliesOfComment + 1
                    );
  
                    setNoOfRepliesDeletionsInSession(noOfDeletions => noOfDeletions + 1);
                  }
                }
              );
  
              break;
  
            default:
              alert("Only Post, Update or delete");
          }
          setReplyContent("");
    }

    handleLikeUnlikeComment(e, comment, action, stateInfo, funcs, refs) {
        const {setParentComments} = stateInfo;
        const {showAlertWithMessage} = funcs;
        let prop = null;
  
        if (comment.parentComment !== null) {
          prop = `comment${comment.parentComment.id}`;
        } else {
          prop = `post${comment.commentedOn.id}`;
        }
        commentService.likeUnlikeCommentCUD(comment, action).then(
          ({ ok, responseBody, error }) => {
            if (!ok) {
              if (
                error.statusCode === 500 &&
                error.exceptionType === "API_SPECIFIC_EXCEPTION"
              ) {
                let str = error.message;
                showAlertWithMessage(str.concat(error.details));
                // setParentComments(prevState);
              } else {
                handleError({ error });
              }
            } else {
              setParentComments((comments) => {
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
            }
          }
        );
    }

    handleGetReplies(e, commentId, pageNo, stateInfo, funcs, refs) {
          const {replies, setReplies, noOfCurrentRepliesDeletionInSession} = stateInfo;
          const {handleMovingPartsOnClick} = funcs;
          const commentProp = `comment${commentId}`.trim();
          handleMovingPartsOnClick(e, "PRE_GET_REPLIES", { pageNo: pageNo });
          commentService.loadComments(null, commentId, {
            pageNo: pageNo,
            noOfDeletions: noOfCurrentRepliesDeletionInSession,
          }).then(({ ok, responseBody, error }) => {
            if (!ok) {
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
              handleMovingPartsOnClick(e, "POST_GET_REPLIES", {
                pageNo: pageNo,
              });
            }
          });
    }

    handleMovingPartsForKeys(e, action, stateInfo, funcs, refs) {
        const {replyBarRef, reactionBarRef, updateCommentRef, commentContentRef} = refs;
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
    }
  
}

export default CommentHelper;