import * as handleErrorRef from "../../components/error/error-handling";
import { postService } from "../../components/post/post-service";
import PostHelper from "../../components/post/post-util";
import { RestMethod } from "../../enums";

describe("test PostHelper", () => {
    let postHelper;
    test("test adjustNoOfCommentsInParentPost", () => {
        const stateInfo = {setPosts: jest.fn()};
        postHelper = new PostHelper(); 
        postHelper.adjustNoOfCommentsInParentPost("POST", 1, 1, stateInfo, null, null);
        expect(stateInfo.setPosts).toHaveBeenCalled();
    });

    test("test handlePostDelete success", async () => {
        const stateInfo = {setPosts: jest.fn(), setNoOfDeletedPostsInSession: jest.fn()};
        const e = {preventDefault: jest.fn()};
        const spyPostsCUD = jest.spyOn(postService, "postsCUD");
        const promise = Promise.resolve({info: "info", ok: true});
        spyPostsCUD.mockImplementation(() => promise);
        postHelper = new PostHelper();
        postHelper.handlePostDelete(e, 1, stateInfo, null, null);
        await promise;
        expect(stateInfo.setNoOfDeletedPostsInSession).toHaveBeenCalledTimes(1);
        expect(stateInfo.setPosts).toHaveBeenCalledTimes(1);
    });

    test("test handlePostDelete failure", async () => {
        const stateInfo = {setPosts: jest.fn(), setNoOfDeletedPostsInSession: jest.fn()};
        const e = {preventDefault: jest.fn()};
        const spyHandleError = jest.spyOn(handleErrorRef, "handleError");
        const spyPostsCUD = jest.spyOn(postService, "postsCUD");
        const promise = Promise.resolve({error: "error", ok: false});
        spyPostsCUD.mockImplementation(() => promise);
        postHelper = new PostHelper();
        postHelper.handlePostDelete(e, 1, stateInfo, null, null);
        await promise;
        expect(spyHandleError).toHaveBeenCalledTimes(1);
    });

    test("test handleLikeUnlikePost success", async () => {
        const stateInfo = {setPosts: jest.fn()};
        const funcs = {showAlertWithMessage: jest.fn()};
        const e = {preventDefault: jest.fn()};
        const spyLikeUnlikeCUD = jest.spyOn(postService, "likeUnlikeCUD");
        const promise = Promise.resolve({ok: true, responseBody: "dummy", error: null});
        spyLikeUnlikeCUD.mockImplementation(() => promise);
        postHelper = new PostHelper();
        postHelper.handleLikeUnlikePost(e, {id: 1}, "like", stateInfo, funcs, null);
        await promise;
        expect(stateInfo.setPosts).toHaveBeenCalledTimes(1);
    });

    test("test handleLikeUnlikePost failure", async () => {
        const stateInfo = {setPosts: jest.fn()};
        const funcs = {showAlertWithMessage: jest.fn()};
        const e = {preventDefault: jest.fn()};
        const spyLikeUnlikeCUD = jest.spyOn(postService, "likeUnlikeCUD");
        const promise = Promise.resolve({ok: false, responseBody: "dummy", error: {statusCode: 500, message: "dummy message", exceptionType: "API_SPECIFIC_EXCEPTION"}});
        spyLikeUnlikeCUD.mockImplementation(() => promise);
        postHelper = new PostHelper();
        postHelper.handleLikeUnlikePost(e, {id: 1}, "like", stateInfo, funcs, null);
        await promise;
        expect(funcs.showAlertWithMessage).toHaveBeenCalledTimes(1);
    });

    test("test handleMovingPartsForKeys success", () => {
        const refs = {replyBarRef: {current: {style: {display: ""}}},
                        reactionBarRef: {current: {style: {display: ""}}}};
        const e = {key: "Escape"};
        postHelper = new PostHelper();
        postHelper.handleMovingPartsForKeys(e, null, null, refs);
        expect(refs.replyBarRef.current.style.display).toEqual("none");
        expect(refs.reactionBarRef.current.style.display).toEqual("inline-block");
    });
    describe("test handlePostCU", () => {
        let method, spyHandleError;

        beforeAll(() => {
            spyHandleError = jest.spyOn(handleErrorRef, "handleError");
        })

        test("test handlePostCU POST", async () => {
            const stateInfo = {editorPost: {id: 1, postHeading: "heading", postBody: "body"}, setEditorPost: jest.fn(), setPosts:jest.fn()}
            const funcs = {handleClose: jest.fn()};
            const e = {key: "Escape"};
            method = RestMethod.POST;
            const spyPostsCUD = jest.spyOn(postService, "postsCUD");
            const promise = Promise.resolve({ok: true, responseBody: {info: "dummy"}, error: null});
            spyPostsCUD.mockImplementation(() => promise);
            postHelper = new PostHelper();
            postHelper.handlePostCU(e, method, {id: 1}, stateInfo, funcs, null);
            await promise;
            expect(stateInfo.setPosts).toHaveBeenCalledTimes(1);
            expect(stateInfo.setEditorPost).toHaveBeenCalledTimes(1);
            expect(funcs.handleClose).toHaveBeenCalledTimes(1);
        });

        test("test handlePostCU PUT", async () => {
            const stateInfo = {editorPost: {id: 1, postHeading: "heading", postBody: "body"}, setEditorPost: jest.fn(), setPosts:jest.fn()}
            const funcs = {handleClose: jest.fn()};
            const e = {key: "Escape"};
            method = RestMethod.PUT;
            const spyPostsCUD = jest.spyOn(postService, "postsCUD");
            const promise = Promise.resolve({ok: true, responseBody: {info: "dummy"}, error: null});
            spyPostsCUD.mockImplementation(() => promise);
            postHelper = new PostHelper();
            postHelper.handlePostCU(e, method, {id: 1}, stateInfo, funcs, null);
            await promise;
            expect(stateInfo.setPosts).toHaveBeenCalledTimes(1);
            expect(stateInfo.setEditorPost).toHaveBeenCalledTimes(1);
            expect(funcs.handleClose).toHaveBeenCalledTimes(1);
        });

        test("test handlePostCU PUT error", async () => {
            const stateInfo = {editorPost: {id: 1, postHeading: "heading", postBody: "body"}, setEditorPost: jest.fn(), setPosts:jest.fn()}
            const funcs = {handleClose: jest.fn()};
            const e = {key: "Escape"};
            method = RestMethod.PUT;
            const spyPostsCUD = jest.spyOn(postService, "postsCUD");
            const promise = Promise.resolve({ok: false, responseBody: null, error: {message: "error"}});
            spyPostsCUD.mockImplementation(() => promise);
            postHelper = new PostHelper();
            postHelper.handlePostCU(e, method, {id: 1}, stateInfo, funcs, null);
            await promise;
            expect(funcs.handleClose).toHaveBeenCalledTimes(2);
            expect(spyHandleError).toHaveBeenCalledTimes(1);
        });
    });
});