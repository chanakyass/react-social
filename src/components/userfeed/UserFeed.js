import React from 'react'
import  Post  from '../post/Post'
import  CreatePost  from '../post/CreatePost';
import { RestMethod } from '../../enums'
import { LoadingPage } from '../utility/LoadingPage'
import useUserFeed from './useUserFeed';


const UserFeed = React.memo(({ setAddPostButtonClicked, addPostButtonClicked }) => {

  // const scrollEventCallbackRef = useRef();
  // const prevDocHeightRef = useRef();
  // const lastScrollTopRef = useRef(window.pageYOffset || getDocScrollTop());

  // const [posts, setPosts] = useState({
  //   currentPageNo: -1,
  //   noOfPages: 0,
  //   dataList: [],
  //   isLastPage: false
  // });
  // const [noOfDeletedPostsInSession, setNoOfDeletedPostsInSession] = useState(0);
  // const [userFeedLoaded, setUserFeedLoaded] = useState(false);

  // const handlePagination = useCallback(() => {
  //     if (posts.currentPageNo < posts.noOfPages - 1) {
  //       loadUserFeed({
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

  // useEffect(() => {
  //   window.onbeforeunload = function () {
  //     document.body.style.display = 'none';
  //   };

  //   window.removeEventListener("scroll", scrollEventCallbackRef.current, true);
  //   window.addEventListener("scroll", scrollEventCallbackRef.current = (e) => {
  //     debounced(100, handleScroll, e);
  //   }, true);

  //   if (posts.currentPageNo === -1) {      
  //     loadUserFeed({
  //         pageNo: 0,
  //         noOfDeletions: 0,
  //       }).then(({ ok, responseBody: body, error }) => {
  //       if (!ok) {
  //         handleError({ error });
  //       } else if(body.dataList.length >0) {
  //          setPosts({ ...posts, ...body, isLastPage: body.currentPageNo === (body.noOfPages - 1) });
  //       }
  //     });
  //   }
  //   setUserFeedLoaded(true);

  //   return () => {
  //     window.removeEventListener("scroll", scrollEventCallbackRef.current, true);
  //     window.onbeforeunload = null;
  //   };
  // }, [posts, handleScroll]);

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

  const [posts, setPosts, setNoOfDeletedPostsInSession, userFeedLoaded] = useUserFeed();


  return (
    <div>
      {addPostButtonClicked === true && <CreatePost setShow={ setAddPostButtonClicked} show={addPostButtonClicked} method={RestMethod.POST} setPosts={setPosts} post={null}  />}
      <div className="col-md-5 col-sm-5 col-lg-5 my-3 mx-auto">
        {posts.dataList && posts.dataList.length > 0 ? (
          posts.dataList.map((post, index) => {
            return (
              <Post
                key={`post${post.id}`}
                post={post}
                setPosts={setPosts}
                setNoOfDeletedPostsInSession={setNoOfDeletedPostsInSession}
              />
            );
          })
        ) : (
            !userFeedLoaded && <><LoadingPage noOfDivs={5}/></>
        )}
      </div>
      <div className='col-md-5 col-sm-5 col-lg-5 mx-auto'>
        {(posts.noOfPages>=1) ? (posts.isLastPage && <div style={{ textAlign: 'center' }}> No more posts to show </div>): <div style={{ textAlign: 'center' }}> No posts available </div>}
      </div>

    </div>
  );
});

export default UserFeed