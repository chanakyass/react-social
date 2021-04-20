import cookie from "react-cookies";
import baseURI from "../../api-config";
import { handleError } from "../error/error-handling";


export const loadLikesOnPost = async (postId, pageNo) => {
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
      `${baseURI}/api/v1/resource/post/${postId}/likes`,
      requestOptions
    );

    const body = await response.json();
    return body;
  } catch (error) {
      handleError({error})
  }
};


export const loadLikesOnComment = async (commentId, pageNo) => {
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
      `${baseURI}/api/v1/resource/comment/${commentId}/likes`,
      requestOptions
    );

    const body = await response.json();
    return body;
  } catch (error) {
      handleError({error})
  }
};