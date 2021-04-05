import React, { useState, useEffect } from "react";
import cookie from "react-cookies";
import { RestMethod } from "../../enums.js";
import  history  from '../../app-history'
import { Link, withRouter } from 'react-router-dom'
import { Form, Col, Button } from 'react-bootstrap'

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
      console.log("Enetered handler");
        if (isValid(creds, fieldErrors))  {
            fetch(
              "http://localhost:8080/api/v1/public/login",
              requestOptions
            ).then((response) => {
                response.json().then(body => {
                  if (response.status === 200) {
                    const { data } = body
                      const jwt = response.headers.get('Authorization')
                      console.log(response)
                      console.log(response.headers)
                      response.headers.forEach((value, key)=>console.log('value is ',value,'key is ', key))
                      console.log(jwt)
                      let expires = new Date();
                      expires.setDate(
                        expires.getDate() + 7
                      );

                      cookie.save('jwt', jwt, { path: '/', expires: expires })
                      cookie.save('current_user', data, { path: '/', expires: expires })
                      
                      //console.log(cookie.load('jwt'))
                      console.log(data)

                      
    
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
    <>
      <div style={{ height: "60rem" }}>
        <div className="row h-100">
          <div className="col-md-4 mx-auto my-auto rounded shadow">
            <div className="col-md-4 mx-auto mt-3">
              <h3>Citizen Sane</h3>
            </div>
            <Form
              //className='my-75'
              noValidate
              //validated={state.hasError}
              onSubmit={submitHandler}

              //style={{  borderBlockColor: 'blue' }}
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
                <Button className="my-3" type="submit">
                  Submit
                </Button>
              </Form.Group>

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
  
    console.log('enetered is valid ', returnValue);

    return returnValue
}

export default withRouter(Login)
