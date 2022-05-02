import {loginUtil} from "../../components/login/login-util"
import cookie from "react-cookies";
import  history  from '../../app-history';

describe("testing login util functions", () => {
    let e, stateInfo, spyCookie, spyHistory;
    beforeEach(() => {
        e = {preventDefault: jest.fn()};
        stateInfo = {};
        stateInfo.creds = {};
        stateInfo.state = {preprocessingState: {}};
        stateInfo.changeState = jest.fn((state) => stateInfo.state = state);
    });

    it("test success", async () => {
        const promise1 = Promise.resolve({data: "Success"});
        let obj = {status: 200, headers: {get: jest.fn(() => "dummy")}, json: jest.fn(() => promise1)};
        const promise2 = Promise.resolve(obj);
        global.fetch = jest.fn(() => promise2);
        spyCookie = jest.spyOn(cookie, "save");
        spyHistory = jest.spyOn(history, "push");
        stateInfo.creds = {username: "dummy@rest.com", password: "dummy@123"};
        loginUtil.submitHandler(e, stateInfo);
        await promise1;
        await promise2;
        expect(spyCookie).toHaveBeenCalled();
        expect(spyHistory).toHaveBeenCalled();
    });

    describe("test failure", () => {
        let promise1, promise2, obj;
        beforeEach(() => {
            promise1 = Promise.resolve({error: "Failure"});
            obj = {status: 200, headers: {get: jest.fn(() => "dummy")}, json: jest.fn(() => promise1)};
            promise2 = Promise.resolve(obj);
            global.fetch = jest.fn(() => promise2);
        });
        test("username is empty", async () => {
            stateInfo.creds = {username: "", password: ""};
            loginUtil.submitHandler(e, stateInfo);
            await promise1;
            await promise2;
            expect(spyCookie).toHaveBeenCalledTimes(0);
            expect(spyHistory).toHaveBeenCalledTimes(0);
            expect(stateInfo.changeState).toHaveBeenCalled();
            expect(stateInfo.state.preprocessingState.failureDetails.fieldErrors.usernameError).toEqual("Field can't be empty");
        });

        test("Incorrect username format", async () => {
            stateInfo.creds = {username: "dummmy", password: "dummy"};
            loginUtil.submitHandler(e, stateInfo);
            await promise1;
            await promise2;
            expect(spyCookie).toHaveBeenCalledTimes(0);
            expect(spyHistory).toHaveBeenCalledTimes(0);
            expect(stateInfo.changeState).toHaveBeenCalled();
            expect(stateInfo.state.preprocessingState.failureDetails.fieldErrors.usernameError).toEqual("Incorrect username format");
        });

        test("password empty", async () => {
            stateInfo.creds = {username: "dummmy@rest.com", password: ""};
            loginUtil.submitHandler(e, stateInfo);
            await promise1;
            await promise2;
            expect(spyCookie).toHaveBeenCalledTimes(0);
            expect(spyHistory).toHaveBeenCalledTimes(0);
            expect(stateInfo.changeState).toHaveBeenCalled();
            expect(stateInfo.state.preprocessingState.failureDetails.fieldErrors.passwordError).toEqual("Field can't be empty");
        });

        test("password Incorrect", async () => {
            stateInfo.creds = {username: "dummmy@rest.com", password: "dummy"};
            loginUtil.submitHandler(e, stateInfo);
            await promise1;
            await promise2;
            expect(spyCookie).toHaveBeenCalledTimes(0);
            expect(spyHistory).toHaveBeenCalledTimes(0);
            expect(stateInfo.changeState).toHaveBeenCalled();
            expect(stateInfo.state.preprocessingState.failureDetails.fieldErrors.passwordError).toEqual("Incorrect password format");
        });
    });
});