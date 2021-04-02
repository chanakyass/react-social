import React, { useEffect, useCallback } from 'react'
import { useParams } from "react-router-dom";
import useState from 'react-usestateref'
import cookie from 'react-cookies'
import history from '../../app-history'
import cleanEmpty from '../utility/cleanup-objects'
import {
  Card,
  Button,
  OverlayTrigger,
  Popover,
  Accordion,
} from "react-bootstrap";
import  {Link}  from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp as faRegularThumbsUp} from "@fortawesome/free-regular-svg-icons";
import { RestMethod } from '../../enums'


const UserFeed = React.memo(() => {

    useEffect(() => {
        loadUserFeed()
    }, [])
  

  


  const [pagePosts, setPosts, postsRef] = useState({currentPageNo: 0, noOfPages: 0, dataList: []})

  
  const jwtToken = cookie.load('jwt')
  const currentUser = cookie.load('current_user')

    const loadUserFeed = () => {
      const requestOptions = {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                  },
                };

                fetch(
                  `http://localhost:8080/api/v1/resource/posts/${0}`,
                  requestOptions
                )
                  .then((response) =>
                    response.json().then((body) => {
                      
                      if (response.status === 200) {
    
                        setPosts(body);

                      } else {
                        const { error } = body;
                        console.log(error);
                        history.push("/error");
                      }
                    })
                  )
                  .catch((err) => {
                    console.log(err);
                    history.push("/error");
                  });
    }



    return (
      <div className="col-md-8 my-3 mx-auto">

        {postsRef.current.dataList.length > 0 ? (
          postsRef.current.dataList.map((post, index) => {

            return (
              
              <Post key={post.id} post={post} setPosts={setPosts} />
              
            );
          })
        ) : (
          <>loading</>
        )}
      </div>
    );
    
}
)

function UserDetailsPopup(props) {
    const { owner } = props




    return (
      <OverlayTrigger
        key="top"
        placement="top"
        //delay={{ show: 100, hide: 3000 }}
        overlay={
          <Popover id={"popover-positioned-top"}>
                <Popover.Title as="h3">{ owner.name }</Popover.Title>
            <Popover.Content>
              <strong>Holy guacamole!</strong> Check this info.
            </Popover.Content>
          </Popover>
        }
      >
        <cite>
          <Link to={`/profile/${owner.id}`}>{owner.name}</Link>
        </cite>
      </OverlayTrigger>
    );
}


const Post = React.memo(({ post, setPosts}) => {

    const jwtToken = cookie.load("jwt");
    const currentUser = cookie.load("current_user");

  const [comments, setComments, commentsRef] = useState({});

  const [commentContent, setCommentContent, commentContentRef] = useState('');
  const [postContent, setPostContent, postContentRef] = useState('')


  const handleCommentCUD = (e, method, commentId, postId, itemId) => {

    const postProp = `post${postId}`.trim();
    const commentProp = `comment${commentId}`.trim();

    switch (method) {
      case RestMethod.POST: {
        if (commentContentRef
          .current === '') {
          //raise error
        }
        else {

          const commentForDispatch = {
            commentedOn: { id: postId },
            commentedAtTime: new Date().toISOString,
            commentContent: commentContentRef.current,
            owner: currentUser
            
          }

          if (commentId) {
            commentForDispatch.parentComment = commentId
          }
          
          const requestOptions = {
            method: RestMethod.POST,
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
            body: commentForDispatch
          };


          fetch(
            `http://localhost:8080/api/v1/resource/comment`,
            requestOptions
          )
            .then((response) =>
              response.json().then((body) => {
                if (response.status === 200) {
                  if (commentId == null) {
                    setComments({ ...comments, [postProp]: body });
                  } else {
                    setComments({ ...comments, [commentProp]: body });
                  }
                } else {
                  console.log('error has occured')
                  history.push("/error");
                }
              })
            )
            .catch((error) => {
              console.log(error);
              history.push("/error");
            });
          
        }
      }
      break
      case RestMethod.PUT: {
          if (commentContentRef.current === "") {
            //raise error
          } else {
            const commentForDispatch = {
              commentedOn: { id: postId },
              commentedAtTime: new Date().toISOString,
              commentContent: commentContentRef.current,
              owner: currentUser
            };

            if (commentId) {
              commentForDispatch.parentComment = commentId;
            }

            const requestOptions = {
              method: RestMethod.PUT,
              headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
              },
              body: commentForDispatch,
            };

            fetch(
              `http://localhost:8080/api/v1/resource/comment`,
              requestOptions
            )
              .then((response) =>
                response.json().then((body) => {
                  if (response.status === 200) {
                    if (commentId == null) {
                      setComments({ ...commentsRef.current, [postProp]: body });
                    } else {
                      setComments({ ...commentsRef.current, [commentProp]: body });
                    }
                  } else {
                    console.log("error has occured");
                    history.push("/error");
                  }
                })
              )
              .catch((error) => {
                console.log(error);
                history.push("/error");
              });
          }
        
      }
      break
      case RestMethod.DELETE: {
        
        const requestOptions = {
          method: RestMethod.DELETE,
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          }
        };

        fetch(
          `http://localhost:8080/api/v1/resource/comment/${itemId}`,
          requestOptions
        )
          .then((response) =>
            response.json().then((body) => {
              if (response.status === 200) {
                if (commentId) {
                  setComments({ ...commentsRef.current, [commentProp]: { ...commentsRef.current[`comment${commentId}`], dataList: commentsRef.current[`comment${commentId}`].dataList.filter((comment) => comment.id !== itemId) } })

                  
                }
                else {
                  setComments({ ...commentsRef.current, [postProp]: { ...commentsRef.current[`post${postId}`], dataList: commentsRef.current[`post${postId}`].dataList.filter((comment) => comment.id !== itemId) } })
                  setPosts(posts => {
                    let dataList = posts.dataList.map(post => {
                      if(post.id === postId)
                        return { ...post, noOfComments: post.noOfComments - 1 }
                      else
                        return post
                    })
                    
                    return {...posts, dataList: dataList}
                  })
                }
                  
                
              } else {
                console.log("error has occured");
                history.push("/error");
              }
            })
          )
          .catch((error) => {
            console.log(error);
            history.push("/error");
          });
      }
    }
  }



  const handleGetComments = (e, postId, commentId, pageNo) => {
      
    const postProp = `post${postId}`.trim();
    const commentProp = `comment${commentId}`.trim();
    if (
      (commentId &&
        
        (!commentsRef.current[commentProp] ||
        (commentsRef.current[commentProp] &&
        commentsRef.current[commentProp].currentPageNo !== pageNo))) ||
      (postId &&
        (!commentsRef.current[postProp] ||
        (commentsRef.current[postProp] &&
        commentsRef.current[postProp].currentPageNo !== pageNo)))
    )
    {
            const requestOptions = {
              method: "GET",
              headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
              },
            };


          fetch(
            `http://localhost:8080/api/v1/resource/post/${postId}/comments/${pageNo}`,
            requestOptions
          )
            .then((response) =>
              response.json().then((body) => {
                if (response.status === 200) {
                  if (commentId == null) {
                    setComments({ ...comments, [postProp]: body });
                  } else {
                    setComments({ ...comments, [commentProp]: body });
                  }
                } else {
                  const { error } = body;
                  console.log(error);
                  history.push("/error");
                }
              })
            )
            .catch((error) => {
              console.log(error);
              history.push("/error");
            });
        }
    };

    const handleLikeUnlikePost = (e, post, action) => {
      const likePost = {
        owner: currentUser,
        likedAtTime: new Date().toISOString(),
        likedPost: { id: post.id },
      };

      const requestOptions = {
        method: action === "like" ? "POST" : "DELETE",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...likePost }),
      };
      fetch(
        `http://localhost:8080/api/v1/resource/post/${post.id}/${action}`,
        requestOptions
      )
        .then((response) =>
          response.json().then((body) => {
            if (response.status === 200) {
              const postLikedByCurrentUser = action === "like" ? true : false;

              setPosts((posts) => {
                
                let dataList =  posts.dataList.map((iterPost) => {
                  if (iterPost.id === post.id) {
                    return { ...iterPost, postLikedByCurrentUser };
                  } else {
                    return iterPost;
                  }
                });

                return {...posts, dataList: dataList}

              });
            } else {
              const { error } = body;
              console.log(error);
              console.log(error.details);
              history.push("/error");
            }
          })
        )
        .catch((error) => {
          console.log(error);
          history.push("/error");
        });
    };
                return <div>
                  <Card
                    className="mt-5"
                    style={{ maxWidth: "80%", borderBottom: "none" }}
                  >
                    {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
                    { console.log(post.id)}
       
                    <Card.Body>
                      <Card.Title>{post.postHeading}</Card.Title>
                      <Card.Subtitle>
                        <UserDetailsPopup owner={post.owner} />
                      </Card.Subtitle>
                      <Card.Text>{post.postBody}</Card.Text>
                      
                    </Card.Body>
                  </Card>
                  <Accordion>
                    <Card style={{ maxWidth: "80%", borderTop: "none" }}>
                      <Card.Header
                        style={{
                          background: "none",
                          border: "none",
                          margin: "none",
                          textDecoration: "underline",
                          color: "dodgerblue",
                        }}
                      >
                        {post.postLikedByCurrentUser === false ? (
                          <FontAwesomeIcon
                            onClick={(e) =>
                              handleLikeUnlikePost(e, post, "like")
                            }
                            icon={faRegularThumbsUp}
                            style={{
                              marginLeft: "1rem",
                              marginRight: "1rem",
                              cursor: "pointer",
                            }}
                          ></FontAwesomeIcon>
                        ) : (
                          <FontAwesomeIcon
                            onClick={(e) =>
                              handleLikeUnlikePost(e, post, "unlike")
                            }
                            icon={faThumbsUp}
                            style={{
                              marginLeft: "1rem",
                              marginRight: "1rem",
                              cursor: "pointer",
                            }}
                          ></FontAwesomeIcon>
                        )}
                        {post.noOfComments > 0 && (
                          <>
                            <Accordion.Toggle
                              as={Button}
                              variant="link"
                              eventKey={`post${post.id}`}
                              onClick={(e) =>
                                handleGetComments(e, post.id, null, 0)
                              }
                            >
                              <FontAwesomeIcon
                                icon={faCommentDots}
                                style={{
                                  marginLeft: "1rem",
                                  marginRight: "1rem",
                                }}
                              ></FontAwesomeIcon>
                            </Accordion.Toggle>
                          </>
                        )}
                      </Card.Header>

                      {post.noOfComments > 0 && (
                        <Accordion.Collapse eventKey={`post${post.id}`}>
                          <Card.Body>
                            <div>
                              <input type='textarea' id={`commentOn${post.id}`} name={`commentOn${post.id}`} onChange={(e) => setCommentContent(e.target.value)} />
                              <button id={`submitCommentOn${post.id}`} name={`submitCommentOn${post.id}`} onClick={(e) => handleCommentCUD(e, RestMethod.POST, null, post.id, null) }>comment</button>
                              </div>
                            {commentsRef.current[`post${post.id}`.trim()] &&
                              commentsRef.current[
                                `post${post.id}`
                              ].dataList.map((comment, index2) => {
                                return (
                    
                            

                                  <Comment
                                      key={index2}
                                      postId={ post.id }
                                      comment={comment}
                     
                                      handleCommentCUD={ handleCommentCUD }
                                    />
                              
                                );
                              })}
                          </Card.Body>
                        </Accordion.Collapse>
                      )}
                    </Card>
                  </Accordion>
                </div>;
}
)


const Comment = React.memo(({ postId, comment, handleCommentCUD }) => {

  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");
  
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
              data-dismiss="alert"
              data-target={`#commentCard${comment.id}`}
              type="button"
              className="close"
              aria-label="Close"
              onClick={(e) =>
                handleCommentCUD(e, RestMethod.DELETE, null, postId, comment.id)
              }
            >
              <span aria-hidden="true">&times;</span>
            </button>
          )}
        </Card.Header>
        {console.log("render ", comment.id)}

        <Card.Body>
          {/* <Card.Body> */}
          <Card.Subtitle>
            <UserDetailsPopup owner={comment.owner} />
          </Card.Subtitle>
          <Card.Text>{comment.commentContent}</Card.Text>
          {/* </Card.Body> */}
        </Card.Body>
      </Card>


    </div>
  );
});


export default UserFeed