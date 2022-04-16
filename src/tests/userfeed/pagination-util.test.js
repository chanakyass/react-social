import {postService} from "../../components/post/post-service";
import PaginationHelper from "../../components/userfeed/pagination-util";

describe("test paginationHelper class", () => {
    let paginationHelper;

    beforeEach(() => {
        const posts = {};
        const noOfDeletedPostsInSession = 0;
        const setNoOfDeletedPostsInSession = jest.fn();
        const setPosts = jest.fn();
        paginationHelper = new PaginationHelper(posts, setPosts, noOfDeletedPostsInSession, setNoOfDeletedPostsInSession);
    });

    test("test setStateInfo", () => {
        jest.spyOn(paginationHelper, "setStateInfo");
        const posts = {};
        const noOfDeletedPostsInSession = 0;
        const setNoOfDeletedPostsInSession = jest.fn();
        const setPosts = jest.fn();
        paginationHelper.setStateInfo(posts, setPosts, noOfDeletedPostsInSession, setNoOfDeletedPostsInSession);
        expect(paginationHelper.posts).toBe(posts);
        expect(paginationHelper.setPosts).toBe(setPosts);
        expect(paginationHelper.noOfDeletedPostsInSession).toBe(noOfDeletedPostsInSession);
        expect(paginationHelper.setNoOfDeletedPostsInSession).toBe(setNoOfDeletedPostsInSession);
    });

    test("test getDocHeight", () => {
        const documentSpy = jest.spyOn(document, "body", "get");
        documentSpy.mockImplementation(() => ({
            scrollHeight: 12
        }));
        const documentSpy2 = jest.spyOn(document, "documentElement", "get");
        documentSpy2.mockImplementation(() => ({
            scrollHeight: 15
        }));
        expect(paginationHelper.getDocHeight()).toBe(15);
    });

    test("test getDocScrollTop", () => {
        const documentSpy = jest.spyOn(document, "body", "get");
        documentSpy.mockImplementation(() => ({
            scrollTop: 12
        }));
        const documentSpy2 = jest.spyOn(document, "documentElement", "get");
        documentSpy2.mockImplementation(() => ({
            scrollTop: 15
        }));
        expect(paginationHelper.getDocScrollTop()).toBe(12);
    });

    test("test handlePagination", async () => {
        paginationHelper.posts = {
            currentPageNo: 2,
            noOfPages: 4,
            dataList: [
                {
                    "id": 1,
                },
                {
                    "id": 2,
                }
            ],
        };
        const extraPosts = {
            currentPageNo: 3,
            noOfPages: 4,
            dataList: [
                {
                    "id": 3,
                },
                {
                    "id": 4,
                }
            ],
        };
        const response = {
            "ok": true, "responseBody": extraPosts, "error": null
        };
        const promiseToWait = Promise.resolve(response);
        jest.spyOn(paginationHelper, "handlePagination");
        jest.spyOn(postService, "loadUserFeed").mockImplementation(() => promiseToWait);
        const combinedPosts = {
            ...paginationHelper.posts,
            dataList: [...paginationHelper.posts.dataList, ...extraPosts.dataList],
            currentPageNo: extraPosts.currentPageNo,
            isLastPage: extraPosts.currentPageNo === extraPosts.noOfPages - 1,
        };
        paginationHelper.handlePagination();
        expect(postService.loadUserFeed).toHaveBeenCalled();

        const spySetPosts = paginationHelper.setPosts;

        await promiseToWait;

        const args = spySetPosts.mock.calls[0][0];

        expect(args.currentPageNo).toBe(3);
        expect(args.dataList.length).toBe(4);
    });
});