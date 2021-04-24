
import cookie from "react-cookies";
import moment from 'moment';
import { RestMethod } from '../../enums'
import baseURI from '../../api-config'

    

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
      

        requestOptions.body = JSON.stringify({ ...commentForDispatch, commentedAtTime: moment.utc().toISOString() });
        url = `${baseURI}/api/v1/resource/comment`;
        
      
      break;
    case RestMethod.PUT:
      
        commentForDispatch = { ...commentForDispatch, id: itemId, modifiedAtTime: moment.utc().toISOString() };
        requestOptions.body = JSON.stringify({ ...commentForDispatch });
        url = `${baseURI}/api/v1/resource/comment`;

        
      
      break;
    case RestMethod.DELETE:

      url = `${baseURI}/api/v1/resource/comment/${itemId}`;
      break;
    
    default:

    
  }
  try {
    let response = await fetch(
      url,
      requestOptions
    );

    let body = await response.json();
    if ("error" in body)
      throw body.error;

    return {ok: true, responseBody: body, error: null};
  }
  catch (error) {
    return { ok: false, responseBody: null, error };
  }
};

export const loadComments = async (postId, commentId, pageNo) => {

  const jwtToken = cookie.load("jwt");
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
  };
  let url = null;
  if(commentId)
     url = `${baseURI}/api/v1/resource/comment/${commentId}/replies/${pageNo}`;
  else
      url = `${baseURI}/api/v1/resource/post/${postId}/comments/${pageNo}`;

    try {
      const response = await fetch(
       url,
        requestOptions
      )
      
      const body = await response.json()

      if ("error" in body)
        throw body.error;
      
      return { ok: true, responseBody: body, error: null };
    }
    catch (error) {
      return { ok: false, responseBody: null, error: error };
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
      `${baseURI}/api/v1/resource/comment/${comment.id}/${action}`,
      requestOptions
    );
    const body = await response.json();
    if ("error" in body)
      throw body.error;
    
    return { ok: true, responseBody: body, error: null };
    
  } catch (error) {
    
    return { ok: false, responseBody: null, error: error };

  }
};
