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
    const paginationHelperRef = useRef();
    paginationHelperRef.current = new PaginationHelper();

    const scrollEventCallbackRef = useRef();
    const prevDocHeightRef = useRef();
    const lastScrollTopRef = useRef(window.pageYOffset || paginationHelperRef.current.getDocScrollTop());

    const handleScroll = useCallback((e) => {
      paginationHelperRef.current.handleScroll(e, {posts, setPosts, noOfDeletedPostsInSession}, null, {lastScrollTopRef, prevDocHeightRef});
    }, [posts, setPosts, noOfDeletedPostsInSession]);
  
    useEffect(() => {
      window.onbeforeunload = function () {
        document.body.style.display = 'none';
      };
  
      window.removeEventListener("scroll", scrollEventCallbackRef.current, true);
      window.addEventListener("scroll", scrollEventCallbackRef.current = (e) => {
        debounced(100, handleScroll, paginationHelperRef.current, e);
      }, true);
  
      if (posts.currentPageNo === -1) {      
        postService.loadUserFeed({
            pageNo: 0,
            noOfDeletions: 0,
          }).then(response => {
            const ok = response.ok;
            const body = response.responseBody;
            const error = response.error;
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
    }, [posts, noOfDeletedPostsInSession, handleScroll]);

    return [posts, setPosts, setNoOfDeletedPostsInSession, userFeedLoaded];
}

export default useUserFeed;