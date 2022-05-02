import { postService } from '../post/post-service';
import { handleError } from '../error/error-handling';
import { numOrDefault } from '../utility/math-helper';


class PaginationHelper {
    constructor() {
        this.postService = postService;
        this.handleError = handleError;
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

    handlePagination(stateInfo) {
        const {posts, setPosts, noOfDeletedPostsInSession} = stateInfo;
        if (posts.currentPageNo < posts.noOfPages - 1) {
            this.postService.loadUserFeed({
                pageNo: posts.currentPageNo + 1,
                noOfDeletions: noOfDeletedPostsInSession,
            }).then(({ ok, responseBody: body, error }) => {
                if (!ok) {
                    this.handleError({ error });
                } else {
                    const { dataList, currentPageNo, noOfPages } = body;
                    setPosts({
                        ...posts,
                        dataList: [...posts.dataList, ...dataList],
                        currentPageNo: currentPageNo,
                        noOfPages: noOfPages,
                        isLastPage: currentPageNo === noOfPages - 1,
                    });
                }
            });
        }
    }

    handleScroll(e, stateInfo, funcs, refs) {
        const {lastScrollTopRef, prevDocHeightRef} = refs;
        var st = window.pageYOffset || this.getDocScrollTop();
        if (st > lastScrollTopRef.current) {
        const scrollPos = window.scrollY + window.innerHeight;
        const docHeight = this.getDocHeight();
        if (scrollPos > 0.65 * docHeight
            && docHeight !== prevDocHeightRef.current
        ) {
            this.handlePagination(stateInfo);
            prevDocHeightRef.current = docHeight;
        }
        }

        lastScrollTopRef.current = st <= 0 ? 0 : st;
    }
}

export default PaginationHelper;