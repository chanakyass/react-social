import {renderHook} from "@testing-library/react-hooks";
import useUserFeed from "../../components/userfeed/useUserFeed";
import * as data from "../resources/mocked_posts_response.json"
import { act } from "react-dom/test-utils";
import { cleanup } from "@testing-library/react";
import { postService } from "../../components/post/post-service";
import UserFeed from "../../components/userfeed/UserFeed";
import Post from "../../components/post/Post";
import {debounced} from '../../components/utility/debouncer';

jest.mock('../../components/post/Post', () => ({ post, setPosts, setNoOfDeletedPostsInSession }) => (
<div data-testid={`post${post.id}`}>
</div>));


describe("test userFeed", () => {
    let promiseToWait;
    beforeEach(() => {
        const response = {
            "ok": true, "responseBody": data, "error": null
        };
        promiseToWait = Promise.resolve(response);
        const loadUserFeedSpy = jest.spyOn(postService, "loadUserFeed");
        loadUserFeedSpy.mockImplementation(() => promiseToWait);
    });

    afterEach(() => cleanup());

    it("test the hook", async () => {
        const {result, waitForNextUpdate} = renderHook(()=> useUserFeed());
        await act(() => promiseToWait)
        expect(result.current[3]).toEqual(true);
        expect(result.current[0].currentPageNo).toEqual(0);
        expect(result.current[0].noOfPages).toEqual(2);
    });
});


