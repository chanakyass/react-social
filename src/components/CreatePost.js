import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Parser from "html-react-parser";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal, InputGroup, FormControl } from "react-bootstrap";
import { postsCUD } from "./post/post-service";
import { RestMethod } from "../enums";
import cookie from "react-cookies";
import history from "../app-history";
import moment from 'moment';

import React, { useState, useEffect } from "react";

export const CreatePost = React.memo(({
  setShow,
    show,
  method,
  setPosts,
    post
}) => {
  const [editorPost, setEditorPost] = useState({ id: null, postHeading: "", postBody: "" });
  const jwtToken = cookie.load("jwt");
    const currentUser = cookie.load("current_user");
    
    useEffect(() => {
        if (post && show === true) {
            setEditorPost({ id: post.id,  postHeading: post.postHeading, postBody: post.postBody });
        }
    }, [show])

  console.log("CreatePost entered");

  const handleClose = (e) => setShow(false);

    const handlePostCU = async (e, method, editorPost) => {
        const postId = editorPost.id;
        const postHeading = editorPost.postHeading.trim();
      const postBody = editorPost.postBody.trim();
      
      console.log(editorPost.postBody)



    if (postHeading === "" || postBody === "") {
      //error
    } else {
    
      const responseBody = await postsCUD(
        method,
        postId,
        postHeading,
        postBody
      );

      if ("error" in responseBody) {
        const { error } = responseBody;

          console.log(error);
          handleClose(e);
          history.push("/error");
          
      } else {
          const { data } = responseBody;
          
        switch (method) {
          case RestMethod.POST: {
            console.log('post getting executed');
                setPosts((posts) => {
                    return {
                      ...posts,
                      dataList: [
                        {
                          id: data.resourceId,
                          owner: currentUser,
                          postHeading: postHeading,
                          postBody: postBody,
                          postedAtTime: moment.utc().toISOString(),
                          modifiedAtTime: null,
                          noOfComments: 0,
                          noOfLikes: 0,
                        },
                        ...posts.dataList,
                      ],
                    };
                });
            }
            break;
            case RestMethod.PUT: {
                setPosts((posts) => {
                return {
                ...posts,
                dataList: posts.dataList.map(listPost => {
                  let newPost = listPost;
                  if (listPost.id === postId) {
                    if (postHeading !== '') {
                      newPost = { ...newPost, postHeading: postHeading };
                    }
                    if (postBody !== '') {
                      newPost = { ...newPost, postBody: postBody };
                    }

                    newPost = { ...newPost, modifiedAtTime: moment.utc().toISOString() }
                    return newPost;
                  }
                  else {
                    return listPost;
                  }
                })
              }});
            }
        }


      }
    }
    handleClose(e);
    setEditorPost({ id: null, postHeading: '', postBody: '' });
  };

  return (
    <>
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className='col-md-10 mx-auto'>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  placeholder="PostHeading"
                  aria-label="PostHeading"
                  aria-describedby="basic-addon1"
                  onChange={(e) => setEditorPost({...editorPost, postHeading: e.target.value})}
                  value={editorPost.postHeading}
                />
              </InputGroup>
            </div>
            <div className=" mx-auto">
              <CKEditor
                editor={ClassicEditor}
                data={editorPost.postBody}
                onReady={(editor) => {
                  // You can store the "editor" and use when it is needed.
                  if(post)
                    editor.setData(post.postBody);
                  console.log("Editor is ready to use!", editor);
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setEditorPost({ ...editorPost, postBody: data });
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
            onClick={(e) => handlePostCU(e, method, editorPost)}
          >
            {method === RestMethod.PUT ? 'Update post': 'Create post'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});
