import {postService} from "../../components/post/post-service";
import PaginationHelper from "../../components/userfeed/pagination-util";

describe("test paginationHelper class", () => {
    let paginationHelper;

    beforeEach(() => {
        paginationHelper = new PaginationHelper();
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
        const noOfDeletedPostsInSession = 0;
        const setPosts = jest.fn();
        const posts = {
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
        paginationHelper.handlePagination({posts, setPosts, noOfDeletedPostsInSession});
        expect(postService.loadUserFeed).toHaveBeenCalled();

        await promiseToWait;

        const args = setPosts.mock.calls[0][0];

        expect(args.currentPageNo).toBe(3);
        expect(args.dataList.length).toBe(4);
    });
});