import React, { useState, useEffect } from "react";
import cookie from "react-cookies";
import { RestMethod } from "../../enums.js";
import  history  from '../../app-history'
import { withRouter } from 'react-router-dom'
import { Form, Col, Button } from 'react-bootstrap';
import baseURI from "../../api-config";

const Login = () => {

  const preprocessingState = {
    isSuccess: true,
    failureDetails: {
      fieldErrors: {
        usernameError: "",
        passwordError: "",
      }
    }
  };

  const postprocessingState = {
    isSuccess: true,
    failureDetails: {
      failureMessage: '',
      details: []
    }
  }
    const defaultState = {
      hasError: false,
      preprocessingState: preprocessingState,
      postprocessingState: postprocessingState
    }


    const [creds, setCreds] = useState({
        username: '',
        password: ''
    });

  const [state, changeState] = useState(defaultState);

  useEffect(() => {
    const jwt = cookie.load('jwt')
    if (jwt) {
      history.push('/')
    }
  })
  

    const requestOptions = {
        method: RestMethod.POST,
        headers: { "Content-Type": "application/json", 'Authorization': '' },
        body: JSON.stringify({ ...creds }),
    };

    const changeDefaults = (e) => {
        const name = e.target.name
        const value = e.target.value
        setCreds({...creds, [name]: value})

    }

    const submitHandler = (e) => {
      e.preventDefault()
      const fieldErrors = {
        usernameError: '',
        passwordError: ''
        
      }
        if (isValid(creds, fieldErrors))  {
            fetch(
              `${baseURI}/api/v1/public/login`,
              requestOptions
            ).then((response) => {
                response.json().then(body => {
                  if (response.status === 200) {
                    const { data } = body
                      const jwt = response.headers.get('Authorization')
 
                      let expires = new Date();
                      expires.setDate(
                        expires.getDate() + 7
                      );

                      cookie.save('jwt', jwt, { path: '/', expires: expires })
                      cookie.save('current_user', data, { path: '/', expires: expires })
                      
                    
                      history.push('/')
                    }
                    else {
                    const { error } = body
                        changeState({
                          ...state,
                          hasError: true,
                          preprocessingState: {
                            ...state.preprocessingState,
                            failureDetails: {
                              ...state.preprocessingState.failureDetails,
                              fieldErrors: {
                                usernameError: '',
                                passwordError: ''
                              }
                            },
                            isSuccess: true
                            
                          },
                          postprocessingState: {
                            ...state.postprocessingState,
                            isSuccess: false,
                            failureDetails: {
                              failureMessage: error.message,
                              details: error.details
                            }
                          }
                        });
                    }
              });
            });
        } else {
          changeState({
            ...state,
            hasError: true,
            preprocessingState: {
              ...state.preprocessingState,
              isSuccess: false,
              failureDetails: {
                fieldErrors: fieldErrors,
              },
            },
          });
        }
    }
  

  return (
    
    <div style={{ height: '80vh', maxHeight: '80vh' }}>
      <div className='row h-100 m-0'>
          <div className="col-md-4 mx-auto my-auto rounded shadow bg-white ">
            <div className="col-md-4 mx-auto mt-3">
              <h3>Citizen Sane</h3>
            </div>
            <Form
              
              noValidate
              onSubmit={submitHandler}

            >
              <div className="col-md-12 my-4 mx-auto">
                <h5>Login</h5>
              </div>

              <Form.Group as={Col} md={12} controlId="formUsername">
                <Form.Label>Username</Form.Label>
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
                <Button variant='secondary' className="my-3" type="submit">
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
      // </div>
     
    
  );
  
};

const isValid = (creds, fieldErrors) => {

  let returnValue = true


    if (creds.username === "") {
      fieldErrors.usernameError = "Field can't be empty";
      returnValue = false;
    } else {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!re.test(String(creds.username).toLowerCase())) {
        fieldErrors.usernameError = "Incorrect username format";
        returnValue = false;
      }
    }
    // Also need a regex for username
    if (creds.password === "") {
      fieldErrors.passwordError = "Field can't be empty";
      returnValue = false;
    } else {
      const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
      if (!re.test(String(creds.password))) {
        fieldErrors.passwordError = "Incorrect password format";
        returnValue = false;
      }
  }
  

    return returnValue
}

export default withRouter(Login)
