import  history  from '../../app-history';
import cookie from "react-cookies";
import { RestMethod } from "../../enums.js";
import baseURI from "../../api-config";
import { handleError } from "../error/error-handling.js";

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

    return returnValue;
}


const changeDefaults = (e, creds, setCreds) => {
    const name = e.target.name
    const value = e.target.value
    setCreds({...creds, [name]: value})
}

const submitHandler = (e, stateInfo) => {
  e.preventDefault();
  const {creds, state, changeState} = stateInfo;
  const fieldErrors = {
    usernameError: '',
    passwordError: '' 
  }
  const requestOptions = {
    method: RestMethod.POST,
    headers: { "Content-Type": "application/json", 'Authorization': '' },
    body: JSON.stringify({ ...creds }),
    };
    if (isValid(creds, fieldErrors))  {
        fetch(
          `${baseURI}/public/login`,
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
          })
            .catch(error => {
              handleError({ error });
            });
        })
          .catch(error => {
            handleError({ error });
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

export const loginUtil = {
    changeDefaults,
    submitHandler
};