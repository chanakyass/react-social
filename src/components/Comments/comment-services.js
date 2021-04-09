
import cookie from "react-cookies";
import history from "../../app-history";
import moment from 'moment';
import { RestMethod } from '../../enums'


    

export const commentsCUD = async (method, commentId, postId, itemId, commentContent) => {

  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");
  let commentForDispatch = {
    commentedOn: { id: postId },
    commentContent: commentContent,
    owner: currentUser,
  };

  if (commentId) {
    commentForDispatch = { ...commentForDispatch, parentComment: { id: commentId } };
  }

  let requestOptions = {
    method: method,
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    }
  };

  let url = null;
  
  switch (method) {
    case RestMethod.POST:
      {

        requestOptions.body = JSON.stringify({ ...commentForDispatch, commentedAtTime: moment.utc().toISOString() });
        url = `http://localhost:8080/api/v1/resource/comment`;
        
      }
      break;
    case RestMethod.PUT:
      {
        commentForDispatch = { ...commentForDispatch, id: itemId, modifiedAtTime: moment.utc().toISOString() };
        requestOptions.body = JSON.stringify({ ...commentForDispatch });
        url = `http://localhost:8080/api/v1/resource/comment`;

        
      }
      break;
    case RestMethod.DELETE: {

      url = `http://localhost:8080/api/v1/resource/comment/${itemId}`;

    }
  }
  try {
    let response = await fetch(
      url,
      requestOptions
    );

    let body = await response.json();

    return body;
  }
  catch (err) {
    console.log(err);
    history.push('/error');
  }
};

export const loadComments = async (postId, commentId, pageNo) => {

  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
  };
  let url = null;
  if(commentId)
     url = `http://localhost:8080/api/v1/resource/comment/${commentId}/replies/${pageNo}`;
  else
      url = `http://localhost:8080/api/v1/resource/post/${postId}/comments/${pageNo}`;

    try {
      const response = await fetch(
       url,
        requestOptions
      )
      
      const body = await response.json()
      return body;
    }
    catch (err) {
      history.push('/error')
    }

  
};

export const likeUnlikeCommentCUD = async (comment, action) => {
  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");
  const likeComment = {
    owner: currentUser,
    likedAtTime: moment.utc().toISOString(),
    likedComment: { id: comment.id },
  };

  const requestOptions = {
    method: action === "like" ? "POST" : "DELETE",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...likeComment }),
  };

  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/resource/comment/${comment.id}/${action}`,
      requestOptions
    );
    const body = await response.json();
    return body;
  } catch (err) {
    console.log(err);
    history.push("/error");
  }
};
