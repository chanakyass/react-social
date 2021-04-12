import React, { useEffect, useState, useRef } from 'react'

import cookie from 'react-cookies'
import history from '../../app-history'
import { loadUserFeed } from '../post/post-service'
import { Post } from '../post/Post'
import { CreatePost } from '../CreatePost';
import { RestMethod } from '../../enums'
import { ErrorAlert } from '../ErrorAlert'


const UserFeed = React.memo(({ setAddPostButtonClicked, addPostButtonClicked }) => {


  let location = history.location;
  let showAlert = false;
  let alertMessage = null;
  if (location && location.state) {
    showAlert = location.state.showAlert;
    alertMessage = location.state.alertMessage;
  }

  const pagePostsRef = useRef();
  

  const [pagePosts, setPosts] = useState({
    currentPageNo: -1,
    noOfPages: -1,
    dataList: [],
  });

  pagePostsRef.current = pagePosts;

  const changeHistory = () => {
    history.replace({ state: null });
  };

  useEffect(() => {
    
    window.onbeforeunload = function () {
      if (showAlert === true) changeHistory();
      //window.scrollTo(0, 0);
      document.body.style.display = 'none';
    };
  
    if (pagePostsRef.current.currentPageNo === -1) {

      (async () => {
        try {
          const body = await loadUserFeed(0);
          if ("error" in body) {
            console.log(body.error);
            history.push("/error");
          } else {
            setPosts(body);
            window.addEventListener("scroll", (e) => handleScroll(e));
          };

        } catch (err) {
          console.log(err);
          history.push("/error"); 
        }
      })();
    }
    

      return () => {
        if (showAlert === true) {
          window.onbeforeunload = null;
          
        }
        window.removeEventListener("scroll", e => handleScroll(e));
      };
    
  }, []);

  function getDocHeight() {
    var D = document;
    return Math.max(
      D.body.scrollHeight,
      D.documentElement.scrollHeight,
      D.body.offsetHeight,
      D.documentElement.offsetHeight,
      D.body.clientHeight,
      D.documentElement.clientHeight
    );
  }

  const handleScroll = async (e) => {
    
    if ((window.scrollY + window.innerHeight) === getDocHeight()) {
      try {
        if (pagePostsRef.current.currentPageNo < pagePostsRef.current.noOfPages ) {
          const body = await loadUserFeed(pagePostsRef.current.currentPageNo + 1);
          if ("error" in body) {
            console.log(body.error);
            history.push("/error");
          } else {
            const { dataList, currentPageNo, noOfPages } = body;
            setPosts({ ...pagePostsRef.current, dataList: [...pagePostsRef.current.dataList, ...dataList], currentPageNo: currentPageNo, noOfPages: noOfPages});
           
          }
        }
      } catch (err) {
        console.log(err);
        history.push("/error");
      }
    }
  };


  return (
    <div>

      {showAlert === true && <ErrorAlert alertMessage={alertMessage} />}
      {addPostButtonClicked === true && <CreatePost setShow={ setAddPostButtonClicked} show={addPostButtonClicked} method={RestMethod.POST} setPosts={setPosts} post={null}  />}
      <div className="col-md-8 my-3 mx-auto">
        {pagePosts.dataList && pagePosts.dataList.length > 0 ? (
          pagePosts.dataList.map((post, index) => {
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