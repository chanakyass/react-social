import {renderHook} from "@testing-library/react-hooks";
import useLikeState from "../../components/likes/useLikeState";
import * as data1 from "../resources/mocked_post_likes_response.json";
import * as data2 from "../resources/mocked_comment_likes_response.json";
import { act } from "react-dom/test-utils";
import { cleanup } from "@testing-library/react";
import { likeService } from "../../components/likes/like-service";

describe("test userFeed", () => {
    let promiseToWait;
    beforeEach(() => {

    });

    afterEach(() => cleanup());

    it("test the hook for post likes", async () => {
        const response = {
            "ok": true, "responseBody": data1, "error": null
        };
        promiseToWait = Promise.resolve(response);
        const loadUserFeedSpy = jest.spyOn(likeService, "loadLikesOnPost");
        loadUserFeedSpy.mockImplementation(() => promiseToWait);
        const {result, waitForNextUpdate} = renderHook(()=> useLikeState({itemId: 1, itemType: 'POST', setShow: jest.fn(), show: true}));
        await act(() => promiseToWait)
        expect(result.current.stateInfo[0].dataList.length).toEqual(7);
        expect(result.current.stateInfo[0].noOfPages).toEqual(1);
        expect(result.current.stateInfo[0].currentPageNo).toEqual(0);
    });

    it("test the hook for comment likes", async () => {
        const response = {
            "ok": true, "responseBody": data2, "error": null
        };
        promiseToWait = Promise.resolve(response);
        const loadUserFeedSpy = jest.spyOn(likeService, "loadLikesOnComment");
        loadUserFeedSpy.mockImplementation(() => promiseToWait);
        const {result, waitForNextUpdate} = renderHook(()=> useLikeState({itemId: 1, itemType: 'COMMENT', setShow: jest.fn(), show: true}));
        await act(() => promiseToWait)
        expect(result.current.stateInfo[0].dataList.length).toEqual(5);
        expect(result.current.stateInfo[0].noOfPages).toEqual(1);
        expect(result.current.stateInfo[0].currentPageNo).toEqual(0);
    });
});


