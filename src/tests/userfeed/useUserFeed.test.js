import {renderHook} from "@testing-library/react-hooks";
import useUserFeed from "../../components/userfeed/useUserFeed";
import * as data from "../resources/mocked_posts_response.json"
// import { unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { cleanup, fireEvent, waitFor, render, screen } from "@testing-library/react";
import { postService } from "../../components/post/post-service";
import UserFeed from "../../components/userfeed/UserFeed";
import Post from "../../components/post/Post";
import {debounced} from '../../components/utility/debouncer';

jest.mock('../../components/post/Post', () => ({ post, setPosts, setNoOfDeletedPostsInSession }) => (
<div data-testid={`post${post.id}`}>
</div>));

//jest.mock("../../components/post/post-service", () => ({postService : jest.fn()}));


describe("test userFeed", () => {
    let promiseToWait;
    beforeEach(() => {
        // jest.mock('../../components/post/post-service');
        const response = {
            "ok": true, "responseBody": data, "error": null
        };
        promiseToWait = Promise.resolve(response);
        const loadUserFeedSpy = jest.spyOn(postService, "loadUserFeed").mockImplementation(() => promiseToWait);
    });

    afterEach(() => cleanup());

    it("test the hook", async () => {
        const {result, waitForNextUpdate} = renderHook(()=> useUserFeed());
        await act(() => promiseToWait)
        //await waitForNextUpdate();
        expect(result.current[3]).toEqual(true);
        expect(result.current[0].currentPageNo).toEqual(0);
        expect(result.current[0].noOfPages).toEqual(2);
    });
});

// describe("testing react UserFeed component", () => {
//     beforeEach(() => {
//         jest.mock('../../components/post/post-service');
//         const response = {
//             "ok": true, "responseBody": data, "error": null
//         };
//         postService.loadUserFeed = jest.fn(() => Promise.resolve(response));
//     });

//     afterEach(() => {
//         // cleanup on exiting
//         cleanup()
//       });

//       it("test scroll", async () => {
//         // Object.defineProperty(global.document, 'scrollHeight', { value: spyFunc });
//         // window.addEventListener("scroll", (e) => {
//         //     debounced(100, handleScroll, e);
//         //   }, true);
//         jest.spyOn(document.body, 'scrollTop', 'get')
//         .mockImplementation(() => 0);
//         jest.spyOn(document.body, 'scrollHeight', 'get')
//         .mockImplementation(() => 150);
//         act(() => {
//             render(<UserFeed setAddPostButtonClicked={()=>null} addPostButtonClicked={false}/>);
//             jest.spyOn(document.body, 'scrollTop', 'get')
//             .mockImplementation(() => 50);
//             console.log(window.scrollY, document.body.scrollTop);
//             fireEvent.scroll(window, {target: {scrollTop: 50, scrollY: 50, innerHeight: 50}});
//         });

//         await waitFor(() => {
//             screen.getByTestId("post3");
//         });
//         //screen.debug();
          
//       })
// })


