import React, { useState, useReducer } from "react";
import { withRouter } from 'react-router-dom'
import { reducer } from "./reducer";
import { RestMethod } from '../../enums.js';
import { isValid } from './user-registration-validations'
import { defaultUserState as defaultState } from '../utility/state-info'
import history from '../../app-history'

const UserRegister = () => {
  const defaultUser = {
    id: null,
    name: "",
    email: "",
    profileName: "",
    password: "",
    DOB: "",
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
      emailError: "",
      passwordError: "",
      DOBError: "",
    };
            if (isValid(user, fieldErrors)) {
            fetch(
              "http://localhost:8080/api/v1/public/register",
              requestOptions
            ).then((response) => {
              response.json().then(body => {
                if (response.status === 200) {

                  const { data } = body
                  console.log(data)

                  history.push('/login')
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
        <form>
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={user.name}
              onChange={changePerson}
            />
            <span id="error-name" name="error-name">
              {!state.preprocessingState.isSuccess &&
                state.preprocessingState.failureDetails.fieldErrors.nameError}
            </span>
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              id="email"
              value={user.email}
              onChange={changePerson}
            />
            <span id="error-email" name="error-email">
              {!state.preprocessingState.isSuccess &&
                state.preprocessingState.failureDetails.fieldErrors.emailError}
            </span>
          </div>
          <div>
            <label htmlFor="profileName">Profile Name</label>
            <input
              type="text"
              name="profileName"
              id="profileName"
              value={user.profileName}
              onChange={changePerson}
            />
            <span id="error-profileName" name="error-profileName">
              {!state.preprocessingState.isSuccess &&
                state.preprocessingState.failureDetails.fieldErrors
                  .profileNameError}
            </span>
          </div>
            <div>
              <label htmlFor="pass">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={user.password}
                onChange={changePerson}
              />
              <span id="error-pass" name="error-pass">
                {!state.preprocessingState.isSuccess &&
                  state.preprocessingState.failureDetails.fieldErrors
                    .passwordError}
              </span>
        </div>
          <div>
            <label htmlFor="DOB">Date of birth</label>
            <input
              type="date"
              name="DOB"
              id="DOB"
              value={user.DOB}
              onChange={changePerson}
            />
            <span id="error-date" name="error-date">
              {!state.preprocessingState.isSuccess &&
                state.preprocessingState.failureDetails.fieldErrors.DOBError}
            </span>
          </div>
          <div>
            <label htmlFor="summary">Summary</label>
            <input
              type="textarea"
              name="userSummary"
              id="userSummary"
              value={user.userSummary}
              onChange={changePerson}
            />
            <span id="error-summary" name="error-summary">
              {!state.preprocessingState.isSuccess &&
                state.preprocessingState.failureDetails.fieldErrors
                  .userSummaryError}
            </span>
          </div>
          <div>
            <button type="submit" onClick={submitHandler}>
                register
            </button>
          <button type="reset" onClick={(e) => {
            console.log('from form default state ', defaultState)
            setUser(defaultUser)
            dispatch({ type: 'RESET', payload: defaultState })
          }}>
              reset
            </button>
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
