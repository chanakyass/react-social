import React, { useState, useReducer, useEffect } from "react";
import { withRouter } from 'react-router-dom'
import { reducer } from "./reducer";
import { RestMethod } from '../../enums.js';
import { isValid } from './user-registration-validations'
import { defaultState } from '../user/user-registration-validations'
import history from '../../app-history'
import { Col, Form, Button, InputGroup } from 'react-bootstrap'
import cookie from "react-cookies";
import {ErrorAlert} from '../ErrorAlert'

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

      const jwtToken = cookie.load("jwt");
      const currentUser = cookie.load("current_user");

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

  // return (
  //   <>
  //       <form>
  //         <div>
  //           <label htmlFor="name">Name</label>
  //           <input
  //             type="text"
  //             name="name"
  //             id="name"
  //             value={user.name}
  //             onChange={changePerson}
  //           />
  //           <span id="error-name" name="error-name">
  //             {!state.preprocessingState.isSuccess &&
  //               state.preprocessingState.failureDetails.fieldErrors.nameError}
  //           </span>
  //         </div>
  //         <div>
  //           <label htmlFor="email">Email</label>
  //           <input
  //             type="text"
  //             name="email"
  //             id="email"
  //             value={user.email}
  //             onChange={changePerson}
  //           />
  //           <span id="error-email" name="error-email">
  //             {!state.preprocessingState.isSuccess &&
  //               state.preprocessingState.failureDetails.fieldErrors.emailError}
  //           </span>
  //         </div>
  //         <div>
  //           <label htmlFor="profileName">Profile Name</label>
  //           <input
  //             type="text"
  //             name="profileName"
  //             id="profileName"
  //             value={user.profileName}
  //             onChange={changePerson}
  //           />
  //           <span id="error-profileName" name="error-profileName">
  //             {!state.preprocessingState.isSuccess &&
  //               state.preprocessingState.failureDetails.fieldErrors
  //                 .profileNameError}
  //           </span>
  //         </div>
  //           <div>
  //             <label htmlFor="pass">Password</label>
  //             <input
  //               type="password"
  //               name="password"
  //               id="password"
  //               value={user.password}
  //               onChange={changePerson}
  //             />
  //             <span id="error-pass" name="error-pass">
  //               {!state.preprocessingState.isSuccess &&
  //                 state.preprocessingState.failureDetails.fieldErrors
  //                   .passwordError}
  //             </span>
  //       </div>
  //         <div>
  //           <label htmlFor="DOB">Date of birth</label>
  //           <input
  //             type="date"
  //             name="DOB"
  //             id="DOB"
  //             value={user.DOB}
  //             onChange={changePerson}
  //           />
  //           <span id="error-date" name="error-date">
  //             {!state.preprocessingState.isSuccess &&
  //               state.preprocessingState.failureDetails.fieldErrors.DOBError}
  //           </span>
  //         </div>
  //         <div>
  //           <label htmlFor="summary">Summary</label>
  //           <input
  //             type="textarea"
  //             name="userSummary"
  //             id="userSummary"
  //             value={user.userSummary}
  //             onChange={changePerson}
  //           />
  //           <span id="error-summary" name="error-summary">
  //             {!state.preprocessingState.isSuccess &&
  //               state.preprocessingState.failureDetails.fieldErrors
  //                 .userSummaryError}
  //           </span>
  //         </div>
  //         <div>
  //           <button type="submit" onClick={submitHandler}>
  //               register
  //           </button>
  //         <button type="reset" onClick={(e) => {
  //           console.log('from form default state ', defaultState)
  //           setUser(defaultUser)
  //           dispatch({ type: 'RESET', payload: defaultState })
  //         }}>
  //             reset
  //           </button>
  //          </div>
  //       <div>
  //         <h1>
  //           {state.hasError &&
  //             state.postprocessingState.failureDetails.failureMessage}
  //         </h1>
  //         <h5>
  //           {state.hasError && state.postprocessingState.failureDetails.details}
  //         </h5>
  //       </div>
  //       </form>
  //   </>
  // );

  return <>
    
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
                  {state.preprocessingState.failureDetails.fieldErrors.nameError}
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
                  {state.preprocessingState.failureDetails.fieldErrors.emailError}
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
                  id="DOB"
                  name="DOB"
                  type="date"
                  value={user.DOB}
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
                <Button className="my-3" type="submit">
                  Submit
              </Button>
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
