import React, { useEffect, useState } from 'react'

import cookie from 'react-cookies'
import history from '../../app-history'
import { loadUserFeed } from '../post/post-service'
import cleanEmpty from '../utility/cleanup-objects'
import {
  Card,
  OverlayTrigger,
  Popover
} from "react-bootstrap";
import { Post } from '../post/Post'
import { CreatePost } from '../CreatePost';
import  {Link}  from 'react-router-dom'
import { RestMethod } from '../../enums'
import { ErrorAlert } from '../ErrorAlert'


const UserFeed = React.memo(({ setAddPostButtonClicked, addPostButtonClicked }) => {
  console.log("render");

  let location = history.location;
  let showAlert = false;
  let alertMessage = null;
  if (location && location.state) {
    showAlert = location.state.showAlert;
    alertMessage = location.state.alertMessage;
  }

  

  const [pagePosts, setPosts] = useState({
    currentPageNo: 0,
    noOfPages: 0,
    dataList: [],
  });

  const changeHistory = () => {
    console.log("changeHistory called");
    history.replace({ state: null });
  };

  useEffect(() => {
    window.onbeforeunload = function () {
      console.log("entering onbeforeunload");
      changeHistory();
    };
    (async () => {
      try {
        const body = await loadUserFeed();
        if ("error" in body) {
          console.log(body.error);
          history.push("/error");
        } else setPosts(body);
        // if (history.location && history.location.state && history.location.state.showAlert) {
        //   let stateCopy = history.location.state
        //   console.log(stateCopy)
        //   delete stateCopy.showAlert
        //   delete stateCopy.alertMessage;
        //   history.replace({ state: stateCopy });
        // }
      } catch (err) {
        console.log(err);
        history.push("/error");
      }
    })();
    return () => (window.onbeforeunload = null);
  }, []);

  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");

  return (
    <>
      {showAlert === true && <ErrorAlert alertMessage={alertMessage} />}
      {console.log('addPostButtonClicked ', addPostButtonClicked)}
      <CreatePost setAddPostButtonClicked={ setAddPostButtonClicked} addPostButtonClicked={addPostButtonClicked} setPosts={setPosts} />
      <div className="col-md-8 my-3 mx-auto">
        {pagePosts.dataList && pagePosts.dataList.length > 0 ? (
          pagePosts.dataList.map((post, index) => {
            return (
              <Post key={`post${post.id}`} post={post} setPosts={setPosts} />
            );
          })
        ) : (
          <>loading</>
        )}
      </div>
    </>
  );
});

export default UserFeed