import cookie from "react-cookies";
import history from "../../app-history";
import React, {  useState, useRef, useCallback } from "react";
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
import { UserDetailsPopup } from '../UserDetailsPopup'
import { Comment } from '../comments/Comment'
import { CreatePost } from "../CreatePost";
import { LikesModal } from "../likes/LikesModal";
import moment from 'moment';
import { convertDateToReadableFormat } from '../utility/handle-dates'
import { CustomToggle } from '../utility/CustomToggle';

let myfuncs2 = new Set();

export const Post = React.memo(({ post, setPosts }) => {
  const currentUser = cookie.load("current_user");

  const [comments, setComments] = useState({});

  const [showPostModal, setShowPostModal] = useState(false)

  const [commentContent, setCommentContent] = useState("");

  let [noOfComments, setNoOfComments] = useState(post.noOfComments);

  let [showLikesModal, setShowLikesModal] = useState(false);

  const [showGetRepliesLoad, setShowGetRepliesLoad] = useState(false);

  const replyBarRef = useRef(null);
  let reactionBarRef = useRef(null);
  const replyInputRef = useRef(null);
  const commentsDotRef = useRef(null);


  const handlePostDelete = async (e, postId) => {
    e.preventDefault();
    const responseBody = await postsCUD(
      RestMethod.DELETE,
      postId,
      null,
      null
    );
    if ("error" in responseBody) {
      const { error } = responseBody;
      console.log(error);
      history.push("/error");
    } else {

      setPosts((posts) => {
        return {
          ...posts,
          dataList: posts.dataList.filter(iterPost => iterPost.id !== postId)
        };
      });
    }   
  }

  const handleCreateComment = useCallback( async (e, commentObj) => {

    let postId = commentObj.postId;
    let commentContent = commentObj.commentContent;

    const postProp = `post${postId}`.trim();

    e.preventDefault();

    if (commentContent === '') {
      replyInputRef.current.focus();
    } else {
          const responseBody = await commentsCUD(
            RestMethod.POST,
            null,
            postId,
            null,
            commentContent
          );
      if ("error" in responseBody) {
        const { error } = responseBody;
        console.log(error);
        history.push("/error");
      } else {

        const { data } = responseBody

        if (comments && comments[postProp]){
          
            let newComment = {
              id: data.resourceId,
              commentedOn: { id: postId },
              commentContent: commentContent,
              owner: currentUser,
              commentLikedByCurrentUser: false,
              noOfLikes: 0,
              noOfReplies: 0,
            };

        newComment = { ...newComment, commentedAtTime: moment.utc().toISOString(), modifiedAtTime: null };

        let newDataList = [...comments[postProp].dataList, newComment];
          
        setComments({
            ...comments, [postProp]: {
              ...comments[postProp],
              dataList: newDataList
            }
          });
        }


        setNoOfComments(noOfComments => noOfComments + 1)

      }
    }

    setCommentContent('')
  }, [comments, noOfComments]);

  

  const handleGetComments = useCallback( async (e, postId, pageNo) => {
    const postProp = `post${postId}`.trim();

    if (postId) {
      const responseBody = await loadComments( postId, null, pageNo);
      if ("error" in responseBody) {
        const { error } = responseBody;
        history.push("/error");
      } else {
        if (!comments[postProp]) {
          setComments({ ...comments, [postProp]: responseBody });
        } else if(comments[postProp].currentPageNo !== pageNo){
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
      }
      setShowGetRepliesLoad(false);
    }
  }, [comments, showGetRepliesLoad]);

  const handleLikeUnlikePost = async (e, post, action) => {
    const responseBody = await likeUnlikeCUD(post, action);
    if ("error" in responseBody) {
      const { error } = responseBody;
      console.log(error);
      history.push("/error");
    } else {
      const postLikedByCurrentUser = action === "like" ? true : false;

      setPosts((posts) => {
        let dataList = posts.dataList.map((iterPost) => {
          if (iterPost.id === post.id) {
            const noOfLikes = (action === 'like') ? iterPost.noOfLikes + 1 : iterPost.noOfLikes - 1;
            return { ...iterPost, postLikedByCurrentUser, noOfLikes };
          } else {
            return iterPost;
          }
        });

        return { ...posts, dataList: dataList };
      });
    }
  };

    const handleMovingPartsOnClick = (e, action) => {
      switch (action) {
        case "REPLY":
          {
            replyBarRef.current.style.display = "block";
            reactionBarRef.current.style.display = "none";
            replyInputRef.current.value = "";
            replyInputRef.current.focus();
          }
          break;
        case "REPLY_SUBMIT":
          {
 
            replyBarRef.current.style.display = "none";
            reactionBarRef.current.style.display = "inline-block";
            commentsDotRef.current.click();
            
          }
          break;
      }
  };
  
  const handleMovingPartsForKeys = (e) => {
    if (e.key === 'Escape') {
            replyBarRef.current.style.display = "none";
            reactionBarRef.current.style.display = "inline-block";
    }
  }


  return (
    <>
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
          <Card.Text>
            <div style={{ display: "inline-block" }}>
              {Parser(post.postBody)}
            </div>
          </Card.Text>
        </Card.Body>
      </Card>

      <Accordion>
        <Card style={{ maxWidth: "100%", borderTop: "none" }}>
          <Card.Header
            style={{
              background: "none",
              border: "none",
              margin: "none",
            }}
          >
            <div ref={reactionBarRef} style={{ display: "inline-block" }}>
              <div className="mb-3">
                {post.noOfLikes > 0 && (
                  <button
                    className="link-button mr-3"
                    onClick={(e) => {
                      setShowLikesModal(true);
                    }}
                  >
                    <small>View Likes</small>
                  </button>
                )}
              </div>
              {post.postLikedByCurrentUser === false ||
              post.postLikedByCurrentUser === undefined ||
              post.postLikedByCurrentUser === null ? (
                <span style={{ marginRight: "1rem" }}>
                  <FontAwesomeIcon
                    color="#4A4A4A"
                    onClick={(e) =>
                      post.owner.id !== currentUser.id &&
                      handleLikeUnlikePost(e, post, "like")
                    }
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
                  <span style={{ color: "#4A4A4A" }}>{post.noOfLikes}</span>
                </span>
              ) : (
                <span style={{ marginRight: "1rem" }}>
                  <FontAwesomeIcon
                    color="#4A4A4A"
                    onClick={(e) => handleLikeUnlikePost(e, post, "unlike")}
                    icon={faThumbsUp}
                    style={{
                      marginRight: "0.4rem",
                      cursor: "pointer",
                    }}
                  ></FontAwesomeIcon>
                  <span style={{ color: "grey" }}>{post.noOfLikes}</span>
                </span>
              )}

              <button
                className="toggle-button"
                onClick={(e) => {
                  if (
                    noOfComments > 0 &&
                    (!comments || !comments[`post${post.id}`])
                  ) {
                    setShowGetRepliesLoad(true);
                    handleGetComments(e, post.id, 0);
                  }
                }}
              >
                <CustomToggle
                  eventKey={`post${post.id}`}
                  attachRef={commentsDotRef}
                  allowToggle={noOfComments}
                >
                  <>
                    <FontAwesomeIcon
                      icon={faCommentDots}
                      color="#4A4A4A"
                      style={{
                        marginRight: "0.4rem",
                      }}
                    />
                    {noOfComments !== 0 && (
                      <span style={{ color: "#4A4A4A" }}>{noOfComments}</span>
                    )}
                  </>

                  {/* </FontAwesomeIcon> */}
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
              <Form.Group controlId={`commentBoxFor${post.id}`}>
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
              <Form.Group controlId={`replyBoxFor${post.id}`}>
                <Button
                  type="submit"
                  id={`submitCommentOn${post.id}`}
                  name={`submitCommentOn${post.id}`}
                  onClick={async (e) => {
                    await handleCreateComment(e, {
                      commentId: null,
                      postId: post.id,
                      commentContent: commentContent,
                    });
                    handleMovingPartsOnClick(e, "REPLY_SUBMIT");
                  }}
                >
                  reply
                </Button>
              </Form.Group>
            </div>
          </Card.Header>

          {noOfComments > 0 && (
            <Accordion.Collapse eventKey={`post${post.id}`}>
              <Card.Body>
                {showGetRepliesLoad === true && (
                  <div className="spinner bg-light">
                    <div className="bounce1"></div>
                    <div className="bounce2"></div>
                    <div className="bounce3"></div>
                  </div>
                )}
                {comments[`post${post.id}`.trim()] &&
                  comments[`post${post.id}`].dataList.map((comment, index2) => {
                    return (
                      <Comment
                        key={`comment${comment.id}`}
                        postId={post.id}
                        parentCommentId={null}
                        comment={comment}
                        //handleCommentCUD={handleCommentCUD}
                        setParentComments={setComments}
                        setNoOfRepliesInParent={setNoOfComments}
                      />
                    );
                  })}
                {comments[`post${post.id}`.trim()] &&
                  comments[`post${post.id}`].currentPageNo <
                    comments[`post${post.id}`].noOfPages - 1 && (
                    <div className="bg-light">
                      <button
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
                    </div>
                  )}
              </Card.Body>
            </Accordion.Collapse>
          )}
        </Card>
      </Accordion>
      {/* {console.log('no of commentcud functions for post ', post.id, ' is ', myfuncs2.size)} */}
    </>
  );
});
