import {renderHook} from "@testing-library/react-hooks";
import useCommentState from "../../components/comments/useCommentState";
import CommentHelper from '../../components/comments/comment-util';
import { RestMethod } from "../../enums";

jest.mock( '../../components/comments/comment-util');

describe("test useCommentState", () => {
    let result, waitForNextUpdate;
    let stateInfo, funcs, refs;
    let spyObj;
    let hookReturns;

    beforeAll(() => {
        spyObj = {
            post: {id: 1},
            parentComment: {id: 2},
            comment: {commentedOn: {
                id: 1
            }},
            setParentComments: jest.fn(),
            adjustRepliesInHeirarchy: jest.fn(),
            adjustNoOfCommentsInParentPost: jest.fn(),
            handleMovingPartsOnClickPost: jest.fn(),
            handleMovingPartsOnClickParent: jest.fn(),
            setNoOfCommentsDeletionsInSession: jest.fn(),
            setNoOfRepliesDeletionsInSession: jest.fn()
        };
    });

    beforeEach(() => {
        hookReturns = renderHook(()=> useCommentState(spyObj));
        result = hookReturns.result;
        waitForNextUpdate = hookReturns.waitForNextUpdate;
        stateInfo = result.current.stateInfo;
        funcs = result.current.funcs;
        refs = result.current.refs;
    })

    afterEach(() => {
       hookReturns = null ,result = null, waitForNextUpdate = null, stateInfo = null, funcs =null, refs =null;
    });

    it("test the adjustNoOfReplies", () => {
        const adjustNoOfReplies = funcs[0];
        const method = RestMethod.POST, childReplyId = 1, noOfRepliesAffected = 2;
        adjustNoOfReplies(method, childReplyId, noOfRepliesAffected);
        const mockCommentHelperInstance = CommentHelper.mock.instances[0];
        expect(mockCommentHelperInstance.adjustNoOfReplies).toHaveBeenCalledTimes(1);
        expect(CommentHelper).toHaveBeenCalled();
        //const args = mockCommentHelperInstance.adjustNoOfReplies.mock.calls[0][0];
    });

    it("test the handleMovingPartsOnClick", () => {
        const handleMovingPartsOnClick = funcs[1];
        const e={}, action = "dummy action", details= {};
        handleMovingPartsOnClick(e, action, details);
        const mockCommentHelperInstance = CommentHelper.mock.instances[0];
        expect(mockCommentHelperInstance.handleMovingPartsOnClick).toHaveBeenCalledTimes(1);
        expect(CommentHelper).toHaveBeenCalled();
    });

    it("test the handleCommentCUD", () => {
        const handleCommentCUD = funcs[2];
        const e={}, method = RestMethod.POST, commentObj= {};
        handleCommentCUD(e, method, commentObj);
        const mockCommentHelperInstance = CommentHelper.mock.instances[0];
        expect(mockCommentHelperInstance.handleCommentCUD).toHaveBeenCalledTimes(1);
        expect(CommentHelper).toHaveBeenCalled();
    });

    it("test the handleReplyCUD", () => {
        const handleReplyCUD = funcs[3];
        const e={}, method = RestMethod.POST, replyObj= {};
        handleReplyCUD(e, method, replyObj);
        const mockCommentHelperInstance = CommentHelper.mock.instances[0];
        expect(mockCommentHelperInstance.handleReplyCUD).toHaveBeenCalledTimes(1);
        expect(CommentHelper).toHaveBeenCalled();
    });

    it("test the handleLikeUnlikeComment", () => {
        const handleLikeUnlikeComment = funcs[4];
        const e={}, comment = {}, action= 'dummy action';
        handleLikeUnlikeComment(e, comment, action);
        const mockCommentHelperInstance = CommentHelper.mock.instances[0];
        expect(mockCommentHelperInstance.handleLikeUnlikeComment).toHaveBeenCalledTimes(1);
        expect(CommentHelper).toHaveBeenCalled();
    });

    it("test the handleGetReplies", () => {
        const handleGetReplies = funcs[5];
        const e={}, commentId = 1, pageNo= 1;
        handleGetReplies(e, commentId, pageNo);
        const mockCommentHelperInstance = CommentHelper.mock.instances[0];
        expect(mockCommentHelperInstance.handleGetReplies).toHaveBeenCalledTimes(1);
        expect(CommentHelper).toHaveBeenCalled();
    });

    it("test the handleMovingPartsForKeys", () => {
        const handleMovingPartsForKeys = funcs[6];
        const e = {}, action = 'dummy action';
        handleMovingPartsForKeys(e, action);
        const mockCommentHelperInstance = CommentHelper.mock.instances[0];
        expect(mockCommentHelperInstance.handleMovingPartsForKeys).toHaveBeenCalledTimes(1);
        expect(CommentHelper).toHaveBeenCalled();
    });
});


