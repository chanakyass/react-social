import { useEffect, useState, useRef, useCallback } from 'react'

import { postService } from '../post/post-service';
import { handleError } from '../error/error-handling';
import {debounced} from '../utility/debouncer';
import PaginationHelper from './pagination-util';


const useUserFeed = () => {
    const [posts, setPosts] = useState({
      currentPageNo: -1,
      noOfPages: 0,
      dataList: [],
      isLastPage: false
    });
    const [noOfDeletedPostsInSession, setNoOfDeletedPostsInSession] = useState(0);
    const [userFeedLoaded, setUserFeedLoaded] = useState(false);
    const paginationHelperRef = useRef(new PaginationHelper(posts, setPosts, noOfDeletedPostsInSession, setNoOfDeletedPostsInSession));

    const scrollEventCallbackRef = useRef();
    const prevDocHeightRef = useRef();
    const lastScrollTopRef = useRef(window.pageYOffset || paginationHelperRef.current.getDocScrollTop());

    useEffect(() => {
      paginationHelperRef.current.setStateInfo(posts, setPosts, noOfDeletedPostsInSession, setNoOfDeletedPostsInSession);
    }, [posts, setPosts, noOfDeletedPostsInSession, setNoOfDeletedPostsInSession])
  
    // const handlePagination = useCallback(() => {
    //     if (posts.currentPageNo < posts.noOfPages - 1) {
    //       postService.loadUserFeed({
    //         pageNo: posts.currentPageNo + 1,
    //         noOfDeletions: noOfDeletedPostsInSession,
    //       }).then(({ ok, responseBody: body, error }) => {
    //         if (!ok) {
    //           handleError({ error });
    //         } else {
    //           const { dataList, currentPageNo, noOfPages } = body;
    //           setPosts({
    //             ...posts,
    //             dataList: [...posts.dataList, ...dataList],
    //             currentPageNo: currentPageNo,
    //             noOfPages: noOfPages,
    //             isLastPage: currentPageNo === noOfPages - 1,
    //           });
    //         }
    //       });
    //   }
  
    // }, [posts, noOfDeletedPostsInSession]);
  
  
    // const handleScroll = useCallback(
    //   (e) => {
    //     var st = window.pageYOffset || getDocScrollTop();
    //     if (st > lastScrollTopRef.current) {
    //       const scrollPos = window.scrollY + window.innerHeight;
    //       const docHeight = getDocHeight();
    //       if (scrollPos > 0.65 * docHeight
    //         && docHeight !== prevDocHeightRef.current
    //       ) {
    //         handlePagination();
    //         prevDocHeightRef.current = docHeight;
    //       }
    //     }
  
    //     lastScrollTopRef.current = st <= 0 ? 0 : st;
    //   },
    //   [handlePagination]
    // );
  
    useEffect(() => {
      window.onbeforeunload = function () {
        document.body.style.display = 'none';
      };
  
      window.removeEventListener("scroll", scrollEventCallbackRef.current, true);
      window.addEventListener("scroll", scrollEventCallbackRef.current = (e) => {
        debounced(100, paginationHelperRef.current.handleScroll, e, lastScrollTopRef, prevDocHeightRef);
      }, true);
  
      if (posts.currentPageNo === -1) {      
        postService.loadUserFeed({
            pageNo: 0,
            noOfDeletions: 0,
          }).then(({ ok, responseBody: body, error }) => {
          if (!ok) {
            handleError({ error });
          } else if(body.dataList.length >0) {
             setPosts({ ...posts, ...body, isLastPage: body.currentPageNo === (body.noOfPages - 1) });
          }
        });
      }
      setUserFeedLoaded(true);
  
      return () => {
        window.removeEventListener("scroll", scrollEventCallbackRef.current, true);
        window.onbeforeunload = null;
      };
    }, [posts]);
  
    // function getDocHeight() {
    //   let D = document;
    //   return Math.max(
    //     D.body.scrollHeight,
    //     D.documentElement.scrollHeight,
    //     D.body.offsetHeight,
    //     D.documentElement.offsetHeight,
    //     D.body.clientHeight,
    //     D.documentElement.clientHeight
    //   );
    // }
  
    // function getDocScrollTop() {
    //   let D = document;
    //   return Math.min(
    //     D.body.scrollTop,
    //     D.documentElement.scrollTop,
    //     D.body.offsetTop,
    //     D.documentElement.offsetTop,
    //     D.body.clientTop,
    //     D.documentElement.clientTop
    //   );
    // }

    return [posts, setPosts, setNoOfDeletedPostsInSession, userFeedLoaded];
}

export default useUserFeed;