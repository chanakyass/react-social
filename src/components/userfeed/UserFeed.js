import React, { useEffect, useState, useRef, useCallback } from 'react'

import { loadUserFeed } from '../post/post-service'
import  Post  from '../post/Post'
import  CreatePost  from '../post/CreatePost';
import { RestMethod } from '../../enums'
import { LoadingPage } from '../utility/LoadingPage'
import { handleError } from '../error/error-handling';
import {debounced} from '../utility/debouncer'


const UserFeed = React.memo(({ setAddPostButtonClicked, addPostButtonClicked }) => {


  const scrollEventCallbackRef = useRef();

  const [posts, setPosts] = useState({
    currentPageNo: -1,
    noOfPages: -1,
    dataList: [],
  });

  const lastScrollTopRef = useRef(window.pageYOffset || getDocScrollTop());

  const handlePagination = useCallback(() => {
      if (posts.currentPageNo < posts.noOfPages - 1) {
        loadUserFeed(posts.currentPageNo + 1).then(
          ({ ok, responseBody: body, error }) => {
            if (!ok) {
              handleError({ error });
            } else {
              const { dataList, currentPageNo, noOfPages } = body;
              setPosts({
                ...posts,
                dataList: [...posts.dataList, ...dataList],
                currentPageNo: currentPageNo,
                noOfPages: noOfPages,
                isLastPage: currentPageNo === (noOfPages - 1)
              });
            }
          }
        );
    }

  }, [posts]);


  const handleScroll = useCallback(
    (e) => {
      var st = window.pageYOffset || getDocScrollTop();
      if (st > lastScrollTopRef.current) {
        const scrollPos = window.scrollY + window.innerHeight;
        const docHeight = getDocHeight();
        if (scrollPos > 0.80 * docHeight) handlePagination();
      }

      lastScrollTopRef.current = st <= 0 ? 0 : st;
    },
    [handlePagination]
  );


  useEffect(() => {

    window.onbeforeunload = function () {
      document.body.style.display = 'none';
    };

    window.removeEventListener("scroll", scrollEventCallbackRef.current, true);

      window.addEventListener("scroll", scrollEventCallbackRef.current = (e) => {
        debounced(150, handleScroll, e);
      }, true);


    if (posts.currentPageNo === -1) {      
      loadUserFeed(0).then(({ ok, responseBody: body, error }) => {
        if (!ok) {
          handleError({ error });
        } else {
          setPosts({ ...posts, ...body, isLastPage: body.currentPageNo === (body.noOfPages - 1) });
        }
      });
    }

    return () => {
      window.removeEventListener("scroll", scrollEventCallbackRef.current, true);
      window.onbeforeunload = null;
    };
  }, [ posts, handleScroll]);

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

  function getDocScrollTop() {
    let D = document;
    return Math.min(
      D.body.scrollTop,
      D.documentElement.scrollTop,
      D.body.offsetTop,
      D.documentElement.offsetTop,
      D.body.clientTop,
      D.documentElement.clientTop
    );
  }


  return (
    <div>
      {addPostButtonClicked === true && <CreatePost setShow={ setAddPostButtonClicked} show={addPostButtonClicked} method={RestMethod.POST} setPosts={setPosts} post={null}  />}
      <div className="col-md-5 col-sm-5 col-lg-5 my-3 mx-auto">
        {posts.dataList && posts.dataList.length > 0 ? (
          posts.dataList.map((post, index) => {
            return (
              <Post key={`post${post.id}`} post={post} setPosts={setPosts} />
            );
          })
        ) : (
            posts.currentPageNo === -1 && <><LoadingPage noOfDivs={5}/></>
        )}
      </div>

      {posts.isLastPage === true &&
        <div style={{ textAlign: 'center' }}>
        No more posts to show
        </div>
      }

    </div>
  );
});

export default UserFeed