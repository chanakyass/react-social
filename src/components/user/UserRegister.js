import React, { useState, useReducer } from "react";
import { withRouter } from 'react-router-dom'
import { reducer } from "./reducer";
import { RestMethod } from '../../enums.js';
import { isValid } from './user-registration-validations'
import { defaultState } from '../user/user-registration-validations'
import history from '../../app-history'
import { Col, Form, Button } from 'react-bootstrap';
import baseURI from "../../api-config";

const UserRegister = () => {
  const defaultUser = {
    id: null,
    name: "",
    email: "",
    profileName: "",
    password: "",
    dob: "",
    userSummary: "",
    grantedAuthoritiesList: [
      {
        authority: "ROLE_USER",
      },
    ],
  };


  const [user, setUser] = useState(defaultUser);

  const changePerson = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    const newUser = {
      ...user,
      [name]: value,
    };
    setUser(newUser);
  };

  const [state, dispatch] = useReducer(reducer, defaultState);

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...user }),
  };

  const submitHandler = (e) => {
    e.preventDefault();
    requestOptions.method = RestMethod.POST;
    const fieldErrors = {
      nameError: "",
      profileNameError: '',
      emailError: "",
      passwordError: "",
      DOBError: "",
      userSummaryError: ''
    };
            if (isValid(user, fieldErrors, RestMethod.POST)) {
            fetch(
              `${baseURI}/public/register`,
              requestOptions
            ).then((response) => {
              response.json().then(body => {
                if (response.status === 200) {
                  history.push('/login');
                }
                else {
                  const { error } = body
                  dispatch(
                    {
                      type: RestMethod.POST,
                      preprocessed: true,
                      status: response.status,
                      payload: error
                    }
                  )
                }
              });
            });
            } else {
              dispatch({
                type: RestMethod.POST,
                preprocessed: false,
                status: 422,
                payload: fieldErrors,
              });

          }
    
  };

  return (
    <>
      <div style={{ height: "97vh" }}>
        <div className="row h-100 m-0">
          <div className="col-md-4 col-lg-4 col-sm-4 mx-auto my-auto rounded shadow bg-white">
            <div className="col-md-12 col-sm-12 col-lg-12 mx-auto mt-3">
              <h3>Citizen Sane</h3>
            </div>
            <Form noValidate onSubmit={submitHandler}>
              <div className="col-md-12 col-sm-12 col-lg-12 my-4 mx-auto">
                <h5>Register</h5>
              </div>

              <Form.Group as={Col} md={12} controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={user.name}
                  isInvalid={
                    state.hasError &&
                    state.preprocessingState.failureDetails.fieldErrors
                      .nameError !== ""
                  }
                  onChange={changePerson}
                />
                <Form.Control.Feedback type="invalid">
                  {
                    state.preprocessingState.failureDetails.fieldErrors
                      .nameError
                  }
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={12} controlId="formEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={user.email}
                  autoComplete="email"
                  onChange={changePerson}
                  isInvalid={
                    state.hasError &&
                    state.preprocessingState.failureDetails.fieldErrors
                      .emailError !== ""
                  }
                />
                <Form.Text className="text-muted">
                  We'll never share your email with anyone else.
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {
                    state.preprocessingState.failureDetails.fieldErrors
                      .emailError
                  }
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={12} controlId="formProfileName">
                <Form.Label>Profile Name</Form.Label>
                <Form.Control
                  id="profileName"
                  name="profileName"
                  type="text"
                  placeholder="Enter a name you would like to chose for your profile"
                  value={user.profileName}
                  onChange={changePerson}
                  autoComplete="nickname"
                  isInvalid={
                    state.hasError &&
                    state.preprocessingState.failureDetails.fieldErrors
                      .profileNameError !== ""
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {
                    state.preprocessingState.failureDetails.fieldErrors
                      .profileNameError
                  }
                </Form.Control.Feedback>
                {/* <Form.Control.Feedback>{state.preprocessingState.failureDetails.fieldErrors.emailError}</Form.Control.Feedback> */}
              </Form.Group>

              <Form.Group as={Col} md={12} controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  value={user.password}
                  onChange={changePerson}
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

              <Form.Group as={Col} md={12} controlId="formDOB">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  id="dob"
                  name="dob"
                  type="date"
                  value={
                    user.dob
                      ? new Date(user.dob).toISOString().substr(0, 10)
                      : ""
                  }
                  onChange={changePerson}
                  isInvalid={
                    state.hasError &&
                    state.preprocessingState.failureDetails.fieldErrors
                      .DOBError !== ""
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {state.preprocessingState.failureDetails.fieldErrors.DOBError}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={12} controlId="formUserSummary">
                <Form.Label>Something about yourself</Form.Label>
                <Form.Control
                  id="userSummary"
                  name="userSummary"
                  as="textarea"
                  rows={3}
                  value={user.userSummary}
                  onChange={changePerson}
                />
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
                  onClick={() => history.push("/login")}
                >
                  Already registered? Click here to login
                </button>
              </Form.Group>

              <Form.Control.Feedback type="invalid">
                {state.postprocessingState.failureDetails.failureMessage}
              </Form.Control.Feedback>

              <Form.Control.Feedback type="invalid">
                {state.postprocessingState.failureDetails.details}
              </Form.Control.Feedback>
            </Form>
            <div className="col-md-8 mx-auto my-3 text-danger">
              {state.postprocessingState.failureDetails.failureMessage}
              {state.postprocessingState.failureDetails.details}
            </div>
          </div>
        </div>
      </div>
    </>
  );
  
};

export default withRouter(UserRegister)

// const SuccessView = (props) => {
//   const { successDetails } = props;
//   const { successMessage, resourceId } = successDetails;
//   return (
//     <>
//       <div>
//         <h1>{successMessage}</h1>
//         <h5>{resourceId}</h5>
//       </div>
//     </>
//   );
// };
