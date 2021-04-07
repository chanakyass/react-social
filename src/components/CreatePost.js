import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Parser from "html-react-parser";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "react-bootstrap";
import { postsCUD } from "./post/post-service";
import { RestMethod } from "../enums";
import cookie from "react-cookies";
import history from "../app-history";

import React, { useState } from "react";

export const CreatePost = ({
  setAddPostButtonClicked,
  addPostButtonClicked,
  setPosts,
}) => {
  const [post, setPost] = useState({ postHeading: "", postBody: "" });
  const jwtToken = cookie.load("jwt");
  const currentUser = cookie.load("current_user");

  console.log("CreatePost entered");

  const handleClose = (e) => setAddPostButtonClicked(false);

  const handleCreatePost = async (e, post) => {
    const { postHeading, postBody } = post;
    if (postHeading === "" || postBody === "") {
      //error
    } else {
      const responseBody = await postsCUD(
        RestMethod.POST,
        null,
        postHeading,
        postBody
      );

      if ("error" in responseBody) {
        const { error } = responseBody;

        console.log(error);

        history.push("/error");
      } else {
        const { data } = responseBody;

        setPosts((posts) => {
          return {
            ...posts,
            dataList: [
              {
                id: data.resourceId,
                postHeading: postHeading,
                postBody: postBody,
                postedAtTime: new Date().toISOString(),
                owner: currentUser,
              },
              ...posts.dataList,
            ],
          };
        });
      }
    }
    handleClose(e);
  };

  return (
    <>
      
        <Modal size="lg" show={addPostButtonClicked} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className=" mx-auto">
                <CKEditor
                  editor={ClassicEditor}
                  data={post.postBody}
                  onReady={(editor) => {
                    // You can store the "editor" and use when it is needed.
                    console.log("Editor is ready to use!", editor);
                  }}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setPost({ ...post, postBody: data });
                  }}
                  onBlur={(event, editor) => {
                    console.log("Blur.", editor);
                  }}
                  onFocus={(event, editor) => {
                    console.log("Focus.", editor);
                  }}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={(e, post) => handleCreatePost(e, post)}
            >
              Create Post
            </Button>
          </Modal.Footer>
        </Modal>
      
    </>
  );
};
