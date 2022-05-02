import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Button, Modal, InputGroup, FormControl } from "react-bootstrap";
import { RestMethod } from "../../enums";

import React from "react";
import useCreatePostState from "./useCreatePostState";

const CreatePost = React.memo(({
  setShow,
  show,
  method,
  setPosts,
  post
}) => {

  const {stateInfo, funcs} = useCreatePostState({setShow, setPosts, post});

  const [editorPost, setEditorPost] = stateInfo;
  const [handleClose, handlePostCU] = funcs;

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
                  
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setEditorPost({ ...editorPost, postBody: data });
                }}
                onBlur={(event, editor) => {
                  
                }}
                onFocus={(event, editor) => {
                  
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
            variant="secondary"
            disabled={ editorPost.postBody === ''  }
            onClick={(e) => handlePostCU(e, method, editorPost)}
          >
            {method === RestMethod.PUT ? 'Update post': 'Create post'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});

export default CreatePost;
