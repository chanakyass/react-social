import {postService} from "../../components/post/post-service";
import { commentService } from "../../components/comments/comment-services";
import PaginationHelper from "../../components/userfeed/pagination-util";
import CommentHelper from "../../components/comments/comment-util";
import { RestMethod } from "../../enums";


describe("test commentHelper class", () => {
    describe("test adjustNoOfReplies", () => {
        let commentHelper;

        beforeEach(() => {
            commentHelper = new CommentHelper();
        });

        afterEach(() => {
            commentHelper = null;
            jest.clearAllMocks();
        })

        test("test success", () => {
            let method = RestMethod.POST;
            const childReplyId = 2, noOfRepliesAffected = 1, parentCommentId = 1, parentPostId = 1;
            const stateInfo = {setParentComments: jest.fn()};
            const funcs = {adjustRepliesInHeirarchy: jest.fn()};
            commentHelper.adjustNoOfReplies(method, childReplyId, noOfRepliesAffected, parentCommentId, parentPostId, stateInfo, funcs, null);
            expect(stateInfo.setParentComments).toHaveBeenCalledTimes(1);
            expect(funcs.adjustRepliesInHeirarchy).toHaveBeenCalledTimes(1);
            jest.clearAllMocks();
            method = RestMethod.PUT;
            commentHelper.adjustNoOfReplies(method, childReplyId, noOfRepliesAffected, parentCommentId, parentPostId, stateInfo, funcs, null);
            expect(stateInfo.setParentComments).toHaveBeenCalledTimes(1);
            expect(funcs.adjustRepliesInHeirarchy).toHaveBeenCalledTimes(1);
        });
    });

    describe("test handleMovingPartsOnClick", () => {
        let e,action, details,stateInfo, refs;
        let commentHelper;
        beforeEach(() => {
            commentHelper = new CommentHelper();
            e = {}, action = 'REPLY', details = {pageNo: 1};
            stateInfo = {setShowGetRepliesLoad: jest.fn(), repliesAccordionOpen: true, setRepliesAccordionOpen: jest.fn()};
            refs = {
                replyBarRef: {
                    current: {
                        style: {
                            display: ''
                        }
                    }
                },
                reactionBarRef: {
                    current: {
                        style: {
                            display: ''
                        }
                    },
                },
                replyInputRef: {
                    current: {
                        value: '',
                        focus: jest.fn()
                    }
                },
                repliesDotRef: {
                    current: {
                        click: jest.fn()
                    }
                },
                commentContentRef: {
                    current: {
                        style: {
                            display: ''
                        }
                    }
                },
                updateCommentRef: {
                    current: {
                        style: {
                            display: ''
                        }
                    }
                },
                updateInputRef: {
                    current: {
                        focus: jest.fn()
                    }
                },
                paginationRef: {
                    current: {
                        children: [{style: {display: ''}}, {style: {display: ''}}]
                    }
                }
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        })

        test("#1", () => {

            commentHelper.handleMovingPartsOnClick(e, action, details, stateInfo, null, refs);
            expect(refs.replyBarRef.current.style.display).toBe("block");
            expect(refs.reactionBarRef.current.style.display).toBe("none");
            expect(refs.replyInputRef.current.value).toBe("");
            expect(refs.replyInputRef.current.focus).toHaveBeenCalledTimes(1);
        });

        test("#2", () => {

            action = "PRE_REPLY_SUBMIT";

            commentHelper.handleMovingPartsOnClick(e, action, details, stateInfo, null, refs);
            expect(stateInfo.setShowGetRepliesLoad).toHaveBeenCalledTimes(1);
            expect(refs.replyBarRef.current.style.display).toBe("none");
            expect(refs.reactionBarRef.current.style.display).toBe("block");
        });

        test("#3", () => {
            action = "POST_REPLY_SUBMIT";
            stateInfo.repliesAccordionOpen = false;
            commentHelper.handleMovingPartsOnClick(e, action, details, stateInfo, null, refs);
            expect(stateInfo.setShowGetRepliesLoad).toHaveBeenCalledTimes(1);
            expect(refs.repliesDotRef.current.click).toHaveBeenCalledTimes(1);
        });

        test("#4", () => {
            action = "UPDATE";
            commentHelper.handleMovingPartsOnClick(e, action, details, stateInfo, null, refs);
            expect(refs.commentContentRef.current.style.display).toBe("none");
            expect(refs.updateCommentRef.current.style.display).toBe("block");
            expect(refs.updateInputRef.current.focus).toHaveBeenCalledTimes(1);
            expect(refs.reactionBarRef.current.style.display).toBe("none");
        });

        test("#5", () => {
            action = "UPDATE_SUBMIT";
            commentHelper.handleMovingPartsOnClick(e, action, details, stateInfo, null, refs);
            expect(refs.commentContentRef.current.style.display).toBe("block");
            expect(refs.updateCommentRef.current.style.display).toBe("none");
            expect(refs.reactionBarRef.current.style.display).toBe("block");
        });

        test("#6", () => {
            action = "PRE_GET_REPLIES";
            commentHelper.handleMovingPartsOnClick(e, action, details, stateInfo, null, refs);
            expect(refs.paginationRef.current.children[0].style.display).toBe("none");
        });

        test("#7", () => {

            action = "POST_GET_REPLIES";
            commentHelper.handleMovingPartsOnClick(e, action, details, stateInfo, null, refs);
            expect(refs.paginationRef.current.children[1].style.display).toBe("none");
        });

        test("#8", () => {

            action = "DELETE_COMMENT";
            commentHelper.handleMovingPartsOnClick(e, action, details, stateInfo, null, refs);
            expect(refs.repliesDotRef.current.click).toHaveBeenCalledTimes(1);
            expect(stateInfo.setRepliesAccordionOpen).toHaveBeenCalledTimes(1);
        });
    });

    describe("test handleCommentCUD", () => {
        let commentHelper;
        let e, method, commentObj, noOfCommentsOnPost, noOfRepliesOnComment;
        let stateInfo, funcs, refs, spyCommentsCUD;
        beforeEach(() => {
            spyCommentsCUD = jest.spyOn(commentService, "commentsCUD");
            commentHelper = new CommentHelper();
            commentObj = {
                postId: 1,
                commentId: 1,
                commentContent: "This is comment content"
            }
            e = {preventDefault: jest.fn()};
            noOfCommentsOnPost = 2, noOfRepliesOnComment = 1;
            stateInfo = {setParentComments: jest.fn(), setNoOfCommentsDeletionsInSession: jest.fn(), setReplyContent: jest.fn()};
            funcs = {handleMovingPartsOnClick: jest.fn(), handleMovingPartsOnClickPost: jest.fn(), adjustNoOfCommentsInParentPost: jest.fn()};
            refs = {updateCommentRef: {
                current: {
                    focus: jest.fn()
                }
            }}
        });
        afterEach(() => {
            jest.clearAllMocks();
        })
        test("test PUT", async () => {
            const promiseToWait = Promise.resolve({ok: true, responseBody: {}, error: null});
            spyCommentsCUD.mockImplementation(() => promiseToWait);
            method = RestMethod.PUT;
            commentHelper.handleCommentCUD(e, method, commentObj, noOfCommentsOnPost,  noOfRepliesOnComment, stateInfo, funcs, refs);
            await promiseToWait;
            expect(stateInfo.setParentComments).toHaveBeenCalledTimes(1);
            expect(funcs.handleMovingPartsOnClick).toHaveBeenCalledTimes(1);
            expect(spyCommentsCUD).toHaveBeenCalled();
        });

        test("test DELETE", async () => {
            const promiseToWait = Promise.resolve({ok: true, responseBody: {}, error: null});
            spyCommentsCUD.mockImplementation(() => promiseToWait);
            method = RestMethod.DELETE;
            commentHelper.handleCommentCUD(e, method, commentObj, noOfCommentsOnPost,  noOfRepliesOnComment, stateInfo, funcs, refs);
            await promiseToWait;
            expect(stateInfo.setParentComments).toHaveBeenCalledTimes(1);
            expect(funcs.handleMovingPartsOnClickPost).toHaveBeenCalled();
            expect(stateInfo.setNoOfCommentsDeletionsInSession).toHaveBeenCalled();
            expect(funcs.adjustNoOfCommentsInParentPost).toHaveBeenCalledWith(RestMethod.DELETE, noOfRepliesOnComment + 1)
        });
    });

    describe("test handleLikeUnlikeComment", () => {
        let commentHelper;
        let e, comment, action;
        let stateInfo, funcs, refs, spyLikeUnlikeCommentCUD;
        beforeEach(() => {
            spyLikeUnlikeCommentCUD = jest.spyOn(commentService, "likeUnlikeCommentCUD");
            commentHelper = new CommentHelper();
            comment = {
                parentComment: {
                    id: 1
                }
            }
            e = {preventDefault: jest.fn()};
            stateInfo = {setParentComments: jest.fn()};
            funcs = {showAlertWithMessage: jest.fn()};
            refs = null;
            action = "like";
        });
        afterEach(() => {
            jest.clearAllMocks();
        })
        test("test error case", async () => {
            let error = {};
            error.statusCode = 500;
            error.exceptionType = "API_SPECIFIC_EXCEPTION";
            error.details = "details";
            error.message = "message";
            const promiseToWait = Promise.resolve({ok: false, responseBody: {}, error: error});
            spyLikeUnlikeCommentCUD.mockImplementation(() => promiseToWait);
            commentHelper.handleLikeUnlikeComment(e, comment, action, stateInfo, funcs, refs);
            await promiseToWait;
            expect(funcs.showAlertWithMessage).toHaveBeenCalledWith(error.message.concat(error.details));
            expect(spyLikeUnlikeCommentCUD).toHaveBeenCalled();
        });

        test("test success", async () => {
            const promiseToWait = Promise.resolve({ok: true, responseBody: {}, error: null});
            spyLikeUnlikeCommentCUD.mockImplementation(() => promiseToWait);
            commentHelper.handleLikeUnlikeComment(e, comment, action, stateInfo, funcs, refs);
            await promiseToWait;
            expect(stateInfo.setParentComments).toHaveBeenCalledTimes(1);
            expect(spyLikeUnlikeCommentCUD).toHaveBeenCalled();
        });
    });

    describe("test handleGetReplies", () => {
        let commentHelper;
        let e, commentId, pageNo;
        let stateInfo, funcs, refs, spyLoadComments;
        beforeEach(() => {
            spyLoadComments = jest.spyOn(commentService, "loadComments");
            commentHelper = new CommentHelper();
            commentId = 1, pageNo = 0;
            e = {preventDefault: jest.fn()};
            stateInfo = {replies: {}, setReplies: jest.fn(), noOfCurrentRepliesDeletionInSession: 0};
            funcs = {handleMovingPartsOnClick: jest.fn()};
            refs = null;
        });
        afterEach(() => {
            jest.clearAllMocks();
        })
        test("test error case", async () => {
            const promiseToWait = Promise.resolve({ok: false, responseBody: {}, error: {}});
            spyLoadComments.mockImplementation(() => promiseToWait);
            commentHelper.handleGetReplies(e, commentId, pageNo, stateInfo, funcs, refs);
            await promiseToWait;
            expect(spyLoadComments).toHaveBeenCalled();
        });

        test("test success first set", async () => {
            const promiseToWait = Promise.resolve({ok: true, responseBody: {}, error: null});
            spyLoadComments.mockImplementation(() => promiseToWait);
            commentHelper.handleGetReplies(e, commentId, pageNo, stateInfo, funcs, refs);
            await promiseToWait;
            expect(funcs.handleMovingPartsOnClick).toHaveBeenCalledTimes(2);
            expect(stateInfo.setReplies).toHaveBeenCalledTimes(1);
            expect(spyLoadComments).toHaveBeenCalled();
        });

        test("test success later set", async () => {
            stateInfo.replies = {'comment1': {
                dataList: []
            }};
            const promiseToWait = Promise.resolve({ok: true, responseBody: {dataList: []}, error: null});
            spyLoadComments.mockImplementation(() => promiseToWait);
            commentHelper.handleGetReplies(e, commentId, pageNo, stateInfo, funcs, refs);
            await promiseToWait;
            expect(funcs.handleMovingPartsOnClick).toHaveBeenCalledTimes(2);
            expect(stateInfo.setReplies).toHaveBeenCalledTimes(1);
            expect(spyLoadComments).toHaveBeenCalled();
        });
    });

    describe("test handleMovingPartsForKeys", () => {
        let commentHelper;
        let e, action;
        let stateInfo, funcs, refs;
        beforeEach(() => {
            commentHelper = new CommentHelper();
            e = {preventDefault: jest.fn()};
            stateInfo = null;
            funcs = null;
            refs = {replyBarRef: {current: {style: {display: ''}}},
            reactionBarRef : {current: {style: {display: ''}}}, 
            updateCommentRef : {current: {style: {display: ''}}}, 
            commentContentRef : {current: {style: {display: ''}}}};
        });
        afterEach(() => {
            jest.clearAllMocks();
        })
        test("test REPLY_SUBMIT",  () => {
            action = "REPLY_SUBMIT";
            e.key = "Escape";
            commentHelper.handleMovingPartsForKeys(e, action, stateInfo, funcs, refs);
            expect(refs.replyBarRef.current.style.display).toBe("none");
            expect(refs.reactionBarRef.current.style.display).toBe("inline-block");
        });

        test("test UPDATE_SUBMIT",  () => {
            action = "UPDATE_SUBMIT";
            e.key = "Escape";
            commentHelper.handleMovingPartsForKeys(e, action, stateInfo, funcs, refs);
            expect(refs.updateCommentRef.current.style.display).toBe("none");
            expect(refs.commentContentRef.current.style.display).toBe("inline-block");
            expect(refs.reactionBarRef.current.style.display).toBe("inline-block");
        });
    });
});