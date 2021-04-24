import React, { useEffect, useState, useRef, useCallback } from 'react'

import { loadUserFeed } from '../post/post-service'
import  Post  from '../post/Post'
import  CreatePost  from '../post/CreatePost';
import { RestMethod } from '../../enums'
import { LoadingPage } from '../utility/LoadingPage'
import { handleError } from '../error/error-handling';
import {debounced} from '../utility/debouncer'


const UserFeed = React.memo(({ setAddPostButtonClicked, addPostButtonClicked }) => {


  const pagePostsRef = useRef();
  const paginationRef = useRef();

  const [pagePosts, setPosts] = useState({
    currentPageNo: -1,
    noOfPages: -1,
    dataList: [],
  });


  pagePostsRef.current = pagePosts;


  const handlePagination = useCallback( () => {

    if (paginationRef.current) {
      if (
        pagePostsRef.current.currentPageNo <
        pagePostsRef.current.noOfPages - 1
      ) {
        loadUserFeed(pagePostsRef.current.currentPageNo + 1)
          .then(({ ok, responseBody: body, error }) => {
            if (!ok) {
              handleError({ error });
            } else {
              const { dataList, currentPageNo, noOfPages } = body;
              setPosts({
                ...pagePostsRef.current,
                dataList: [...pagePostsRef.current.dataList, ...dataList],
                currentPageNo: currentPageNo,
                noOfPages: noOfPages,
              });
            }
          })

      } else {
        paginationRef.current.style.display = "block";
      }
    }

  }, []);

  useEffect(() => {

    window.onbeforeunload = function () {
      document.body.style.display = 'none';
    };

    const handleScroll = (e) => {
      const scrollPos = window.scrollY + window.innerHeight;
      const docHeight = getDocHeight();
      if(scrollPos > 0.85*docHeight)
        setTimeout(handlePagination, 1000);
      
    };

    if (pagePostsRef.current.currentPageNo === -1) {
      loadUserFeed(0).then(({ ok, responseBody: body, error }) => {
        if (!ok) {
          handleError({ error });
        } else {
          setPosts(body);
          window.addEventListener("scroll", (e) =>
            debounced(150, handleScroll, e)
          );
        }
      });
    }

    return () => {
      window.removeEventListener("scroll", (e) =>
        debounced(150, handleScroll, e)
      );
      window.onbeforeunload = null;
    };
  }, [handlePagination]);

  function getDocHeight() {
    let D = document;
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
      <div>
        <div ref={paginationRef} style={{display: 'none', textAlign: 'center'}}>
          No more posts to show
        </div>
      </div>
    </div>
  );
});

export default UserFeed