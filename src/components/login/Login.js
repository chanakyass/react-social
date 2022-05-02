import React from "react";
import  history  from '../../app-history'
import { withRouter } from 'react-router-dom'
import { Form, Col, Button } from 'react-bootstrap';
import useLoginState from "./useLoginState.js";

const Login = () => {
  const {stateInfo, funcs} = useLoginState();  
  const [creds, state] = stateInfo;
  const [changeDefaults, submitHandler] = funcs;

  return (
    <div style={{ height: "80vh", maxHeight: "80vh" }}>
      <div className="row h-100 m-0">
        <div className="col-md-4 col-lg-4 col-sm-4 mx-auto my-auto rounded shadow bg-white ">
          <div className="col-md-12 col-sm-12 col-lg-12 mx-auto mt-3">
            <h3>Citizen Sane</h3>
          </div>
          <Form noValidate onSubmit={submitHandler}>
            <div className="col-md-12 col-sm-12 col-lg-12 my-4 mx-auto">
              <h5>Login</h5>
            </div>

            <Form.Group as={Col} md={12}>
              <Form.Label>Username</Form.Label>
              <Form.Control
                id="username"
                name="username"
                type="email"
                placeholder="Enter the email id you logged in with"
                autoComplete="email"
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

            <Form.Group as={Col} md={12}>
              <Form.Label>Password</Form.Label>
              <Form.Control
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={creds.password}
                onChange={changeDefaults}
                autoComplete="current-password"
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
              <Button variant="secondary" className="my-3" type="submit">
                Submit
              </Button>
            </Form.Group>

            <Form.Group as={Col} md={12}>
              <button
                className="my-3 link-button"
                type="submit"
                // style={{
                //   background: "none",
                //   border: "none",
                //   margin: "none",
                //   textDecoration: "underline",
                //   color: "dodgerblue",
                // }}
                onClick={() => history.push("/register")}
              >
                Register yourself
              </button>
            </Form.Group>
          </Form>
          <div className="col-md-8 mx-auto my-3 text-danger">
            {state.postprocessingState.failureDetails.failureMessage}
            {state.postprocessingState.failureDetails.details}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter(Login)
