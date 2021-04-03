import cookie from "react-cookies";
import history from "../../app-history";

    const jwtToken = cookie.load("jwt");
    const currentUser = cookie.load("current_user");

export const loadUserFeed = async () => {


  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    };
    
    try {

        const response = await fetch(
            `http://localhost:8080/api/v1/resource/posts/${0}`,
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

export const likeUnlikeCUD = async (post, action) => {
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
