import cookie from "react-cookies";
import history from "../../app-history";
import { RestMethod } from "../../enums";

export const loadLikesOnPost = async (postId, pageNo) => {
  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");
  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(
      `/api/v1/resource/post/${postId}/likes`,
      requestOptions
    );

    const body = await response.json();
    return body;
  } catch (err) {
    console.log(err);
    history.push("/error");
  }
};


export const loadLikesOnComment = async (commentId, pageNo) => {
  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");
  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(
      `/api/v1/resource/comment/${commentId}/likes`,
      requestOptions
    );

    const body = await response.json();
    return body;
  } catch (err) {
    console.log(err);
    history.push("/error");
  }
};