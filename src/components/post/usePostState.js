
import cookie from "react-cookies";
import {  useState, useRef, useCallback, useContext } from "react";
import { AlertContext } from "../../App";
import PostHelper from "./post-util";

const usePostState = ({ post, setPosts, setNoOfDeletedPostsInSession }) => {
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
  const postHelperRef = useRef();
  postHelperRef.current = new PostHelper();

  const adjustNoOfCommentsInParentPost = useCallback(
    (method, noOfRepliesAffected) => {
      postHelperRef.current.adjustNoOfCommentsInParentPost(method, noOfRepliesAffected, post.id, {setPosts, setNoOfDeletedPostsInSession}, null, null)
    },
    [setPosts, setNoOfDeletedPostsInSession, post.id]
  )

  const handlePostDelete = useCallback(
    (e, postId) => {
      postHelperRef.current.handlePostDelete(e, postId, {setPosts, setNoOfDeletedPostsInSession}, null, null)
    },
    [setPosts, setNoOfDeletedPostsInSession]
  );

  const handleMovingPartsOnClick = useCallback((e, action, details) => {
    postHelperRef.current.handleMovingPartsOnClick(e, action, details, 
                                                  {commentsAccordianOpen, setCommentsAccordianOpen, setShowGetRepliesLoad},
                                                  null,
                                                  {replyBarRef, reactionBarRef, replyInputRef, paginationRef, commentsDotRef})
  }, [commentsAccordianOpen, setCommentsAccordianOpen, setShowGetRepliesLoad]);

  const handleCreateComment = useCallback(
      (e, commentObj) => {
          postHelperRef.current.handleCreateComment(e, commentObj, currentUser,
                                                    {comments, setComments, setCommentContent},
                                                    {adjustNoOfCommentsInParentPost, handleMovingPartsOnClick},
                                                    {replyInputRef})
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
          postHelperRef.current.handleGetComments(e, postId, pageNo,
                                                {comments, setComments, noOfCommentsDeletionsInSession},
                                                {handleMovingPartsOnClick})
      },
      [comments, handleMovingPartsOnClick, noOfCommentsDeletionsInSession]
  );

  const handleLikeUnlikePost = (e, post, action) => {
      postHelperRef.current.handleLikeUnlikePost(e, post, action,
                                                {setPosts},
                                                {showAlertWithMessage},
                                                null);
  }

  const handleMovingPartsForKeys = (e) => {
      postHelperRef.current.handleMovingPartsForKeys(e, null, null, {replyBarRef, reactionBarRef});
  }

  return {
      stateInfo: [currentUser, comments, setComments, showPostModal, setShowPostModal, commentContent, setCommentContent, showLikesModal, setShowLikesModal,
        showGetRepliesLoad, setCommentsAccordianOpen, setNoOfCommentsDeletionsInSession, localLike, setLocalLike],
      funcs: [adjustNoOfCommentsInParentPost, handlePostDelete, handleMovingPartsOnClick, handleCreateComment, handleGetComments,
        handleLikeUnlikePost, handleMovingPartsForKeys], 
      refs: [replyBarRef, reactionBarRef, replyInputRef, commentsDotRef, paginationRef, likeRef, postHelperRef]
    }
}

export default usePostState;
