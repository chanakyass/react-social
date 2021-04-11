import { RestMethod } from "../../enums";

const preprocessingState = {
  isSuccess: false,
  failureDetails: {
    fieldErrors: {
      idError: "",
      nameError: "",
      profileNameError: '',
      emailError: "",
      passwordError: "",
      DOBError: "",
      userSummaryError: "",
    },
  },
};

const postprocessingState = {
  isSuccess: false,
  successDetails: {
    successMessage: "",
    resourceId: -1,
  },
  failureDetails: {
    failureMessage: "",
    detials: [],
  },
};

export let defaultState = {
  hasError: false,
  preprocessingState: preprocessingState,
  postprocessingState: postprocessingState,
};

export const isValid = (userDetails, fieldErrors, method) => {
  let returnValue = true;


  if (userDetails.name === "") {
    fieldErrors.nameError = "Field can't be empty";
    returnValue = false;
  }

    if (userDetails.profileName === "") {
      fieldErrors.profileNameError = "Field can't be empty";
      returnValue = false;
  }
  
  if(method === RestMethod.POST){
    if (userDetails.email === "") {
    fieldErrors.emailError = "Field can't be empty";
    returnValue = false;
  } else {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(String(userDetails.email).toLowerCase())) {
      fieldErrors.emailError = "Incorrect email format";
      returnValue = false;
    }
    }
  }
  // Also need a regex for email

  if(method === RestMethod.POST){
    if (userDetails.password === "") {
    fieldErrors.passwordError = "Field can't be empty";
    returnValue = false;
  } else {
    const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if (!re.test(String(userDetails.password))) {
      fieldErrors.passwordError = "Incorrect password format";
      returnValue = false;
    }
    }
  }
  

  if (userDetails.dob === "") {
    fieldErrors.DOBError = "Field can't be empty";
    returnValue = false;
  }

  return returnValue;
};
