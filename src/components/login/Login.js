import React, { useState, useEffect } from "react";
import cookie from "react-cookies";
import { RestMethod } from "../../enums.js";
import  history  from '../../app-history'
import {  Link, withRouter } from 'react-router-dom'

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
      <div>
        <form>
          <div>
            <label htmlFor="username">username</label>
            <input id='username' name='username' type="text" value={creds.username} onChange={changeDefaults} />
            <span id="error-username" name="error-username">
              {!state.preprocessingState.isSuccess &&
                state.preprocessingState.failureDetails.fieldErrors.usernameError}
            </span>
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id='password'
              name='password'
              type="password"
              value={creds.password}
              onChange={changeDefaults}
            />
            <span id="error-password" name="error-password">
              {!state.preprocessingState.isSuccess &&
                state.preprocessingState.failureDetails.fieldErrors.passwordError}
            </span>
          </div>
          <div>
            <button id='login' name='login' type='submit' onClick={submitHandler}>
                login
            </button>
          </div>
          <div>
            <Link to={`/register`}>register</Link>
          </div>
      <div>
        <h1>
          {state.hasError &&
            state.postprocessingState.failureDetails.failureMessage}
        </h1>
        <h5>
          {state.hasError && state.postprocessingState.failureDetails.details}
        </h5>
      </div>
        </form>
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
