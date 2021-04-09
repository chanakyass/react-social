import React, { useState, useReducer, useEffect } from "react";
import { useParams } from 'react-router-dom'
import { reducer } from "./reducer";
import cookie from "react-cookies";
import { RestMethod } from "../../enums.js";
import { isValid } from "./user-registration-validations";
import { defaultUserState as defaultState } from "../utility/state-info";
import { Form, Col, Button } from 'react-bootstrap';
import history from '../../app-history'

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
        // editName: false,
        // editEmail: false,
        // editProfileName: false,
        // editDOB: false,
        // editSummary: false

  }

  
  

  const jwtToken = cookie.load('jwt')
  const loggedInUser = cookie.load("current_user");

    const [user, setUser] = useState(defaultUser);

  const [isLoggedInUser, setIsLoggedInUser] = useState(false)

  const [isBusy, setIsBusy] = useState(true)

    const [editSettings, setEditSettings] = useState(defaultEditSettings);
    
    const { id } = useParams();

      const loadUser =  () => {
        const requestOptions = {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        };

        fetch(
          `http://localhost:8080/api/v1/profile/${id}`,
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
          console.log(isLoggedInUser)
        }
      };
  
  useEffect(() => {
    loadUser();
  }, []);
  

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
      emailError: '',
      passwordError: '',
      DOBError: '',
      userSummaryError: ''
    }

    if (isValid(user, fieldErrors)) {
      fetch("http://localhost:8080/api/v1/profile/{profileId}", requestOptions).then((response) => {
        response.json().then(body => {
          if (response.status === 200) {
            const { data }= body
            dispatch({
              type: RestMethod.PUT,
              preprocessed: true,
              status: response.status,
              payload: data,
            });
            setEditSettings(defaultEditSettings)
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
      });
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
      "http://localhost:8080/api/v1/profile/{profileId}",
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

  const onEnterUpdate = (e, target) => {
    if (e.key === 'Enter') {
      setEditSettings({...editSettings, [target]: false})
    }
  }

  // return (
  //   <div className="col-md-8 my-3 mx-auto">
  //     {!isBusy ? (
  //       <>
  //         <div>
  //           <label htmlFor="name">Name</label>
  //           {editSettings.editName ? (
  //             <>
  //               <input
  //                 type="text"
  //                 name="name"
  //                 id="name"
  //                 value={user.name}
  //                 onChange={changePerson}
  //                 onKeyDown={(e) => onEnterUpdate(e, "editName")}
  //               />
  //               <span id="error-name" name="error-name">
  //                 {!state.preprocessingState.isSuccess &&
  //                   state.preprocessingState.failureDetails.fieldErrors
  //                     .nameError}
  //               </span>
  //             </>
  //           ) : (
  //             user.name
  //           )}
  //           {isLoggedInUser && (
  //             <button
  //               onClick={(e) =>
  //                 setEditSettings({
  //                   ...editSettings,
  //                   editName: true,
  //                   editTriggered: true,
  //                 })
  //               }
  //             >
  //               edit
  //             </button>
  //           )}
  //         </div>
  //         <div>
  //           <label htmlFor="email">Email</label>
  //           {editSettings.editEmail ? (
  //             <>
  //               <input
  //                 type="text"
  //                 name="email"
  //                 id="email"
  //                 value={user.email}
  //                 onChange={changePerson}
  //                 onKeyDown={(e) => onEnterUpdate(e, "editEmail")}
  //               />
  //               <span id="error-email" name="error-email">
  //                 {!state.preprocessingState.isSuccess &&
  //                   state.preprocessingState.failureDetails.fieldErrors
  //                     .emailError}
  //               </span>
  //             </>
  //           ) : (
  //             user.email
  //           )}
  //           {isLoggedInUser && (
  //             <button
  //               onClick={(e) =>
  //                 setEditSettings({
  //                   ...editSettings,
  //                   editEmail: true,
  //                   editTriggered: true,
  //                 })
  //               }
  //             >
  //               edit
  //             </button>
  //           )}
  //         </div>
  //         <div>
  //           <label htmlFor="profileName">Profile Name</label>
  //           {editSettings.editProfileName ? (
  //             <>
  //               <input
  //                 type="text"
  //                 name="profileName"
  //                 id="profileName"
  //                 value={user.profileName}
  //                 onChange={changePerson}
  //                 onKeyDown={(e) => onEnterUpdate(e, "editProfileName")}
  //               />
  //               <span id="error-profileName" name="error-profileName">
  //                 {!state.preprocessingState.isSuccess &&
  //                   state.preprocessingState.failureDetails.fieldErrors
  //                     .profileNameError}
  //               </span>
  //             </>
  //           ) : (
  //             user.profileName
  //           )}
  //           {isLoggedInUser && (
  //             <button
  //               onClick={(e) =>
  //                 setEditSettings({
  //                   ...editSettings,
  //                   editProfileName: true,
  //                   editTriggered: true,
  //                 })
  //               }
  //             >
  //               edit
  //             </button>
  //           )}
  //         </div>

  //         <div>
  //           <label htmlFor="DOB">Date of birth</label>
  //           {editSettings.editDOB ? (
  //             <>
  //               <input
  //                 type="date"
  //                 name="DOB"
  //                 id="DOB"
  //                 value={user.DOB}
  //                 onChange={changePerson}
  //                 onKeyDown={(e) => onEnterUpdate(e, "editDOB")}
  //               />
  //               <span id="error-date" name="error-date">
  //                 {!state.preprocessingState.isSuccess &&
  //                   state.preprocessingState.failureDetails.fieldErrors
  //                     .DOBError}
  //               </span>
  //             </>
  //           ) : (
  //             user.DOB
  //           )}
  //           {isLoggedInUser && (
  //             <button
  //               onClick={(e) =>
  //                 setEditSettings({
  //                   ...editSettings,
  //                   editDOB: true,
  //                   editTriggered: true,
  //                 })
  //               }
  //             >
  //               edit
  //             </button>
  //           )}
  //         </div>
  //         <div>
  //           <label htmlFor="summary">Summary</label>
  //           {editSettings.editSummary ? (
  //             <>
  //               <input
  //                 type="textarea"
  //                 name="userSummary"
  //                 id="userSummary"
  //                 value={user.userSummary}
  //                 onChange={changePerson}
  //                 onKeyDown={(e) => onEnterUpdate(e, "editSummary")}
  //               />
  //               <span id="error-summary" name="error-summary">
  //                 {!state.preprocessingState.isSuccess &&
  //                   state.preprocessingState.failureDetails.fieldErrors
  //                     .userSummaryError}
  //               </span>
  //             </>
  //           ) : (
  //             user.userSummary
  //           )}
  //           {isLoggedInUser && (
  //             <button
  //               onClick={(e) =>
  //                 setEditSettings({
  //                   ...editSettings,
  //                   editSummary: true,
  //                   editTriggered: true,
  //                 })
  //               }
  //             >
  //               edit
  //             </button>
  //           )}
  //         </div>
  //         {isLoggedInUser && (
  //           <>
  //             <div>
  //               <button
  //                 disabled={!editSettings.editTriggered}
  //                 type="submit"
  //                 onClick={updateHandler}
  //               >
  //                 update
  //               </button>
  //               <button disabled={!editSettings.editTriggered} type="reset">
  //                 reset
  //               </button>
  //             </div>
  //             <div>
  //               <button type="submit" onClick={deleteHandler}>
  //                 Delete account
  //               </button>
  //             </div>
  //           </>
  //         )}
  //         <div>
  //           <h1>
  //             {state.hasError &&
  //               state.postprocessingState.failureDetails.failureMessage}
  //           </h1>
  //           <h5>
  //             {state.hasError &&
  //               state.postprocessingState.failureDetails.details}
  //           </h5>
  //         </div>
  //       </>
  //     ) : (
  //       <>loading</>
  //     )}
  //   </div>
  // );

  return (
    <>
      <div style={{ height: "50rem" }}>
        <div className="row h-100">
          <div className="col-md-4 mx-auto my-auto rounded shadow bg-white">
            {/* <div className="col-md-4 mx-auto mt-3">
              <h3>User Information</h3>
            </div> */}
            <Form
              //className='my-75'
              noValidate
              //validated={state.hasError}
              onSubmit={updateHandler}

              //style={{  borderBlockColor: 'blue' }}
            >
              <div className="col-md-12 my-4 mx-auto">
                <h5>User details</h5>
              </div>

              {editSettings.editTriggered === true ? (
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
                <div className="container">
                  <div className="row my-2">
                    <div className="col-md-6">Name:</div>
                    <div className="col-md-6">{user.name}</div>
                  </div>
                </div>
              )}
              {editSettings.editTriggered === true ? (
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
                <div className="container">
                  <div className="row my-2">
                    <div className="col-md-6">Email:</div>
                    <div className="col-md-6">{user.email}</div>
                  </div>
                </div>
              )}

              {editSettings.editTriggered === true ? (
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
              ) : (
                <div className="container">
                  <div className="row my-2">
                    <div className="col-md-6">Profile Name:</div>
                    <div className="col-md-6">{user.profileName}</div>
                  </div>
                </div>
              )}

              {editSettings.editTriggered === true ? (
                <Form.Group as={Col} md={12} controlId="formDOB">
                  <Form.Label>Date of Birth</Form.Label>

                  <Form.Control
                    id="dob"
                    name="dob"
                    type="date"
                    value={ user.dob ? new Date(user.dob).toISOString().substr(0, 10): '' }
                    onChange={changePerson}
                    isInvalid={
                      state.hasError &&
                      state.preprocessingState.failureDetails.fieldErrors
                        .DOBError !== ""
                    }
                  />

                  <Form.Control.Feedback type="invalid">
                    {
                      state.preprocessingState.failureDetails.fieldErrors
                        .DOBError
                    }
                  </Form.Control.Feedback>
                </Form.Group>
              ) : (
                <div className="container">
                  <div className="row my-2">
                    <div className="col-md-6">Date of Birth:</div>
                      <div className="col-md-6">{user.dob}</div>
                  </div>
                </div>
              )}

              {editSettings.editTriggered === true ? (
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
                <div className="container">
                  <div className="row my-2">
                    <div className="col-md-6">Profile Summary:</div>
                    <div className="col-md-6">{user.userSummary}</div>
                  </div>
                </div>
              )}

              {editSettings.editTriggered === true ? (
                <Form.Group as={Col} md={12}>
                  <Button  className="my-3 mr-2" type="submit">
                    Update
                  </Button>
                  <Button className="my-3 ml-2" type="clear">
                    Clear
                  </Button>
                </Form.Group>
              ) : isLoggedInUser ? (
                <Form.Group as={Col} md={12}>
                  <button
                    className="my-3"
                    type="submit"
                    style={{
                      background: "none",
                      border: "none",
                      margin: "none",
                      textDecoration: "underline",
                      color: "dodgerblue",
                    }}
                    onClick={() =>
                      setEditSettings({ ...editSettings, editTriggered: true })
                    }
                  >
                    update your details
                  </button>
                </Form.Group>
              ) : (
                <></>
              )}
            </Form>
            {editSettings.editTriggered === true && (
              <div className="col-md-8 mx-auto my-3 text-danger">
                {state.postprocessingState.failureDetails.failureMessage}
                {state.postprocessingState.failureDetails.details}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default User

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
