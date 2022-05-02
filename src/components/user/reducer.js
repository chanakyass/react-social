export function reducer(state, action)
{
  const { type, preprocessed, status, payload } = action

  if (type === 'RESET') {
    return payload
  }

  else {
  
    if (preprocessed === false) {
      const fieldErrors = payload;
      return {
        ...state,
        hasError: true,
        preprocessingState: {
          ...state.preprocessingState,
          isSuccess: false,
          failureDetails: {
            ...state.failureDetails,
            failureMessage: "Please check the errors",
            fieldErrors: fieldErrors,
          },
        },
      };
    }
    
    else if (preprocessed) {
      if (status === 200) {
        return { ...state, hasError: false, preprocessingState: { ...state.preprocessingState, isSuccess: true }, postprocessingState: { ...state.postprocessingState, isSuccess: true, successDetails: { ...state.successDetails, successMessage: payload.message, resourceId: payload.resourceId } } }
      }
      else {
    const fieldErrors = {
      nameError: "",
      profileNameError: "",
      emailError: "",
      passwordError: "",
      DOBError: "",
      userSummaryError: "",
    };
        return {
          ...state,
          hasError: true,
          preprocessingState: {
            ...state.preprocessingState,
            failureDetails: {
              ...state.preprocessingState.failureDetails,
              fieldErrors: fieldErrors
            },
            isSuccess: true,
          },
          postprocessingState: {
            ...state.postprocessingState,
            isSuccess: false,
            failureDetails: {
              ...state.failureDetails,
              failureMessage: payload.message,
              details: payload.details,
            },
          },
        };
      }
    }
  }

}
