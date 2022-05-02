import { useState, useEffect, useCallback } from "react";
import cookie from "react-cookies";
import  history  from '../../app-history'
import {loginUtil} from './login-util';

const useLoginState = () => {
    const defaultState = {
      hasError: false,
      preprocessingState: {
        isSuccess: true,
        failureDetails: {
          fieldErrors: {
            usernameError: "",
            passwordError: "",
          }
        }
      },
      postprocessingState: {
        isSuccess: true,
        failureDetails: {
          failureMessage: '',
          details: []
        }
      }
    };

    const [creds, setCreds] = useState({
        username: '',
        password: ''
    });

  const [state, changeState] = useState(defaultState);

  const changeDefaults = useCallback((e) => {
    loginUtil.changeDefaults(e, creds, setCreds);
  }, [creds, setCreds]);

  const submitHandler = useCallback((e) => {
      loginUtil.submitHandler(e, {creds, state, changeState});
  }, [creds, state, changeState])

  useEffect(() => {
    let jwt = cookie.load('jwt')
    if (jwt) {
      history.push('/')
    }
  });

  return {
      stateInfo: [creds, state],
      funcs: [changeDefaults, submitHandler]
  }

}

export default useLoginState;