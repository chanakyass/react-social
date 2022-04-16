import { postService } from '../post/post-service';
import { handleError } from '../error/error-handling';
import { numOrDefault } from '../utility/math-helper';


class PaginationHelper {
    constructor(posts, setPosts, noOfDeletedPostsInSession, setNoOfDeletedPostsInSession) {
        this.posts = posts;
        this.setPosts = setPosts;
        this.noOfDeletedPostsInSession = noOfDeletedPostsInSession;
        this.setNoOfDeletedPostsInSession = setNoOfDeletedPostsInSession;
        this.postService = postService;
        this.handleError = handleError;
    }

    setStateInfo(posts, setPosts, noOfDeletedPostsInSession, setNoOfDeletedPostsInSession) {
        this.posts = posts;
        this.setPosts = setPosts;
        this.noOfDeletedPostsInSession = noOfDeletedPostsInSession;
        this.setNoOfDeletedPostsInSession = setNoOfDeletedPostsInSession;
    }

    getDocHeight() {
        let D = document;
        return Math.max(
          numOrDefault(D.body.scrollHeight, false),
          numOrDefault(D.documentElement.scrollHeight, false),
          numOrDefault(D.body.offsetHeight, false),
          numOrDefault(D.documentElement.offsetHeight, false),
          numOrDefault(D.body.clientHeight, false),
          numOrDefault(D.documentElement.clientHeight, false)
        );
    }
    
    getDocScrollTop() {
        let D = document;
        return Math.min(
          numOrDefault(D.body.scrollTop, true),
          numOrDefault(D.documentElement.scrollTop, true),
          numOrDefault(D.body.offsetTop, true),
          numOrDefault(D.documentElement.offsetTop, true),
          numOrDefault(D.body.clientTop, true),
          numOrDefault(D.documentElement.clientTop, true)
        );
    }

    handlePagination() {
        if (this.posts.currentPageNo < this.posts.noOfPages - 1) {
            this.postService.loadUserFeed({
                pageNo: this.posts.currentPageNo + 1,
                noOfDeletions: this.noOfDeletedPostsInSession,
            }).then(({ ok, responseBody: body, error }) => {
                if (!ok) {
                this.handleError({ error });
                } else {
                const { dataList, currentPageNo, noOfPages } = body;
                this.setPosts({
                    ...this.posts,
                    dataList: [...this.posts.dataList, ...dataList],
                    currentPageNo: currentPageNo,
                    noOfPages: noOfPages,
                    isLastPage: currentPageNo === noOfPages - 1,
                });
                }
            });
        }
    }

    handleScroll(e, lastScrollTopRef, prevDocHeightRef) {
        var st = window.pageYOffset || getDocScrollTop();
        if (st > lastScrollTopRef.current) {
        const scrollPos = window.scrollY + window.innerHeight;
        const docHeight = getDocHeight();
        if (scrollPos > 0.65 * docHeight
            && docHeight !== prevDocHeightRef.current
        ) {
            handlePagination();
            prevDocHeightRef.current = docHeight;
        }
        }

        lastScrollTopRef.current = st <= 0 ? 0 : st;
    }
}

export default PaginationHelper;