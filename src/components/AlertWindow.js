import React, { useEffect } from 'react'
import { Alert } from 'react-bootstrap'

export const AlertWindow = React.memo(({ showErrorAlert, setShowErrorAlert }) => {

  useEffect(() => {
    let timer;
    if (showErrorAlert.show === true) {
      timer = setTimeout(() => {
        setShowErrorAlert({ show: false, alertMessage: '' });

      }, 3000);
    }
    return () => {
      if(timer)
        clearTimeout(timer);
    }
  }, [setShowErrorAlert, showErrorAlert])

  return (
    <>
      <Alert style={{ zIndex: '5000', position: 'fixed', bottom: '1vh', left: '2vh' }} show={showErrorAlert.show}
        variant="secondary" onClose={() => setShowErrorAlert({ show: false, alertMessage: '' })} dismissible>
        <p>{showErrorAlert.alertMessage}</p>
      </Alert>
    </>
  );
});
