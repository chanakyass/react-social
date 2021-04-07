import cookie from "react-cookies";
import history from "../../app-history";
import {RestMethod} from '../../enums'



export const loadUserFeed = async (pageNo) => {

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
            `http://localhost:8080/api/v1/resource/posts/${pageNo}`,
            requestOptions
        );

        const body = await response.json();
        return body;
    }
    catch (err) {
        console.log(err)
        history.push('/error')
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
      {
        requestOptions.body = JSON.stringify({ ...postForDispatch, postedAtTime: new Date().toISOString  });
        url = `http://localhost:8080/api/v1/resource/post`;
      }
      break;
    case RestMethod.PUT:
      {
        requestOptions.body = JSON.stringify( { ...postForDispatch, id: postId, modifiedAtTime: new Date().toISOString } );
        url = `http://localhost:8080/api/v1/resource/post`;
      }
      break;
    case RestMethod.DELETE: {
      url = `http://localhost:8080/api/v1/resource/post/${postId}`;
    }
  }
  try {
    let response = await fetch(url, requestOptions);

    let body = await response.json();

    return body;
  } catch (err) {
    console.log(err);
    history.push("/error");
  }
};

export const likeUnlikeCUD = async (post, action) => {
      const jwtToken = cookie.load("jwt");
      const currentUser = cookie.load("current_user");
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
    
    try {
        const response = await fetch(
            `http://localhost:8080/api/v1/resource/post/${post.id}/${action}`,
            requestOptions
        )
        const body = await response.json();
        return body
    }

    catch (err) {
        console.log(err)
        history.push('/error')
    }

};
