import cookie from "react-cookies";
import {  useState, useRef, useCallback, useContext } from "react";
import { AlertContext } from "../../App";
import CommentHelper from "./comment-util";


const useCommentState =
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
    const currentUser = cookie.load("current_user");

    const [replies, setReplies] = useState({});
    const [replyContent, setReplyContent] = useState("");
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [showGetRepliesLoad, setShowGetRepliesLoad] = useState(false);
    const [repliesAccordionOpen, setRepliesAccordionOpen] = useState(false);
    const [localLike, setLocalLike] = useState({
      commentLikedByCurrentUser: comment.commentLikedByCurrentUser,
      noOfLikes: comment.noOfLikes,
    });

    const [noOfCurrentRepliesDeletionInSession, setNoOfCurrentRepliesDeletionInSession] = useState(0);

    const showAlertWithMessage = useContext(AlertContext);

    let replyBarRef = useRef(null);
    let reactionBarRef = useRef(null);
    let updateCommentRef = useRef(null);
    let commentContentRef = useRef(null);
    let repliesDotRef = useRef(null);
    let replyInputRef = useRef(null);
    let updateInputRef = useRef(null);
    let paginationRef = useRef(null);
    let likeRef = useRef(comment.commentLikedByCurrentUser);
    let commentHelperRef = useRef();
    commentHelperRef.current = new CommentHelper();

    // const parentCommentId = parentComment ? parentComment.id : null;
    // const postId = post.id;

    // const parentCommentRepliesCount = parentComment
    //   ? parentComment.noOfReplies
    //   : null;

    const adjustNoOfReplies = useCallback(
      (method, childReplyId, noOfRepliesAffected) => {
        const parentCommentId = parentComment ? parentComment.id : null;
        commentHelperRef.current.adjustNoOfReplies(method, childReplyId, noOfRepliesAffected,
                                                   parentCommentId, comment.commentedOn.id, 
                                                   {setParentComments}, 
                                                   {adjustRepliesInHeirarchy},
                                                   null)
      },
      [adjustRepliesInHeirarchy, comment, setParentComments, parentComment]
    );

    const handleMovingPartsOnClick = useCallback(
      (e, action, details) => {
        commentHelperRef.current.handleMovingPartsOnClick(e, action, details,
                                                          {setShowGetRepliesLoad, repliesAccordionOpen, setRepliesAccordionOpen},
                                                          null,
                                                          {replyBarRef, reactionBarRef, replyInputRef, repliesDotRef,
                                                            commentContentRef, updateCommentRef, updateInputRef, paginationRef})
      },
      [setShowGetRepliesLoad, repliesAccordionOpen, setRepliesAccordionOpen]
    );

    const handleCommentCUD = useCallback(
      (e, method, commentObj) => {
        commentHelperRef.current.handleCommentCUD(e, method, commentObj, post.noOfComments, comment.noOfReplies,
                                                  {setParentComments, setNoOfCommentsDeletionsInSession, setReplyContent},
                                                  {handleMovingPartsOnClick, handleMovingPartsOnClickPost, adjustNoOfCommentsInParentPost},
                                                  {updateCommentRef});
      },
      [
        setParentComments, setNoOfCommentsDeletionsInSession, setReplyContent, post.noOfComments, comment.noOfReplies,
        handleMovingPartsOnClick, handleMovingPartsOnClickPost, adjustNoOfCommentsInParentPost
      ]
    );

    const handleReplyCUD = useCallback(
      (e, method, replyObj) => {
        const parentCommentRepliesCount = parentComment
        ? parentComment.noOfReplies
        : null;
        commentHelperRef.current.handleReplyCUD(e, method, replyObj, currentUser, parentCommentRepliesCount, comment.noOfReplies,
                                                {replies, setReplies, setParentComments, setNoOfRepliesDeletionsInSession, setReplyContent},
                                                {adjustNoOfCommentsInParentPost, adjustNoOfReplies, adjustRepliesInHeirarchy,
                                                  handleMovingPartsOnClickParent, handleMovingPartsOnClick},
                                                  {replyInputRef, updateInputRef});
      }, 
      [        
        replies,
        currentUser,
        setParentComments,
        adjustNoOfCommentsInParentPost,
        adjustNoOfReplies,
        adjustRepliesInHeirarchy,
        comment.noOfReplies,
        parentComment,
        handleMovingPartsOnClickParent,
        setNoOfRepliesDeletionsInSession,
        handleMovingPartsOnClick,
      ]
    );

    const handleLikeUnlikeComment = (e, comment, action) => {
      commentHelperRef.current.handleLikeUnlikeComment(e, comment, action, {setParentComments}, {showAlertWithMessage}, null)
    }

    const handleGetReplies = useCallback(
      (e, commentId, pageNo) => {
        commentHelperRef.current.handleGetReplies(e, commentId, pageNo,
                                                  {replies, setReplies, noOfCurrentRepliesDeletionInSession},
                                                  {handleMovingPartsOnClick},
                                                  null);
      }, 
      [replies, handleMovingPartsOnClick, noOfCurrentRepliesDeletionInSession]
    );

    const handleMovingPartsForKeys = (e, action) => {
      commentHelperRef.current.handleMovingPartsForKeys(e, action,
                                                        null, null,
                                                        {replyBarRef, reactionBarRef, updateCommentRef, commentContentRef})
    }
    return {
        stateInfo: [currentUser, replies, setReplies, replyContent, setReplyContent, showLikesModal, setShowLikesModal,
            showGetRepliesLoad, repliesAccordionOpen, setRepliesAccordionOpen, localLike, setLocalLike, setNoOfCurrentRepliesDeletionInSession],
        funcs: [adjustNoOfReplies, handleMovingPartsOnClick, handleCommentCUD, handleReplyCUD, handleLikeUnlikeComment, handleGetReplies, handleMovingPartsForKeys],
        refs: [replyBarRef, reactionBarRef, updateCommentRef, commentContentRef, repliesDotRef, 
            replyInputRef, updateInputRef, paginationRef, likeRef, commentHelperRef]
    }
}

export default useCommentState;
