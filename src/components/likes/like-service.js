import cookie from "react-cookies";
import baseURI from "../../api-config";


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
      `${baseURI}/resource/post/${postId}/likes`,
      requestOptions
    );

    const body = await response.json();
    if ("error" in body)
      throw body.error;
    return {ok: true, responseBody: body, error: null};
  } catch (error) {
      return {ok: false, responseBody: null, error: error}
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
      `${baseURI}/resource/comment/${commentId}/likes`,
      requestOptions
    );

    const body = await response.json();
    if ("error" in body)
      return body.error;
    return {ok: true, responseBody: body, error: null};
  } catch (error) {
      return {ok: false, responseBody: null, error: error}
  }
};