import React, { useEffect, useState, useRef, useCallback } from 'react'

import { loadUserFeed } from '../post/post-service'
import { Post } from '../post/Post'
import { CreatePost } from '../CreatePost';
import { RestMethod } from '../../enums'
import { LoadingPage } from '../utility/LoadingPage'
import { handleError } from '../error/error-handling';
import {throttleTheFunction} from '../utility/throttle'


const UserFeed = React.memo(({ setAddPostButtonClicked, addPostButtonClicked }) => {

  // let location = history.location;
  // let showAlert = false;
  // let alertMessage = null;
  // if (location && location.state) {
  //   showAlert = location.state.showAlert;
  //   alertMessage = location.state.alertMessage;
  // }

  const pagePostsRef = useRef();
  const paginationRef = useRef();

  const [pagePosts, setPosts] = useState({
    currentPageNo: -1,
    noOfPages: -1,
    dataList: [],
  });

  pagePostsRef.current = pagePosts;

  // const changeHistory = () => {
  //   history.replace({ state: null });
  // };

  const handlePagination = useCallback(async () => {
    try {
      if (
        pagePostsRef.current.currentPageNo <
        pagePostsRef.current.noOfPages - 1
      ) {
        paginationRef.current.children[0].style.display = "block";
        const body = await loadUserFeed(pagePostsRef.current.currentPageNo + 1);
        if ("error" in body) {
          const { error } = body;
          throw error;
        } else {
          const { dataList, currentPageNo, noOfPages } = body;
          setPosts({
            ...pagePostsRef.current,
            dataList: [...pagePostsRef.current.dataList, ...dataList],
            currentPageNo: currentPageNo,
            noOfPages: noOfPages,
          });
          paginationRef.current.children[0].style.display = "none";
        }
      } else {
        paginationRef.current.children[1].style.display = "block";
      }
    } catch (error) {
      handleError({ error });
    }
  }, []);

  useEffect(() => {
    
    // window.onbeforeunload = function () {
    //   if (showAlert === true) changeHistory();
    //   document.body.style.display = 'none';
    // };

    const handleScroll = (e) => {
      if (window.scrollY + window.innerHeight === getDocHeight()) {
        handlePagination().then(() => console.log('Done'));
      }
    };
  
    if (pagePostsRef.current.currentPageNo === -1) {

      (async () => {
        try {
          const body = await loadUserFeed(0);
          if ("error" in body) {
            const { error } = body;
            throw error;
          } else {
            setPosts(body);
            window.addEventListener("scroll", (e) => (throttleTheFunction(1000, handleScroll, e))());
          };

        } catch (error) {
          handleError({ error });
        }
      })();
    }
    

      return () => {
        // if (showAlert === true) {
        //   window.onbeforeunload = null;
          
        // }
        window.removeEventListener("scroll", (e) => (throttleTheFunction(300, handleScroll, e))());
      };
    
  }, [handlePagination]);

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


  return (
    <div>

      {/* {showAlert === true && <ErrorAlert alertMessage={alertMessage} />} */}
      {addPostButtonClicked === true && <CreatePost setShow={ setAddPostButtonClicked} show={addPostButtonClicked} method={RestMethod.POST} setPosts={setPosts} post={null}  />}
      <div className="col-md-5 col-sm-5 col-lg-5 my-3 mx-auto">
        {pagePosts.dataList && pagePosts.dataList.length > 0 ? (
          pagePosts.dataList.map((post, index) => {
            return (
              <Post key={`post${post.id}`} post={post} setPosts={setPosts} />
            );
          })
        ) : (
            pagePosts.currentPageNo === -1 && <><LoadingPage noOfDivs={5}/></>
        )}
      </div>
      <div ref={paginationRef} >
        <div className="spinner" style={{ display: 'none',backgroundColor: 'rgb(241, 241, 241)'}} >
          <div className="bounce1"></div>
          <div className="bounce2"></div>
          <div className="bounce3"></div>
        </div>
        <div style={{display: 'none', textAlign: 'center'}}>
          No more posts to show
        </div>
      </div>
    </div>
  );
});

export default UserFeed