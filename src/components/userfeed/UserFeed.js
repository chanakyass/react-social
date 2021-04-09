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
    currentPageNo: -1,
    noOfPages: -1,
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
        const body = await loadUserFeed(0);
        if ("error" in body) {
          console.log(body.error);
          history.push("/error");
        } else setPosts(body);

      } catch (err) {
        console.log(err);
        history.push("/error");
      }
    })();
    return () => (window.onbeforeunload = null);
  }, []);

  const handleScroll = async (e) => {
     const bottom = (e.target.scrollHeight - e.target.scrollTop) === e.target.clientHeight;
    if (bottom) {
      try {
        if (pagePosts.currentPageNo < pagePosts.noOfPages) {
          const body = await loadUserFeed(pagePosts.currentPageNo + 1);
          if ("error" in body) {
            console.log(body.error);
            history.push("/error");
          } else {
            const { dataList, currentPageNo, noOfPages } = body;
            setPosts({ ...pagePosts, dataList: [...pagePosts.dataList, ...dataList], currentPageNo: currentPageNo, noOfPages: noOfPages });
           
          }
        }
       } catch (err) {
         console.log(err);
         history.push("/error");
       }
    }
  }

  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");

  return (
    <div onScroll = {handleScroll} className='social-container'>
      {showAlert === true && <ErrorAlert alertMessage={alertMessage} />}
      {addPostButtonClicked === true && <CreatePost setShow={ setAddPostButtonClicked} show={addPostButtonClicked} method={RestMethod.POST} setPosts={setPosts} post={null}  />}
      <div className="col-md-8 my-3 mx-auto">
        {pagePosts.dataList && pagePosts.dataList.length > 0 ? (
          pagePosts.dataList.map((post, index) => {
            console.log(post);
            return (
              <Post key={`post${post.id}`} post={post} setPosts={setPosts} />
            );
          })
        ) : (
          pagePosts.currentPageNo === -1 && <>loading</> 
        )}
      </div>
    </div>
  );
});

export default UserFeed