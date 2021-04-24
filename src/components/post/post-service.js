import cookie from "react-cookies";
import moment from 'moment'
import { RestMethod } from '../../enums'
import baseURI from "../../api-config";



export const loadUserFeed = async (pageNo) => {

    const jwtToken = cookie.load("jwt");
  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    };
    
    try {

        const response = await fetch(
            `${baseURI}/api/v1/resource/posts/${pageNo}`,
            requestOptions
        );

      const body = await response.json();
      if ("error" in body) {
        throw body.error
      }
      return {ok: true, responseBody: body, error: null};
    }
    catch (error) {

      return { ok: false, responseBody: null, error: error};
    }

};

export const postsCUD = async (
  method,
  postId,
  postHeading,
  postBody
) => {
  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");
  let postForDispatch = {
    postHeading: postHeading,
    postBody: postBody,
    owner: currentUser,
  };

  let requestOptions = {
    method: method,
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  };

  let url = null;

  switch (method) {
    case RestMethod.POST:
      
        requestOptions.body = JSON.stringify({ ...postForDispatch, postedAtTime: moment.utc().toISOString() });
        url = `${baseURI}/api/v1/resource/post`;
      
      break;
    case RestMethod.PUT:
      
        requestOptions.body = JSON.stringify({ ...postForDispatch, id: postId, modifiedAtTime: moment.utc().toISOString() });
        url = `${baseURI}/api/v1/resource/post`;
      
      break;
    case RestMethod.DELETE:
      url = `${baseURI}/api/v1/resource/post/${postId}`;
    
      break;
    
    default: console.log('method not supported');
      break;
  }
  try {
    let response = await fetch(url, requestOptions);

    let body = await response.json();

    if ("error" in body) {
      throw body.error;
    }

    return {ok: true, responseBody: body, error: null};
  } catch (error) {
    return {ok: false, responseBody: null, error}
  }
};

export const likeUnlikeCUD = async (post, action) => {
      const jwtToken = cookie.load("jwt");
      const currentUser = cookie.load("current_user");
  const likePost = {
    owner: currentUser,
    likedAtTime: moment.utc().toISOString(),
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
    
    try {
        const response = await fetch(
            `${baseURI}/api/v1/resource/post/${post.id}/${action}`,
            requestOptions
        )
      const body = await response.json();
      if ("error" in body) {
        throw body.error;
      }
      else {
        return { ok: true, responseBody: body, error: null };
      }
    }

    catch (error) {
      return { ok: false, responseBody: null, error};
    }

};
