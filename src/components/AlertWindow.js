import React, { useEffect } from 'react'
import { Alert, Fade } from 'react-bootstrap'

export const AlertWindow = React.memo(({ showAlert, setShowAlert }) => {

  useEffect(() => {
    let timer;
    if (showAlert.show === true) {
      timer = setTimeout(() => {
        setShowAlert({ show: false, alertMessage: '' });

      }, 3000);
    }
    return () => {
      if(timer)
        clearTimeout(timer);
    }
  }, [setShowAlert, showAlert])

  return (
    <>
      <Fade in={ showAlert.show }>
        <Alert
          style={{
            zIndex: "5000",
            position: "fixed",
            bottom: "1vh",
            left: "2vh",
          }}
          show={showAlert.show}
          variant="secondary"
          onClose={() => setShowAlert({ show: false, alertMessage: "" })}
          dismissible
        >
          <p>{showAlert.alertMessage}</p>
        </Alert>
      </Fade>
    </>
  );
});
