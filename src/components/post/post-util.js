import { handleError } from "../error/error-handling";
import { postService } from "./post-service";
import moment from 'moment';
import { RestMethod } from "../../enums";
import { commentService } from "../comments/comment-services";

class PostHelper {
    constructor() {
        this.postService = postService;  
        this.handleError = handleError;      
    }

    adjustNoOfCommentsInParentPost(method, noOfRepliesAffected, parentPostId, stateInfo, funcs, refs) {
        const setPosts = stateInfo.setPosts;
        setPosts((posts) => {
            let newDataList = posts.dataList.map((iterPost) => {
                if (iterPost.id === parentPostId) {
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
    }

    handlePostDelete(e, postId, stateInfo, funcs, refs) {
        const {setPosts, setNoOfDeletedPostsInSession} = stateInfo;
        e.preventDefault();
        postService.postsCUD(RestMethod.DELETE, postId, null, null).then(
        (res) => {
            const ok = res.ok;
            const error = res.error;
            if (!ok) {
            handleError({error});
            } else {
            setNoOfDeletedPostsInSession(noOfDeletedPosts => noOfDeletedPosts + 1);
            setPosts((posts) => {
                return (posts.dataList.length === 1) ? 
                {
                dataList: [], 
                noOfPages: 0, 
                currentPageNo: -1, 
                isLastPage: false
                }
                :
                {
                ...posts,
                dataList: posts.dataList.filter(
                    (iterPost) => iterPost.id !== postId
                )
                };
            });
            }
        }
        );
    }

    handleMovingPartsOnClick(e, action, details, stateInfo, funcs, refs) {
          const {commentsAccordianOpen, setCommentsAccordianOpen, setShowGetRepliesLoad} = stateInfo;
          const {replyBarRef, reactionBarRef, replyInputRef, paginationRef, commentsDotRef} = refs;
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
    }

    handleCreateComment(e, commentObj, currentUser, stateInfo, funcs, refs) {
          const {comments, setComments, setCommentContent} = stateInfo;
          const {adjustNoOfCommentsInParentPost, handleMovingPartsOnClick} = funcs;
          const {replyInputRef} = refs;
          let postId = commentObj.postId;
          let commentContent = commentObj.commentContent;
    
          const postProp = `post${postId}`.trim();
    
          e.preventDefault();
    
          handleMovingPartsOnClick(e, "PRE_REPLY_SUBMIT", null);
    
          if (commentContent === "") {
            replyInputRef.current.focus();
          } else {
            commentService.commentsCUD(RestMethod.POST, null, postId, null, commentContent).then(
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
                  handleMovingPartsOnClick(e, "POST_REPLY_SUBMIT", null);
                }
              }
            );
          }
    
          setCommentContent("");
    }

    handleGetComments(e, postId, pageNo, stateInfo, funcs, refs) {
          const {comments, setComments, noOfCommentsDeletionsInSession} = stateInfo;
          const {handleMovingPartsOnClick} = funcs;
          const postProp = `post${postId}`.trim();
    
          if (postId) {
            handleMovingPartsOnClick(e, "PRE_GET_COMMENTS", { pageNo: pageNo });
    
            commentService.loadComments(postId, null, {
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
    }

    handleLikeUnlikePost(e, post, action, stateInfo, funcs, refs) {
        const {setPosts} = stateInfo;
        const {showAlertWithMessage} = funcs;
        postService.likeUnlikeCUD(post, action)
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
    }

    handleMovingPartsForKeys(e, stateInfo, funcs, refs) {
        const {replyBarRef, reactionBarRef} = refs;
        if (e.key === "Escape") {
          replyBarRef.current.style.display = "none";
          reactionBarRef.current.style.display = "inline-block";
        }
    }

    handlePostCU(e, method, currentUser, stateInfo, funcs, refs) {
      const {editorPost, setEditorPost, setPosts} = stateInfo;
      const {handleClose} = funcs;
      const postId = editorPost.id;
      const postHeading = editorPost.postHeading.trim();
      const postBody = editorPost.postBody.trim();

      if (postBody === "") {
        //error
      } else {
    
        postService.postsCUD(
          method,
          postId,
          postHeading,
          postBody
        ).then(({ ok, responseBody, error }) => {

          if (!ok) {
            handleClose(e);
            handleError({ error });
          
          } else {
            const { data } = responseBody;
          
            switch (method) {
              case RestMethod.POST:
                setPosts((posts) => {
                  return {
                    ...posts,
                    dataList: [
                      {
                        id: data.resourceId,
                        owner: currentUser,
                        postHeading: postHeading,
                        postBody: postBody,
                        postedAtTime: moment.utc().toISOString(),
                        modifiedAtTime: null,
                        noOfComments: 0,
                        postLikedByCurrentuser: false,
                        noOfLikes: 0
                      },
                      ...posts.dataList,
                    ],
                    currentPageNo: (posts.currentPageNo !== -1) ? posts.currentPageNo : 0,
                    noOfPages: (posts.noOfPages !== 0) ? posts.noOfPages : 1,
                    isLastPage: (posts.noOfPages !==0) ? posts.isLastPage: true
                  };
                });
            
                break;
              case RestMethod.PUT:
                setPosts((posts) => {
                  return {
                    ...posts,
                    dataList: posts.dataList.map(listPost => {
                      let newPost = listPost;
                      if (listPost.id === postId) {
                        if (postHeading !== '') {
                          newPost = { ...newPost, postHeading: postHeading };
                        }
                        if (postBody !== '') {
                          newPost = { ...newPost, postBody: postBody };
                        }

                        newPost = { ...newPost, modifiedAtTime: moment.utc().toISOString() }
                        return newPost;
                      }
                      else {
                        return listPost;
                      }
                    })
                  }
                });
                break;
              default: console.log('Method not applicable');
                break;
            }
          }
          setEditorPost({ id: null, postHeading: '', postBody: '' });
          handleClose(e);
        });
      }    
    }
}

export default PostHelper;