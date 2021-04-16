import React, { useState, useReducer, useEffect, useContext, useCallback } from "react";
import { useParams } from 'react-router-dom'
import { reducer } from "./reducer";
import cookie from "react-cookies";
import { RestMethod } from "../../enums.js";
import { isValid } from "./user-registration-validations";
import { defaultUserState as defaultState } from "../utility/state-info";
import { Form, Col, Button } from 'react-bootstrap';
import history from '../../app-history'
import { CurrentUserContext } from "../../App";
import baseURI from "../../api-config";
import { LoadingPage } from '../utility/LoadingPage';

const User = () => {
  const defaultUser = {
    id: null,
    name: "",
    email: "",
    password: "",
    profileName: "",
    dob: "",
    userSummary: "",
    };
    
  const defaultEditSettings = {
    editTriggered: false,
    editOtherTriggered: false,
    editEmailTriggered: false,
    editPasswordTriggered: false
  }

  
  const { setIsCurrentUserUpdated } = useContext(CurrentUserContext);

  const jwtToken = cookie.load('jwt')
  const loggedInUser = cookie.load("current_user");

    const [user, setUser] = useState(defaultUser);

  const [isLoggedInUser, setIsLoggedInUser] = useState(false)

  const [isBusy, setIsBusy] = useState(true)

    const [editSettings, setEditSettings] = useState(defaultEditSettings);
    
    const { id } = useParams();

      const loadUser =  useCallback(() => {
        const requestOptions = {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        };

        fetch(
          `${baseURI}/api/v1/profile/${id}`,
          requestOptions
        ).then(response => response.json().then(body => {
          
          if (response.status === 200) {
            const { data } = body
            setUser(data)
            setIsBusy(false);
          }
          else {

            const { error } = body
            console.log(error)
            history.push('/error')
          }
          
        })).catch(error => {

          console.log(error)
          history.push('/error')
        })


        if (loggedInUser.id === parseInt(id)) {
          setIsLoggedInUser(true);
        }
      }, [id, jwtToken, loggedInUser.id]);
  
  useEffect(() => {
    loadUser();
  }, [loadUser]);
  

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


  const updateHandler = (e) => {
    e.preventDefault();
        const requestOptions = {
          method: RestMethod.PUT,
          headers: { "Content-Type": "application/json", 'Authorization':  `Bearer ${jwtToken}`},
          body: JSON.stringify({ ...user }),
    };
      

    const fieldErrors = {
      nameError: '',
      // emailError: '',
      profileNameError: '',
      passwordError: '',
      DOBError: '',
      userSummaryError: ''
    }

    if (isValid(user, fieldErrors, RestMethod.PUT)) {
      if (editSettings.editOtherTriggered === true) {
        
        fetch(`${baseURI}/api/v1/profile/{profileId}`, requestOptions).then((response) => {
          response.json().then(body => {
            if (response.status === 200) {
              const { data } = body;
              const currentUser = {
                ...loggedInUser,
                name: user.name,
                userSummary: user.userSummary,
                profileName: user.profileName
              }

              let expires = new Date();
              expires.setDate(expires.getDate() + 7);

              cookie.save("current_user", currentUser, { path: "/", expires: expires })
              setIsCurrentUserUpdated(true);
            
              dispatch({
                type: RestMethod.PUT,
                preprocessed: true,
                status: response.status,
                payload: data,
              });
              setEditSettings(defaultEditSettings)

              history.push('/', { showAlert: true, alertMessage: 'Your profile has been updated successfully' });
            } else {
              const { error } = body
              dispatch(
                {
                  type: RestMethod.PUT,
                  preprocessed: true,
                  status: response.status,
                  payload: error
                })
              
            }
          });
        }
        );
      }
      else if (editSettings.editEmailTriggered === true) {
        // Separate procedure for email change
      }
      else if (editSettings.editPasswordTriggered === true) {
        // Separate procedure for password change
      }

    } else {
      dispatch({
        type: null,
        preprocessed: false,
        status: -1,
        payload: fieldErrors,
      });
    }
  };

  const deleteHandler = (e) => {
    e.preventDefault()
    const requestOptions = {
      method: RestMethod.DELETE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    };

    fetch(
      `${baseURI}/api/v1/profile/${id}`,
      requestOptions
    ).then((response) => {
      response.json().then(body => {
        if (response.status === 200) {
          
          const { data } = body
          console.log(data)

          history.push("/login");

        } else {
          const { error } = body
          dispatch({
            type: RestMethod.DELETE,
            preprocessed: true,
            status: response.status,
            payload: error,
          });
        }
      });
    });
  }


  return (
    <>
      <div style={{ height: "80vh" }}>
        <div className="row h-100 m-0">
          <div className="col-md-4 col-lg-4 col-sm-4 mx-auto my-auto rounded shadow bg-white">
            {isBusy === true ? (
              <LoadingPage noOfDivs={1} />
            ) : (
              <>
                <Form noValidate onSubmit={updateHandler}>
                  <div className="col-md-12 col-sm-12 col-lg-12 my-4 mx-auto">
                    <h5>User details</h5>
                  </div>

                  {editSettings.editTriggered === true &&
                  editSettings.editOtherTriggered === true ? (
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
                  ) : (
                    editSettings.editTriggered === false && (
                      <div className="container">
                        <div className="row my-2">
                          <div className="col-md-6">Name:</div>
                          <div className="col-md-6">{user.name}</div>
                        </div>
                      </div>
                    )
                  )}
                  {editSettings.editTriggered === true &&
                  editSettings.editEmailTriggered === true ? (
                    <Form.Group as={Col} md={12} controlId="formEmail">
                      <Form.Label className="h5">Email address:</Form.Label>

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
                        {
                          state.preprocessingState.failureDetails.fieldErrors
                            .emailError
                        }
                      </Form.Control.Feedback>
                    </Form.Group>
                  ) : (
                    editSettings.editTriggered === false && (
                      <div className="container">
                        <div className="row my-2">
                          <div className="col-md-6">Email:</div>
                          <div className="col-md-6">{user.email}</div>
                        </div>
                      </div>
                    )
                  )}

                  {editSettings.editTriggered === true &&
                    editSettings.editPasswordTriggered === true && (
                      <Form.Group as={Col} md={12} controlId="formPassword">
                        <Form.Label className="h5">New Password:</Form.Label>

                        <Form.Control
                          id="password"
                          name="password"
                          type="password"
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
                              .emailError
                          }
                        </Form.Control.Feedback>
                      </Form.Group>
                    )}

                  {editSettings.editTriggered === true &&
                  editSettings.editOtherTriggered === true ? (
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
                    </Form.Group>
                  ) : (
                    editSettings.editTriggered === false && (
                      <div className="container">
                        <div className="row my-2">
                          <div className="col-md-6">Profile Name:</div>
                          <div className="col-md-6">{user.profileName}</div>
                        </div>
                      </div>
                    )
                  )}

                  {editSettings.editTriggered === true &&
                  editSettings.editOtherTriggered === true ? (
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
                        {state.hasError &&
                          state.preprocessingState.failureDetails.fieldErrors
                            .DOBError}
                      </Form.Control.Feedback>
                    </Form.Group>
                  ) : (
                    editSettings.editTriggered === false && (
                      <div className="container">
                        <div className="row my-2">
                          <div className="col-md-6">Date of Birth:</div>
                          <div className="col-md-6">{user.dob}</div>
                        </div>
                      </div>
                    )
                  )}

                  {editSettings.editTriggered === true &&
                  editSettings.editOtherTriggered === true ? (
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
                  ) : (
                    editSettings.editTriggered === false && (
                      <div className="container">
                        <div className="row my-2">
                          <div className="col-md-6">Profile Summary:</div>
                          <div className="col-md-6">{user.userSummary}</div>
                        </div>
                      </div>
                    )
                  )}

                  {editSettings.editTriggered === true ? (
                    <Form.Group as={Col} md={12}>
                      <Button
                        className="my-3 mr-2"
                        variant="secondary"
                        type="submit"
                      >
                        Update
                      </Button>
                      <Button
                        className="my-3 ml-2"
                        variant="secondary"
                        type="reset"
                      >
                        Clear
                      </Button>
                    </Form.Group>
                  ) : isLoggedInUser ? (
                    <Form.Group as={Col} md={12}>
                      <div className="row p-1">
                        <button
                          className="col-md col-sm col-lg p-0 link-button"
                          type="button"
                          // style={{
                          //   background: "none",
                          //   border: "none",
                          //   margin: "none",
                          //   textDecoration: "underline",
                          //   color: "dodgerblue",
                          // }}
                          onClick={() =>
                            setEditSettings({
                              ...editSettings,
                              editTriggered: true,
                              editOtherTriggered: true,
                            })
                          }
                        >
                          Update your details
                        </button>
                        <button
                          className="col-md col-sm col-lg p-0 link-button"
                          type="button"
                          // style={{
                          //   background: "none",
                          //   border: "none",
                          //   margin: "none",
                          //   textDecoration: "underline",
                          //   color: "dodgerblue",
                          // }}
                          onClick={() =>
                            setEditSettings({
                              ...editSettings,
                              editTriggered: true,
                              editEmailTriggered: true,
                            })
                          }
                        >
                          Change Email ID
                        </button>
                        <button
                          className="col-md col-sm col-lg p-0 link-button"
                          type="button"
                          // style={{
                          //   background: "none",
                          //   border: "none",
                          //   margin: "none",
                          //   textDecoration: "underline",
                          //   color: "dodgerblue",
                          // }}
                          onClick={() =>
                            setEditSettings({
                              ...editSettings,
                              editTriggered: true,
                              editPasswordTriggered: true,
                            })
                          }
                        >
                          Change Password
                        </button>
                      </div>
                      <div className="row p-1">
                        <button
                          className="col-md col-sm col-lg p-0 link-button"
                          onClick={deleteHandler}
                        >
                          Delete your account
                        </button>
                      </div>
                    </Form.Group>
                  ) : (
                    <></>
                  )}
                </Form>
                {editSettings.editTriggered === true ||
                  editSettings.editEmailTriggered === true ||
                  (editSettings.editPasswordTriggered === true && (
                    <div className="col-md-8 mx-auto my-3 text-danger">
                      {state.postprocessingState.failureDetails.failureMessage}
                      {state.postprocessingState.failureDetails.details}
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default User;

