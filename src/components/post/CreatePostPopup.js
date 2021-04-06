import { Form, Modal, Button } from 'react-bootstrap';

function Example() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            
            noValidate
            
            onSubmit={submitHandler}

            //style={{  borderBlockColor: 'blue' }}
          >


            <Form.Group as={Col} md={12} controlId="formUsername">
              <Form.Label>Heading</Form.Label>
              <Form.Control
                id="username"
                name="username"
                type="email"
                placeholder="Enter the email id you logged in with"
                value={creds.username}
                isInvalid={
                  state.hasError &&
                  state.preprocessingState.failureDetails.fieldErrors
                    .usernameError !== ""
                }
                onChange={changeDefaults}
              />
              <Form.Control.Feedback type="invalid">
                {
                  state.preprocessingState.failureDetails.fieldErrors
                    .usernameError
                }
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={12} controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={creds.password}
                onChange={changeDefaults}
                isInvalid={
                  state.hasError &&
                  state.preprocessingState.failureDetails.fieldErrors
                    .passwordError !== ""
                }
              />
              <Form.Control.Feedback type="invalid">
                {
                  state.preprocessingState.failureDetails.fieldErrors
                    .passwordError
                }
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={12}>
              <Button className="my-3" type="submit">
                Submit
              </Button>
            </Form.Group>

            <Form.Group as={Col} md={12}>
              <button
                className="my-3"
                type="submit"
                style={{
                  background: "none",
                  border: "none",
                  margin: "none",
                  textDecoration: "underline",
                  color: "dodgerblue",
                }}
                onClick={() => history.push("/register")}
              >
                Register yourself
              </button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
