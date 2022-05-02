import {commentService} from "../../components/comments/comment-services";
import cookie from 'react-cookies';
import moment from 'moment';
import baseURI from '../../api-config';
import { RestMethod } from "../../enums";

describe("test commentsCUD", () => {
    let spyCookie, method, commentId, postId, itemId, commentContent;
    beforeEach(() => {
        spyCookie = jest.spyOn(cookie, "load");
        commentId = 1, postId = 2, itemId = 3, commentContent = "content";
        spyCookie = jest.spyOn(cookie, "load");
        spyCookie.mockReturnValue("abc");
    });

    test("test POST", async () => {
        method = RestMethod.POST;
        const promisetowait1 = Promise.resolve({post: "good post"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await commentService.commentsCUD(method, commentId, postId, null, commentContent);
        expect(responseFromService.ok).toBeTruthy();
    });

    test("test PUT", async () => {
        method = RestMethod.PUT;
        const promisetowait1 = Promise.resolve({post: "good post"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await commentService.commentsCUD(method, commentId, postId, null, commentContent);
        expect(responseFromService.ok).toBeTruthy();
    });

    test("test POST error", async () => {
        method = RestMethod.POST;
        const promisetowait1 = Promise.resolve({error: "error"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await commentService.commentsCUD(method, commentId, postId, null, commentContent);
        expect(responseFromService.ok).toBeFalsy();
        expect(responseFromService.error).toBe("error");
    });

    test("test PUT error", async () => {
        method = RestMethod.PUT;
        const promisetowait1 = Promise.resolve({error: "error"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await commentService.commentsCUD(method, commentId, postId, null, commentContent);
        expect(responseFromService.ok).toBeFalsy();
        expect(responseFromService.error).toBe("error");
    });
});

describe("test loadComments", () => {
    let spyCookie, commentId, postId, pageDetails;
    beforeEach(() => {
        spyCookie = jest.spyOn(cookie, "load");
        commentId = 1, postId = 2, pageDetails = {pageNo: 1, noOfDeletions: 0};
        spyCookie = jest.spyOn(cookie, "load");
        spyCookie.mockReturnValue("abc");
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    test("test success", async () => {
        const promisetowait1 = Promise.resolve({post: "good post"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await commentService.loadComments(postId, commentId, pageDetails);
        expect(responseFromService.ok).toBeTruthy();
    });

    test("test error", async () => {
        const promisetowait1 = Promise.resolve({error: "error"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await commentService.loadComments(postId, commentId, pageDetails);
        expect(responseFromService.ok).toBeFalsy();
        expect(responseFromService.error).toBe("error");
    });
});

describe("test likeUnlikeCommentCUD", () => {
    let spyCookie, comment, action;
    beforeEach(() => {
        spyCookie = jest.spyOn(cookie, "load");
        comment = {id: 1};
        spyCookie = jest.spyOn(cookie, "load");
        spyCookie.mockReturnValue("abc");
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    test("test success", async () => {
        const promisetowait1 = Promise.resolve({post: "good post"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await commentService.likeUnlikeCommentCUD(comment, "like");
        expect(responseFromService.ok).toBeTruthy();
    });

    test("test error", async () => {
        const promisetowait1 = Promise.resolve({error: "error"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await commentService.likeUnlikeCommentCUD(comment, "unlike");
        expect(responseFromService.ok).toBeFalsy();
        expect(responseFromService.error).toBe("error");
    });
});