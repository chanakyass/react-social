import cookie from 'react-cookies';
import { postService } from '../../components/post/post-service';

describe("postService test", () => {
    describe("test loadUserFeed", () => {
        let pageDetails;
        beforeEach(() => {
            pageDetails = {
                pageNo: 0,
                noOfDeletions: 0
            };
            cookie.load = jest.fn(() => "dummy");
        });

        afterEach(() => {
            jest.clearAllMocks();
        });
        test("success", async () => {
            const data = {
                info: "dummy"
            };
            const promise1 = Promise.resolve(data);
            const response = {json: jest.fn(() => promise1), status: 200};
            const promise2 = Promise.resolve(response);
            global.fetch = jest.fn(() => promise2);

            const responseFromService = await postService.loadUserFeed(pageDetails);
            expect(responseFromService.ok).toBeTruthy();
            expect(responseFromService.responseBody.info).toEqual("dummy");
        });

        test("failure", async () => {
            const data = {
                error: "error"
            };
            const promise1 = Promise.resolve(data);
            const response = {json: jest.fn(() => promise1), status: 200};
            const promise2 = Promise.resolve(response);
            global.fetch = jest.fn(() => promise2);

            const responseFromService = await postService.loadUserFeed(pageDetails);
            expect(responseFromService.ok).toBeFalsy();
            expect(responseFromService.responseBody).toEqual(null);
            expect(responseFromService.error).toEqual("error");
        });
    });

    describe("test postsCUD", () => {
        let method, postId, postHeading, postBody;
        beforeEach(() => {
            postHeading = "dummy", postBody = "dummy";
            cookie.load = jest.fn(() => "dummy");
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        test("POST", async () => {
            method = "POST";
            const data = {
                info: "dummy"
            };
            const promise1 = Promise.resolve(data);
            const response = {json: jest.fn(() => promise1), status: 200};
            const promise2 = Promise.resolve(response);
            global.fetch = jest.fn(() => promise2);

            const responseFromService = await postService.postsCUD(method, null, postHeading, postBody);
            expect(responseFromService.ok).toBeTruthy();
            expect(responseFromService.responseBody.info).toEqual("dummy");
        });

        test("PUT", async () => {
            method = "PUT";
            postId = 1;
            const data = {
                info: "dummy"
            };
            const promise1 = Promise.resolve(data);
            const response = {json: jest.fn(() => promise1), status: 200};
            const promise2 = Promise.resolve(response);
            global.fetch = jest.fn(() => promise2);

            const responseFromService = await postService.postsCUD(method, null, postHeading, postBody);
            expect(responseFromService.ok).toBeTruthy();
            expect(responseFromService.responseBody.info).toEqual("dummy");
        });

        test("DELETE", async () => {
            method = "DELETE";
            postId = 1;
            const data = {
                info: "dummy"
            };
            const promise1 = Promise.resolve(data);
            const response = {json: jest.fn(() => promise1), status: 200};
            const promise2 = Promise.resolve(response);
            global.fetch = jest.fn(() => promise2);

            const responseFromService = await postService.postsCUD(method, null, postHeading, postBody);
            expect(responseFromService.ok).toBeTruthy();
            expect(responseFromService.responseBody.info).toEqual("dummy");
        });

        test("failure POST", async () => {
            method = "POST";
            const data = {
                error: "error"
            };
            const promise1 = Promise.resolve(data);
            const response = {json: jest.fn(() => promise1), status: 200};
            const promise2 = Promise.resolve(response);
            global.fetch = jest.fn(() => promise2);

            const responseFromService = await postService.postsCUD(method, null, postHeading, postBody);
            expect(responseFromService.ok).toBeFalsy();
            expect(responseFromService.responseBody).toEqual(null);
            expect(responseFromService.error).toEqual("error");
        });
    });

    describe("test likeUnlikeCUD", () => {
        let post, action;
        beforeEach(() => {
            post = {
                id: 1
            };
            action = "like";
            cookie.load = jest.fn(() => "dummy");
        });

        afterEach(() => {
            jest.clearAllMocks();
        });
        test("success", async () => {
            const data = {
                info: "dummy"
            };
            const promise1 = Promise.resolve(data);
            const response = {json: jest.fn(() => promise1), status: 200};
            const promise2 = Promise.resolve(response);
            global.fetch = jest.fn(() => promise2);

            const responseFromService = await postService.likeUnlikeCUD(post, action);
            expect(responseFromService.ok).toBeTruthy();
            expect(responseFromService.responseBody.info).toEqual("dummy");
        });

        test("failure", async () => {
            const data = {
                error: "error"
            };
            const promise1 = Promise.resolve(data);
            const response = {json: jest.fn(() => promise1), status: 200};
            const promise2 = Promise.resolve(response);
            global.fetch = jest.fn(() => promise2);

            const responseFromService = await postService.likeUnlikeCUD(post, action);
            expect(responseFromService.ok).toBeFalsy();
            expect(responseFromService.responseBody).toEqual(null);
            expect(responseFromService.error).toEqual("error");
        });
    });
});