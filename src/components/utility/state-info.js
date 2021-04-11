const preprocessingState = {
  isSuccess: false,
  failureDetails: {
    fieldErrors: {
      idError: "",
      nameError: "",
      emailError: "",
      profileNameError: '',
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

export let defaultUserState = {
  hasError: false,
  preprocessingState: preprocessingState,
  postprocessingState: postprocessingState,
};

export let defaultPostState = {
    hasError: false,
    postprocessingState: postprocessingState
}

export let defaultCommentState = {
    hasError: false,
    postprocessingState: postprocessingState
}
