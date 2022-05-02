import {likeService} from "../../components/likes/like-service";
import cookie from 'react-cookies';
import moment from 'moment';
import baseURI from '../../api-config';
import { RestMethod } from "../../enums";

describe("test loadLikesOnPost", () => {
    let spyCookie, postId, pageNo;
    beforeEach(() => {
        spyCookie = jest.spyOn(cookie, "load");
        postId = 2, pageNo = 0;
        spyCookie = jest.spyOn(cookie, "load");
        spyCookie.mockReturnValue("abc");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("test success", async () => {
        const promisetowait1 = Promise.resolve({likePost: "good post"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await likeService.loadLikesOnPost(postId, pageNo);
        expect(responseFromService.ok).toBeTruthy();
        expect(responseFromService.responseBody.likePost).toEqual("good post");
    });

    test("test error", async () => {
        const promisetowait1 = Promise.resolve({error: "error"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await likeService.loadLikesOnPost(postId, pageNo);
        expect(responseFromService.ok).toBeFalsy();
        expect(responseFromService.error).toBe("error");
    });
});

describe("test loadLikesOnComment", () => {
    let spyCookie, commentId, pageNo;
    beforeEach(() => {
        spyCookie = jest.spyOn(cookie, "load");
        commentId = 2, pageNo = 0;
        spyCookie = jest.spyOn(cookie, "load");
        spyCookie.mockReturnValue("abc");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("test success", async () => {
        const promisetowait1 = Promise.resolve({likeComment: "good comment"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await likeService.loadLikesOnComment(commentId, pageNo);
        expect(responseFromService.ok).toBeTruthy();
        expect(responseFromService.responseBody.likeComment).toEqual("good comment");
    });

    test("test error", async () => {
        const promisetowait1 = Promise.resolve({error: "error"});
        const response = {json: jest.fn(() => promisetowait1)};
        const promisetowait2 = Promise.resolve(response);
        global.fetch = jest.fn(() => promisetowait2);
        const responseFromService = await likeService.loadLikesOnComment(commentId, pageNo);
        expect(responseFromService.ok).toBeFalsy();
        expect(responseFromService.error).toBe("error");
    });
});