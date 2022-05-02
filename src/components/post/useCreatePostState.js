import PostHelper from "./post-util";
import cookie from "react-cookies";
import { useState, useRef, useEffect } from "react";

const useCreatePostState = ({
    setShow,
    setPosts,
    post
  }) => {
    const [editorPost, setEditorPost] = useState({ id: null, postHeading: "", postBody: "" });
    const currentUser = cookie.load("current_user");
    const postHelperRef = useRef();
    postHelperRef.current = new PostHelper();
    
    useEffect(() => {
        if(post) {
        setEditorPost({ id: post.id, postHeading: post.postHeading, postBody: post.postBody });
        }
    }, [post]);

    const handleClose = (e) => setShow(false);

    const handlePostCU = (e, method, editorPost) => {
        postHelperRef.current.handlePostCU(e, method, currentUser, {editorPost, setEditorPost, setPosts}, {handleClose}, null);
    }

    return {
        stateInfo: [editorPost, setEditorPost],
        funcs: [handleClose, handlePostCU],
        refs: null
    };
}

export default useCreatePostState;